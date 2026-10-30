// Scene 8 — Day 3: signals (36 s)
const L = require('./lib'); const F = require('./forest_lib');
const { W, H, C, FONT, keys, clamp, lerp, rng, easeOut, easeIn, easeInOut, spring, pulse, mix } = L;
const DUR = 36;
const mod = (a, n) => ((a % n) + n) % n;
const txt = (x, y, s, fs, fill = '#fff', extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" ${FONT} font-size="${fs}" fill="${fill}" ${extra}>${s}</text>`;

function canopy(t) {
  // dark leafy overhang along the top corners (camera is under the trees)
  const r = rng(5); let g = '';
  const blob = (x, y, rad, c) => `<circle cx="${x}" cy="${y}" r="${rad}" fill="${c}"/>`;
  for (let i = 0; i < 14; i++) { const x = r() * 560 - 40, y = -40 + r() * 150, rad = 80 + r() * 90; g += blob(x, y + Math.sin(t * 1.2 + i) * 3, rad, i % 3 ? '#1f5a38' : '#2a6e45'); }
  for (let i = 0; i < 14; i++) { const x = 1400 + r() * 560, y = -40 + r() * 150, rad = 80 + r() * 90; g += blob(x, y + Math.sin(t * 1.2 + i * 2) * 3, rad, i % 3 ? '#1f5a38' : '#2a6e45'); }
  return `<g>${g}</g>`;
}
function vignette(a) {
  if (a <= 0) return '';
  return `<defs><radialGradient id="vg"><stop offset="0.45" stop-color="#1a0a14" stop-opacity="0"/><stop offset="1" stop-color="#1a0a14" stop-opacity="${a.toFixed(2)}"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#vg)"/>`;
}

// ---------- A: forest, heli passes ----------
function heroA(t) {
  let expr = 'worried', armR = 8, armL = 8;
  if (t > 2.2 && t < 4.2) { expr = 'happy'; armR = keys(t, [[2.2, 8], [2.9, 120]]); }
  if (t >= 4.2 && t < 5.6) { expr = 'scared'; armR = 150 + Math.sin(t * 14) * 25; armL = 140 - Math.sin(t * 14) * 25; }
  if (t >= 5.6) { expr = 'worried'; armR = keys(t, [[5.6, 150], [6.2, 10]]); armL = keys(t, [[5.6, 140], [6.2, 10]]); }
  return { x: 640, y: 950, s: 0.9, expr, armR, armL, blink: L.blinkAt(t), lean: t > 4.2 && t < 5.6 ? Math.sin(t * 14) * 2 : 0 };
}
function layerA(t) {
  const s = [];
  s.push(F.forestBackdrop(t, { time: 'day', clearing: 0.2 }));
  const hx = keys(t, [[1.2, 2000], [5.6, -200]]);
  s.push(F.tree(180, 760, 1.4, 'pine', { t }), F.tree(1780, 760, 1.4, 'pine', { t }));
  if (t > 1.0 && t < 5.8) s.push(F.helicopterFar(t, hx, keys(t, [[1.2, 290], [5.6, 250]]), 1.8, -1));
  s.push(L.character(heroA(t)));
  s.push(canopy(t));
  return s.join('');
}

// ---------- B: aerial view ----------
function layerB(t) {
  const r = rng(21); let g = `<rect width="${W}" height="${H}" fill="#2d6f46"/>`;
  const crowns = [];
  for (let gy = -60; gy < H + 80; gy += 78) for (let gx = -60; gx < W + 80; gx += 78) crowns.push([gx + (r() - 0.5) * 60 + (Math.round(gy / 78) % 2) * 36, gy + (r() - 0.5) * 50, 50 + r() * 36, r()]);
  crowns.forEach(([x, y, rad, k]) => g += `<circle cx="${x.toFixed(0)}" cy="${(y + 10).toFixed(0)}" r="${rad.toFixed(0)}" fill="#1b4a2f" opacity="0.7"/>`);
  const hid = [1180, 560];
    crowns.forEach(([x, y, rad, k]) => {
    const nearHid = Math.hypot(x - hid[0], y - hid[1]) < 120; const c = k < 0.33 ? '#3d9358' : k < 0.66 ? '#2f7d4f' : '#378a55';
    g += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${rad.toFixed(0)}" fill="${c}"/><circle cx="${(x - rad * 0.25).toFixed(0)}" cy="${(y - rad * 0.25).toFixed(0)}" r="${(rad * 0.55).toFixed(0)}" fill="${mix(c, '#c8f5b0', 0.18)}"/>`;
  });
  g += `<circle cx="${hid[0]}" cy="${hid[1]}" r="10" fill="#f26b2a"/><circle cx="${hid[0] + 12}" cy="${hid[1] + 7}" r="26" fill="#2f7d4f"/><circle cx="${hid[0] + 6}" cy="${hid[1] + 2}" r="14" fill="#3d9358"/>`;
  // sweeping search cone
  const sx = keys(t, [[6.2, 300], [9.2, 1500]]);
  g += `<g opacity="0.55"><circle cx="${sx}" cy="560" r="170" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="20 14"/><line x1="${sx - 220}" y1="560" x2="${sx + 220}" y2="560" stroke="#fff" stroke-width="3"/><line x1="${sx}" y1="340" x2="${sx}" y2="780" stroke="#fff" stroke-width="3"/></g>`;
  // viewfinder corners
  const cn = (x, y, a, b) => `<path d="M${x} ${y + b * 80} L${x} ${y} L${x + a * 80} ${y}" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`;
  g += cn(120, 160, 1, 1) + cn(W - 120, 160, -1, 1) + cn(120, 900, 1, -1) + cn(W - 120, 900, -1, -1);
  g += `<rect width="${W}" height="${H}" fill="#000" opacity="0.1"/>`;
  return g;
}

// ---------- C: forest, signals ----------
function heroC(t) {
  const x = 800;
  let expr = 'neutral', armR = 8, lean = 0;
  if (t > 10 && t < 15) expr = 'worried';
  if (t >= 15 && t < 19.9) { expr = 'focused'; lean = Math.sin(t * 7) * 1.5; }
  if (t >= 19.9 && t < 22.4) { expr = 'scared'; armR = 40; }
  if (t >= 22.4) { expr = 'happy'; armR = keys(t, [[22.4, 8], [23.2, 105]]); }
  return { x, y: 950, s: 0.9, expr, armR, lean, blink: L.blinkAt(t) };
}
const bubble = (x, y, k, txtS) => `<g transform="translate(${x} ${y}) scale(${k.toFixed(3)})"><path d="M-20 60 L-50 92 L10 62 Z" fill="#fff" stroke="${C.pillInk}" stroke-width="6" stroke-linejoin="round"/><rect x="-125" y="-52" width="250" height="110" rx="40" fill="#fff" stroke="${C.pillInk}" stroke-width="6"/><path d="M-30 58 L10 58 L-30 62 Z" fill="#fff"/>${txt(0, 24, txtS, 66, C.red)}</g>`;
function layerC(t) {
  const s = [];
  s.push(F.forestBackdrop(t, { time: 'day', clearing: 0.5 }));
  s.push(F.tree(200, 720, 1.2, 'pine', { t }), F.tree(1560, 700, 1.1, 'pine', { t }), F.tree(1800, 720, 1.0, 'leafy', { t }), F.rocks(1250, 880, 0.7));
  const h = heroC(t);
  if (t > 22.3) s.push(F.helicopterFar(t, 1560 + Math.sin(t * 0.8) * 30, 255, 0.9, -1));
  s.push(L.character(h));
  // whistle
  const mx = h.x + 8, my = h.y - 350 * h.s;
  if (t >= 15.2 && t < 19.9) { s.push(F.whistle(mx + 26, my + 6, 0.5)); s.push(F.whistleWaves(t, mx + 80, my, 0.9, { t0: 15.6, period: 0.95, dur: 1.4 })); }
  // shout bubbles
  [[20.2, 1010, 500, 'HELP!'], [20.95, 1270, 440, 'HELP!'], [21.7, 1530, 380, 'HELP!']].forEach(([t0, x, y, tx]) => { if (t > t0 && t < 22.7) s.push(`<g opacity="${(1 - clamp((t - 22.3) / 0.4)).toFixed(2)}">${bubble(x, y, spring((t - t0) / 0.4), tx)}</g>`); });
  // mirror
  if (t >= 22.5) { const hd = L.handR(h, 160); s.push(F.signalMirror(t, hd.x, hd.y, 0.8, { target: [1560, 255] })); }
  // 3 card
  s.push(L.popCard(t, 10.5, 960, 250, txt(0, 82, '3', 230, C.orange), { r: 150, out: 15.0 }));
  if (t > 11.2 && t < 15.3) s.push(L.pill(t, 960, 'THE RULE OF THREE', 11.0, { y: 410, fs: 42, h: 74, fill: C.orange, ink: '#fff' }));
  // whistle counter
  if (t > 15.0 && t < 20.3) {
    const dots = [0, 1, 2].map(i => { const on = t > 15.6 + i * 0.95; return `<circle cx="${(i - 1) * 62}" cy="150" r="22" fill="${on ? C.orange : '#fff'}" stroke="${C.pillInk}" stroke-width="5" opacity="${on ? 1 : 0.5}"/>`; }).join('');
    s.push(L.popCard(t, 15.0, 1400, 250, `<g transform="scale(1.1)">${F.icons.whistle}</g>`, { r: 100, out: 20.0 }));
    s.push(`<g transform="translate(1400 230)">${dots}</g>`);
  }
  if (t > 20.3 && t < 22.6) s.push(L.pill(t, 1270, '3 SHOUTS', 20.3, { y: 640, fs: 44, h: 76, fill: C.red, ink: '#fff' }));
  if (t > 24.4 && t < 26.4) s.push(L.pill(t, 1100, 'SEEN FOR MILES', 24.4, { y: 130, fs: 44, h: 76, fill: C.orange, ink: '#fff' }));
  return s.join('');
}

// ---------- D: clearing, SOS ----------
function jacket(t) {
  const sh = 1;
  return `<g><ellipse cx="0" cy="14" rx="170" ry="34" fill="#000" opacity="0.22"/><g transform="scale(1 0.55)">
    <path d="M-60 -70 L-170 20 L-130 62 L-60 -4 L-60 80 L60 80 L60 -4 L130 62 L170 20 L60 -70 L28 -84 Q0 -60 -28 -84 Z" fill="#ff7a00" stroke="#c45500" stroke-width="6" stroke-linejoin="round"/>
    <rect x="-60" y="30" width="120" height="14" fill="#ffe14a"/><rect x="-60" y="52" width="120" height="10" fill="#ffe14a"/><path d="M-148 34 L-120 58" stroke="#ffe14a" stroke-width="12"/><path d="M148 34 L120 58" stroke="#ffe14a" stroke-width="12"/><path d="M0 -60 L0 80" stroke="#c45500" stroke-width="5"/></g></g>`;
}
function layerD(t) {
  const s = [];
  s.push(F.forestBackdrop(t, { time: 'day', clearing: 1 }));
  s.push(F.tree(150, 700, 1.1, 'pine', { t }), F.tree(1790, 700, 1.1, 'pine', { t }), F.tree(420, 690, 0.8, 'leafy', { t }));
  s.push(F.sosRocks(940, 905, 900, easeInOut(pulse(t, 26.6, 29.6)), { depth: 300 }));
  // bracket 12 ft
  const bk = easeOut(pulse(t, 29.7, 30.3));
  if (bk > 0) {
    s.push(`<g opacity="${bk.toFixed(2)}" stroke="${C.pillInk}" stroke-width="8" fill="none" stroke-linecap="round"><path d="M1440 610 L1456 610 L1456 905 L1440 905" stroke="#fff" stroke-width="14"/><path d="M1440 610 L1456 610 L1456 905 L1440 905"/></g>`);
    s.push(L.pill(t, 1456, '12 FT', 29.8, { y: 540, fs: 46, h: 76, fill: C.orange, ink: '#fff' }));
  }
  s.push(L.character({ x: 1590, y: 905, s: 0.32, expr: 'happy', blink: L.blinkAt(t) }));
  if (t > 30.6) { const k = spring((t - 30.6) / 0.5); s.push(`<g transform="translate(290 870) scale(${(k * 1.35).toFixed(3)})">${jacket(t)}</g>`); s.push(L.pill(t, 290, 'BRIGHT COLORS', 30.9, { y: 690, fs: 42, h: 74, fill: '#ffd23f' })); }
  if (t > 31.6) s.push(F.flag(t, 1730, 905, 0.8, { color: '#ff3b6b' }));
  return s.join('');
}

function frame(t) {
  const s = [];
  if (t < 9.3) s.push(layerA(t)); else s.push(layerC(t));
  if (t > 25.4) s.push(`<g opacity="${easeInOut(pulse(t, 25.4, 26.3)).toFixed(3)}">${layerD(t)}</g>`);
  // iris to aerial view
  const rad = 1300 * easeInOut(pulse(t, 5.8, 6.8)) * (1 - easeInOut(pulse(t, 9.2, 10.1)));
  if (rad > 2) {
    s.push(`<defs><clipPath id="iris"><circle cx="960" cy="540" r="${rad.toFixed(0)}"/></clipPath></defs><g clip-path="url(#iris)">${layerB(t)}</g>`);
    s.push(`<circle cx="960" cy="540" r="${rad.toFixed(0)}" fill="none" stroke="#fff" stroke-width="10" opacity="0.9"/>`);
    if (t > 7.4 && t < 9.6) { s.push(L.popCard(t, 7.4, 1500, 320, `<g transform="scale(1.4)">${F.icons.eye}</g>${L.stampX(1.3)}`, { r: 120, out: 9.4 })); }
    if (t > 8.0 && t < 9.6) s.push(L.pill(t, 1180, 'THIS IS YOU', 8.0, { y: 640, fs: 40, h: 70, fill: C.orange, ink: '#fff' }));
    if (t > 6.6 && t < 9.6) s.push(L.pill(t, 960, 'VIEW FROM ABOVE', 6.6, { y: 140, fs: 44, h: 76, fill: '#14161c', ink: '#fff' }));
  }
  s.push(vignette(t < 10 ? 0.55 : 0.55 * (1 - clamp((t - 10) / 1.5))));
  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', 'DAY 3', 0.3), L.pill(t, 'right', 'SIGNAL', 0.45));
  s.push(L.captions(t, [
    [6.2, 6.7, 10.1, 'INVISIBLE — ', 'FROM ABOVE.'],
    [10.6, 11.0, 22.6, 'THREE — ', 'OF ANYTHING.'],
    [26.6, 27.0, 31.4, 'SOS — ', '12 FEET TALL.'],
  ]));
  return s.join('\n');
}
L.render(frame, DUR, 'scene8.mp4');
