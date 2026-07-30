// E2E smoke test: load sand-write, draw two strokes, press Wave/Clear/Save,
// capture the JSONL download and print its contents.
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = '/Users/yxc/Repos/CMG/sand-write';
const server = http.createServer((req, res) => {
  const p = new URL(req.url, 'http://x').pathname;
  const f = path.join(ROOT, p === '/' ? 'index.html' : p);
  try { res.end(fs.readFileSync(f)); } catch { res.statusCode = 404; res.end(); }
}).listen(8931);

const browser = await chromium.launch({
  executablePath: '/Users/yxc/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'
});
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
await page.goto('http://127.0.0.1:8931/?dev');
await page.waitForTimeout(500);

// stroke 1: horizontal drag
await page.mouse.move(200, 300);
await page.mouse.down();
for (let x = 200; x <= 400; x += 20) { await page.mouse.move(x, 300); await page.waitForTimeout(16); }
await page.mouse.up();

// stroke 2: short diagonal
await page.mouse.move(300, 200);
await page.mouse.down();
for (let i = 0; i <= 5; i++) { await page.mouse.move(300 + i * 15, 200 + i * 15); await page.waitForTimeout(16); }
await page.mouse.up();

await page.click('#waveBtn');
await page.click('#resetBtn');

const dl = page.waitForEvent('download');
await page.click('#saveBtn');
const download = await dl;
const out = '/private/tmp/claude-501/-Users-yxc-Repos-CMG-sand-write/a9fb5736-0ba0-4c26-9d8f-842bde2e21d9/scratchpad/out.jsonl';
await download.saveAs(out);

const lines = fs.readFileSync(out, 'utf8').trim().split('\n');
console.log('events:', lines.length);
console.log(lines.slice(0, 3).join('\n'));
console.log('...');
console.log(lines.slice(-4).join('\n'));
const types = {};
for (const l of lines) { const t = JSON.parse(l).type; types[t] = (types[t] || 0) + 1; }
console.log('by type:', JSON.stringify(types));

// Dev monitor should be open and mirror every event (+ possible ws meta rows).
const dev = await page.evaluate(() => ({
  open: document.getElementById('devPanel').classList.contains('open'),
  rows: document.getElementById('devLog').childElementCount,
  head: document.getElementById('devHead').textContent
}));
console.log('dev monitor:', JSON.stringify(dev));
if (!dev.open || dev.rows < lines.length) throw new Error('dev monitor missing rows');

await browser.close();
server.close();
