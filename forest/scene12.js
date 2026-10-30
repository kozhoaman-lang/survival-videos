// Scene 12 — Day 6: don't hide from rescuers (21 s)
const L = require('./lib'); const F = require('./forest_lib');
const { W, H, C, FONT, clamp, lerp, easeOut, easeIn, easeInOut, spring, pulse, keys } = L;
const DUR = 21;
const GY = 890;

const heart = `<path d="M0 44 C-70 -2 -52 -52 -24 -50 C-8 -48 0 -34 0 -28 C0 -34 8 -48 24 -50 C52 -52 70 -2 0 44 Z" fill="${C.red}" stroke="${C.pillInk}" stroke-width="5" stroke-linejoin="round"/>`;
const vestBadge = `<g transform="translate(0 6)"><path d="M-40 -34 L-16 -46 L-6 -34 L6 -34 L16 -46 L40 -34 L40 44 L-40 44 Z" fill="#ff7a1a" stroke="${C.pillInk}" stroke-width="5" stroke-linejoin="round"/><rect x="-40" y="-8" width="80" height="12" fill="#e8f35a"/><rect x="-40" y="18" width="80" height="12" fill="#e8f35a"/><g transform="translate(0 -52) scale(0.5)">${heart}</g></g>`;

function bubble(t, tin, x, y, txt, fs = 52) {
  if (t < tin) return '';
  const k = spring((t - tin) / 0.45), fl = Math.sin(t * 2 + x) * 6, out = 1 - clamp((t - tin - 2.2) / 0.4);
  if (out <= 0) return '';
  const w = txt.length * fs * 0.66 + 70;
  return `<g transform="translate(${x} ${y + fl}) scale(${(k * out).toFixed(3)})"><path d="M${w / 2 - 70} 40 L${w / 2 + 10} 100 L${w / 2 - 20} 40 Z" fill="#fff" stroke="${C.pillInk}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="${-w / 2}" y="-44" width="${w}" height="96" rx="48" fill="#fff" stroke="${C.pillInk}" stroke-width="6"/><rect x="${w / 2 - 74}" y="36" width="52" height="10" fill="#fff"/>
    <text x="0" y="${fs * 0.36 + 4}" text-anchor="middle" ${FONT} font-size="${fs}" fill="${C.pillInk}">${txt}</text></g>`;
}
function label(t, tin, cx, cy, txt, fs = 34) {
  if (t < tin + 0.1) return '';
  const k = easeOut((t - tin - 0.1) / 0.3), w = txt.length * fs * 0.7 + 44;
  return `<g opacity="${k.toFixed(2)}"><rect x="${cx - w / 2}" y="${cy - 26}" width="${w}" height="52" rx="26" fill="${C.pill}" stroke="${C.pillInk}" stroke-width="4"/><text x="${cx}" y="${cy + fs * 0.36}" text-anchor="middle" ${FONT} font-size="${fs}" fill="${C.pillInk}">${txt}</text></g>`;
}

// volunteers x track and facing
const VX = t => keys(t, [[2.0, 2150], [8.0, 1560], [9.0, 1560], [13, 1760], [17.6, 1760], [20, 1300]]);
function volState(t) {
  const walking = (t > 2.0 && t < 8.0) || (t > 9.0 && t < 13) || t > 17.9;
  const face = t < 9.0 ? -1 : t < 17.8 ? 1 : -1;
  return { walking, face };
}
// hero x
const HXs = t => keys(t, [[0, 700], [16.8, 700], [17.6, 1000], [30, 1000]]);

function frame(t) {
  const s = [F.forestBackdrop(t, { time: 'day', pan: 40 })];
  s.push(F.tree(260, 800, 0.9, 'pine'), F.bush(1180, 800, 0.9), F.rocks(1380, 790, 0.7));
  // volunteers far right
  const vs = volState(t), vx = VX(t);
  const dirMove = t < 9 ? -1 : 1;
  const vsx = vs.face === -1 ? vx : vx;
  s.push(F.volunteers(t, vx, 745, 0.36, { face: vs.face, walking: vs.walking, speed: 1.4 }));
  // ground behind hero: hero hides behind tree
  const hidden = t > 5.2 && t < 17.0;
  const hx = HXs(t);
  const hero = { x: hx, y: GY, s: 0.9, face: 1, blink: L.blinkAt(t), armL: 8, armR: 8 };
  if (t < 3.0) hero.expr = 'neutral'; else if (t < 5.2) hero.expr = 'worried'; else if (t < 17.0) hero.expr = 'scared'; else hero.expr = 'focused';
  if (t > 3.0 && t < 5.2) hero.face = 1;
  if (hidden) { hero.armL = 25; hero.armR = 25; }
  const moving = t > 16.8 && t < 17.7;
  if (moving) { hero.walk = t * 10; hero.armL = Math.sin(t * 10) * 20 + 8; hero.armR = -Math.sin(t * 10) * 20 + 8; }
  if (t > 17.8 && t < 20.6) hero.armR = 128;
  if (t >= 20.6) { hero.expr = 'happy'; hero.armR = 140; }
  if (hidden) hero.x = 700 + Math.sin(t * 2.2) * 3;
  s.push(L.character(hero));
  // tree in front of hero (hiding)
  const treeA = hidden ? 1 : t < 5.2 ? 1 : 1;
  s.push(`<g opacity="${(t > 4.6 && t < 17.2 ? 1 : 0).toFixed(2)}">${F.tree(760 + hero.x - 700 + 0, GY + 20, 1.35, 'pine', { t })}</g>`);
  // bubbles from right
  s.push(bubble(t, 1.9, 1650, 330, 'HELLO?'), bubble(t, 2.9, 1500, 440, 'HELLO?', 46), bubble(t, 3.9, 1740, 520, 'ANYONE?', 40), bubble(t, 9.6, 1650, 360, 'HELLO?', 46));
  // hide stamp
  if (t > 5.4 && t < 11) {
    const k = spring((t - 5.4) / 0.45) * (1 - easeIn(pulse(t, 10.6, 11)));
    s.push(`<g transform="translate(700 270) scale(${k.toFixed(3)})"><circle cx="5" cy="8" r="86" fill="#000" opacity="0.3"/><circle r="86" fill="${C.pill}" stroke="${C.pillInk}" stroke-width="6"/>${L.stampX(1.1)}</g>`);
    s.push(label(t, 5.4, 700, 400, 'HIDING'));
  }
  // volunteers badge
  if (t > 13.2 && t < 17.0) {
    const out = 17.0;
    s.push(L.popCard(t, 13.2, 1300, 300, vestBadge, { r: 86, out }), L.popCard(t, 14.0, 1500, 300, heart, { r: 70, out }));
    if (t < out) s.push(label(t, 13.2, 1300, 420, 'VOLUNTEERS'), label(t, 14.0, 1500, 410, 'LOOKING FOR YOU', 30));
  }
  // whistle bursts
  if (t > 17.8) {
    const o = hero, h = L.handR(o, 170), tw = 18.1;
    if (t < 21) {
      s.push(`<g transform="translate(${h.x + 10} ${h.y - 8}) scale(0.5) rotate(10)">${F.icons.whistle}</g>`, F.whistleWaves(t, h.x + 40, h.y - 10, 0.9, { t0: tw, dir: -6, period: 0.75, dur: 1.2 }));
    }
    s.push(L.popCard(t, 18.2, 1000, 250, L.stampCheck(1.0), { r: 82 }));
    for (let i = 0; i < 3; i++) if (t > tw + i * 0.75) s.push(`<g transform="translate(${1000 - 80 + i * 80} 372) scale(${spring((t - tw - i * 0.75) / 0.3).toFixed(2)})"><circle r="16" fill="${C.green}" stroke="${C.pillInk}" stroke-width="4"/></g>`);
  }
  // volunteers notice: '!'
  if (t > 18.3 && t < 20.2) { const k = spring((t - 18.3) / 0.35); s.push(`<g transform="translate(${vx - 30} 560) scale(${k.toFixed(2)})"><circle r="44" fill="#ffd23f" stroke="${C.pillInk}" stroke-width="6"/><text y="20" text-anchor="middle" ${FONT} font-size="60" fill="${C.pillInk}">!</text></g>`); }
  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', 'DAY 6', 0.3), L.pill(t, 'right', 'SEARCH', 0.45));
  s.push(L.captions(t, [
    [17.0, 17.4, null, "DON'T HIDE — ", 'WHISTLE.'],
  ]));
  return s.join('\n');
}
L.render(frame, DUR, 'scene12.mp4');
