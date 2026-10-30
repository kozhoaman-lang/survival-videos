// Scene 3 — Stay put (29 s)
const L = require('./lib'); const F = require('./forest_lib'); const { txt, fgCanopy } = require('./sc_common');
const { W, H, C, keys, clamp, easeOut, easeIn, easeInOut, spring, pulse } = L;
const DUR = 29;
const MX = 90, MY = 160, MW = 1120, MH = 640;
const CX = MX + MW / 2, CY = MY + MH / 2, ZR = Math.min(MW, MH) * 0.3;
const STILL = [CX - ZR * 0.18, CY + ZR * 0.12];
const PX = 1290, PY = 170, PW = 540, PH = 540, GYL = 400; // cliff panel; local ground y

function pin(x, y, k) {
  return `<g transform="translate(${x} ${y}) scale(${k.toFixed(3)})"><ellipse cx="0" cy="0" rx="16" ry="6" fill="#000" opacity="0.3"/><path d="M0 0 C-34 -40 -34 -76 0 -76 C34 -76 34 -40 0 0 Z" fill="${C.red}" stroke="#fff" stroke-width="5"/><circle cx="0" cy="-52" r="10" fill="#fff"/></g>`;
}
function cliffPanel(t, tin, tout) {
  const k = spring(pulse(t, tin, tin + 0.5)) * (1 - easeIn(pulse(t, tout, tout + 0.4)));
  if (k <= 0.01) return '';
  const u = pulse(t, tin + 0.4, tin + 2.0), fall = pulse(t, tin + 2.0, tin + 3.0);
  const hx = 70 + u * 400, edge = 470;
  const hy = GYL + easeIn(fall) * 380;
  const rot = fall * 60;
  let g = `<defs><clipPath id="cp3"><rect width="${PW}" height="${PH}" rx="30"/></clipPath><linearGradient id="sk3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4ee"/><stop offset="1" stop-color="#dff3ff"/></linearGradient></defs>
  <g clip-path="url(#cp3)"><rect width="${PW}" height="${PH}" fill="url(#sk3)"/>
  <path d="M300 ${GYL + 40} L380 280 L460 ${GYL + 40} Z M360 ${GYL + 40} L440 230 L540 ${GYL + 40} Z" fill="#8dbb9a" opacity="0.9"/>
  <rect x="${edge + 40}" y="${GYL + 120}" width="${PW}" height="${PH}" fill="#5aa06c" opacity="0.5"/>
  <polygon points="0,${GYL} ${edge},${GYL} ${edge - 30},${GYL + 60} ${edge + 4},${PH} 0,${PH}" fill="#8a6a50"/>
  <polygon points="0,${GYL} ${edge},${GYL} ${edge + 6},${GYL + 24} 0,${GYL + 24}" fill="#62a24e"/>
  <polygon points="${edge - 30},${GYL + 60} ${edge + 4},${PH} ${edge - 70},${PH} ${edge - 50},${GYL + 120}" fill="#6e5440" opacity="0.7"/>
  <path d="M${edge - 18} ${GYL + 26} l12 40 M${edge - 70} ${GYL + 30} l8 50" stroke="#5e3a28" stroke-width="5" stroke-linecap="round"/>
  ${[['0', 80], ['1', 190]].map(([i, x]) => `<g transform="translate(${x} ${GYL + 6}) scale(0.5)">${F.tree(0, 0, 1, 'pine', { shadow: false })}</g>`).join('')}
  <g transform="translate(${hx} ${hy}) rotate(${rot})"><g transform="translate(${-hx} ${-GYL})">${L.character({ x: hx, y: GYL, s: 0.3, expr: fall > 0 ? 'scared' : 'worried', armL: fall > 0 ? 150 : 8, armR: fall > 0 ? 150 : 8, walk: u < 1 ? t * 9 : 0 })}</g></g></g>
  <rect width="${PW}" height="${PH}" rx="30" fill="none" stroke="${C.pillInk}" stroke-width="7"/>`;
  return `<g transform="translate(${PX + PW / 2} ${PY + PH / 2}) scale(${k.toFixed(3)}) translate(${-PW / 2} ${-PH / 2})">${g}</g>`;
}
const msgInner = `<rect x="-155" y="-70" width="310" height="130" rx="34" fill="${C.blue}"/><path d="M110 56 L136 86 L80 58 Z" fill="${C.blue}"/>
  <text x="0" y="-12" text-anchor="middle" ${L.FONT} font-size="38" fill="#fff">Trail X,</text><text x="0" y="40" text-anchor="middle" ${L.FONT} font-size="38" fill="#fff">back by 6 PM</text>`;

function forestScene(t, op) {
  const TXc = 1180, GY = 900;
  const wk = pulse(t, 22.8, 24.6);
  const hug = pulse(t, 24.6, 25.4);
  const hx = L.lerp(500, TXc - 64 - 40, easeInOut(wk));
  const h = { x: hx, y: GY, s: 0.9, face: 1, expr: hug > 0 ? 'happy' : 'worried', armR: L.lerp(8, 92, easeOut(hug)), armL: L.lerp(8, -88, easeOut(hug)), walk: wk > 0 && wk < 1 ? t * 9 : 0, bob: wk > 0 && wk < 1 ? -Math.abs(Math.sin(t * 9)) * 8 : 0, blink: L.blinkAt(t) };
  let g = F.forestBackdrop(t, { time: 'day', pan: 50 });
  g += F.tree(160, 880, 1.2, 'pine', { t }) + F.tree(1760, 900, 1.2, 'leafy', { t }) + F.bush(520, 800, 1.0) + F.mushrooms(1500, 930);
  g += `<rect x="${TXc - 36}" y="640" width="72" height="${GY - 640}" rx="10" fill="#7a4e34"/><rect x="${TXc + 6}" y="640" width="30" height="${GY - 640}" fill="#5e3a28"/>`;
  g += F.tree(TXc, 720, 1.5, 'pine', { t, shadow: false });
  g += `<ellipse cx="${TXc}" cy="${GY + 2}" rx="90" ry="14" fill="#000" opacity="0.22"/>`;
  g += L.character(h);
  // trunk strip in front of the hands so they wrap around the tree
  if (hug > 0.3) g += `<rect x="${TXc - 36}" y="${GY - 330}" width="72" height="130" fill="#7a4e34"/><rect x="${TXc + 6}" y="${GY - 330}" width="30" height="130" fill="#5e3a28"/>`
    + `<g transform="translate(${TXc + 44} ${GY - 262})" fill="${C.skin}"><circle r="17"/></g>`;
  if (hug > 0.6) g += `<g transform="translate(${TXc - 120} ${GY - 520}) scale(${spring(pulse(t, 25.2, 25.8)).toFixed(2)})"><path d="M0 0 C-50 -40 -20 -80 0 -50 C20 -80 50 -40 0 0 Z" fill="${C.red}" stroke="#fff" stroke-width="4"/></g>`;
  return `<g opacity="${op.toFixed(3)}">${g}</g>`;
}

function frame(t) {
  const s = [];
  s.push(`<defs><linearGradient id="bg3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f3b62"/><stop offset="1" stop-color="#1e2742"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg3)"/>`);
  // map
  const mk = spring(pulse(t, 0.3, 0.9));
  const mout = 1 - easeInOut(pulse(t, 22.4, 23.4));
  const dx = 340 * (1 - easeInOut(pulse(t, 15.2, 16.0)));
  s.push(`<g transform="translate(${dx.toFixed(1)} 0)">`);
  if (mk > 0.01) {
    s.push(`<g opacity="${mout.toFixed(2)}"><g transform="translate(${CX} ${CY}) scale(${mk.toFixed(3)}) translate(${-CX} ${-CY})"><rect x="${MX - 8}" y="${MY - 8}" width="${MW + 16}" height="${MH + 16}" rx="32" fill="${C.pill}" stroke="${C.pillInk}" stroke-width="6"/>
      ${F.searchMap(t, MX, MY, MW, MH, { tin: 9.2, dur: 6.5, labels: t > 9.4 })}</g>`);
    // last seen pin + search rings
    if (t > 4.6) {
      const k = spring(pulse(t, 4.6, 5.2));
      for (let i = 0; i < 2; i++) { const ph = ((t - 5.4) * 0.5 + i * 0.5) % 1; if (t > 5.4 && t < 9.2) s.push(`<circle cx="${CX}" cy="${CY}" r="${(ph * ZR).toFixed(0)}" fill="none" stroke="#ffd23f" stroke-width="5" opacity="${(0.8 * (1 - ph)).toFixed(2)}"/>`); }
      s.push(pin(CX, CY, k), `<g transform="translate(${CX + 30} ${CY - 70})"><rect x="0" y="-26" width="200" height="46" rx="23" fill="${C.pill}" stroke="${C.pillInk}" stroke-width="4"/>${txt('LAST SEEN', 100, 7, 26)}</g>`);
    }
    s.push('</g>');
  }
  s.push(L.popCard(t, 13.4, STILL[0] - 100, STILL[1] - 100, L.stampCheck(0.5), { r: 50, out: 22.4 }));
  s.push('</g>');
  s.push(cliffPanel(t, 15.6, 19.6));
  s.push(L.popCard(t, 17.9, PX + 270, PY + 270, L.stampX(0.9), { r: 90, out: 19.6 }));
  s.push(L.popCard(t, 19.9, 1550, 440, msgInner, { r: 200, out: 23.0, fill: '#fff6e0' }));
  // forest finale
  const fo = easeInOut(pulse(t, 22.6, 23.6));
  if (fo > 0) s.push(forestScene(t, fo), fgCanopy(t));
  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', 'DAY 1', 0.3), L.pill(t, 'right', 'STAY PUT', 0.45));
  s.push(L.captions(t, [[1.2, 1.6, 22.4, "DON'T MOVE — ", 'GET FOUND.'], [23.6, 24.0, null, 'LOST? — ', 'HUG A TREE.']]));
  return s.join('\n');
}
L.render(frame, DUR, 'scene3.mp4');
