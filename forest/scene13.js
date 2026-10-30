// Scene 13 — Day 7: found (21 s)
const L = require('./lib'); const F = require('./forest_lib');
const { W, H, C, FONT, clamp, lerp, easeOut, easeIn, easeInOut, spring, pulse, keys } = L;
const DUR = 21;
const GY = 880, FX = 1000;

const HX = t => keys(t, [[0, 260], [4.8, 260], [7.4, 700], [30, 700]]);
function leafy(x, y, s, rot) { return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${[0, 1, 2, 3].map(i => `<g transform="translate(${-50 + i * 32} ${(i % 2) * 6}) rotate(${-20 + i * 14})"><ellipse rx="34" ry="13" fill="${i % 2 ? '#3f9150' : '#58b064'}" stroke="#2c6b3b" stroke-width="3"/></g>`).join('')}<rect x="-62" y="-3" width="130" height="6" rx="3" fill="#7a4e34" transform="translate(0 6)"/></g>`; }

function smoke(t, t0, x, y) {
  if (t < t0) return '';
  let g = '';
  const k = clamp((t - t0) / 1.5), N = 22;
  for (let i = 0; i < N; i++) {
    const ph = ((t * 0.18 + i / N) % 1), yy = -ph * 820, xx = Math.sin(ph * 6 + i * 1.7) * (14 + ph * 40) + ph * ph * 40, r = 26 + ph * 60;
    g += `<circle cx="${xx.toFixed(1)}" cy="${yy.toFixed(1)}" r="${r.toFixed(1)}" fill="${L.mix('#d8dce6', '#ffffff', ph)}" stroke="#aab2c0" stroke-width="3" opacity="${(Math.min(1, ph * 8) * (1 - ph * 0.6) * 0.92 * k).toFixed(2)}"/>`;
  }
  return `<g transform="translate(${x} ${y})">${g}</g>`;
}
function rotorLines(t, x, y, s, a) {
  if (a <= 0) return '';
  let g = '';
  for (let i = 0; i < 3; i++) { const ph = (t * 1.6 + i / 3) % 1, r = 50 + ph * 90; g += `<path d="M${-r} ${-r * 0.5} A${r} ${r} 0 0 0 ${-r} ${r * 0.5}" stroke="${C.pillInk}" stroke-width="7" fill="none" stroke-linecap="round" opacity="${((1 - ph) * a).toFixed(2)}"/><path d="M${r} ${-r * 0.5} A${r} ${r} 0 0 1 ${r} ${r * 0.5}" stroke="${C.pillInk}" stroke-width="7" fill="none" stroke-linecap="round" opacity="${((1 - ph) * a).toFixed(2)}"/>`; }
  const fl = Math.floor(t * 8) % 2;
  g += `<text x="${fl * 6}" y="${150}" text-anchor="middle" ${FONT} font-size="64" fill="#fff" stroke="${C.pillInk}" stroke-width="10" paint-order="stroke" stroke-linejoin="round" opacity="${a}">WHUP-WHUP</text>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
}

function frame(t) {
  const s = [F.forestBackdrop(t, { time: 'day', clearing: 1, pan: 0 })];
  // far helicopter + rotor cue
  if (t > 1.8 && t < 5.6) {
    const a = easeOut((t - 1.8) / 0.5) * (1 - pulse(t, 5.0, 5.6)), hx = lerp(1700, 1500, pulse(t, 1.8, 5.6));
    s.push(F.helicopterFar(t, hx, 340, 1.3, -1), rotorLines(t, hx, 340, 1.1, a));
  }
  // campfire (green branches thrown in at 8.0)
  const thrown = t > 8.9;
  s.push(F.campfire(t, FX, GY, 0.95, { lit: 1 }));
  if (thrown) s.push(`<g transform="translate(${FX} ${GY - 24})">${[0, 1, 2, 3, 4].map(i => `<g transform="rotate(${-40 + i * 20} 0 0)"><ellipse cx="0" cy="-26" rx="42" ry="14" fill="${i % 2 ? '#3f9150' : '#58b064'}" stroke="#2c6b3b" stroke-width="3" transform="rotate(${i * 10 - 20})"/></g>`).join('')}</g>`);
  s.push(smoke(t, 9.0, FX, GY - 70));
  // SOS rocks (already there)
  s.push(F.sosRocks(1560, 870, 700, 1, {}));
  // hero
  const x = HX(t), run = t > 4.8 && t < 7.6;
  const o = { x, y: GY, s: 0.9, face: 1, expr: 'worried', blink: L.blinkAt(t), armL: 8, armR: 8, walk: run ? t * 16 : 0 };
  if (t > 1.8 && t < 4.6) { o.armR = 150; o.armL = 8; o.expr = 'worried'; } // looking up, hand to brow
  if (t >= 3.4 && t < 4.8) o.expr = 'focused';
  if (run) { o.armL = Math.sin(t * 16) * 50 + 20; o.armR = -Math.sin(t * 16) * 50 + 20; o.lean = 8; o.expr = 'focused'; o.bob = -Math.abs(Math.sin(t * 16)) * 12; }
  let carryB = false;
  if (t > 7.4 && t < 8.0) { o.armR = 70; carryB = true; o.expr = 'focused'; }
  if (t >= 8.0 && t < 8.9) { const k = pulse(t, 8.0, 8.5); o.armR = lerp(70, 130, k); o.lean = -6; }
  // wave both arms
  if (t >= 10.2) { const w = Math.sin(t * 9) * 18; o.armL = 160 + w; o.armR = 160 - w; o.expr = 'focused'; o.lean = 0; o.bob = 0; }
  // jump with joy
  if (t >= 17.4) { const j = Math.abs(Math.sin((t - 17.4) * 5)); o.bob = -j * 90; o.expr = 'happy'; o.armL = 165; o.armR = 165; }
  s.push(L.character(o));
  if (carryB) s.push(leafy(x + 120, GY - 330, 0.9, -30));
  if (t >= 8.0 && t < 9.1) { const k = pulse(t, 8.4, 9.0), px = lerp(x + 100, FX, k), py = lerp(GY - 380, GY - 40, k) - Math.sin(k * Math.PI) * 140; s.push(leafy(px, py, 0.9, -30 + k * 300)); }
  // helicopter: enters from right, flips around, hovers over hero
  if (t > 13.0) {
    const ent = pulse(t, 13.0, 15.3), back = pulse(t, 16.0, 17.6);
    const hx = t < 15.7 ? lerp(2250, 1250, easeOut(ent)) : lerp(1250, x + 250, easeInOut(back));
    const hy = t < 15.7 ? lerp(340, 300, ent) : lerp(300, 150, easeInOut(back));
    const facing = keys(t, [[15.3, -1], [15.9, 1]]);
    const sc = lerp(0.85, 0.9, back);
    s.push(F.helicopter(t, hx, hy, sc, facing, { light: true }));
    if (t > 17.0) s.push(`<polygon points="${hx + 20},${hy + 60} ${hx - 280},${GY + 20} ${hx + 280},${GY + 20}" fill="#fff3b0" opacity="${(0.12 * easeOut((t - 17.0) / 0.6)).toFixed(2)}"/>`);
    if (t > 13.0 && t < 15.5) s.push(rotorLines(t, hx - 60, hy + 140, 0.7, 0.8));
  }
  // warm light
  const wl = easeInOut(pulse(t, 17.0, 19.0));
  if (wl > 0) s.push(`<defs><radialGradient id="wl"><stop offset="0" stop-color="#ffd27a" stop-opacity="0.30"/><stop offset="1" stop-color="#ffb060" stop-opacity="0.10"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#wl)" opacity="${wl.toFixed(2)}"/>`);
  if (t > 17.4) { const r = L.rng(4); for (let i = 0; i < 16; i++) { const ph = ((t - 17.4) * 0.6 + r()) % 1, cx = 300 + r() * 1300, cy = 700 - ph * 560 + (r() - 0.5) * 60; s.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(5 + r() * 6).toFixed(1)}" fill="${['#ffd23f', '#fff', '#ff7a1a'][i % 3]}" opacity="${((1 - ph) * easeOut((t - 17.4) / 0.5)).toFixed(2)}"/>`); } }
  // step labels
  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', 'DAY 7', 0.3), L.pill(t, 'right', 'FOUND', 0.45));
  if (t > 5.4 && t < 8.0) s.push(L.pill(t, 1560, 'SOS READY', 5.4, { y: 640, fs: 36, h: 62 }));
  s.push(L.captions(t, [
    [10.3, 10.7, 17.0, 'WAVE — ', 'BOTH ARMS.'],
    [17.6, 18.0, null, "YOU'RE — ", 'FOUND.'],
  ]));
  return s.join('\n');
}
L.render(frame, DUR, 'scene13.mp4');
