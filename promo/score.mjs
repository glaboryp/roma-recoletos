// Shared beat grid: music.mjs synthesizes from it and scene.mjs animates from it.
export const BPM = 120;
export const BEAT = 60 / BPM;
export const BAR = 4 * BEAT;
export const BARS = 15;
export const DURATION = BARS * BAR; // 30 s
export const FPS = 30;
export const at = (bar, beat = 0) => bar * BAR + beat * BEAT;

// Section starts, in bars.
export const SEC = { title: 0, build: 1, fajin: 3, socks: 6, pack: 8, roma: 10, end: 12, final: 14 };
const range = (a, b, step = 1) => Array.from({ length: Math.round((b - a) / step) }, (_, i) => a + i * step);
const FILL = at(SEC.end, -1);
const groove = range(SEC.fajin, SEC.final).flatMap((bar) => range(0, 4).map((b) => at(bar, b)));

export const KICKS = [at(0, 0), at(0, 1), at(0, 2), ...range(SEC.build, SEC.fajin).flatMap((bar) => [at(bar, 0), at(bar, 2)]), ...groove.filter((t) => t !== FILL), at(SEC.final)];
export const CLAPS = groove.filter((t) => Math.round(t / BEAT) % 2 === 1 && t !== FILL);
export const ROLL = [...range(0, 2, 0.5).map((b) => at(SEC.fajin - 1, b)), ...range(2, 4, 0.25).map((b) => at(SEC.fajin - 1, b)), ...range(0, 1, 0.25).map((b) => FILL + b * BEAT)];
export const HATS = groove.map((t) => t + BEAT / 2);

const D = [62, 66, 69], A = [61, 64, 69], Bm = [62, 66, 71], G = [62, 67, 71], Em = [64, 67, 71], A2 = [64, 69, 73];
const LOOP = [[D, 38], [A, 33], [Bm, 35], [G, 31]];
// [start, length in beats, chord, bass root]
export const CHORDS = [
  [at(0), 4, D, 38], [at(1), 4, G, 43], [at(2), 4, A, 45],
  ...range(SEC.fajin, SEC.roma + 1).map((bar, i) => [at(bar), 4, ...LOOP[i % 4]]),
  [at(SEC.roma + 1), 2, Em, 40], [at(SEC.roma + 1, 2), 2, A2, 33],
  [at(SEC.end), 4, D, 38], [at(SEC.end + 1), 2, G, 31], [at(SEC.end + 1, 2), 2, A2, 33],
  [at(SEC.final), 4, [50, 57, ...D, 74], 38],
];
export const STABS = [at(0, 0), at(0, 1), at(0, 2)];
export const IMPACTS = [at(0), at(SEC.fajin), at(SEC.end), at(SEC.final)];

export const chordAt = (t) => CHORDS.findLast(([s]) => s <= t + 1e-9);
export const lastHit = (times, t) => times.reduce((l, x) => (x <= t + 1e-9 ? x : l), -Infinity);
export const pulse = (times, t, k = 10) => Math.exp(-(t - lastHit(times, t)) * k);
