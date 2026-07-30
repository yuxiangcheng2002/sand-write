// E2E: mock TouchDesigner WebSocket DAT on :9980, draw a stroke,
// verify events arrive live over the socket.
import { chromium } from 'playwright';
import { WebSocketServer } from 'ws';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = '/Users/yxc/Repos/CMG/sand-write';
const server = http.createServer((req, res) => {
  const p = new URL(req.url, 'http://x').pathname;
  const f = path.join(ROOT, p === '/' ? 'index.html' : p);
  try { res.end(fs.readFileSync(f)); } catch { res.statusCode = 404; res.end(); }
}).listen(8932);

const received = [];
const wss = new WebSocketServer({ port: 9980 });
wss.on('connection', s => s.on('message', m => received.push(JSON.parse(m.toString()))));

const browser = await chromium.launch({
  executablePath: '/Users/yxc/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'
});
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
await page.goto('http://127.0.0.1:8932/');
await page.waitForTimeout(800);

const dotLive = await page.evaluate(() => document.getElementById('tdDot').classList.contains('live'));
console.log('dot live:', dotLive);

await page.mouse.move(200, 300);
await page.mouse.down();
for (let x = 200; x <= 320; x += 30) { await page.mouse.move(x, 300); await page.waitForTimeout(16); }
await page.mouse.up();
await page.waitForTimeout(300);

console.log('received over WS:', received.length);
console.log('types:', received.map(e => e.type).join(','));
console.log('first:', JSON.stringify(received[0]));

await browser.close();
wss.close();
server.close();
