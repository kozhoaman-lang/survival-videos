// Scene 10 — Day 4: hunger (24 s)
const L = require('./lib'); const F = require('./forest_lib');
const { W, H, C, FONT, keys, clamp, lerp, easeOut, easeIn, easeInOut, spring, pulse, mix } = L;
const DUR = 24;
const mod = (a, n) => ((a % n) + n) % n;
const txt = (x, y, s, fs, fill = '#fff', extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" ${FONT} font-size="${fs}" fill="${fill}" ${extra}>${s}</text>`;

const calendar = `<g><rect x="-125" y="-120" width="250" height="250" rx="22" fill="#fff" stroke="${C.pillInk}" stroke-width="7"/><path d="M-125 -98 Q-125 -120 -103 -120 L103 -120 Q125 -120 125 -98 L125 -52 L-125 -52 Z" fill="${C.red}" stroke="${C.pillInk}" stroke-width="7" stroke-linejoin="round"/>
  <rect x="-80" y="-146" width="16" height="48" rx="8" fill="#3b3f4a"/><rect x="64" y="-146" width="16" height="48" rx="8" fill="#3b3f4a"/>
  ${txt(0, 52, '3–4', 112, C.pillInk)}${txt(0, 112, 'WEEKS', 52, C.red)}</g>`;

function heroHungry(t) {
  const x = keys(t, [[0, 720], [3.4, 720], [6.0, 1130], [6.9, 1130], [8.2, 1000], [14, 1000]]);
  const walking = t > 3.4 && t < 6.0;
  let expr = 'worried', armR = -35, armL = -35, lean = 3 + Math.sin(t * 2.4) * 1.5, y = 950;
  if (t > 3.4) { armL = -35; }
  if (t >= 5.2 && t < 7.0) { expr = 'happy'; armR = keys(t, [[5.2, -35], [6.0, 85]]); armL = 8; lean = 6; }
  if (t >= 7.0) { expr = 'scared'; armR = keys(t, [[7.0, 85], [7.5, 20]]); armL = keys(t, [[7.0, 8], [7.5, 40]]); lean = -6; }
  return { x, y, s: 0.92, face: 1, expr, armR, armL, lean, walk: walking ? t * 9 : 0, bob: walking ? -Math.abs(Math.sin(t * 9)) * 8 : 0, blink: L.blinkAt(t) };
}
function growl(t, hx, hy) {
  let g = '';
  const sh = Math.sin(t * 30) * 2;
  for (let i = 0; i < 2; i++) {
    const side = i ? 1 : -1, ph = mod(t * 1.3 + i * 0.5, 1);
    g += `<g transform="translate(${hx + side * 105} ${hy - 205})" opacity="${(Math.min(1, ph * 6) * (1 - ph)).toFixed(2)}" stroke="#ff7a50" stroke-width="8" stroke-linecap="round" fill="none"><path d="M0 -30 Q${side * 24} -10 0 0 Q${side * -24} 10 0 30" transform="translate(${sh} 0)"/><path d="M${side * 34} -20 Q${side * 54} 0 ${side * 34} 20" transform="translate(${sh} 0)"/></g>`;
  }
  const a = clamp(pulse(t, 0.8, 1.1)) * (1 - clamp(pulse(t, 3.0, 3.4)));
  if (a > 0) g += `<g transform="translate(${hx - 280 + sh} ${hy - 90}) rotate(-8)" opacity="${a.toFixed(2)}">${txt(0, 0, 'GRRRR...', 76, '#fff', 'stroke="#20160f" stroke-width="12" paint-order="stroke"')}</g>`;
  return g;
}
function sparkle(t, x, y, ph) { const k = 0.6 + 0.4 * Math.sin(t * 5 + ph); return `<g transform="translate(${x} ${y}) scale(${k.toFixed(2)})"><path d="M0 -26 L6 -6 L26 0 L6 6 L0 26 L-6 6 L-26 0 L-6 -6 Z" fill="#fff6a8" stroke="#fff" stroke-width="2"/></g>`; }

function layerForest(t) {
  const s = [];
  s.push(F.forestBackdrop(t, { time: 'day', clearing: 0.3 }));
  s.push(F.trail(t, { bend: -120, fade: 0.8, x0: 700 }));
  s.push(F.tree(160, 740, 1.2, 'pine', { t }), F.tree(520, 700, 0.8, 'leafy', { t }), F.tree(1860, 740, 1.2, 'pine', { t }));
  s.push(F.bush(1870, 960, 1.0, { berries: '#d6306a' }));
  s.push(F.mushrooms(1380, 935, 1.5, { kind: 'red' }), F.berries(1590, 950, 1.3), F.berries(1730, 960, 1.1));
  if (t < 7.0) s.push(sparkle(t, 1330, 800, 0), sparkle(t, 1460, 840, 2), sparkle(t, 1600, 760, 4), sparkle(t, 1720, 810, 1));
  const h = heroHungry(t);
  s.push(L.character(h));
  if (t < 3.6) s.push(growl(t, h.x, h.y));
  return s.join('');
}
function layerCamp(t) {
  const s = [];
  s.push(F.forestBackdrop(t, { time: 'dusk', clearing: 0.6 }));
  s.push(F.tree(200, 720, 1.2, 'pine', { time: 'dusk', t }), F.tree(1700, 720, 1.2, 'pine', { time: 'dusk', t }), F.tree(1450, 690, 0.8, 'leafy', { time: 'dusk', t }));
  s.push(L.glow(1150, 760, 520, '#ff9a3a', 0.35));
  s.push(F.campfire(t, 1150, 880, 1.2, { lit: 1, time: 'dusk' }));
  const det = t > 19;
  s.push(L.character({ x: 640, y: 930, s: 0.85, face: 1, expr: 'focused', armR: det ? keys(t, [[19, 8], [19.8, 45]]) : 8, lean: det ? 2 : 0, blink: L.blinkAt(t) }));
  s.push(F.log(640, 960, 1.35, { time: 'dusk' }));
  return s.join('');
}

function frame(t) {
  const s = [];
  const shake = t > 7.0 && t < 7.8 ? `translate(${(Math.sin(t * 90) * 14 * (1 - (t - 7) / 0.8)).toFixed(1)} ${(Math.cos(t * 77) * 10 * (1 - (t - 7) / 0.8)).toFixed(1)})` : '';
  const toCamp = easeInOut(pulse(t, 14.0, 14.9));
  s.push(`<g transform="${shake}">`);
  if (t < 15) s.push(layerForest(t));
  if (toCamp > 0) s.push(`<g opacity="${toCamp.toFixed(3)}">${layerCamp(t)}</g>`);
  s.push('</g>');
  // hunger vignette (day 4) and danger tint
  const hv = t < 3.6 ? 0.45 : 0;
  const danger = t > 7.0 && t < 14.9 ? clamp(pulse(t, 7.0, 8.0)) * (1 - clamp(pulse(t, 14.0, 14.9))) : 0;
  if (hv > 0) s.push(`<defs><radialGradient id="hv"><stop offset="0.5" stop-color="#201010" stop-opacity="0"/><stop offset="1" stop-color="#201010" stop-opacity="${hv}"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#hv)"/>`);
  if (danger > 0) s.push(`<defs><radialGradient id="dv"><stop offset="0.3" stop-color="#6a0000" stop-opacity="0.12"/><stop offset="1" stop-color="#6a0000" stop-opacity="0.7"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#dv)" opacity="${danger.toFixed(2)}"/>`);
  // flash
  if (t > 7.0 && t < 8.4) { const f = (1 - (t - 7.0) / 1.4) * (0.55 + 0.45 * Math.abs(Math.sin(t * 22))); s.push(`<rect width="${W}" height="${H}" fill="#ff1a1a" opacity="${(0.72 * f).toFixed(2)}"/>`); }
  s.push(L.bottomShade());
  // skull warning + X
  if (t > 7.1 && t < 14.4) {
    const k = spring((t - 7.1) / 0.5) * (1 + 0.04 * Math.sin(t * 7)), out = 1 - easeIn(pulse(t, 14.0, 14.4));
    s.push(`<g transform="translate(900 300) scale(${(k * out).toFixed(3)})" opacity="${out.toFixed(2)}">${F.skull(0, 0, 2.5, { warning: true })}</g>`);
    const kx = spring((t - 7.5) / 0.4) * out;
    s.push(`<g transform="translate(1540 750) scale(${(kx * 1.8).toFixed(3)})">${L.stampX(1)}</g>`);
  }
  if (t > 12.3 && t < 14.3) s.push(L.pill(t, 1500, 'ONE BITE', 12.3, { y: 560, fs: 60, h: 100, fill: C.red, ink: '#fff' }));
  // calendar
  s.push(L.popCard(t, 14.8, 960, 300, calendar, { r: 195, out: 18.4, fill: '#fff4d6' }));
  if (t > 15.4 && t < 18.6) s.push(L.pill(t, 960, 'WITHOUT FOOD', 15.4, { y: 520, fs: 46, h: 78, fill: C.green, ink: '#fff' }));
  s.push(L.pill(t, 'left', 'DAY 4', 0.3), L.pill(t, 'right', 'HUNGER', 0.45));
  s.push(L.captions(t, [
    [7.4, 7.8, 14.2, 'NOT 100% SURE? — ', "DON'T EAT."],
    [18.6, 19.0, null, 'HUNGER — ', "WON'T KILL YOU."],
  ]));
  return s.join('\n');
}
L.render(frame, DUR, 'scene10.mp4');
