// Scene 4 — The cold (21 s, scary)
const L = require('./lib'); const F = require('./forest_lib'); const { txt, fgCanopy, wetJacket } = require('./sc_common');
const { W, H, C, keys, clamp, easeOut, easeIn, easeInOut, spring, pulse } = L;
const DUR = 21, GY = 880;

function hero(t) {
  let x = 640, lean = 0, armR = 8, armL = 8, expr = 'worried', bob = 0;
  const shiver = t > 12.2 && t < 16.3;
  if (t > 9.5 && t < 12.2) { armR = 30; armL = -30; }               // hugging himself as rain hits
  if (shiver) { x += Math.sin(t * 58) * 5; armR = 60; armL = -60; expr = 'scared'; }
  // stumble 14 - 16.2
  if (t > 14.0 && t < 16.3) { x += keys(t, [[14, 0], [14.8, 50], [15.4, 20], [16.2, 70]]); lean = Math.sin(t * 7) * 10 + keys(t, [[14, 0], [15.6, 8], [16.2, 14]]); }
  if (t >= 16.3) { x += 70; lean = 14; armR = 25; armL = -20; expr = 'scared'; bob = keys(t, [[16.3, 0], [17.5, 10]]); }
  return { x, y: GY, s: 0.95, expr, armR, armL, lean, bob, blink: t > 17.2 || L.blinkAt(t) };
}
function frame(t) {
  const s = [];
  const h = hero(t);
  s.push(F.forestBackdrop(t, { time: 'dusk', pan: 120 }));
  s.push(F.tree(1850, 900, 1.2, 'pine', { t, time: 'dusk' }), F.tree(110, 920, 1.3, 'pine', { t, time: 'dusk' }), F.bush(1000, 800, 1.1, { time: 'dusk' }), F.rocks(360, 780, 0.8, { time: 'dusk' }), F.log(1230, 800, 0.7, { time: 'dusk' }));
  // bear (silhouette), then gone
  if (t > 0.9 && t < 5.0) {
    const k = easeOut(pulse(t, 0.9, 1.6)) * (1 - easeIn(pulse(t, 4.2, 5.0)));
    s.push(`<g opacity="${k.toFixed(2)}">${F.bear(t, 1430, 850, 0.8, { sil: true, face: -1 })}</g>`);
  }
  s.push(L.character(h));
  s.push(wetJacket(h, easeInOut(pulse(t, 9.8, 13.5))));
  // wet drips
  if (t > 11) for (let i = 0; i < 4; i++) { const ph = ((t * 1.3 + i * 0.27) % 1); s.push(`<ellipse cx="${h.x - 40 + i * 28}" cy="${GY - 200 + ph * 140}" rx="4" ry="8" fill="#9ec7ff" opacity="${(0.9 * (1 - ph)).toFixed(2)}"/>`); }
  // confusion marks
  if (t > 14.4 && t < 16.4) for (let i = 0; i < 3; i++) { const a = t * 5 + i * 2.1; s.push(txt('?', h.x + Math.cos(a) * 90, GY - 500 + Math.sin(a) * 24, 62, '#ffd23f', `stroke="${C.pillInk}" stroke-width="8" paint-order="stroke"`)); }
  s.push(fgCanopy(t, 'dusk'));
  // thermometer
  const tk = spring(pulse(t, 4.4, 5.0));
  if (tk > 0.01) {
    const lvl = keys(t, [[4.8, 0.7], [8.6, 0.2]]), deg = Math.round(keys(t, [[4.8, 62], [8.6, 40]]));
    s.push(`<g transform="translate(1700 470) scale(${tk.toFixed(3)}) translate(-1700 -470)">${F.thermometer(1700, 470, 0.85, lvl, { label: deg + '°F' })}</g>`);
  }
  s.push(L.popCard(t, 3.0, 1430, 400, L.stampX(1.0), { r: 100, out: 5.0 }));
  // rain + dark
  const ri = keys(t, [[8.8, 0], [11.5, 1.3]]);
  if (t > 8.8) s.push(F.rain(t, { intensity: Math.max(ri, 0.05), wet: clamp((t - 8.8) / 3) }));
  const dark = keys(t, [[0, 0], [8, 0.1], [14, 0.25], [18, 0.42]]);
  s.push(L.darkness(dark, [{ type: 'circle', x: h.x, y: GY - 250, r: 560, a: 0.9, core: 0.35 }]));
  // red vignette at the end
  if (t > 16.4) {
    const k = easeOut(pulse(t, 16.4, 18.0)) * (0.8 + 0.2 * Math.sin(t * 5));
    s.push(`<defs><radialGradient id="rv4" cx="0.5" cy="0.5" r="0.75"><stop offset="0.45" stop-color="#b0101a" stop-opacity="0"/><stop offset="1" stop-color="#b0101a" stop-opacity="0.85"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#rv4)" opacity="${k.toFixed(2)}"/>`);
  }
  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', 'DAY 1', 0.3), L.pill(t, 'right', '40°F', 0.45));
  s.push(L.captions(t, [[4.2, 4.6, 15.8, 'THE REAL KILLER — ', 'COLD.'], [16.4, 16.8, null, 'SHIVERING STOPS — ', 'DANGER.']]));
  return s.join('\n');
}
L.render(frame, DUR, 'scene4.mp4');
