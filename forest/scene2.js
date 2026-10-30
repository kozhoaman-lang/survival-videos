// Scene 2 — S.T.O.P. (23 s)
const L = require('./lib'); const F = require('./forest_lib'); const { txt, fgCanopy } = require('./sc_common');
const { W, H, C, keys, clamp, easeOut, easeInOut, spring, pulse } = L;
const DUR = 23, GY = 860;
const TILE_T = [7, 10, 13, 17];
const TX = i => 960 + (i - 1.5) * 235;

function hero(t) {
  const running = t > 0.8 && t < 4.0;
  let x = keys(t, [[0.8, 240], [4.0, 960]]);
  const br = Math.sin(t * 2.2) * 3;
  let face = 1, expr = 'worried', lean = 0, armR = 8, armL = 8;
  if (running) { lean = 9; armR = 70 + Math.sin(t * 16) * 30; armL = 70 - Math.sin(t * 16) * 30; expr = 'scared'; }
  if (t >= 4.0) { expr = 'scared'; lean = keys(t, [[4.0, 9], [4.4, -3], [5.0, 0]]); }
  if (t > 5.6) expr = 'focused';
  if (t > 7) armL = 8;
  // sip (S)
  if (t > 7.8 && t < 10.4) armR = keys(t, [[7.8, 8], [8.5, 145], [9.8, 145], [10.3, 8]]);
  // think (T): hand to chin
  if (t >= 10.4 && t < 13.2) armR = keys(t, [[10.4, 8], [11.0, 128], [12.8, 128], [13.2, 8]]);
  // observe (O): look left at the footprints, lean
  if (t >= 13.2 && t < 16.4) { face = -1; lean = 8; }
  if (t >= 13.2 && t < 16.4) armR = 40;
  // plan (P)
  if (t >= 16.6) { armR = keys(t, [[16.6, 8], [17.4, 100]]); expr = t > 19.4 ? 'happy' : 'focused'; }
  return { x, y: GY, s: 0.88, face, expr, armR, armL, lean, walk: running ? t * 16 : 0, bob: running ? -Math.abs(Math.sin(t * 16)) * 12 : br, blink: L.blinkAt(t) };
}
const bottle = `<g><rect x="-15" y="-46" width="30" height="82" rx="10" fill="#4aa3d8" stroke="${C.pillInk}" stroke-width="4"/><rect x="-9" y="-62" width="18" height="18" rx="4" fill="#fff" stroke="${C.pillInk}" stroke-width="4"/><rect x="-15" y="-14" width="30" height="22" fill="#fff" opacity="0.6"/></g>`;
const foot = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k.toFixed(2)})" opacity="0.9"><ellipse cx="0" cy="0" rx="30" ry="13" fill="#4a2c1c"/><ellipse cx="-40" cy="0" rx="15" ry="11" fill="#4a2c1c"/></g>`;
const mapIcon = `<g><path d="M-62 -40 L-22 -54 L22 -40 L62 -54 L62 42 L22 56 L-22 42 L-62 56 Z" fill="#f4e4c4" stroke="${C.pillInk}" stroke-width="5" stroke-linejoin="round"/><path d="M-22 -54 L-22 42 M22 -40 L22 56" stroke="${C.pillInk}" stroke-width="3"/><path d="M-50 30 Q-30 -10 0 10 T48 -26" stroke="${C.red}" stroke-width="6" fill="none" stroke-dasharray="10 8" stroke-linecap="round"/><circle cx="48" cy="-26" r="8" fill="${C.green}"/></g>`;

function frame(t) {
  const s = [];
  const h = hero(t);
  s.push(F.forestBackdrop(t, { time: 'day', pan: 30 }));
  s.push(F.tree(150, 800, 1.1, 'pine', { t }), F.tree(1790, 830, 1.2, 'leafy', { t }), F.bush(1440, 780, 0.9), F.rocks(560, 770, 0.7), F.mushrooms(1230, 800, 0.8));
  // landmark tree + ring (observe)
  s.push(F.tree(400, 770, 1.0, 'pine', { t }));
  if (t > 13.6 && t < 17.0) {
    const k = easeOut(pulse(t, 13.6, 14.2));
    s.push(`<ellipse cx="400" cy="450" rx="${(150 * k).toFixed(0)}" ry="${(220 * k).toFixed(0)}" fill="none" stroke="#ffd23f" stroke-width="8" stroke-dasharray="22 14" stroke-dashoffset="${(-t * 30).toFixed(0)}"/>`);
  }
  // footprints coming from the left toward the hero
  for (let i = 0; i < 9; i++) { const tt = 13.3 + i * 0.25; if (t > tt) s.push(foot(120 + i * 85, GY - 22 + (i % 2 ? 14 : -6), easeOut(pulse(t, tt, tt + 0.2)))); }
  s.push(L.character(h));
  // bottle
  if (t > 8.0 && t < 10.3 && h.armR > 60) {
    const p = L.handR(h, 150);
    s.push(`<g transform="translate(${p.x.toFixed(0)} ${p.y.toFixed(0)}) rotate(-38) scale(0.9)">${bottle}</g>`);
  }
  // breathing puffs (S)
  if (t > 7.2 && t < 8.6) { const k = pulse(t, 7.2, 8.6); s.push(`<g opacity="${(1 - k).toFixed(2)}" fill="none" stroke="#fff" stroke-width="6"><circle cx="${h.x + 90 + k * 40}" cy="${GY - 400 - k * 30}" r="${14 + k * 12}"/><circle cx="${h.x + 130 + k * 60}" cy="${GY - 420 - k * 40}" r="${8 + k * 10}"/></g>`); }
  // thought bubble (T)
  if (t > 10.8 && t < 13.2) {
    const k = spring(pulse(t, 10.8, 11.4)), out = 1 - easeInOut(pulse(t, 12.9, 13.2));
    s.push(`<g transform="translate(${h.x + 190} ${GY - 560}) scale(${(k * out).toFixed(3)})"><circle cx="-60" cy="140" r="12" fill="#fff" stroke="${C.pillInk}" stroke-width="4"/><circle cx="-34" cy="100" r="20" fill="#fff" stroke="${C.pillInk}" stroke-width="4"/>
      <ellipse cx="40" cy="30" rx="110" ry="70" fill="#fff" stroke="${C.pillInk}" stroke-width="5"/>${txt('?', 40, 70, 110, C.orange)}</g>`);
  }
  s.push(fgCanopy(t));
  // stamp X on running
  s.push(L.popCard(t, 4.0, 960, 360, L.stampX(0.9), { r: 100, out: 6.4 }));
  // STOP tiles, active one highlighted
  for (let i = 0; i < 4; i++) {
    const hi = t >= TILE_T[i] && (i === 3 || t < TILE_T[i + 1]);
    s.push(F.stopTile(t, TILE_T[i], i, TX(i), 260, 0.66, { highlight: hi && t < 21 ? true : false }));
  }
  // plan
  s.push(L.popCard(t, 17.8, 1560, 520, mapIcon, { r: 100 }));
  s.push(L.pill(t, 1560, 'ONLY IF SURE', 19.0, { y: 650, fs: 40, h: 70 }));
  s.push(L.popCard(t, 19.6, 1690, 430, L.stampCheck(0.55), { r: 56 }));
  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', 'DAY 1', 0.3), L.pill(t, 'right', 'S.T.O.P.', 0.45));
  s.push(L.captions(t, [[3.6, 4.0, 6.6, "DON'T — ", 'RUN.'], [7.0, 7.4, null, 'FIRST — ', 'STOP.']]));
  return s.join('\n');
}
L.render(frame, DUR, 'scene2.mp4');
