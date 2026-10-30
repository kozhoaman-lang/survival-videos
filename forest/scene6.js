// Scene 6 — Day 2: water (27 s)
const L = require('./lib'); const F = require('./forest_lib');
const { W, H, C, FONT, keys, clamp, easeOut, easeIn, easeInOut, spring, pulse, mix } = L;
const DUR = 27;
const txt = (x, y, s, fs, fill = '#fff', extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" ${FONT} font-size="${fs}" fill="${fill}" ${extra}>${s}</text>`;

const appleIcon = `<g><path d="M0 -26 Q-60 -48 -62 6 Q-60 62 -26 64 Q0 54 26 64 Q60 62 62 6 Q60 -48 0 -26 Z" fill="#e5483b" stroke="${C.pillInk}" stroke-width="5"/><path d="M0 -26 Q2 -48 14 -60" stroke="#6b4430" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M12 -50 Q40 -72 56 -50 Q36 -34 12 -50 Z" fill="#4cc36b"/><path d="M-36 -6 Q-40 12 -30 28" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.6"/></g>`;
function germ(x, y, r, rot, t, col = '#7ac943') {
  let sp = '';
  for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5, w = 1 + 0.12 * Math.sin(t * 6 + i); sp += `<line x1="${(Math.cos(a) * r).toFixed(1)}" y1="${(Math.sin(a) * r).toFixed(1)}" x2="${(Math.cos(a) * r * 1.5 * w).toFixed(1)}" y2="${(Math.sin(a) * r * 1.5 * w).toFixed(1)}" stroke="${col}" stroke-width="${r * 0.22}" stroke-linecap="round"/><circle cx="${(Math.cos(a) * r * 1.55 * w).toFixed(1)}" cy="${(Math.sin(a) * r * 1.55 * w).toFixed(1)}" r="${r * 0.17}" fill="${mix(col, '#000000', 0.2)}"/>`; }
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})">${sp}<circle r="${r}" fill="${col}" stroke="#3d6e1c" stroke-width="3"/>
    <circle cx="${-r * 0.32}" cy="${-r * 0.1}" r="${r * 0.26}" fill="#fff"/><circle cx="${r * 0.32}" cy="${-r * 0.1}" r="${r * 0.26}" fill="#fff"/><circle cx="${-r * 0.28}" cy="${-r * 0.06}" r="${r * 0.12}" fill="#20160f"/><circle cx="${r * 0.36}" cy="${-r * 0.06}" r="${r * 0.12}" fill="#20160f"/>
    <path d="M${-r * 0.6} ${-r * 0.42} L${-r * 0.1} ${-r * 0.24} M${r * 0.6} ${-r * 0.42} L${r * 0.1} ${-r * 0.24}" stroke="#20160f" stroke-width="${r * 0.1}" stroke-linecap="round"/><path d="M${-r * 0.3} ${r * 0.42} Q0 ${r * 0.2} ${r * 0.3} ${r * 0.42}" stroke="#20160f" stroke-width="${r * 0.1}" fill="none" stroke-linecap="round"/></g>`;
}
function magnifier(t) {
  let g = `<g transform="rotate(-8)"><line x1="70" y1="74" x2="150" y2="154" stroke="#6b4430" stroke-width="30" stroke-linecap="round"/><line x1="70" y1="74" x2="104" y2="108" stroke="#3b3f4a" stroke-width="34" stroke-linecap="round"/>
    <circle cx="-14" cy="-14" r="112" fill="#c4e9ff"/>
    <circle cx="-14" cy="-14" r="112" fill="none" stroke="#6c7484" stroke-width="18"/><path d="M-90 -50 Q-60 -90 -20 -96" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.8"/>`;
  g += germ(-52 + Math.sin(t * 2) * 8, -20 + Math.cos(t * 2.3) * 6, 34, Math.sin(t) * 20, t);
  g += germ(30 + Math.cos(t * 1.7) * 8, 12 + Math.sin(t * 2.1) * 8, 26, -Math.sin(t * 1.3) * 25, t, '#c5d83a');
  g += germ(-6 + Math.sin(t * 2.6) * 6, -62 + Math.cos(t * 1.9) * 5, 19, 10, t, '#e86f8c');
  g += `</g>`;
  return g;
}
const mountainIcon = `<g transform="translate(0 -52)"><path d="M-110 56 L-40 -50 L0 6 L40 -64 L116 56 Z" fill="#7d8aa3" stroke="${C.pillInk}" stroke-width="5" stroke-linejoin="round"/><path d="M40 -64 L66 -26 L46 -34 L34 -20 L20 -34 Z" fill="#fff"/><path d="M-40 -50 L-18 -18 L-34 -22 L-48 -10 L-60 -24 Z" fill="#fff"/><path d="M0 6 L40 -64 L116 56 L40 56 Z" fill="#5f6b85"/></g>`;
function timer(t, cx, cy, label, frac, col) {
  return `<g transform="translate(${cx} ${cy})"><rect x="-175" y="-82" width="350" height="164" rx="40" fill="#000" opacity="0.35" transform="translate(5 8)"/><rect x="-175" y="-82" width="350" height="164" rx="40" fill="#1b2238" stroke="${C.pillInk}" stroke-width="6"/>
    ${txt(0, 28, label, 112, '#fff')}<rect x="-140" y="48" width="280" height="12" rx="6" fill="#ffffff22"/><rect x="-140" y="48" width="${(280 * clamp(frac)).toFixed(1)}" height="12" rx="6" fill="${col}"/></g>`;
}

function hero(t) {
  const x = keys(t, [[0, 640], [11.2, 640], [12.4, 1150]]);
  const walking = t > 11.2 && t < 12.4;
  let expr = 'worried';
  if (t > 6.6 && t < 9.4) expr = 'happy';
  if (t > 12.4 && t < 19.2) expr = 'focused';
  if (t > 22.5) expr = 'happy';
  let armR = 8;
  if (t > 6.8 && t < 9.4) armR = 90 + Math.sin(t * 3) * 6;
  if (t > 22.8) armR = 75;
  const lean = t > 7.2 && t < 9.4 ? 6 : 0;
  return { x, y: 935, s: 0.85, face: 1, expr, armR, armL: t > 19.8 && t < 22.5 ? 110 : 8, lean, walk: walking ? t * 9 : 0, bob: walking ? -Math.abs(Math.sin(t * 9)) * 8 : 0, blink: L.blinkAt(t) };
}

function frame(t) {
  const s = [];
  s.push(F.forestBackdrop(t, { time: 'day', clearing: 0.5 }));
  s.push(F.stream(t, { y: 690, h: 130 }));
  s.push(F.tree(170, 692, 1.0, 'pine', { t }), F.tree(420, 690, 0.8, 'leafy', { t }), F.tree(1700, 692, 1.0, 'pine', { t }), F.tree(1880, 690, 0.8, 'leafy', { t }));
  s.push(F.rocks(330, 880, 0.8), F.bush(1790, 900, 1.0));
  // camp
  const lit = clamp(pulse(t, 12.3, 13.2));
  s.push(F.campfire(t, 1450, 905, 1.0, { pot: true, lit, bubbles: clamp(pulse(t, 13.6, 15.4)) }));
  // dashed circle around camp
  const dp = easeOut(pulse(t, 22.7, 24.0));
  if (dp > 0) {
    let d = ''; const N = 40, cx = 1250, cy = 880, rx = 640, ry = 140;
    for (let i = 0; i < N * dp; i++) {
      const a0 = (i / N) * Math.PI * 2, a1 = a0 + Math.PI * 2 / N * 0.62;
      d += `<path d="M${(cx + Math.cos(a0) * rx).toFixed(1)} ${(cy + Math.sin(a0) * ry).toFixed(1)} A${rx} ${ry} 0 0 1 ${(cx + Math.cos(a1) * rx).toFixed(1)} ${(cy + Math.sin(a1) * ry).toFixed(1)}"/>`;
    }
    s.push(`<g fill="none" stroke-linecap="round"><g stroke="#000" stroke-width="16" opacity="0.3" transform="translate(0 6)">${d}</g><g stroke="#fff" stroke-width="9">${d}</g></g>`);
  }
  s.push(L.character(hero(t)));
  s.push(F.forestForeground(t, { pan: 1369 }));
  s.push(L.bottomShade());

  // food vs water
  const outA = 6.5;
  if (t < outA + 0.4) {
    const k = t > outA ? 1 - easeIn((t - outA) / 0.35) : 1;
    s.push(L.popCard(t, 2.6, 640, 250, appleIcon, { r: 125, out: outA }));
    s.push(L.popCard(t, 4.6, 1280, 250, `<g transform="scale(1.7)">${L.icon.bolt ? F.icons.drop : ''}</g>`, { r: 125, out: outA, fill: '#e3f4ff' }));
    if (t > 3.2) s.push(`<g opacity="${k.toFixed(2)}">${L.pill(t, 640, 'WEEKS', 3.0, { y: 400, fs: 46, h: 72, fill: C.green, ink: '#fff' })}</g>`);
    if (t > 5.2) s.push(`<g opacity="${k.toFixed(2)}">${L.pill(t, 1280, 'DAYS', 5.0, { y: 400, fs: 46, h: 72, fill: C.red, ink: '#fff' })}</g>`);
    if (t > 4.4) s.push(`<g opacity="${(k * easeOut(pulse(t, 4.4, 4.8))).toFixed(2)}">${txt(960, 272, 'VS', 64, '#fff', 'stroke="#20160f" stroke-width="10" paint-order="stroke"')}</g>`);
  }
  // magnifier
  s.push(L.popCard(t, 9.6, 1350, 300, magnifier(t), { r: 205, out: 12.6, fill: '#f6f1df' }));
  if (t > 10.1 && t < 12.8) s.push(L.pill(t, 1350, 'CLEAR ≠ SAFE', 10.1, { y: 520, fs: 46, h: 76, fill: C.red, ink: '#fff' }));
  // timer
  if (t >= 15.0 && t < 22.7) {
    let label, frac, col = C.green;
    if (t < 19.4) { const sec = Math.max(0, Math.round(60 * (1 - pulse(t, 15.6, 18.8)))); label = `0:${String(sec).padStart(2, '0')}`; frac = sec / 60; }
    else { const sec = Math.max(0, Math.round(180 * (1 - pulse(t, 20.2, 22.4)))); label = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; frac = sec / 180; col = C.orange; }
    const k = spring((t - 15.0) / 0.5), pop = t > 19.4 && t < 19.9 ? 1 + 0.15 * Math.sin((t - 19.4) / 0.5 * Math.PI) : 1;
    s.push(`<g transform="translate(1450 520) scale(${(k * pop).toFixed(3)}) translate(-1450 -520)">${timer(t, 1450, 520, label, frac, col)}</g>`);
  }
  // mountain
  s.push(L.popCard(t, 19.4, 760, 300, `${mountainIcon}${txt(0, 78, '6,500 FT+', 54, C.pillInk)}${txt(0, 150, '= 3:00', 62, C.orange)}`, { r: 195, out: 23.0 }));
  if (t > 23.2) s.push(L.pill(t, 1250, 'STAY CLOSE', 23.2, { y: 390, fs: 50, h: 84, fill: C.orange, ink: '#fff' }));

  s.push(L.pill(t, 'left', 'DAY 2', 0.3), L.pill(t, 'right', 'WATER', 0.45));
  s.push(L.captions(t, [
    [15.6, 16.0, 19.3, 'BOIL IT — ', '1 MINUTE.'],
    [19.7, 20.1, 23.0, '6,500 FT+ — ', '3 MINUTES.'],
  ]));
  return s.join('\n');
}
L.render(frame, DUR, 'scene6.mp4');
