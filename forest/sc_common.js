// small local helpers shared by scene1..5 (does not touch lib.js / forest_lib.js)
const L = require('./lib'); const F = require('./forest_lib');
const { W, H, C, FONT, mix } = L;
const txt = (s, x, y, fs, fill = C.pillInk, extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" ${FONT} font-size="${fs}" fill="${fill}" ${extra}>${s}</text>`;
// corner canopy only (forestForeground trunks would block the action)
function fgCanopy(t, time = 'day') {
  const p = F._internal.pal(time), c = mix(p.near, '#000000', 0.55), sw = Math.sin(t * 1.1) * 6;
  return `<path d="M-20 -10 Q200 ${150 + sw} 420 -10 Z" fill="${c}"/><path d="M${W - 460} -10 Q${W - 220} ${130 - sw} ${W + 20} -10 Z" fill="${c}"/>`;
}
// wet-jacket overlay in the hero's local frame (torso + hanging arms)
function wetJacket(h, k) {
  if (k <= 0) return '';
  const { x, y, s = 1, face = 1, bob = 0, lean = 0 } = h;
  return `<g transform="translate(${x} ${y + bob}) scale(${s * face} ${s}) rotate(${lean})" opacity="${(0.55 * k).toFixed(2)}" fill="#0a1a3a">
    <rect x="-64" y="-338" width="128" height="200" rx="36"/><rect x="-78" y="-318" width="32" height="150" rx="16"/><rect x="46" y="-318" width="32" height="150" rx="16"/></g>`;
}
module.exports = { txt, fgCanopy, wetJacket };
