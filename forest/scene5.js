// Scene 5 — Shelter (29 s)
const L = require('./lib'); const F = require('./forest_lib'); const { txt, fgCanopy } = require('./sc_common');
const { W, H, C, keys, clamp, easeOut, easeIn, easeInOut, spring, pulse } = L;
const DUR = 29, GY = 760, OX = 660, SS = 1.4, HY = 810;

const prog = t => keys(t, [[1.0, 0], [9.0, 0.78], [23.4, 0.78], [25.6, 1]]);
function hero(t) {
  let x, face = -1, armR = 8, armL = 8, walk = 0, bob = 0, expr = 'focused';
  if (t < 9.6) { // fetching branches
    const ph = Math.sin(t * 0.9 + 1);
    x = 1350 + 40 * ph; face = Math.cos(t * 0.9 + 1) > 0 ? 1 : -1; walk = t * 9; bob = -Math.abs(Math.sin(t * 9)) * 8;
    armR = 60 + Math.sin(t * 4) * 20;
  } else if (t < 25.4) { x = keys(t, [[9.6, 1350], [10.6, 1350]]); face = -1; walk = t < 10.6 ? t * 9 : 0; expr = t > 14 ? 'worried' : 'focused'; if (t >= 24 && t < 25.4) armR = 70 + Math.sin(t * 6) * 25; }
  else { x = keys(t, [[25.4, 1350], [26.9, 1080]]); face = -1; walk = t < 26.9 ? t * 9 : 0; bob = walk ? -Math.abs(Math.sin(t * 9)) * 8 : 0; expr = 'happy'; }
  return { x, y: HY, s: 0.9, face, expr, armR, armL, walk, bob, blink: L.blinkAt(t) };
}
const bag = (hole, cut) => `<g><path d="M-70 60 Q-90 -20 -50 -70 L50 -70 Q90 -20 70 60 Q0 80 -70 60 Z" fill="#2f4a3a" stroke="${C.pillInk}" stroke-width="5"/><path d="M-30 -70 Q0 -96 30 -70" fill="none" stroke="#2f4a3a" stroke-width="12"/>
  ${hole ? `<ellipse cx="0" cy="-20" rx="26" ry="22" fill="${C.pill}" stroke="${C.pillInk}" stroke-width="5"/>` : cut ? `<ellipse cx="0" cy="-20" rx="26" ry="22" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="9 7"/>` : ''}</g>`;
const holeCard = t => `<g transform="translate(0 10)"><path d="M-100 80 Q-130 -40 -90 -90 L90 -90 Q130 -40 100 80 Z" fill="#2f4a3a" stroke="${C.pillInk}" stroke-width="5"/><ellipse cx="0" cy="-30" rx="44" ry="40" fill="${C.pill}" stroke="${C.pillInk}" stroke-width="6"/>
  <g transform="translate(0 -30) scale(${(0.5 * spring(pulse(t, 15.0, 15.6))).toFixed(2)})">${L.stampCheck(1)}</g></g>${txt('FACE HOLE', 0, 112, 24, C.pillInk)}`;
const arrows = t => [0, 1, 2, 3].map(i => { const ph = (t * 1.1 + i * 0.25) % 1; return `<g transform="translate(${-120 + i * 80} ${-30 + ph * 40})" opacity="${(1 - ph).toFixed(2)}"><path d="M0 -26 L0 22 M-16 6 L0 26 L16 6" stroke="#ff6a2a" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`; }).join('');
function groundPanel(t, tin, tout) {
  const k = spring(pulse(t, tin, tin + 0.5)) * (1 - easeIn(pulse(t, tout, tout + 0.4)));
  if (k < 0.01) return '';
  const bed = easeOut(pulse(t, 23.2, 24.4));
  const bedLeaves = bed > 0 ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `<ellipse cx="${-190 + i * 34}" cy="${112 - Math.sin(i / 11 * Math.PI) * 18 * bed}" rx="30" ry="${(12 * bed).toFixed(1)}" fill="${['#d9a441', '#c9742f', '#9aa83c', '#e0b84f'][i % 4]}" stroke="#00000022" stroke-width="2"/>`).join('') : '';
  return `<g transform="translate(1665 470) scale(${(k * 0.88).toFixed(3)})"><defs><clipPath id="gp5"><rect x="-250" y="-170" width="500" height="340" rx="30"/></clipPath></defs>
    <rect x="-250" y="-170" width="500" height="340" rx="30" fill="#2a3052"/>
    <g clip-path="url(#gp5)"><rect x="-250" y="120" width="500" height="60" fill="#6b4a38"/>${bedLeaves}
    <g transform="translate(0 ${(-bed * 26 + 0).toFixed(0)})"><rect x="-130" y="62" width="230" height="40" rx="20" fill="${C.jacket}"/><circle cx="-150" cy="76" r="30" fill="${C.skin}"/><path d="M-182 66 Q-150 36 -118 66 Z" fill="${C.beanie}"/><rect x="100" y="76" width="50" height="24" rx="12" fill="${C.pants}"/></g>
    ${bed < 0.5 ? `<g opacity="${(1 - bed * 2).toFixed(2)}" transform="translate(0 40)">${arrows(t)}</g>` : ''}</g>
    <rect x="-250" y="-170" width="500" height="340" rx="30" fill="none" stroke="${C.pillInk}" stroke-width="7"/>
    ${txt(bed < 0.5 ? 'BARE GROUND' : 'LEAF BED', 0, -100, 46, bed < 0.5 ? C.red : C.green, `stroke="${C.pillInk}" stroke-width="9" paint-order="stroke"`)}</g>`;
}
function frame(t) {
  const s = [];
  const h = hero(t), pr = prog(t);
  const dark = keys(t, [[0, 0], [14, 0.04], [29, 0.2]]);
  s.push(F.forestBackdrop(t, { time: 'dusk', clearing: 0.8, pan: 60 }));
  s.push(`<rect width="${W}" height="${H}" fill="#ffc27a" opacity="0.16"/>`);
  s.push(F.tree(1850, 800, 1.2, 'pine', { t, time: 'dusk' }), F.tree(90, 760, 1.3, 'pine', { t, time: 'dusk' }), F.bush(1560, 740, 1.0, { time: 'dusk' }), F.rocks(1440, 790, 0.6, { time: 'dusk' }));
  // warm light on the shelter + campfire
  s.push(L.glow(OX + 220, GY - 100, 700, '#ffb347', 0.35 + 0.05 * Math.sin(t * 7)));
  s.push(F.shelter(OX, GY, SS, pr, { time: 'day' }));
  s.push(F.campfire(t, 1215, GY + 40, 0.75, { time: 'dusk' }), L.glow(1215, GY - 20, 330, '#ffb347', 0.4 + 0.06 * Math.sin(t * 9)));
  // standing hero (fades as the seated one takes over)
  const seat = easeInOut(pulse(t, 26.4, 27.2));
  const pon = keys(t, [[10.8, 0], [12.8, 1]]);
  const ph = { ...h, face: h.face };
  if (seat < 1) s.push(`<g opacity="${(1 - seat).toFixed(2)}">${L.character(ph)}${F.poncho(t, h.x, h.y + (h.bob || 0), 0.9, { face: h.face, progress: pon })}</g>`);
  // hero lying on the leaf bed under the lean-to (drawn locally)
  if (seat > 0) {
    const bx = OX + 100, by = GY - 78, br = Math.sin(t * 2) * 2;
    s.push(`<g opacity="${seat.toFixed(2)}" transform="translate(${bx} ${by + br}) scale(1.25)">
      <ellipse cx="120" cy="64" rx="190" ry="14" fill="#000" opacity="0.25"/>
      <rect x="150" y="-14" width="120" height="44" rx="20" fill="${C.pants}"/><ellipse cx="274" cy="8" rx="20" ry="26" fill="#17191f"/>
      <rect x="30" y="-34" width="150" height="78" rx="34" fill="${C.jacket}"/>
      <path d="M44 -34 Q104 -52 164 -34 L176 44 L36 44 Z" fill="#2f4a3a"/><rect x="44" y="-6" width="120" height="8" fill="#9aa3b2"/>
      <circle cx="0" cy="0" r="52" fill="${C.skin}"/><path d="M-52 -8 C-52 -66 52 -66 52 -8 Z" fill="${C.beanie}"/><rect x="-54" y="-18" width="108" height="20" rx="10" fill="#d4561b"/><circle cx="0" cy="-60" r="13" fill="#d4561b"/>
      <path d="M-30 12 Q-22 20 -14 12 M14 12 Q22 20 30 12" stroke="#20160f" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="-34" cy="26" r="8" fill="#e48f7a" opacity="0.5"/><circle cx="34" cy="26" r="8" fill="#e48f7a" opacity="0.5"/><path d="M-10 34 Q0 42 10 34" stroke="#5a2e22" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${[0, 1, 2].map(i => { const ph = ((t * 0.6 + i * 0.33) % 1); return `<text x="${60 + i * 30 + ph * 30}" y="${-90 - ph * 90}" ${L.FONT} font-size="${44 - i * 6}" fill="#fff" stroke="${C.pillInk}" stroke-width="7" paint-order="stroke" opacity="${(1 - ph).toFixed(2)}">Z</text>`; }).join('')}
    </g>`);
  }
  s.push(fgCanopy(t, 'dusk'));
  s.push(L.darkness(dark, [{ type: 'circle', x: OX + 250, y: GY - 150, r: 900, a: 0.85, core: 0.4 }]));
  // cards
  s.push(L.popCard(t, 9.7, 1660, 330, bag(t > 11.2, t > 10.8 && t <= 11.2), { r: 125, out: 13.2 }));
  s.push(L.popCard(t, 13.8, 1660, 330, holeCard(t), { r: 140, out: 19.0 }));
  s.push(L.popCard(t, 16.6, 1520, 600, F.icons.skull, { r: 66, out: 19.0 }));
  s.push(groundPanel(t, 19.3, 26.6));
  s.push(L.popCard(t, 21.2, 1830, 300, L.stampX(0.5), { r: 52, out: 23.2 }));
  s.push(L.popCard(t, 24.2, 1830, 300, L.stampCheck(0.5), { r: 52, out: 26.6 }));
  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', 'NIGHT 1', 0.3), L.pill(t, 'right', 'SHELTER', 0.45));
  s.push(L.captions(t, [[13.4, 13.8, 18.9, 'FACE HOLE — ', 'A MUST.'], [19.3, 19.7, null, 'BARE GROUND — ', 'STEALS HEAT.']]));
  return s.join('\n');
}
L.render(frame, DUR, 'scene5.mp4');
