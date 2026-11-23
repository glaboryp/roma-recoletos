// Synthesizes out/music.wav from score.mjs. No samples: every sound is an oscillator or noise.
import { mkdirSync, writeFileSync } from 'node:fs';
import { BEAT, BAR, DURATION, KICKS, CLAPS, ROLL, HATS, CHORDS, STABS, IMPACTS, SEC, at, chordAt } from './score.mjs';
const BUILD = at(SEC.build), DROP = at(SEC.fajin), FINAL = at(SEC.final), FILL = at(SEC.end, -1);

const SR = 48000;
const N = Math.round(DURATION * SR);
const bus = () => [new Float32Array(N), new Float32Array(N)];
const drums = bus(), music = bus(), verb = bus(), echo = bus();

let seed = 7;
const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

function biquad(type) {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x, f, q = 0.707) => {
    const w = (2 * Math.PI * Math.min(f, SR * 0.45)) / SR, a = Math.sin(w) / (2 * q), cw = Math.cos(w);
    const [b0, b1, b2] = type === 'lp' ? [(1 - cw) / 2, 1 - cw, (1 - cw) / 2] : type === 'hp' ? [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2] : [a, 0, -a];
    const a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a;
    const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
}

// gen(t) returns one sample; pan -1..1; sends add the dry signal to reverb / echo buses.
function play(target, start, len, gen, { gain = 1, pan = 0, rev = 0, del = 0 } = {}) {
  const s0 = Math.round(start * SR), gl = Math.cos(((pan + 1) * Math.PI) / 4), gr = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < len * SR && s0 + i < N; i++) {
    if (s0 + i < 0) continue;
    const v = gen(i / SR) * gain, l = v * gl, r = v * gr;
    target[0][s0 + i] += l; target[1][s0 + i] += r;
    if (rev) { verb[0][s0 + i] += l * rev; verb[1][s0 + i] += r * rev; }
    if (del) { echo[0][s0 + i] += l * del; echo[1][s0 + i] += r * del; }
  }
}

const kick = (t0, g = 1) => {
  let ph = 0;
  play(drums, t0, 0.5, (t) => {
    ph += (2 * Math.PI * (48 + 120 * Math.exp(-t * 32))) / SR;
    return Math.sin(ph) * Math.exp(-t * 6.5) + noise() * Math.exp(-t * 400) * 0.25;
  }, { gain: 0.95 * g });
};
const clap = (t0, g = 1, rev = 0.25) => {
  const bp = biquad('bp');
  play(drums, t0, 0.35, (t) => {
    const burst = t < 0.03 ? Math.exp(-((t % 0.01) * 300)) : Math.exp(-(t - 0.03) * 16);
    return bp(noise(), 1400, 1.2) * burst * 2.2;
  }, { gain: 0.5 * g, rev });
};
const hat = (t0, g = 1, open = false, pan = 0.25) => {
  const hp = biquad('hp');
  play(drums, t0, open ? 0.3 : 0.08, (t) => hp(noise(), 8000) * Math.exp(-t * (open ? 14 : 55)), { gain: 0.28 * g, pan });
};
const crash = (t0, g = 1) => {
  const hp = biquad('hp');
  play(drums, t0, 2.2, (t) => hp(noise(), 5000) * Math.exp(-t * 2.2), { gain: 0.22 * g, rev: 0.4 });
};
const boom = (t0) => {
  let ph = 0;
  play(drums, t0, 1.6, (t) => { ph += (2 * Math.PI * (36 + 30 * Math.exp(-t * 6))) / SR; return Math.sin(ph) * Math.exp(-t * 2.4); }, { gain: 0.7 });
};

// Detuned saws through a lowpass that opens on the attack.
function saws(target, start, len, notes, { gain, cutoff, env = 0, attack = 0.005, release = 0.1, voices = 3, pan = 0, rev = 0, del = 0, sub = false }) {
  const oscs = notes.flatMap((m) => Array.from({ length: voices }, (_, v) => ({ f: mtof(m) * 2 ** ((v - (voices - 1) / 2) * 0.09 / 12), ph: (noise() + 1) / 2 })));
  const lp = biquad('lp');
  let sph = 0;
  play(target, start, len + release, (t) => {
    let s = 0;
    for (const o of oscs) { o.ph = (o.ph + o.f / SR) % 1; s += 2 * o.ph - 1; }
    s /= Math.sqrt(oscs.length);
    if (sub) { sph += (2 * Math.PI * mtof(notes[0] - 12)) / SR; s += Math.sin(sph) * 1.2; }
    const amp = Math.min(1, t / attack) * (t > len ? Math.exp(-(t - len) / (release / 4)) : 1);
    return lp(s, cutoff + env * Math.exp(-t * 9), 0.9) * amp;
  }, { gain, pan, rev, del });
}

const pluck = (t0, m, g = 1, pan = 0) => {
  const lp = biquad('lp');
  let ph = 0;
  const f = mtof(m);
  play(music, t0, 0.35, (t) => {
    ph = (ph + f / SR) % 1;
    return lp((ph < 0.35 ? 1 : -1) * Math.exp(-t * 11), 900 + 4200 * Math.exp(-t * 18));
  }, { gain: 0.16 * g, pan, del: 0.45, rev: 0.12 });
};

// Drums
KICKS.forEach((t) => kick(t, t < DROP && t >= BUILD ? 0.8 : 1));
CLAPS.forEach((t) => clap(t));
ROLL.forEach((t) => clap(t, 1.4 * (0.35 + 0.65 * (t >= DROP ? (t - FILL) / BEAT : (t - at(SEC.fajin - 1)) / BAR)), 0.1));
HATS.forEach((t, i) => { hat(t, 1, i % 4 === 3); hat(t - BEAT / 4, 0.35, false, -0.3); hat(t + BEAT / 4, 0.35, false, -0.3); });
for (let b = 3; b < 4; b += 0.25) hat(at(0, b), 0.5 + (b - 3));
IMPACTS.forEach((t) => { crash(t, t === FINAL ? 1.3 : 1); boom(t); });

// Riser over the build bar: noise through a bandpass sweeping up.
{
  const bp = biquad('bp');
  play(music, BUILD, DROP - BUILD, (t) => { const p = t / (DROP - BUILD); return bp(noise(), 300 * 20 ** p, 2) * p * p * 1.4; }, { gain: 0.75, rev: 0.3 });
}

// Harmony
for (const [start, beats, notes, root] of CHORDS) {
  const len = beats * BEAT, groove = start >= DROP && start < FINAL, end = start >= FINAL;
  if (end) saws(music, start, 1.7, notes, { gain: 0.3, cutoff: 900, env: 3000, attack: 0.004, release: 0.3, rev: 0.6 });
  else if (start >= BUILD) saws(music, start, len, notes, { gain: groove ? 0.13 : 0.16, cutoff: groove ? 1400 : 700 + 1400 * (start - BUILD) / (DROP - BUILD), attack: 0.05, release: 0.15, voices: 3, rev: 0.25 });
  if (groove) {
    for (let e = 0; e < beats * 2; e++) if (e % 2) saws(music, start + (e * BEAT) / 2, BEAT / 2 * 0.8, [root], { gain: 0.32, cutoff: 260, env: 900, voices: 2, release: 0.03, sub: true });
    const tones = [...notes.map((n) => n + 12), notes[0] + 24];
    const order = [0, 1, 2, 3, 2, 1];
    for (let s = 0; s < beats * 4; s++) pluck(start + (s * BEAT) / 4, tones[order[s % 6]], s % 4 === 0 ? 1 : 0.7, s % 2 ? 0.35 : -0.35);
  }
}
STABS.forEach((t) => saws(music, t, 0.18, [...chordAt(t)[2], 50], { gain: 0.32, cutoff: 600, env: 5000, release: 0.25, rev: 0.5 }));

// Echo bus: dotted-eighth ping-pong.
{
  const d = Math.round(BEAT * 0.75 * SR);
  for (let i = d; i < N; i++) { echo[0][i] += echo[1][i - d] * 0.42; echo[1][i] += echo[0][i - d] * 0.42; }
  const lpL = biquad('lp'), lpR = biquad('lp');
  for (let i = 0; i < N; i++) { music[0][i] += lpL(echo[0][i], 3500) * 0.5; music[1][i] += lpR(echo[1][i], 3500) * 0.5; }
}

// Sidechain: music ducks under every kick.
for (let i = 0; i < N; i++) {
  const t = i / SR, since = t - KICKS.reduce((l, k) => (k <= t ? k : l), -9);
  const g = 1 - 0.55 * Math.exp(-since * 9) * Math.min(1, since * 400);
  music[0][i] *= g; music[1][i] *= g;
}

// Schroeder reverb on the send bus.
function reverb(input, spread) {
  const combs = [1557, 1617, 1491, 1422].map((n) => ({ buf: new Float32Array(n + spread), i: 0, lp: 0 }));
  const aps = [556, 441].map((n) => ({ buf: new Float32Array(n + spread), i: 0 }));
  const outp = new Float32Array(N);
  for (let n = 0; n < N; n++) {
    let s = 0;
    for (const c of combs) { const y = c.buf[c.i]; c.lp = y * 0.75 + c.lp * 0.25; c.buf[c.i] = input[n] * 0.3 + c.lp * 0.86; c.i = (c.i + 1) % c.buf.length; s += y; }
    for (const a of aps) { const b = a.buf[a.i]; const y = -s + b; a.buf[a.i] = s + b * 0.5; a.i = (a.i + 1) % a.buf.length; s = y; }
    outp[n] = s;
  }
  return outp;
}
const rl = reverb(verb[0], 0), rr = reverb(verb[1], 23);

const L = new Float32Array(N), R = new Float32Array(N);
for (let i = 0; i < N; i++) {
  L[i] = drums[0][i] + music[0][i] + rl[i] * 0.35;
  R[i] = drums[1][i] + music[1][i] + rr[i] * 0.35;
}
let peak = 0;
for (let i = 0; i < N; i++) { L[i] = Math.tanh(L[i] * 1.3); R[i] = Math.tanh(R[i] * 1.3); peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
const fade = (i) => Math.min(1, i / (0.005 * SR), (N - i) / (0.06 * SR));

const pcm = Buffer.alloc(44 + N * 4);
pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + N * 4, 4); pcm.write('WAVEfmt ', 8);
pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22); pcm.writeUInt32LE(SR, 24);
pcm.writeUInt32LE(SR * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34); pcm.write('data', 36); pcm.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  const g = (0.89 / peak) * fade(i);
  pcm.writeInt16LE(Math.round(L[i] * g * 32767), 44 + i * 4);
  pcm.writeInt16LE(Math.round(R[i] * g * 32767), 46 + i * 4);
}
mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
writeFileSync(new URL('./out/music.wav', import.meta.url), pcm);
console.log(`music.wav: ${DURATION.toFixed(3)} s, ${N} samples, peak before normalize ${peak.toFixed(3)}`);
