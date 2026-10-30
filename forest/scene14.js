// Scene 14 — Recap: what saved you (17 s)
const L = require('./lib'); const F = require('./forest_lib');
const { W, H, C, FONT, clamp, lerp, easeOut, easeIn, spring, pulse, keys } = L;
const DUR = 17;
const GY = 890;

const miniStop = `<g transform="translate(0 -4)">${[['S', C.red], ['T', '#f2a03a'], ['O', C.blue], ['P', C.green]].map(([c, col], i) => `<g transform="translate(${-48 + (i % 2) * 52} ${-42 + Math.floor(i / 2) * 52})"><rect x="-22" y="-22" width="44" height="44" rx="9" fill="${col}" stroke="${C.pillInk}" stroke-width="4"/><text y="14" text-anchor="middle" ${FONT} font-size="38" fill="#fff" stroke="${C.pillInk}" stroke-width="5" paint-order="stroke">${c}</text></g>`).join('')}</g>`;
const treeIcon = `<g transform="translate(0 6)"><rect x="-9" y="22" width="18" height="30" fill="#7a4e34"/><path d="M0 -58 L36 -8 L20 -8 L44 26 L-44 26 L-20 -8 L-36 -8 Z" fill="#2f7d4f" stroke="${C.pillInk}" stroke-width="5" stroke-linejoin="round"/></g>`;
const bagIcon = `<g transform="translate(0 4)"><path d="M-36 -40 Q0 -62 36 -40 L52 40 Q0 58 -52 40 Z" fill="#2f4a3a" stroke="${C.pillInk}" stroke-width="5" stroke-linejoin="round"/><ellipse cx="0" cy="-22" rx="20" ry="14" fill="${C.pill}" stroke="${C.pillInk}" stroke-width="4"/><path d="M-30 -10 L-22 30 M26 -8 L34 28" stroke="#8fc2a8" stroke-width="5" stroke-linecap="round" opacity="0.7"/></g>`;
function potIcon(t) {
  let b = '';
  for (let i = 0; i < 5; i++) { const ph = (t * 1.3 + i * 0.21) % 1; b += `<circle cx="${-22 + i * 11}" cy="${-8 - ph * 40}" r="${4 + ph * 5}" fill="#fff" stroke="#4a8fd8" stroke-width="2.5" opacity="${(1 - ph).toFixed(2)}"/>`; }
  return `<g transform="translate(0 14)"><path d="M-48 -26 Q0 -62 48 -26" stroke="#444" stroke-width="6" fill="none"/><path d="M-42 -20 L-36 36 Q0 46 36 36 L42 -20 Z" fill="#6c7484" stroke="${C.pillInk}" stroke-width="5" stroke-linejoin="round"/><ellipse cx="0" cy="-20" rx="42" ry="9" fill="#4aa3d8" stroke="${C.pillInk}" stroke-width="4"/>${b}</g>`;
}
const cards = [
  ['STOP', t => miniStop, 4.3], ['STAY PUT', t => treeIcon, 6.6], ['WARM + DRY', t => bagIcon, 8.6],
  ['BOIL WATER', potIcon, 10.7], ['3 SIGNALS', t => `<g transform="scale(0.9)">${F.icons.whistle}</g>`, 12.4], ['NO MUSHROOMS', t => `<g transform="scale(0.85)">${F.icons.mushroom}</g>`, 13.8],
];
function label(t, tin, cx, cy, txt, fs = 26) {
  if (t < tin + 0.1) return '';
  const k = easeOut((t - tin - 0.1) / 0.3), w = txt.length * fs * 0.7 + 40;
  return `<g opacity="${k.toFixed(2)}"><rect x="${cx - w / 2}" y="${cy - 25}" width="${w}" height="50" rx="25" fill="${C.pill}" stroke="${C.pillInk}" stroke-width="4"/><text x="${cx}" y="${cy + fs * 0.36}" text-anchor="middle" ${FONT} font-size="${fs}" fill="${C.pillInk}">${txt}</text></g>`;
}
function frame(t) {
  const s = [F.forestBackdrop(t, { time: 'day', pan: 30 }), F.trail(t, { fade: 0.9, bend: 40 })];
  s.push(F.tree(180, 800, 1.0, 'pine'), F.tree(1760, 810, 1.0, 'leafy'), F.campfire(t, 1450, 880, 0.7, { lit: 0.6 }), F.log(470, 830, 0.7));
  const wave = t > 1.5 && t < 3.8;
  s.push(L.character({ x: 960, y: 905, s: 0.9, expr: 'happy', blink: L.blinkAt(t), armR: wave ? 140 + Math.sin(t * 8) * 14 : t > 15 ? 150 + Math.sin(t * 8) * 12 : 8, armL: 8 }));
  // card row
  const cy = 272, r = 82;
  cards.forEach(([nm, ic, tin], i) => {
    const cx = 285 + i * 270;
    let inner = ic(t);
    if (i === 5) inner += `<g transform="translate(0 0) scale(${(spring((t - tin - 0.5) / 0.4) || 0).toFixed(3)})"><g stroke="#fff" stroke-width="34" stroke-linecap="round" opacity="0.9" transform="scale(0.62)"><line x1="-50" y1="-50" x2="50" y2="50"/><line x1="50" y1="-50" x2="-50" y2="50"/></g>${L.stampX(0.62)}</g>`;
    s.push(L.popCard(t, tin, cx, cy, inner, { r }), label(t, tin, cx, cy + r + 40, nm));
  });
  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', '7 DAYS', 0.3), L.pill(t, 'right', 'SURVIVED', 0.45));
  s.push(L.captions(t, [[1.6, 2.0, null, 'YOU — ', 'SURVIVED.']]));
  return s.join('\n');
}
L.render(frame, DUR, 'scene14.mp4');
