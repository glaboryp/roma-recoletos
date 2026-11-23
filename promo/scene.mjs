// Every frame is a pure function of time: render(ctx, t). frame(i) averages sub-frames for motion blur.
import { BEAT, FPS, at, SEC, KICKS, pulse } from './score.mjs';

const W = 1080, H = 1920;
const C = { paper: '#f3e5cf', deep: '#e8d4b5', raised: '#faf2e4', ink: '#22304d', inkSoft: '#4a5573', wine: '#6b1517', wineDeep: '#521012' };
const DISPLAY = 'Anton', TEXT = '"Raleway Variable"', HAND = '"Gochi Hand"';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, x) => a + (b - a) * x;
const prog = (t, t0, dur) => clamp((t - t0) / dur);
const outExpo = (x) => (x >= 1 ? 1 : 1 - 2 ** (-10 * x));
const outBack = (x, s = 1.9) => 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2;
const inOut = (x) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const mk = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });

function txt(c, s, x, y, { size, font = DISPLAY, color, align = 'center', weight = 400, spacing = 0 }) {
  c.font = `${weight} ${size}px ${font}`;
  c.fillStyle = color; c.textAlign = align; c.textBaseline = 'middle'; c.letterSpacing = `${spacing}px`;
  c.fillText(s, x, y);
  c.letterSpacing = '0px';
}
function placed(c, x, y, s, r, a, draw) {
  if (a <= 0 || s <= 0) return;
  c.save(); c.translate(x, y); c.rotate(r); c.scale(s, s); c.globalAlpha *= Math.min(1, a); draw(); c.restore();
}
const bg = (c, color) => { c.fillStyle = color; c.fillRect(-200, -200, W + 400, H + 400); };

// Letters drop in one by one.
function headline(c, s, y, size, color, t, t0, { out = Infinity } = {}) {
  if (t < t0) return;
  c.font = `400 ${size}px ${DISPLAY}`;
  const widths = [...s].map((ch) => c.measureText(ch).width), total = widths.reduce((a, b) => a + b, 0);
  const leave = inOut(prog(t, out, 0.25));
  let x = W / 2 - total / 2;
  [...s].forEach((ch, j) => {
    const p = prog(t, t0 + j * 0.03, 0.42), e = outExpo(p);
    placed(c, x + widths[j] / 2, y - 140 * (1 - e) - 220 * leave, 1, 0, clamp(p * 4) * (1 - leave), () => txt(c, ch, 0, 0, { size, color }));
    x += widths[j];
  });
}
function line(c, s, y, t, t0, opts) {
  const p = prog(t, t0, 0.5);
  placed(c, W / 2, y + 30 * (1 - outExpo(p)), 1, 0, p * 3, () => txt(c, s, 0, 0, { font: TEXT, weight: 600, ...opts }));
}
function stamp(c, x, y, r, t, t0, { big, small, color, rot = -0.2, bump = 0 }) {
  const p = prog(t, t0, 0.45);
  if (p <= 0) return;
  const s = outBack(p) * (1 + 0.06 * bump);
  placed(c, x, y, s, rot + (1 - outExpo(p)) * 0.8, p * 4, () => {
    c.fillStyle = color; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
    c.strokeStyle = C.paper; c.lineWidth = 4; c.setLineDash([10, 9]); c.beginPath(); c.arc(0, 0, r - 16, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
    txt(c, big, 0, small ? 14 : 4, { size: r * 0.78, color: C.paper });
    if (small) txt(c, small, 0, -r * 0.5, { size: r * 0.2, font: TEXT, weight: 800, color: C.paper, spacing: 2 });
  });
}
function rays(c, cx, cy, n, rot, color, alpha) {
  c.save(); c.globalAlpha = alpha; c.fillStyle = color; c.translate(cx, cy); c.rotate(rot);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, d = Math.PI / n;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a - d / 2) * 2600, Math.sin(a - d / 2) * 2600); c.lineTo(Math.cos(a + d / 2) * 2600, Math.sin(a + d / 2) * 2600); c.fill();
  }
  c.restore();
}

// St Peter's dome silhouette, base centre at origin, about 520 units tall.
function dome(c, color, hole) {
  c.fillStyle = color;
  c.fillRect(-300, -70, 600, 70);
  c.fillRect(-200, -200, 400, 130);
  c.fillRect(-215, -215, 430, 22);
  c.beginPath(); c.ellipse(0, -215, 175, 205, 0, Math.PI, 0); c.fill();
  c.fillRect(-30, -470, 60, 60);
  c.beginPath(); c.ellipse(0, -470, 32, 26, 0, Math.PI, 0); c.fill();
  c.fillRect(-5, -545, 10, 60); c.fillRect(-20, -528, 40, 9);
  c.fillStyle = hole;
  for (let i = -3; i <= 3; i++) { c.beginPath(); c.roundRect(i * 52 - 12, -175, 24, 70, [12, 12, 0, 0]); c.fill(); }
  for (let i = -5; i <= 5; i++) c.fillRect(i * 52 - 6, -58, 12, 46);
  c.strokeStyle = hole; c.lineWidth = 5;
  for (const k of [-0.62, -0.25, 0.25, 0.62]) { c.beginPath(); c.ellipse(0, -215, 175 * Math.abs(k), 205, 0, k < 0 ? Math.PI : 1.5 * Math.PI, k < 0 ? 1.5 * Math.PI : 2 * Math.PI); c.stroke(); }
}

// Fabric tiles, drawn once.
function tile(size, base, draw) {
  const cv = mk(size, size), c = cv.getContext('2d');
  c.fillStyle = base; c.fillRect(0, 0, size, size);
  for (const dx of [-size, 0, size]) for (const dy of [-size, 0, size]) { c.save(); c.translate(dx, dy); draw(c); c.restore(); }
  return cv;
}
function flower(c, x, y, r, petal, centre, rot) {
  c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = petal;
  for (let i = 0; i < 5; i++) { c.rotate((Math.PI * 2) / 5); c.beginPath(); c.ellipse(0, r * 0.62, r * 0.36, r * 0.6, 0, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = centre; c.beginPath(); c.arc(0, 0, r * 0.28, 0, Math.PI * 2); c.fill(); c.restore();
}
function leaf(c, x, y, r, color, rot) {
  c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = color; c.beginPath(); c.ellipse(0, 0, r * 0.3, r, 0, 0, Math.PI * 2); c.fill(); c.restore();
}
function paisley(c, x, y, s, rot, body, trim, dot) {
  c.save(); c.translate(x, y); c.rotate(rot);
  const shape = (k) => { c.beginPath(); c.moveTo(0, s * k); c.bezierCurveTo(-s * k, s * k, -s * k, -s * 0.3 * k, 0, -s * 0.45 * k); c.bezierCurveTo(s * 0.45 * k, -s * 0.6 * k, s * 0.5 * k, -s * 1.05 * k, s * 0.15 * k, -s * 1.3 * k); c.bezierCurveTo(s * 1.05 * k, -s * 1.05 * k, s * 0.95 * k, s * k, 0, s * k); c.closePath(); };
  shape(1); c.fillStyle = body; c.fill(); c.lineWidth = s * 0.08; c.strokeStyle = trim; c.stroke();
  shape(0.55); c.fillStyle = trim; c.fill();
  c.fillStyle = dot; c.beginPath(); c.arc(-s * 0.05, s * 0.2, s * 0.18, 0, Math.PI * 2); c.fill();
  c.restore();
}
const scatter = (n, seed, size) => Array.from({ length: n }, (_, i) => [hash(seed + i * 3.1) * size, hash(seed + i * 7.7) * size, hash(seed + i * 1.3)]);

const FABRICS = [
  ['Flores azules', tile(220, '#2f4058', (c) => {
    scatter(7, 1, 220).forEach(([x, y, k]) => leaf(c, x + 20, y - 18, 22, '#7f97b8', k * 6));
    scatter(6, 2, 220).forEach(([x, y, k]) => flower(c, x, y, 20 + 14 * k, '#e3ebf5', '#7f97b8', k * 3));
  })],
  ['Flores crema', tile(220, '#f0e2c4', (c) => {
    scatter(8, 3, 220).forEach(([x, y, k]) => leaf(c, x - 16, y + 20, 24, '#6f8a4b', k * 6));
    scatter(6, 4, 220).forEach(([x, y, k], i) => flower(c, x, y, 22 + 14 * k, i % 2 ? '#c7432e' : '#e1953a', '#7a2418', k * 3));
  })],
  ['Geométrico rosa', tile(64, '#9c4659', (c) => {
    c.fillStyle = '#f2d3d8';
    for (const [x, y] of [[0, 0], [32, 32]]) { c.beginPath(); c.moveTo(x, y - 12); c.lineTo(x + 10, y); c.lineTo(x, y + 12); c.lineTo(x - 10, y); c.fill(); }
    c.fillStyle = '#5c1f30';
    for (const [x, y] of [[32, 0], [0, 32]]) { c.beginPath(); c.arc(x, y, 5, 0, Math.PI * 2); c.fill(); }
  })],
  ['Cachemir verde', tile(240, '#5d6629', (c) => {
    scatter(5, 5, 240).forEach(([x, y, k], i) => paisley(c, x, y, 34 + 10 * k, k * 6, i % 2 ? '#c99a3b' : '#8c2f35', '#2e2412', '#e9cf8a'));
  })],
  ['Cachemir granate', tile(240, '#6d1a32', (c) => {
    scatter(5, 6, 240).forEach(([x, y, k], i) => paisley(c, x, y, 34 + 10 * k, k * 6, i % 2 ? '#d3a64b' : '#4f7a52', '#2a0b14', '#f1dca0'));
  })],
];
const SOCKS = [['Negro', '#24252a', 480], ['Granate', '#6e1b24', 240], ['Marrón', '#5b3a26', 480], ['Gris', '#8a8b8f', 240], ['Azul', '#1f3a7a', 480]];
const PACK = [
  ['calaveras', tile(78, '#3b3e44', (c) => {
    for (const [x, y, col] of [[20, 20, '#e6b83c'], [59, 59, '#e0743a']]) {
      c.fillStyle = col; c.beginPath(); c.arc(x, y - 3, 9, 0, Math.PI * 2); c.fill(); c.fillRect(x - 5, y + 3, 10, 7);
      c.fillStyle = '#3b3e44'; c.fillRect(x - 5, y - 5, 4, 4); c.fillRect(x + 1, y - 5, 4, 4);
    }
  }), '#7c1d22'],
  ['aviones', tile(90, '#6a4a35', (c) => {
    for (const [x, y, col, r] of [[22, 24, '#f1ead8', 0.5], [66, 68, '#4fa3a0', -0.4]]) {
      c.save(); c.translate(x, y); c.rotate(r); c.fillStyle = col;
      c.beginPath(); c.ellipse(0, 0, 4, 17, 0, 0, Math.PI * 2); c.fill();
      c.fillRect(-15, -4, 30, 6); c.fillRect(-7, 11, 14, 4); c.restore();
    }
  }), '#2f4058'],
  ['rombos', tile(60, '#1d2945', (c) => {
    c.fillStyle = '#7c1d22'; c.beginPath(); c.moveTo(30, 4); c.lineTo(52, 30); c.lineTo(30, 56); c.lineTo(8, 30); c.fill();
    c.strokeStyle = '#c9b48a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(60, 60); c.moveTo(60, 0); c.lineTo(0, 60); c.stroke();
  }), '#7c1d22'],
];
const pat = (c, cv) => c.createPattern(cv, 'repeat');

function sashPath(c, t, L, w) {
  const n = 56, left = [], right = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n, y = -L / 2 + s * L, x = Math.sin(s * Math.PI * 2.2 - t * 3.2) * 28, half = (w / 2) * Math.sin(Math.PI * s) ** 0.55;
    left.push([x - half, y]); right.push([x + half, y]);
  }
  c.beginPath(); c.moveTo(...left[0]);
  for (const p of left) c.lineTo(...p);
  for (const p of right.reverse()) c.lineTo(...p);
  c.closePath();
  return left.map((p, i) => [p, right[n - i]]);
}

function sockPath(c, leg) {
  c.beginPath(); c.moveTo(-70, 0); c.lineTo(-70, leg);
  c.bezierCurveTo(-70, leg + 95, -25, leg + 140, 35, leg + 140);
  c.lineTo(140, leg + 140);
  c.bezierCurveTo(192, leg + 140, 196, leg + 52, 140, leg + 48);
  c.lineTo(100, leg + 44);
  c.quadraticCurveTo(70, leg + 40, 70, leg - 20);
  c.lineTo(70, 0); c.closePath();
}
function sock(c, t, id, fill, leg, accent) {
  sockPath(c, leg);
  c.fillStyle = fill; c.fill();
  c.save(); c.clip();
  if (accent) {
    c.fillStyle = accent;
    c.beginPath(); c.ellipse(-35, leg + 95, 70, 62, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(178, leg + 95, 50, 60, 0, 0, Math.PI * 2); c.fill();
  }
  c.strokeStyle = 'rgba(255,255,255,0.13)'; c.lineWidth = 6;
  for (let x = -64; x < 200; x += 15) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, leg + 150); c.stroke(); }
  const shade = c.createLinearGradient(-70, 0, 70, 0);
  shade.addColorStop(0, 'rgba(0,0,0,0.28)'); shade.addColorStop(0.45, 'rgba(0,0,0,0)'); shade.addColorStop(1, 'rgba(0,0,0,0.18)');
  c.fillStyle = shade; c.fillRect(-70, 0, 270, leg + 150);
  if (!accent) {
    c.fillStyle = 'rgba(255,240,205,0.45)';
    for (let k = 0; k < 90; k++) c.fillRect(-70 + hash(id * 91 + k) * 260, hash(id * 57 + k * 3) * (leg + 140), 3, 3);
    for (let k = 0; k < 16; k++) {
      const x = -60 + hash(id * 13 + k) * 120, y = hash(id * 29 + k) * (leg + 60), tw = Math.max(0, Math.sin(t * 7 + hash(k + id) * 40)) ** 10;
      if (tw < 0.05) continue;
      c.save(); c.translate(x, y); c.rotate(Math.PI / 4 * k); c.fillStyle = `rgba(255,246,220,${0.3 + 0.7 * tw})`;
      const s = 4 + 14 * tw; c.beginPath(); c.moveTo(0, -s); c.lineTo(2, 0); c.lineTo(0, s); c.lineTo(-2, 0); c.moveTo(-s, 0); c.lineTo(0, 2); c.lineTo(s, 0); c.lineTo(0, -2); c.fill(); c.restore();
    }
  }
  c.restore();
  c.fillStyle = fill;
  for (let j = 0; j < 7; j++) { c.beginPath(); c.arc(-60 + j * 20, -2, 12, Math.PI, 0); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,0.12)';
  for (let j = 0; j < 7; j++) { c.beginPath(); c.arc(-60 + j * 20, -2, 12, Math.PI, 0); c.fill(); }
}
function hang(c, t, t0, x, y, s, draw) {
  if (t < t0) return;
  const tau = t - t0, drop = outExpo(prog(t, t0, 0.32));
  const swing = 0.2 * Math.exp(-3.2 * tau) * Math.sin(10 * tau);
  c.save(); c.translate(x, y - 1500 * (1 - drop)); c.rotate(swing); c.scale(s, s); draw(); c.restore();
}

function plane(c, color, fold) {
  c.fillStyle = color;
  c.beginPath(); c.moveTo(46, 0); c.lineTo(-34, -26); c.lineTo(-16, 0); c.lineTo(-34, 26); c.closePath(); c.fill();
  c.fillStyle = fold; c.beginPath(); c.moveTo(46, 0); c.lineTo(-16, 0); c.lineTo(-24, 12); c.closePath(); c.fill();
}
function pin(c, color, dot) {
  c.fillStyle = color; c.beginPath(); c.arc(0, -70, 46, Math.PI * 0.82, Math.PI * 0.18); c.lineTo(0, 0); c.closePath(); c.fill();
  c.fillStyle = dot; c.beginPath(); c.arc(0, -70, 18, 0, Math.PI * 2); c.fill();
}
const bez = (p0, p1, p2, s) => [0, 1].map((k) => (1 - s) ** 2 * p0[k] + 2 * (1 - s) * s * p1[k] + s * s * p2[k]);

// ---------- scenes ----------

function intro(c, t) {
  bg(c, C.wine);
  rays(c, 540, 1040, 20, t * 0.12, C.wineDeep, 0.5 + 0.35 * pulse(KICKS, t, 5));
  const up = inOut(prog(t, at(SEC.build), BEAT * 1.4));
  c.save();
  c.translate(540, 900 - 330 * up); c.scale(lerp(1, 0.62, up), lerp(1, 0.62, up));
  [['¡RUMBO', -270, 290], ['A', -40, 190], ['ROMA!', 230, 360]].forEach(([s, y, size], k) => {
    const h = at(0, k);
    if (t < h) return;
    const p = prog(t, h, 0.45), shake = Math.exp(-(t - h) * 14) * 16 * Math.sin((t - h) * 85);
    placed(c, shake, y, lerp(2.6, 1, outExpo(p)), 0, p * 6, () => txt(c, s, 0, 0, { size, color: C.paper }));
  });
  c.restore();

  const rise = outExpo(prog(t, at(SEC.build, 0.5), BEAT * 3));
  placed(c, 540, 1920 + 40 + 700 * (1 - rise), 1.55, 0, rise * 3, () => dome(c, C.paper, C.wine));

  const write = prog(t, at(SEC.build, 1), BEAT * 3);
  if (write > 0) {
    c.save(); c.translate(540, 1020); c.rotate(-0.05);
    c.font = `400 118px ${HAND}`;
    const w = c.measureText('Semana Santa 2027').width;
    c.beginPath(); c.rect(-w / 2 - 20, -120, (w + 40) * write, 240); c.clip();
    txt(c, 'Semana Santa 2027', 0, 0, { size: 118, font: HAND, color: C.paper });
    c.restore();
  }

  const iris = prog(t, at(SEC.fajin, -1), BEAT);
  if (iris > 0) { c.fillStyle = C.paper; c.beginPath(); c.arc(540, 1240, 1700 * iris ** 3, 0, Math.PI * 2); c.fill(); }
}

function fajines(c, t) {
  const t0 = at(SEC.fajin), SLOT = 2 * BEAT;
  bg(c, C.paper);
  headline(c, 'FAJINES', 300, 250, C.wine, t, t0);
  line(c, 'de tela estampada', 450, t, t0 + BEAT * 0.5, { size: 54, color: C.inkSoft });

  const k = Math.floor((t - t0) / SLOT), cur = k % FABRICS.length, prev = (k + FABRICS.length - 1) % FABRICS.length;
  const beatT = t0 + k * SLOT, wipe = outExpo(prog(t, beatT, 0.25)), enter = outExpo(prog(t, t0, 0.6)), L = 1060;
  c.save();
  c.translate(540 + 600 * (1 - enter), 1135 + 900 * (1 - enter)); c.rotate(-0.22 + 0.7 * (1 - enter));
  c.strokeStyle = C.ink; c.lineWidth = 4;
  c.beginPath(); c.moveTo(Math.sin(-t * 3.2) * 28, -L / 2); c.quadraticCurveTo(50, -L / 2 - 50, 25, -L / 2 - 95); c.stroke();
  c.beginPath(); c.moveTo(Math.sin(Math.PI * 2.2 - t * 3.2) * 28, L / 2); c.quadraticCurveTo(-45, L / 2 + 40, -15, L / 2 + 75); c.stroke();
  c.save(); c.translate(24, 28); sashPath(c, t, L, 300); c.fillStyle = 'rgba(34,48,77,0.2)'; c.fill(); c.restore();
  const quads = sashPath(c, t, L, 300);
  c.save(); c.clip();
  const drift = new DOMMatrix().translate(0, -t * 30);
  const fill = (i) => { const p = pat(c, FABRICS[i][1]); p.setTransform(drift); c.fillStyle = p; c.fillRect(-300, -L, 600, 2 * L); };
  fill(k > 0 && wipe < 1 ? prev : cur);
  if (k > 0 && wipe < 1) { c.save(); c.beginPath(); c.rect(-300, L / 2 + 40 - wipe * (L + 80), 600, 2 * L); c.clip(); fill(cur); c.restore(); }
  for (let i = 0; i < quads.length - 1; i++) {
    const s = i / (quads.length - 1), sh = Math.cos(s * Math.PI * 2.2 - t * 3.2);
    c.fillStyle = sh > 0 ? `rgba(255,248,230,${0.16 * sh})` : `rgba(20,10,10,${-0.22 * sh})`;
    const [[a, b], [d, e]] = [quads[i], quads[i + 1]];
    c.beginPath(); c.moveTo(...a); c.lineTo(...d); c.lineTo(...e); c.lineTo(...b); c.closePath(); c.fill();
  }
  c.restore();
  c.restore();

  stamp(c, 860, 1430, 150, t, at(SEC.fajin, 1), { big: '14 €', small: 'FAJÍN', color: C.wine, bump: pulse(KICKS, t, 8) });
  const pop = 1 + 0.25 * Math.exp(-(t - beatT) * 14);
  placed(c, 540, 1805, pop * enter, -0.03, enter, () => txt(c, FABRICS[cur][0], 0, 0, { size: 88, font: HAND, color: C.ink }));
}

function calcetines(c, t) {
  const t0 = at(SEC.socks), t1 = at(SEC.pack);
  bg(c, C.paper);
  headline(c, 'CALCETINES', 270, 210, C.ink, t, t0, { out: t1 - 0.12 });
  if (t < t1 - 0.12) line(c, 'largos y cortos · con brillo', 400, t, t0 + BEAT * 0.5, { size: 50, color: C.inkSoft });
  headline(c, 'PACK CHICO', 270, 230, C.wine, t, t1 + 0.05);
  line(c, 'tres pares con dibujos', 400, t, t1 + BEAT * 0.5, { size: 50, color: C.inkSoft });

  const rail = 560, lift = inOut(prog(t, t1 - 0.2, 0.3)) * -2600;
  c.fillStyle = C.ink; c.fillRect(-50, rail - 8, W + 100, 12);
  c.save(); c.translate(0, lift);
  SOCKS.forEach(([name, color, leg], i) => {
    const x = 540 + (i - 2) * 205 - 40, d = at(SEC.socks, i * 0.5);
    hang(c, t, d, x, rail, 0.95, () => sock(c, t, i + 1, color, leg));
    if (t > d) placed(c, x + 20, 1290 + (i % 2) * 30, 1, (hash(i) - 0.5) * 0.15, prog(t, d + 0.15, 0.3), () => txt(c, name.toLowerCase(), 0, 0, { size: 58, font: HAND, color: C.ink }));
  });
  stamp(c, 330, 1600, 145, t, at(SEC.socks, 3), { big: '9 €', small: '1 PAR', color: C.wine, rot: -0.18 });
  stamp(c, 750, 1610, 160, t, at(SEC.socks, 4), { big: '16 €', small: '2 PARES', color: C.ink, rot: 0.14 });
  c.restore();

  PACK.forEach(([name, fabric, accent], i) => {
    const x = 540 + (i - 1) * 290 - 50, d = at(SEC.pack, 0.5 + i * 0.5);
    hang(c, t, d, x, rail, 1.12, () => sock(c, t, 10 + i, pat(c, fabric), 400, accent));
    if (t > d) placed(c, x + 40, 1270, 1, (hash(i + 5) - 0.5) * 0.15, prog(t, d + 0.15, 0.3), () => txt(c, name, 0, 0, { size: 58, font: HAND, color: C.ink }));
  });
  stamp(c, 540, 1580, 190, t, at(SEC.pack, 3), { big: '25 €', small: '3 PARES', color: C.wine, rot: -0.1, bump: pulse(KICKS, t, 8) });
}

const ROUTE = [[190, 1580], [200, 980], [790, 1080]];
function roma(c, t) {
  const t0 = at(SEC.roma);
  bg(c, C.wine);
  rays(c, 800, 900, 16, -t * 0.1, C.wineDeep, 0.45);
  headline(c, 'CADA COMPRA', 260, 170, C.paper, t, t0);
  headline(c, 'NOS ACERCA', 430, 170, C.paper, t, t0 + BEAT);

  const fly = inOut(prog(t, at(SEC.roma, 1), BEAT * 3));
  c.save(); c.strokeStyle = 'rgba(243,229,207,0.75)'; c.lineWidth = 7; c.setLineDash([20, 18]); c.lineCap = 'round';
  c.beginPath(); c.moveTo(...ROUTE[0]);
  for (let s = 0; s <= fly; s += 0.01) c.lineTo(...bez(...ROUTE, s));
  c.stroke(); c.restore();
  c.fillStyle = C.paper; c.beginPath(); c.arc(...ROUTE[0], 16, 0, Math.PI * 2); c.fill();

  const land = at(SEC.roma, 4);
  placed(c, ...ROUTE[2], 1.6 * outBack(prog(t, land, 0.4)), 0, 1, () => pin(c, C.paper, C.wine));
  headline(c, 'A ROMA', 610, 200, C.paper, t, land);
  if (fly < 1) {
    const [x, y] = bez(...ROUTE, fly), [x2, y2] = bez(...ROUTE, Math.min(1, fly + 0.01));
    placed(c, x, y, 2.3, Math.atan2(y2 - y, x2 - x), 1, () => plane(c, C.paper, C.deep));
  }
  line(c, 'Vendemos fajines y calcetines', 1700, t, at(SEC.roma, 2), { size: 54, color: C.paper });
  line(c, 'para pagarnos el viaje', 1775, t, at(SEC.roma, 2.5), { size: 54, color: C.paper });

  const iris = prog(t, at(SEC.end, -1), BEAT);
  if (iris > 0) { c.fillStyle = C.paper; c.beginPath(); c.arc(790, 970, 1900 * iris ** 3, 0, Math.PI * 2); c.fill(); }
}

function end(c, t) {
  const t0 = at(SEC.end), drift = 1 + 0.04 * prog(t, t0, at(SEC.final + 1) - t0);
  bg(c, C.paper);
  c.save(); c.translate(540, 960); c.scale(drift, drift); c.translate(-540, -960);
  placed(c, 540, 560, 0.62 * outBack(prog(t, t0, 0.5)), 0, 1, () => dome(c, C.wine, C.paper));
  headline(c, '¡RUMBO A', 715, 230, C.wine, t, t0 + 0.02);
  headline(c, 'ROMA!', 990, 290, C.wine, t, t0 + BEAT * 0.5);
  line(c, 'Fajines y calcetines', 1195, t, at(SEC.end, 1.5), { size: 60, weight: 700, color: C.ink });
  line(c, 'Semana Santa 2027', 1270, t, at(SEC.end, 2), { font: HAND, weight: 400, size: 62, color: C.inkSoft });

  const p = prog(t, at(SEC.end, 3.5), 0.45);
  placed(c, 540, 1470, outBack(p), 0, p * 4, () => {
    c.fillStyle = C.wine; c.beginPath(); c.roundRect(-400, -62, 800, 124, 62); c.fill();
    txt(c, 'roma-recoletos.vercel.app', 0, 2, { font: TEXT, weight: 800, size: 50, color: C.paper });
  });
  line(c, 'Haz tu pedido aquí', 1378, t, at(SEC.end, 3), { font: HAND, weight: 400, size: 56, color: C.ink });
  line(c, 'recoletos', 1690, t, at(SEC.end, 5), { size: 120, weight: 800, color: C.ink, spacing: -5 });
  line(c, '-centro universitario-', 1775, t, at(SEC.end, 5.5), { size: 32, weight: 700, color: C.ink });
  c.restore();
}

function band(c, t, t0, color) {
  const p = prog(t, t0 - 0.24, 0.48);
  if (p <= 0 || p >= 1) return;
  const y = lerp(H + 1500, -1500, inOut(p));
  c.fillStyle = color; c.beginPath();
  c.moveTo(-200, y - 1150 + 260); c.lineTo(W + 200, y - 1150 - 260); c.lineTo(W + 200, y + 1150 - 260); c.lineTo(-200, y + 1150 + 260); c.fill();
}

function render(c, t) {
  c.save();
  const z = 1 + 0.016 * pulse(KICKS, t, 9);
  c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
  if (t < at(SEC.fajin)) intro(c, t);
  else if (t < at(SEC.socks)) fajines(c, t);
  else if (t < at(SEC.roma)) calcetines(c, t);
  else if (t < at(SEC.end)) roma(c, t);
  else end(c, t);
  band(c, t, at(SEC.socks), C.ink);
  band(c, t, at(SEC.roma), C.wine);
  c.restore();
}

// ---------- frame output ----------

const out = document.getElementById('c'), octx = out.getContext('2d');
const scratch = mk(W, H), sctx = scratch.getContext('2d');
const grain = mk(W / 2, H / 2);
{
  const g = grain.getContext('2d'), img = g.createImageData(grain.width, grain.height);
  for (let i = 0; i < img.data.length; i += 4) { const v = 128 + (hash(i * 0.37) - 0.5) * 90; img.data.set([v, v, v, 255], i); }
  g.putImageData(img, 0, 0);
}
const vignette = octx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75);
vignette.addColorStop(0, 'rgba(0,0,0,0)'); vignette.addColorStop(1, 'rgba(20,8,8,0.22)');

const SUB = 16, SHUTTER = 0.5;
window.frame = (i, { blur = true } = {}) => {
  const n = blur ? SUB : 1;
  for (let k = 0; k < n; k++) {
    const t = Math.max(0, (i + (blur ? ((k + 0.5) / n - 0.5) * SHUTTER : 0)) / FPS);
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    render(sctx, t);
    octx.globalAlpha = 1 / (k + 1);
    octx.drawImage(scratch, 0, 0);
  }
  octx.globalAlpha = 0.07; octx.globalCompositeOperation = 'overlay';
  octx.drawImage(grain, -((i * 37) % 60), -((i * 53) % 60), W + 120, H + 120);
  octx.globalAlpha = 1; octx.globalCompositeOperation = 'source-over';
  octx.fillStyle = vignette; octx.fillRect(0, 0, W, H);
  return out.toDataURL('image/png');
};
window.ready = Promise.all([`400 100px ${DISPLAY}`, `600 100px ${TEXT}`, `800 100px ${TEXT}`, `400 100px ${HAND}`].map((f) => document.fonts.load(f, '¡€áéíóú'))).then(() => true);

const preview = new URLSearchParams(location.search).get('t');
if (preview !== null) window.ready.then(() => window.frame(Math.round(Number(preview) * FPS)));
