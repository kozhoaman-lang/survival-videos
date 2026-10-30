// Scene 11 — Night 5: fear, whistle, despair, routine (27 s)
const L = require('./lib'); const F = require('./forest_lib');
const { W, H, C, FONT, clamp, lerp, easeOut, easeIn, easeInOut, spring, pulse, keys, mix } = L;
const DUR = 27;
const dip = (t, at, w = 0.5) => { const d = 1 - clamp(Math.abs(t - at) / w); return d > 0 ? `<rect width="${W}" height="${H}" fill="#000" opacity="${Math.min(1, d * 1.6).toFixed(2)}"/>` : ''; };
const GY = 885;

// hero x track in the morning routine
const HX = t => keys(t, [[0, 860], [20.3, 860], [21.2, 1500], [22.2, 1500], [23.4, 450], [23.9, 450], [25.0, 950], [30, 950]]);
function walkState(t) {
  const v = (HX(t + 0.05) - HX(t)) / 0.05, dir = HX(t + 0.3) - HX(t - 0.3);
  return { walking: Math.abs(v) > 40, face: dir < -30 ? -1 : 1 };
}
const cloud = (x, y, k) => `<g opacity="${k.toFixed(2)}" fill="#141a2e" stroke="#000" stroke-width="4">${[[-90, 10, 60], [-20, -20, 80], [60, -10, 70], [120, 14, 50], [20, 24, 70]].map(([a, b, r]) => `<circle cx="${x + a}" cy="${y + b}" r="${r}"/>`).join('')}</g>`;
const sticks = (x, y, s = 1, n = 5) => `<g transform="translate(${x} ${y}) scale(${s})">${Array.from({ length: n }, (_, i) => `<rect x="-50" y="${-i * 9}" width="100" height="10" rx="5" fill="${i % 2 ? '#7a4e34' : '#5e3a28'}" transform="rotate(${(i - 2) * 4} 0 ${-i * 9})"/>`).join('')}</g>`;
const woodIcon = `<g transform="rotate(-20)">${[0, 1, 2].map(i => `<rect x="-46" y="${-24 + i * 18}" width="92" height="16" rx="8" fill="${i % 2 ? '#8a5a3c' : '#6b4430'}" stroke="${C.pillInk}" stroke-width="3"/>`).join('')}</g>`;
function check(t, tt) { return t < tt ? '' : `<g transform="translate(48 46) scale(${spring((t - tt) / 0.4).toFixed(3)})"><circle r="34" fill="#fff" stroke="${C.pillInk}" stroke-width="5"/><g transform="scale(0.55)">${L.stampCheck(1)}</g></g>`; }
function label(t, tin, cx, cy, txt) {
  if (t < tin + 0.1) return '';
  const k = easeOut((t - tin - 0.1) / 0.3), w = txt.length * 24 + 44;
  return `<g opacity="${k.toFixed(2)}"><rect x="${cx - w / 2}" y="${cy - 26}" width="${w}" height="52" rx="26" fill="${C.pill}" stroke="${C.pillInk}" stroke-width="4"/><text x="${cx}" y="${cy + 12}" text-anchor="middle" ${FONT} font-size="34" fill="${C.pillInk}">${txt}</text></g>`;
}

function night(t) {
  const s = [F.forestBackdrop(t, { time: 'night', pan: 120 })];
  const flick = 1 + Math.sin(t * 9) * 0.04, fx = 1150, fy = GY;
  s.push(F.campfire(t, fx, fy, 1, { time: 'night', lit: 0.5 }));
  const scared = t > 3.2 && t < 9.4;
  const o = { x: 800, y: GY, s: 0.9, face: 1, expr: t < 2.8 ? 'worried' : scared && !(t > 6.4 && t < 9) ? 'scared' : t < 9.4 ? 'focused' : t > 13.4 ? 'worried' : 'worried', bob: scared && t < 6.4 ? Math.sin(t * 38) * 3 : 0, blink: L.blinkAt(t), armL: 8, armR: 8, lean: t > 13.6 ? -4 : 0 };
  if (t > 3.2 && t < 6.2) { o.armL = 70; o.armR = 70; }
  const wh = keys(t, [[6.2, 8], [6.8, 128]]);
  if (t >= 6.2 && t < 9.6) { o.armR = wh; o.armL = 20; }
  if (t >= 9.6) o.armR = keys(t, [[9.6, 128], [10.2, 8]]);
  s.push(L.darkness(0.58, [{ type: 'circle', x: fx, y: fy - 100, r: 760 * flick, a: 1, core: 0.2 }]));
  s.push(L.glow(fx, fy - 70, 300, '#ff9a3a', 0.35));
  s.push(L.character(o));
  // mind imagines the worst: more eyes
  const eyeK = (t0, t1) => spring((t - t0) / 0.4) * (1 - easeIn(pulse(t, t1, t1 + 0.35)));
  const k1 = t < 3.4 ? 0 : eyeK(3.4, 8.3), k2 = t < 5.0 ? 0 : eyeK(5.0, 8.6), k3 = t < 5.6 ? 0 : eyeK(5.6, 8.9);
  if (k1 > 0.01) s.push(F.eyesInBush(t, 1620, 900, 1.15 * k1, { seed: 1 }));
  if (k2 > 0.01) s.push(F.eyesInBush(t, 300, 900, 1.15 * k2, { seed: 2 }));
  if (k3 > 0.01) s.push(F.eyesInBush(t, 1830, 800, 0.8 * k3, { seed: 3 }));
  // crack
  if (t > 3.0 && t < 4.4) {
    const a = 1 - pulse(t, 3.5, 4.4), k = spring((t - 3.0) / 0.3);
    let g = '';
    const r = L.rng(5);
    for (let i = 0; i < 9; i++) { const ang = -Math.PI * 0.95 + i * Math.PI * 0.2 + r() * 0.2; let d = 'M1500 640'; let x = 1500, y = 640; for (let j = 1; j <= 4; j++) { const len = 40 + j * 24; x += Math.cos(ang + (r() - 0.5) * 0.9) * len; y += Math.sin(ang + (r() - 0.5) * 0.9) * len; d += ` L${x.toFixed(0)} ${y.toFixed(0)}`; } g += `<path d="${d}" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; }
    s.push(`<g opacity="${a.toFixed(2)}">${g}<g transform="translate(1500 470) rotate(-8) scale(${k.toFixed(2)})"><text text-anchor="middle" ${FONT} font-size="120" fill="#fff" stroke="${C.red}" stroke-width="14" paint-order="stroke" stroke-linejoin="round">CRACK!</text></g></g>`);
  }
  // whistle in hand + waves
  if (t > 6.3 && t < 11) {
    const h = L.handR(o, 170);
    s.push(`<g transform="translate(${h.x + 10} ${h.y - 8}) scale(0.5) rotate(10)">${F.icons.whistle}</g>`);
    s.push(F.whistleWaves(t, h.x + 40, h.y - 10, 0.9, { t0: 6.8, dir: -6 }));
  }
  // despair cloud
  if (t > 13.6) { const k = easeOut((t - 13.6) / 0.7); s.push(cloud(780, 330 + (1 - k) * 40, k * (1 - pulse(t, 16.0, 16.4)))); const rain = L.rng(9); for (let i = 0; i < 12; i++) { const ph = (t * 1.3 + i * 0.37) % 1; s.push(`<line x1="${700 + i * 16}" y1="${400 + ph * 90}" x2="${694 + i * 16}" y2="${420 + ph * 90}" stroke="#7d8cc4" stroke-width="4" opacity="${(k * (1 - ph)).toFixed(2)}"/>`); } }
  return s.join('');
}

function morning(t) {
  const s = [F.forestBackdrop(t, { time: 'day', pan: 60 }), F.stream(t, { y: 690, h: 110, slope: 10 })];
  const lit = keys(t, [[0, 0.5], [24.8, 0.55], [25.4, 1]]);
  const fx = 1180;
  s.push(F.log(520, 800, 0.6), F.tree(120, 800, 0.9, 'pine'), F.tree(1820, 790, 0.9, 'leafy'));
  s.push(F.campfire(t, fx, GY, 0.9, { lit }));
  const ws = walkState(t), x = HX(t);
  const o = { x, y: GY, s: 0.9, face: ws.face, expr: 'neutral', walk: ws.walking ? t * 9 : 0, blink: L.blinkAt(t), armL: 8, armR: 8, lean: 0 };
  if (ws.walking) { o.armL = Math.sin(t * 9) * 20 + 8; o.armR = -Math.sin(t * 9) * 20 + 8; }
  let carry = false, bottle = false;
  if (t > 21.2 && t < 22.2) { o.lean = 14 * Math.sin(Math.PI * clamp((t - 21.2) / 1.0)); o.armR = 40 + 40 * Math.sin(Math.PI * clamp((t - 21.2) / 1.0)); bottle = true; }
  if (t > 23.4 && t < 23.9) o.lean = 16 * Math.sin(Math.PI * pulse(t, 23.4, 23.9));
  if (t > 23.6 && t < 25.0) { carry = true; o.armL = 60; o.armR = 60; }
  if (t > 25.0 && t < 25.4) o.expr = 'happy';
  if (t > 25.4 && t < 26.8) { o.armR = 128; o.expr = 'focused'; }
  if (t > 26.8) o.expr = 'happy';
  s.push(L.character(o));
  if (bottle) s.push(`<g transform="translate(${x + 120 * ws.face} ${GY - 120})"><g transform="scale(0.55)">${F.icons.drop}</g></g>`);
  if (carry) s.push(sticks(x + 70 * ws.face, GY - 190, 0.9));
  // pile of wood next to fire after dropping
  if (t > 25.0) s.push(sticks(fx + 130, GY + 4, 0.7, 5));
  if (t > 25.4 && t < 27) { const h = L.handR(o, 170); s.push(`<g transform="translate(${h.x + 10} ${h.y - 8}) scale(0.5) rotate(10)">${F.icons.whistle}</g>`, F.whistleWaves(t, h.x + 40, h.y - 10, 0.8, { t0: 25.5, dir: -6, period: 0.6 })); }
  // sunrise warmth
  const warm = 0.3 * (1 - pulse(t, 16.8, 21));
  s.push(`<rect width="${W}" height="${H}" fill="#ff9a4a" opacity="${warm.toFixed(2)}"/>`);
  // thought bubble
  if (t > 17.3 && t < 20.6) {
    const k = spring((t - 17.3) / 0.5) * (1 - pulse(t, 20.2, 20.6));
    s.push(`<g transform="translate(760 300) scale(${k.toFixed(3)})"><circle cx="-120" cy="150" r="14" fill="#fff" stroke="${C.pillInk}" stroke-width="4"/><circle cx="-90" cy="116" r="22" fill="#fff" stroke="${C.pillInk}" stroke-width="4"/><rect x="-340" y="-80" width="680" height="170" rx="85" fill="#fff" stroke="${C.pillInk}" stroke-width="6"/>
      <text x="0" y="-10" text-anchor="middle" ${FONT} font-size="46" fill="${C.pillInk}">PEOPLE ARE ALREADY</text><text x="0" y="48" text-anchor="middle" ${FONT} font-size="46" fill="${C.orange}">LOOKING FOR ME</text></g>`);
  }
  // checklist
  const cards = [['WATER', 1180, F.icons.drop, 22.2], ['FIREWOOD', 1440, woodIcon, 25.0], ['SIGNALS', 1700, `<g transform="scale(0.85)">${F.icons.whistle}</g>`, 25.9]];
  cards.forEach(([nm, cx, ic, tt], i) => {
    const tin = 20.3 + i * 0.25;
    s.push(L.popCard(t, tin, cx, 270, ic + check(t, tt), { r: 74 }), label(t, tin, cx, 270 + 74 + 44, nm));
  });
  return s.join('');
}

function frame(t) {
  const s = [t < 16.6 ? night(t) : morning(t), dip(t, 16.6)];
  s.push(L.bottomShade());
  if (t < 16.6) s.push(L.pill(t, 'left', 'NIGHT 5', 0.3), L.pill(t, 'right', 'FEAR', 0.45));
  else s.push(L.pill(t, 'left', 'DAY 6', 16.8), L.pill(t, 'right', 'ROUTINE', 16.95));
  s.push(L.captions(t, [
    [6.6, 7.0, 12.8, 'BLOW — ', 'THE WHISTLE.'],
    [13.6, 14.0, 19.8, 'DESPAIR — ', 'IS THE ENEMY.'],
    [21.0, 21.4, null, 'A ROUTINE — ', 'KEEPS YOU ALIVE.'],
  ]));
  return s.join('\n');
}
L.render(frame, DUR, 'scene11.mp4');
