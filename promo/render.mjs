// node promo/render.mjs [--draft]  →  promo/out/rumbo-a-roma.mp4 + contact sheets.
// Drives headless Chrome over the DevTools pipe and streams PNG frames into ffmpeg.
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DURATION, FPS, BEAT, SEC, at } from './score.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
const OUT = join(here, 'out');
const draft = process.argv.includes('--draft');
const frames = Math.round(DURATION * FPS);

execFileSync('node', [join(here, 'music.mjs')], { stdio: 'inherit' });

const profile = mkdtempSync(join(tmpdir(), 'promo-chrome-'));
const chrome = spawn('google-chrome', ['--headless=new', '--remote-debugging-pipe', '--allow-file-access-from-files', '--hide-scrollbars', '--no-first-run', `--user-data-dir=${profile}`, '--window-size=1080,1920', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
const [toChrome, fromChrome] = [chrome.stdio[3], chrome.stdio[4]];
let id = 0, buf = '';
const pending = new Map();
fromChrome.on('data', (d) => {
  buf += d;
  let k;
  while ((k = buf.indexOf('\0')) >= 0) {
    const msg = JSON.parse(buf.slice(0, k)); buf = buf.slice(k + 1);
    if (msg.id && pending.has(msg.id)) { const { ok, ko } = pending.get(msg.id); pending.delete(msg.id); msg.error ? ko(new Error(JSON.stringify(msg.error))) : ok(msg.result); }
  }
});
const send = (method, params = {}, sessionId) => new Promise((ok, ko) => { pending.set(++id, { ok, ko }); toChrome.write(JSON.stringify({ id, method, params, sessionId }) + '\0'); });
const evaluate = async (session, expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, session);
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result.value;
};

try {
  const { targetInfos } = await send('Target.getTargets');
  const { sessionId } = await send('Target.attachToTarget', { targetId: targetInfos.find((t) => t.type === 'page').targetId, flatten: true });
  await send('Page.enable', {}, sessionId);
  await send('Page.navigate', { url: `file://${join(here, 'scene.html')}` }, sessionId);
  for (let i = 0; i < 100 && !(await evaluate(sessionId, 'typeof window.frame === "function"').catch(() => false)); i++) await new Promise((r) => setTimeout(r, 100));
  await evaluate(sessionId, 'window.ready');

  const video = join(OUT, draft ? 'draft.mp4' : 'rumbo-a-roma.mp4');
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', '-i', join(OUT, 'music.wav'),
    '-c:v', 'libx264', '-preset', draft ? 'veryfast' : 'slow', '-crf', draft ? '23' : '16', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', video], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((ok, ko) => ff.on('close', (code) => (code ? ko(new Error(`ffmpeg exited ${code}`)) : ok())));
  const started = Date.now();
  for (let i = 0; i < frames; i++) {
    const url = await evaluate(sessionId, `window.frame(${i}, { blur: ${!draft} })`);
    if (!ff.stdin.write(Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 30 === 0) process.stdout.write(`\rframe ${i}/${frames}  ${((Date.now() - started) / 1000).toFixed(0)} s`);
  }
  ff.stdin.end();
  await done;
  console.log(`\n${video}`);

  // Contact sheets: one frame every two beats, and each transition at full frame rate.
  const tag = draft ? 'draft-' : '';
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', video, '-vf', `fps=${1 / (2 * BEAT)},scale=216:-1,tile=6x5:padding=6:color=black`, '-frames:v', '1', join(OUT, `${tag}sheet-beats.png`)]);
  for (const [name, t] of [['t1', at(SEC.fajin)], ['t2', at(SEC.socks)], ['t3', at(SEC.roma)], ['t4', at(SEC.end)]])
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', String(t - 0.3), '-i', video, '-vf', 'scale=180:-1,tile=9x2:padding=4', '-frames:v', '1', join(OUT, `${tag}sheet-${name}.png`)]);
  console.log('contact sheets in', OUT);
} finally {
  const exited = new Promise((r) => chrome.once('exit', r));
  chrome.kill();
  await exited;
  rmSync(profile, { recursive: true, force: true });
}
