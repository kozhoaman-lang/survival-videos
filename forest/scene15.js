// Scene 15 — Outro: tell someone, pack, subscribe (21 s)
const L = require('./lib'); const F = require('./forest_lib');
const { W, H, C, FONT, clamp, lerp, easeOut, easeIn, easeInOut, spring, pulse, keys } = L;
const DUR = 21;
const GY = 900;

const bagIcon = `<g transform="translate(0 4)"><path d="M-36 -40 Q0 -62 36 -40 L52 40 Q0 58 -52 40 Z" fill="#2f4a3a" stroke="${C.pillInk}" stroke-width="5" stroke-linejoin="round"/><ellipse cx="0" cy="-22" rx="20" ry="14" fill="${C.pill}" stroke="${C.pillInk}" stroke-width="4"/><path d="M-30 -10 L-22 30 M26 -8 L34 28" stroke="#8fc2a8" stroke-width="5" stroke-linecap="round" opacity="0.7"/></g>`;
const items = [['whistle', `<g transform="scale(0.8)">${F.icons.whistle}</g>`, 300, 8.2], ['mirror', `<g transform="scale(0.85)">${F.icons.mirror}</g>`, 470, 9.6], ['bag', bagIcon, 640, 11.0]];
const BPX = 1560, BPY = 880;

function room(t) {
  const s = [`<rect width="${W}" height="${H}" fill="#e8c9a0"/><rect y="0" width="${W}" height="812" fill="#f0d6ae"/><rect y="812" width="${W}" height="${H}" fill="#9a6a48"/><rect y="800" width="${W}" height="16" fill="#7a5238"/>`];
  s.push(`<rect x="1250" y="150" width="400" height="360" rx="10" fill="#7a5238"/><rect x="1266" y="166" width="368" height="328" fill="#9fd4f5"/><circle cx="1540" cy="260" r="48" fill="#fff3b0"/><path d="M1266 494 L1266 400 Q1350 340 1430 400 Q1520 330 1634 410 L1634 494 Z" fill="#6fb06a"/><rect x="1442" y="166" width="10" height="328" fill="#7a5238"/><rect x="1266" y="320" width="368" height="10" fill="#7a5238"/>`);
  s.push(`<polygon points="1250,510 1650,510 1760,812 1140,812" fill="#fff3c0" opacity="0.18"/>`);
  // desk
  s.push(`<rect x="170" y="710" width="600" height="26" rx="8" fill="#8a5a3c"/><rect x="190" y="736" width="22" height="76" fill="#6b4430"/><rect x="728" y="736" width="22" height="76" fill="#6b4430"/>`);
  // picture + shelf
  s.push(`<rect x="320" y="200" width="260" height="170" rx="8" fill="#7a5238"/><rect x="334" y="214" width="232" height="142" fill="#bfe3ff"/><path d="M334 356 L420 270 L480 320 L520 280 L566 330 L566 356 Z" fill="#5aa06c"/>`);
  s.push(`<g transform="translate(700 710)"><rect x="-26" y="-40" width="52" height="40" rx="8" fill="#c0603c"/><path d="M0 -40 Q-30 -76 -14 -96 Q10 -70 0 -40 Z M0 -40 Q30 -70 22 -92 Q-6 -70 0 -40 Z" fill="#3f9150"/></g>`);
  return s.join('');
}
function backpack(t, packed) {
  const open = clamp(1 - pulse(t, 12.2, 12.8));
  const sq = packed > 0 ? Math.sin(Math.PI * clamp((t - 0) * 0)) : 0;
  return `<g transform="translate(${BPX} ${BPY})"><ellipse cx="0" cy="6" rx="130" ry="14" fill="#000" opacity="0.22"/>
    <rect x="-100" y="-210" width="200" height="210" rx="50" fill="#e5483b" stroke="${C.pillInk}" stroke-width="6"/>
    <rect x="-70" y="-110" width="140" height="90" rx="22" fill="#c23a2f" stroke="${C.pillInk}" stroke-width="5"/>
    <path d="M-100 -150 Q0 -230 100 -150 L100 -170 Q0 -250 -100 -170 Z" fill="#c23a2f"/>
    <path d="M-100 -168 Q0 -${(open > 0.5 ? 262 : 230)} 100 -168" stroke="${C.pillInk}" stroke-width="6" fill="none"/>
    <rect x="-60" y="-205" width="120" height="16" rx="8" fill="#f2b134" stroke="${C.pillInk}" stroke-width="4"/>
    <rect x="-80" y="-60" width="26" height="10" rx="5" fill="#f2b134"/></g>`;
}
function msgPanel(t) {
  const tin = 2.8; if (t < tin) return '';
  const k = spring((t - tin) / 0.5), typed = clamp((t - 3.6) / 1.4), full = 'Trail X — back by 6 PM';
  const txt = full.slice(0, Math.round(typed * full.length)), sent = t > 5.6;
  const out = t > 13.4 ? 1 - easeIn((t - 13.4) / 0.3) : 1;
  return `<g transform="translate(880 290) scale(${(k * out).toFixed(3)})">
    <rect x="-300" y="-170" width="600" height="340" rx="48" fill="#000" opacity="0.3" transform="translate(6 10)"/>
    <rect x="-300" y="-170" width="600" height="340" rx="48" fill="#14161c" stroke="${C.pillInk}" stroke-width="6"/>
    <rect x="-282" y="-152" width="564" height="304" rx="34" fill="#e9eefb"/>
    <rect x="-282" y="-152" width="564" height="64" rx="34" fill="#4a8fd8"/><rect x="-282" y="-120" width="564" height="32" fill="#4a8fd8"/>
    <text x="0" y="-108" text-anchor="middle" ${FONT} font-size="34" fill="#fff">MAYA</text>
    <rect x="-250" y="-60" width="300" height="56" rx="28" fill="#d3dbea"/><text x="-100" y="-22" text-anchor="middle" ${FONT} font-size="28" fill="#4a5a78">Where to?</text>
    <rect x="-262" y="10" width="${sent || typed > 0 ? 520 : 0}" height="88" rx="44" fill="${C.blue}" opacity="${typed > 0 ? 1 : 0}"/>
    <text x="-14" y="66" text-anchor="middle" ${FONT} font-size="42" fill="#fff">${txt}</text>
    ${sent ? `<g transform="translate(150 130) scale(${spring((t - 5.6) / 0.4).toFixed(2)})"><text x="-40" y="10" text-anchor="end" ${FONT} font-size="28" fill="#4a5a78">SENT</text><circle r="24" fill="${C.green}" stroke="${C.pillInk}" stroke-width="4"/><g transform="scale(0.36)"><polyline points="-48,4 -14,38 52,-36" fill="none" stroke="#fff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/></g></g>` : ''}
  </g>`;
}
function frame(t) {
  const s = [room(t)];
  // desk items (until they fly)
  items.forEach(([nm, ic, x, at]) => {
    const p = easeInOut(pulse(t, at, at + 0.9));
    if (t < 7.0) return;
    const tin = spring((t - 7.0) / 0.4);
    if (p >= 1) return;
    const px = lerp(x, BPX, p), py = lerp(690, BPY - 230, p) - Math.sin(p * Math.PI) * 220, sc = (p === 0 ? tin : 1) * (1 - p * 0.35);
    s.push(`<g transform="translate(${px} ${py}) rotate(${p * 25}) scale(${sc.toFixed(3)})">${ic}</g>`);
  });
  s.push(backpack(t, 0));
  // hero
  const texting = t > 2.2 && t < 6.6, jump = t > 15.8 ? -Math.abs(Math.sin((t - 15.8) * 4)) * 24 : 0;
  const o = { x: 1040, y: GY, s: 0.9, face: 1, blink: L.blinkAt(t), expr: texting ? 'focused' : t > 6.6 ? 'happy' : 'neutral', armL: 8, armR: texting ? 80 : 8, hold: texting ? 'phone' : null, bob: jump };
  if (t > 7.4 && t < 12) { o.armL = 30 + Math.sin(t * 3) * 6; o.armR = 100; o.face = 1; }
  if (t > 13) { o.armR = 150 + Math.sin(t * 7) * 14; o.expr = 'happy'; }
  s.push(L.character(o));
  s.push(msgPanel(t));
  // checklist cards after packing
  items.forEach(([nm, ic, x, at], i) => {
    const tin = at + 0.9, cx = 1400 + i * 160;
    if (t < tin) return;
    s.push(L.popCard(t, tin, cx, 520, `<g transform="scale(0.55)">${ic}</g><g transform="translate(34 34) scale(${spring((t - tin - 0.3) / 0.4).toFixed(2)})"><circle r="26" fill="#fff" stroke="${C.pillInk}" stroke-width="4"/><g transform="scale(0.4)">${L.stampCheck(1)}</g></g>`, { r: 56 }));
  });
  // warm glow
  s.push(`<defs><radialGradient id="wg"><stop offset="0" stop-color="#ffd27a" stop-opacity="0.35"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs><circle cx="1450" cy="330" r="700" fill="url(#wg)"/>`);
  // subscribe
  if (t > 16.0) {
    const k = L.spring((t - 16.0) / 0.6), pr = 1 + 0.03 * Math.sin((t - 16.6) * 5) * clamp(t - 16.6);
    s.push(`<g transform="translate(900 330) scale(${(k * pr).toFixed(3)})"><rect x="-240" y="-62" width="480" height="124" rx="62" fill="#000" opacity="0.3" transform="translate(5 8)"/><rect x="-240" y="-62" width="480" height="124" rx="62" fill="${C.red}" stroke="${C.pillInk}" stroke-width="6"/><text x="0" y="22" text-anchor="middle" ${FONT} font-size="66" fill="#fff">SUBSCRIBE</text></g>`);
  }
  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', 'BEFORE YOU GO', 0.3), L.pill(t, 'right', 'CHECKLIST', 0.45));
  s.push(L.captions(t, [
    [2.6, 3.0, 8.0, 'TELL SOMEONE — ', 'YOUR PLAN.'],
    [8.4, 8.8, 15.4, 'PACK — ', 'THREE THINGS.'],
    [15.8, 16.2, null, 'NEXT SCENARIO — ', 'SOON.'],
  ]));
  const fade = clamp((t - 20.2) / 0.8);
  if (fade > 0) s.push(`<rect width="${W}" height="${H}" fill="#000" opacity="${fade.toFixed(2)}"/>`);
  return s.join('\n');
}
L.render(frame, DUR, 'scene15.mp4');
