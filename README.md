<div align="center">

# Sand Write

### A mobile sand-writing interaction prototype

[Critical Matter Group](https://www.media.mit.edu/groups/critical-matter/overview/) · MIT Media Lab

</div>

---

## ▶ Quickstart

**Live demo:** [yuxiangcheng2002.github.io/sand-write](https://yuxiangcheng2002.github.io/sand-write/)

```bash
git clone https://github.com/yuxiangcheng2002/sand-write.git
cd sand-write
python3 -m http.server 8000
```

Open `http://localhost:8000` on a phone or with a mobile viewport. Drag or swipe to write in the sand; tap **Wave** to wash it away, or **Clear** to reset.

---

## What this repository is

This repository is a single-file, self-contained prototype of a touch-based sand-writing interaction. It runs in any modern browser and is tuned for mobile: touch events are captured, the viewport is locked, and a particle system deposits colored grains that settle onto a persistent sand texture. A "wave" effect slowly erases the drawing from the bottom of the screen.

It is intended for:

- **Interaction designers** — as a starting point for tactile, ephemeral drawing interfaces.
- **Researchers** — to fork and adapt for studies on gesture, materiality, or playful input.
- **Students and makers** — to inspect, modify, and rebuild a minimal Canvas-based mobile prototype.

> [!NOTE]
> This is a design prototype, not a production application. No build step, dependencies, or backend are required.

---

## What's in this repository

| File | What's inside |
|---|---|
| [`index.html`](index.html) | The full prototype: HTML, CSS, and JavaScript in one file. |
| [`README.md`](README.md) | This document. |
| [`LICENSE`](LICENSE) | MIT License. |

---

## License

© 2026 Critical Matter Group, MIT Media Lab.

Released under the [MIT License](LICENSE).

---
