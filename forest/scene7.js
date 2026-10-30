// Scene 7 — Day 2: fire (24 s)
const L = require('./lib'); const F = require('./forest_lib');
const { W, H, C, FONT, keys, clamp, lerp, easeOut, easeIn, easeInOut, spring, pulse, mix } = L;
const DUR = 24;
const mod = (a, n) => ((a % n) + n) % n;
const txt = (x, y, s, fs, fill = '#fff', extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" ${FONT} font-size="${fs}" fill="${fill}" ${extra}>${s}</text>`;
const FX = 1050, FY = 845;

const signalIcon = `<g><circle cx="-26" cy="44" r="30" fill="#c9ced8"/><circle cx="8" cy="30" r="40" fill="#e1e5ec"/><circle cx="-8" cy="-10" r="38" fill="#c9ced8"/><circle cx="22" cy="-34" r="32" fill="#e1e5ec"/><circle cx="4" cy="-62" r="24" fill="#c9ced8"/><path d="M-60 66 L60 66" stroke="#5a3820" stroke-width="10" stroke-linecap="round"/><path d="M56 -60 l18 -18 M72 -30 l26 -6" stroke="${C.orange}" stroke-width="8" stroke-linecap="round"/></g>`;
const flame = (x, y, s, t, ph) => `<path transform="translate(${x} ${y}) scale(${s * (1 + 0.1 * Math.sin(t * 9 + ph))})" d="M0 0 C-26 -6 -30 -40 -10 -70 C-8 -52 4 -50 6 -64 C22 -44 30 -8 0 0 Z" fill="#ff7a2e"/><path transform="translate(${x} ${y}) scale(${s * 0.55})" d="M0 0 C-26 -6 -30 -40 -10 -70 C-8 -52 4 -50 6 -64 C22 -44 30 -8 0 0 Z" fill="#ffd23f"/>`;
function burningForest(t, xT) {
  let g = `<rect x="-130" y="70" width="260" height="14" rx="7" fill="#5a3820"/>`;
  [[-80, 0.9], [0, 1.15], [80, 0.85]].forEach(([x, s]) => { g += `<g transform="translate(${x} 70) scale(${s})"><rect x="-8" y="-24" width="16" height="30" fill="#4a3228"/><path d="M0 -150 L-48 -60 L-22 -60 L-58 -20 L58 -20 L22 -60 L48 -60 Z" fill="#2b5a38"/></g>`; });
  g += flame(-84, 44, 1.5, t, 0) + flame(-10, -20, 1.8, t, 1.4) + flame(70, 30, 1.6, t, 2.5) + flame(-40, 0, 1.1, t, 3.3) + flame(110, 56, 1.1, t, 4.1) + flame(0, 56, 1.3, t, 5.2);
  // smoke wisps
  g += `<circle cx="-30" cy="-120" r="22" fill="#6a6e78" opacity="0.8"/><circle cx="6" cy="-150" r="28" fill="#555965" opacity="0.7"/>`;
  if (xT > 0) g += `<g transform="scale(${spring(xT).toFixed(3)} ${spring(xT).toFixed(3)}) scale(1.55)">${L.stampX(1)}</g>`;
  return g;
}

function smokeColumn(t, k) {
  if (k <= 0) return '';
  let g = ''; const N = 22;
  for (let i = 0; i < N; i++) {
    const ph = mod(t * 0.13 + i / N, 1), yy = -150 - ph * 1050, xx = Math.sin(ph * 5 + i * 1.7) * (30 + ph * 40) + ph * ph * 160, r = (46 + ph * 95) * (0.5 + 0.5 * k);
    const op = Math.min(1, ph * 8) * (1 - ph * 0.55) * 0.95 * k;
    g += `<circle cx="${xx.toFixed(1)}" cy="${yy.toFixed(1)}" r="${r.toFixed(1)}" fill="${mix('#c9ced8', '#f5f7fa', ph)}" opacity="${op.toFixed(2)}"/>`;
  }
  return `<g transform="translate(${FX} ${FY})">${g}</g>`;
}

function leaf(x, y, rot, sc) { return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)}) scale(${sc})"><path d="M-22 0 Q0 -16 22 0 Q0 16 -22 0 Z" fill="#4cc36b" stroke="#2d7a45" stroke-width="3"/><path d="M-20 0 L20 0" stroke="#2d7a45" stroke-width="3"/></g>`; }

function dayHero(t) {
  const x = 650, throwing = t > 7.0 && t < 11.6, cyc = 0.95, ph = mod(t - 7.0, cyc) / cyc;
  let armR = 8;
  if (throwing) armR = ph < 0.35 ? keys(ph, [[0, 20], [0.35, 150]]) : ph < 0.5 ? keys(ph, [[0.35, 150], [0.5, 60]]) : keys(ph, [[0.5, 60], [0.9, 20]]);
  return { x, y: 885, s: 0.8, face: 1, expr: t < 7 ? 'worried' : (t < 11.6 ? 'focused' : 'happy'), armR, armL: 8, walk: 0, blink: L.blinkAt(t) };
}
function dayLayer(t) {
  const s = [];
  s.push(F.forestBackdrop(t, { time: 'day', clearing: 0.6 }));
  s.push(F.tree(220, 690, 1.1, 'pine', { t }), F.tree(480, 680, 0.9, 'leafy', { t }), F.tree(1640, 690, 1.1, 'pine', { t }), F.tree(1860, 680, 0.9, 'leafy', { t }), F.tree(1380, 670, 0.8, 'pine', { t }));
  s.push(smokeColumn(t, easeOut(pulse(t, 8.2, 10.2))));
  s.push(F.campfire(t, FX, FY, 1.1, { lit: 1 }));
  const h = dayHero(t); s.push(L.character(h));
  // leaves thrown
  if (t > 7.0 && t < 12.2) {
    const cyc = 0.95;
    for (let k = 0; k < 6; k++) {
      const t0 = 7.0 + k * cyc + 0.35 * cyc, a = (t - t0) / 0.55;
      if (a < 0 || a > 1 || t0 > 11.6) continue;
      const sx = 650 + 62 * 0.8 + 150 * 0.8 + 20, sy = 885 - 312 * 0.8 - 10;
      for (let j = 0; j < 3; j++) { const aa = clamp(a - j * 0.06); const x = lerp(sx, FX - 20 + j * 24, aa), y = lerp(sy, FY - 60, aa) - Math.sin(aa * Math.PI) * 170; s.push(leaf(x, y, aa * 540 + j * 60, 1 - 0.2 * aa)); }
    }
  }
  if (t > 8.4 && t < 12.2) s.push(`<g opacity="${easeOut(pulse(t, 8.4, 9)).toFixed(2)}"><ellipse cx="${FX}" cy="${FY - 10}" rx="${(80).toFixed(0)}" ry="22" fill="#2d7a45" opacity="0.9"/></g>`);
  return s.join('');
}
function nightLayer(t) {
  const s = [];
  s.push(F.forestBackdrop(t, { time: 'night', clearing: 0.6 }));
  s.push(F.tree(220, 690, 1.1, 'pine', { time: 'night' }), F.tree(480, 680, 0.9, 'leafy', { time: 'night' }), F.tree(1640, 690, 1.1, 'pine', { time: 'night' }), F.tree(1860, 680, 0.9, 'leafy', { time: 'night' }), F.tree(1380, 670, 0.8, 'pine', { time: 'night' }));
  s.push(L.glow(FX, FY - 120, 560, '#ff9a3a', 0.5));
  s.push(F.campfire(t, FX, FY, 1.7, { lit: 1, time: 'night' }));
  const hx = 640;
  s.push(L.character({ x: hx, y: 885, s: 0.8, face: 1, expr: t > 17.6 ? 'focused' : 'happy', armR: t > 17.6 ? 40 : 8, blink: L.blinkAt(t) }));
  s.push(L.darkness(0.28, [{ type: 'circle', x: FX, y: FY - 110, r: 860, core: 0.25 }, { type: 'circle', x: hx, y: 700, r: 300, a: 0.5 }], '#030616'));
  s.push(L.glow(FX, FY - 100, 300, '#ffb050', 0.3));
  // highlighted stone ring
  const hk = easeOut(pulse(t, 15.2, 15.8));
  if (hk > 0) {
    const pl = 0.6 + 0.4 * Math.sin(t * 5), rx = 92 * 1.7 + 20, ry = 28 * 1.7 + 14;
    s.push(`<g opacity="${hk.toFixed(2)}"><ellipse cx="${FX}" cy="${FY + 6}" rx="${rx}" ry="${ry}" fill="none" stroke="#ffe27a" stroke-width="${(9 + 4 * pl).toFixed(1)}" stroke-dasharray="26 14" opacity="0.95"/>
      <path d="M${FX + rx + 6} ${FY - 10} L1340 735" stroke="#ffe27a" stroke-width="5" stroke-linecap="round"/></g>`);
    s.push(L.pill(t, 1460, 'ROCK RING', 15.3, { y: 690, fs: 44, h: 76 }));
  }
  return s.join('');
}

function frame(t) {
  const s = [];
  const nf = easeInOut(pulse(t, 12.2, 13.4));
  s.push(dayLayer(t));
  if (nf > 0) s.push(`<g opacity="${nf.toFixed(3)}">${nightLayer(t)}</g>`);
  s.push(L.bottomShade());

  // three cards
  const outA = 5.7;
  const cards = [[560, 1.2, F.icons.fire, 'WARMTH', C.orange, '#fff2dc', 1.2], [960, 2.6, `<g transform="scale(1.6)">${F.icons.drop}</g>`, 'WATER', C.blue, '#e3f4ff', 2.5], [1360, 3.9, `<g transform="scale(1.0)">${signalIcon}</g>`, 'SIGNAL', '#6c7484', '#f2f4f8', 3.8]];
  if (t < outA + 0.4) {
    cards.forEach(([cx, tin, ic, lab, col, fill, pt], i) => {
      s.push(L.popCard(t, tin, cx, 260, ic, { r: 118, out: outA, fill }));
      const k = t > outA ? 1 - easeIn((t - outA) / 0.35) : 1;
      if (t < outA) s.push(L.pill(t, cx, lab, tin + 0.2, { y: 395, fs: 42, h: 70, fill: col, ink: '#fff' }));
      if (i < 2 && t > tin + 0.7) s.push(`<g opacity="${(k * easeOut(pulse(t, tin + 0.7, tin + 1.1))).toFixed(2)}">${txt(cx + 200, 282, '+', 84, '#fff', 'stroke="#20160f" stroke-width="10" paint-order="stroke"')}</g>`);
    });
  }
  // visible for miles
  if (t > 10.8 && t < 12.6) s.push(L.pill(t, 1450, 'VISIBLE FOR MILES', 10.8, { y: 150, fs: 44, h: 78, fill: C.orange, ink: '#fff' }));
  // warning card
  if (t > 19.3) s.push(L.popCard(t, 19.3, 1560, 330, burningForest(t, t > 20.3 ? pulse(t, 20.3, 20.9) : 0), { r: 175, fill: '#3a2420' }));
  if (t > 19.6) s.push(L.pill(t, 1560, 'WILDFIRE', 19.6, { y: 530, fs: 44, h: 74, fill: C.red, ink: '#fff' }));

  s.push(L.pill(t, 'left', 'DAY 2', 0.3), L.pill(t, 'right', 'FIRE', 0.45));
  s.push(L.captions(t, [
    [6.0, 6.4, 12.3, 'DAY — ', 'SMOKE.'],
    [13.3, 13.7, 17.6, 'NIGHT — ', 'FLAMES.'],
    [17.8, 18.2, null, 'NEVER — ', 'LEAVE IT.'],
  ]));
  return s.join('\n');
}
L.render(frame, DUR, 'scene7.mp4');
