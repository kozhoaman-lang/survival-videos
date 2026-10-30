// Scene 9 — Day 3: phone (25 s)
const L = require('./lib'); const F = require('./forest_lib');
const { W, H, C, FONT, keys, clamp, lerp, easeOut, easeIn, easeInOut, spring, pulse, mix } = L;
const DUR = 25;
const mod = (a, n) => ((a % n) + n) % n;
const txt = (x, y, s, fs, fill = '#fff', extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" ${FONT} font-size="${fs}" fill="${fill}" ${extra}>${s}</text>`;

const barsIcon = (n, col = '#3b3f4a') => [0, 1, 2, 3].map(i => `<rect x="${-62 + i * 34}" y="${42 - (i + 1) * 26}" width="24" height="${(i + 1) * 26}" rx="5" fill="${i < n ? col : '#b9bfcc'}"/>`).join('');
const battLow = `<g><rect x="-80" y="-44" width="150" height="88" rx="16" fill="none" stroke="${C.pillInk}" stroke-width="9"/><rect x="74" y="-18" width="16" height="36" rx="5" fill="${C.pillInk}"/><rect x="-68" y="-32" width="26" height="64" rx="6" fill="${C.red}"/>${txt(20, 20, '9%', 56, C.red)}</g>`;
const snowflake = (r = 50, col = '#7ec8ff') => { let g = ''; for (let i = 0; i < 3; i++) g += `<g transform="rotate(${i * 60})"><line x1="${-r}" y1="0" x2="${r}" y2="0"/><path d="M${r * 0.55} 0 l${r * 0.28} -${r * 0.28} M${r * 0.55} 0 l${r * 0.28} ${r * 0.28} M${-r * 0.55} 0 l-${r * 0.28} -${r * 0.28} M${-r * 0.55} 0 l-${r * 0.28} ${r * 0.28}"/></g>`; return `<g stroke="${col}" stroke-width="9" stroke-linecap="round" fill="none">${g}</g>`; };
const planeIcon = `<g transform="rotate(-45) scale(1.5)"><path d="M0 -22 L5 -6 L26 6 L26 12 L5 7 L3 18 L10 24 L10 28 L0 25 L-10 28 L-10 24 L-3 18 L-5 7 L-26 12 L-26 6 L-5 -6 Z" fill="#fff"/></g>`;

function airPanel(t, cx, cy) {
  const on = easeInOut(pulse(t, 6.0, 6.5)), k = spring((t - 5.0) / 0.55);
  const col = mix('#8a90a0', C.green, on);
  return `<g transform="translate(${cx} ${cy}) scale(${k.toFixed(3)})"><rect x="-290" y="-130" width="580" height="260" rx="40" fill="#000" opacity="0.3" transform="translate(6 10)"/><rect x="-290" y="-130" width="580" height="260" rx="40" fill="${C.pill}" stroke="${C.pillInk}" stroke-width="6"/>
    <g transform="translate(-200 -4)"><circle r="62" fill="${mix('#6c7484', C.orange, on)}"/><g transform="scale(0.9)">${planeIcon}</g></g>
    ${txt(80, -30, 'AIRPLANE MODE', 46, C.pillInk)}
    <g transform="translate(110 54)"><rect x="-86" y="-40" width="172" height="80" rx="40" fill="${col}" stroke="${C.pillInk}" stroke-width="5"/><circle cx="${lerp(-46, 46, on).toFixed(1)}" cy="0" r="32" fill="#fff" stroke="${C.pillInk}" stroke-width="4"/></g>
    ${txt(-190, 100, on > 0.5 ? 'ON' : 'OFF', 46, on > 0.5 ? '#2a8a48' : '#6c7484')}</g>`;
}
function callScreen(t, cx, cy, s, k) {
  const ring = mod(t * 1.2, 1);
  return `<g transform="translate(${cx} ${cy}) scale(${s * k})"><rect x="-205" y="-370" width="410" height="740" rx="56" fill="#14161c"/><rect x="-185" y="-350" width="370" height="700" rx="40" fill="#10341f"/><rect x="-50" y="-340" width="100" height="22" rx="11" fill="#14161c"/>
    ${txt(0, -150, 'EMERGENCY', 40, '#bfe8cc')}${txt(0, 0, '911', 190, '#fff')}${txt(0, 60, 'CALLING...', 40, '#bfe8cc')}
    <circle cx="0" cy="200" r="${(70 + ring * 50).toFixed(0)}" fill="none" stroke="${C.green}" stroke-width="6" opacity="${(1 - ring).toFixed(2)}"/><circle cx="0" cy="200" r="70" fill="${C.green}"/>
    <path d="M-28 214 Q-34 188 -14 176 L-4 190 L-12 198 Q-6 210 8 218 L16 210 L30 220 Q20 242 -4 238 Q-22 232 -28 214 Z" fill="#fff" transform="translate(0 -8) rotate(-10)"/>
    <rect x="-60" y="330" width="120" height="8" rx="4" fill="#fff" opacity="0.4"/></g>`;
}

// ---------- hill ----------
const hillY = x => 905 - 355 * Math.exp(-Math.pow((x - 1340) / 470, 2));
function hill(t) {
  let a = '';
  for (let x = -20; x <= W + 20; x += 20) a += `${x},${hillY(x).toFixed(1)} `;
  return `<polygon points="${a} ${W + 20},${H + 20} -20,${H + 20}" fill="#62a24e"/><polyline points="${a}" fill="none" stroke="#86cc66" stroke-width="10" stroke-linejoin="round"/>
    <polygon points="${a} ${W + 20},${H + 20} -20,${H + 20}" fill="#2d5a2a" opacity="0.18"/>`;
}
function heroHill(t) {
  const x = keys(t, [[12.6, 760], [17.2, 1340]]);
  const walking = t > 12.6 && t < 17.2;
  const top = t >= 17.2;
  const y = hillY(x) + 4;
  return { x, y, s: 0.5, face: 1, expr: top ? 'focused' : 'neutral', hold: t >= 18.8 ? 'phone' : null, armR: t >= 18.8 ? keys(t, [[18.8, 8], [19.4, 110]]) : (walking ? 8 : 8), walk: walking ? t * 9 : 0, bob: walking ? -Math.abs(Math.sin(t * 9)) * 5 : 0, blink: L.blinkAt(t) };
}
function layerHill(t) {
  const s = [];
  s.push(F.forestBackdrop(t, { time: 'day', clearing: 0.9 }));
  s.push(F.tree(120, 700, 0.9, 'pine', { t }), F.tree(560, 700, 0.7, 'leafy', { t }), F.tree(1780, 760, 0.9, 'pine', { t }));
  s.push(hill(t));
  s.push(F.tree(900, hillY(900), 0.55, 'pine', { t }), F.tree(1700, hillY(1700), 0.55, 'leafy', { t }), F.rocks(1000, hillY(1000) + 6, 0.35));
  // camp below
  s.push(F.shelter(180, 920, 0.4, 1, {}), F.campfire(t, 430, 920, 0.5, { smoky: true }));
  const h = heroHill(t);
  // line of sight
  if (t > 16.8 && t < 20.2) {
    const k = easeOut(pulse(t, 16.8, 17.8)), x1 = h.x - 4, y1 = h.y - 215 * h.s * 1.8 * 0.6, x2 = 430, y2 = 820;
    const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k);
    s.push(`<g fill="none" stroke-linecap="round"><line x1="${x1}" y1="${y1}" x2="${ex}" y2="${ey}" stroke="#000" stroke-width="12" opacity="0.25" stroke-dasharray="26 20" transform="translate(0 5)"/><line x1="${x1}" y1="${y1}" x2="${ex}" y2="${ey}" stroke="#fff" stroke-width="7" stroke-dasharray="26 20" stroke-dashoffset="${(-t * 40).toFixed(0)}"/></g>`);
    s.push(L.pill(t, 900, 'KEEP CAMP IN SIGHT', 17.3, { y: 400, fs: 42, h: 76, fill: C.orange, ink: '#fff' }));
  }
  s.push(L.character(h));
  if (t > 12.8 && t < 17.0) s.push(L.pill(t, 1340, 'OPEN HIGH SPOT', 14.2, { y: 440, fs: 40, h: 72 }));
  return s.join('');
}

// ---------- forest tuck ----------
function layerTuck(t) {
  const s = [];
  s.push(F.forestBackdrop(t, { time: 'day', clearing: 0.2 }));
  s.push(F.tree(180, 740, 1.3, 'pine', { t }), F.tree(1700, 740, 1.3, 'pine', { t }), F.tree(1460, 700, 0.8, 'leafy', { t }));
  const k = clamp(pulse(t, 8.2, 9.4));
  const armR = keys(t, [[7.4, 70], [8.2, 70], [9.4, -34]]);
  const hold = t < 9.4 ? 'phone' : null;
  s.push(L.character({ x: 820, y: 955, s: 0.95, face: 1, expr: t < 9.4 ? 'worried' : 'happy', armR, armL: 8, hold, blink: L.blinkAt(t) }));
  // warm glow on chest
  if (t > 9.4) { const a = easeOut(pulse(t, 9.4, 10.0)); s.push(L.glow(820 + 10, 955 - 250 * 0.95, 140, '#ffb050', 0.55 * a)); for (let i = 0; i < 3; i++) { const ph = mod(t * 0.9 + i / 3, 1); s.push(`<path d="M${820 + 70 + i * 22} ${955 - 300 - ph * 80} q12 -16 0 -30" stroke="#ff9a3a" stroke-width="7" fill="none" stroke-linecap="round" opacity="${(1 - ph).toFixed(2)}"/>`); } }
  return s.join('');
}

function frame(t) {
  const s = [];
  // base layers
  const bgPhone = () => `<rect width="${W}" height="${H}" fill="#3b4a72"/><circle cx="1500" cy="900" r="500" fill="#46588a" opacity="0.5"/><circle cx="200" cy="200" r="380" fill="#46588a" opacity="0.35"/>`;
  if (t < 7.8) {
    s.push(bgPhone());
    s.push(F.phone(t, 620, 500, 0.88, { battery: 9, airplane: t >= 6.3, bars: 0, noService: t < 6.3 }));
    s.push(L.popCard(t, 1.8, 1100, 290, `<g transform="scale(1.1)">${barsIcon(0)}</g>${L.stampX(1.0)}`, { r: 115, out: 4.8 }));
    s.push(L.popCard(t, 3.0, 1480, 290, `<g transform="scale(1.2)">${battLow}</g>`, { r: 115, out: 4.8, fill: '#ffe4e0' }));
    if (t > 2.1 && t < 5.1) s.push(L.pill(t, 1100, 'NO SIGNAL', 2.1, { y: 430, fs: 38, h: 66, fill: C.red, ink: '#fff' }));
    if (t > 3.3 && t < 5.1) s.push(L.pill(t, 1480, '9% LEFT', 3.3, { y: 430, fs: 38, h: 66, fill: C.red, ink: '#fff' }));
    if (t > 4.9) s.push(airPanel(t, 1330, 480));
  }
  if (t >= 7.0 && t < 12.9) s.push(`<g opacity="${(easeInOut(pulse(t, 7.0, 7.8)) * (1 - easeInOut(pulse(t, 12.2, 12.9)))).toFixed(3)}">${layerTuck(t)}</g>`);
  if (t >= 12.0 && t < 20.4) s.push(`<g opacity="${easeInOut(pulse(t, 12.0, 12.9)).toFixed(3)}">${layerHill(t)}</g>`);
  // cold drains battery card
  s.push(L.popCard(t, 10.4, 1330, 290, `<g transform="translate(0 14) scale(1.15)">${battLow}</g><g transform="translate(-72 -72) scale(1.1)">${snowflake(52)}</g>${(t > 11.4) ? `<g transform="scale(${spring((t - 11.4) / 0.4).toFixed(3)})">${L.stampX(1.35)}</g>` : ''}`, { r: 150, out: 12.6, fill: '#e3f1ff' }));
  if (t > 10.9 && t < 12.6) s.push(L.pill(t, 1330, 'COLD DRAINS BATTERY', 10.9, { y: 470, fs: 36, h: 66, fill: '#3a7fc4', ink: '#fff' }));
  // big phone final
  if (t >= 19.6) {
    const dim = easeOut(pulse(t, 19.6, 20.1));
    s.push(`<rect width="${W}" height="${H}" fill="#0a1020" opacity="${(0.62 * dim).toFixed(2)}"/>`);
    const k = spring((t - 19.6) / 0.6);
    if (t < 22.4) { s.push(`<g transform="translate(620 500) scale(${(0.88 * k).toFixed(3)}) translate(-620 -500)">${F.phone(t, 620, 500, 1, { battery: 9, airplane: false, bars: t > 20.6 ? 1 : 0, noService: t <= 20.6 })}</g>`); }
    else s.push(callScreen(t, 620, 500, 0.88, spring((t - 22.4) / 0.5)));
    s.push(L.popCard(t, 20.8, 1250, 300, `<g transform="scale(1.35)">${barsIcon(1, C.green)}</g>`, { r: 125, fill: '#f2f4f8' }));
    s.push(L.pill(t, 1250, '1 BAR', 21.0, { y: 440, fs: 46, h: 76, fill: C.green, ink: '#fff' }));
    if (t > 22.4) s.push(L.popCard(t, 22.6, 1560, 300, txt(0, 56, '911', 130, C.red), { r: 125, fill: '#fff2f0' }));
  }
  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', 'DAY 3', 0.3), L.pill(t, 'right', '9% BATTERY', 0.45));
  s.push(L.captions(t, [
    [5.9, 6.4, 12.4, 'AIRPLANE MODE — ', 'KEEP IT WARM.'],
    [20.6, 21.0, null, 'ONE BAR — ', 'CALL 911.'],
  ]));
  return s.join('\n');
}
L.render(frame, DUR, 'scene9.mp4');
