# sand-write

> **2026-07-30 — MIGRATED, this repo is frozen.** Canonical home is
> `Critical-Matter-MIT-Media-Lab/Future-Fest` under `web/` (local clone
> `~/Repos/CMG/Future-Fest`); its CLAUDE.md carries the decision log.
> Do not add features here. Pre-migration history stays in this repo;
> the GitHub Pages demo still serves this frozen build.

Single-file WebGL 2 sand-writing surface (`index.html`). Fingers/mouse carve
grooves into a simulated sand heightfield; a wave sweep clears it.

## Current goal

Record the *process* of writing (not just the final image) and stream it to a
TouchDesigner rendering. User is setting up a quick DB to persist sessions.

## Key decisions

- **Canonical record = timestamped vector event stream, not raster.** TD does
  its own rendering, so it needs the gesture (when/where), not our pixels. The
  heightfield is derived state. Vector JSONL is small, replayable at any speed,
  resolution-independent.
- **Schema** (one JSON event per line; `t` = seconds since session start,
  x/y normalized UV with y **up**, aspect in header):
  - `{"type":"session","sid",...,"aspect","brushRadius","yUp":true,"started"}`
  - `{"type":"start"|"point"|"end","id":<strokeId>,"x","y","t"}`
  - `{"type":"wave"|"clear","t"}` — so TD can mirror sand clearing
  - `{"type":"resize","aspect","t"}`
- **Transport = WebSocket direct to TD's WebSocket DAT** (TD as server,
  default `ws://127.0.0.1:9980`, override with `?td=host:port`). Chosen over
  OSC because the browser cannot send UDP — OSC would force a relay bridge.
  Auto-reconnects every 2 s; header is re-sent on each (re)connect.
- **Save button** downloads the full session as `sand-<sid>.jsonl` (for DB
  ingestion / offline replay). Green/red dot top-right = TD link state.
- **Dev mode (`?dev`)**: live monitor panel tailing every JSON event
  (color-coded by type, points dimmed) plus ws open/close meta lines;
  header shows sid, TD endpoint, event count. Capped at 400 DOM rows.
  Tapping the TD dot toggles the panel. Composes with `?td=`, e.g.
  `?dev&td=192.168.41.20:9980`.
- Reconnect is driven from `onclose` only — a failed ws attempt fires error
  then close, and handling both doubled the retry count every cycle
  (fixed regression from the first recording commit).
- **Prebaked writing (dev)**: Hershey "futural" single-stroke font embedded
  as `HERSHEY` (~7 KB, ASCII 33+, converted from techninja/hersheytextjs).
  Dev panel gets a text field + Write/Stop; glyph polylines are resampled
  and replayed one sample per frame through the same brush + recorder
  pipeline, so TD receives synthetic writing exactly like a human gesture.
  Font units are squared in screen space via aspect; text auto-fits to 90%
  width, centered. Copy = session JSONL to clipboard; Wipe = clears the
  monitor view only (record intact).
  Caveat: drawing by hand while a prebaked write is running interleaves
  stroke ids (shared counter) — dev-only concern.
- **Replay (dev)**: Replay button loads a saved session JSONL and
  re-performs it with original timing (rAF scheduler, catch-up loop) through
  the same pipeline — sand redraws and TD gets a fresh live stream with new
  stroke ids/clock. wave/clear rows re-trigger; session/resize are skipped.
  Write/Replay/Stop are mutually exclusive.

## Testing

`tests/e2e.mjs` (record + save path) and `tests/e2e-ws.mjs` (live WS stream
with a mock TD server). Run with `node tests/e2e-ws.mjs` after
`npm install playwright ws --no-save`; they use the locally cached Playwright
chromium (hardcoded executablePath). Sample output in
`tests/output/sample-session.jsonl`.

## Open questions / proposals (not yet approved)

- Per-stroke heightfield PNG snapshot so TD can take groove shapes without
  re-implementing the sim.
- Point-stream thinning (dedupe/rAF throttle) if high-Hz mice flood the link.
- DB ingestion endpoint (user said they'll set up a quick DB — format is
  JSONL-ready, one row per event, `sid` in header).

## Constraints

- Demo stroke (`?demo`) bypasses input handlers, so it is *not* recorded.
- iPad/touch is a target; keep `touch-action: none` and passive:false.
