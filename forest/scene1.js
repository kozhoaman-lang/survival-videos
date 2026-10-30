// Scene 1 — Saturday afternoon, off the trail (21 s)
const L = require('./lib'); const F = require('./forest_lib'); const { txt, fgCanopy } = require('./sc_common');
const { W, H, C, keys, clamp, easeOut, easeIn, easeInOut, spring, pulse } = L;
const DUR = 21;

function hero(t) {
  const x = keys(t, [[0.5, 380], [4.0, 960], [4.6, 990], [6.5, 1230]]);
  const moving = Math.abs(keys(t + 0.05, [[0.5, 380], [4.0, 960], [4.6, 990], [6.5, 1230]]) - x) > 0.05;
  const face = t < 9.4 ? 1 : -1;
  const armR = keys(t, [[6.6, 8], [7.4, 118], [8.8, 118], [9.3, 8], [11.6, 8], [12.3, 75]]);
  const hold = (t > 6.6 && t < 9.3) || t > 11.6 ? 'phone' : null;
  let expr = 'neutral';
  if (t > 6.6) expr = 'happy';
  if (t > 9.3) expr = 'worried';
  if (t > 12) expr = 'scared';
  return { x, y: 930, s: 0.9, face, hold, expr, armR, armL: 8, walk: moving ? t * 9 : 0, bob: moving ? -Math.abs(Math.sin(t * 9)) * 8 : 0, blink: L.blinkAt(t) };
}
const sunCard = `<g><circle r="30" fill="#ffd23f" stroke="${C.pillInk}" stroke-width="5"/>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="${Math.cos(a * Math.PI / 180) * 42}" y1="${Math.sin(a * Math.PI / 180) * 42 - 20}" x2="${Math.cos(a * Math.PI / 180) * 56}" y2="${Math.sin(a * Math.PI / 180) * 56 - 20}" stroke="#ffd23f" stroke-width="7" stroke-linecap="round" transform="translate(0 20)"/>`).join('')}</g>`;
const noSvc = `<g transform="translate(0 -26)"><rect x="-52" y="10" width="20" height="26" rx="4" fill="#8a93a6"/><rect x="-22" y="-10" width="20" height="46" rx="4" fill="#8a93a6"/><rect x="8" y="-30" width="20" height="66" rx="4" fill="#8a93a6"/><rect x="38" y="-50" width="20" height="86" rx="4" fill="#8a93a6"/><line x1="-62" y1="44" x2="68" y2="-56" stroke="${C.red}" stroke-width="12" stroke-linecap="round"/></g>${txt('NO SERVICE', 0, 82, 27, C.red)}`;

function frame(t) {
  const s = [];
  const h = hero(t);
  s.push(F.forestBackdrop(t, { time: 'day', pan: h.x * 0.04 }));
  s.push(F.trail(t, { bend: 60, fade: 1 - easeInOut(pulse(t, 9.6, 12.4)) }));
  s.push(F.tree(130, 900, 1.2, 'pine', { t }), F.tree(1840, 930, 1.3, 'leafy', { t }), F.bush(330, 800, 1.1, { berries: '#d6306a' }), F.log(1560, 800, 0.7), F.mushrooms(520, 930), F.berries(700, 940, 1.1));
  // deer
  if (t > 4.8) {
    const bolt = Math.max(0, t - 8.4);
    const dx = 1590 + bolt * bolt * 420;
    const op = easeOut(pulse(t, 4.8, 5.6));
    s.push(`<g opacity="${op.toFixed(2)}">${F.deer(t, dx, 905, 0.85, { face: bolt > 0 ? 1 : -1, walk: bolt > 0 ? t * 15 : 0 })}</g>`);
  }
  s.push(L.character(h));
  // photo flash
  const fl = 1 - pulse(t, 8.2, 8.6);
  if (t > 8.2 && t < 8.6) s.push(`<rect width="${W}" height="${H}" fill="#fff" opacity="${(0.55 * fl).toFixed(2)}"/>`);
  s.push(fgCanopy(t));
  // warm light shift
  const warm = keys(t, [[12.5, 0], [20, 0.16]]);
  s.push(`<rect width="${W}" height="${H}" fill="#ff8a2a" opacity="${warm.toFixed(3)}"/>`);
  // cards
  s.push(L.popCard(t, 12.5, 1000, 330, noSvc, { r: 135, out: 15.6 }));
  s.push(L.popCard(t, 14.7, 1440, 340, sunCard + txt('2 HRS', 0, 70, 34), { r: 105, out: 19.4 }));
  for (let i = 0; i < 7; i++) s.push(L.popCard(t, 16.4 + i * 0.25, 640 + i * 105, 235, txt(i + 1, 0, 16, 44), { r: 40, fill: i === 0 ? C.orange : C.pill }));
  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', 'DAY 1', 0.3), L.pill(t, 'right', '3:40 PM', 0.45));
  s.push(L.captions(t, [[8.8, 9.2, 12.4, 'THE TRAIL — ', 'GONE.'], [15.7, 16.1, null, '7 DAYS — ', 'ALONE.']]));
  return s.join('\n');
}
L.render(frame, DUR, 'scene1.mp4');
