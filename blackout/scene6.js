// Scene 6 — Day 3: save the phone (30 s)
const L = require('./lib');
const { W, H, C, keys, clamp, easeOut, easeInOut, pulse, mix, FONT } = L;
const DUR = 30;
const dip = (t, at) => { const d = 1 - clamp(Math.abs(t - at) / 0.3); return d > 0 ? `<rect width="${W}" height="${H}" fill="#000" opacity="${d.toFixed(2)}"/>` : ''; };
const APPS = ['#e5483b', '#4a8fd8', '#4cc36b', '#f2b134', '#9b5de5', '#f26b2a', '#2ec4b6', '#e84a8a', '#7c8ba1', '#5ab0ff', '#ffd23f', '#8ac926'];

function phone(t, x, y, s, opts = {}) {
  const bright = opts.bright ?? 1, lowPow = opts.lowPow ?? false, apps = opts.apps ?? 12, batt = opts.batt ?? 0.12;
  const scr = mix('#0d1220', '#2f4a7a', bright);
  const out = [`<g transform="translate(${x} ${y}) scale(${s})">`,
    `<rect x="-205" y="-370" width="410" height="740" rx="56" fill="#14161c"/><rect x="-185" y="-350" width="370" height="700" rx="40" fill="${scr}"/>`,
    `<rect x="-50" y="-340" width="100" height="22" rx="11" fill="#14161c"/>`];
  // battery
  const bc = lowPow ? '#f2b134' : (Math.sin(t * 8) > -0.2 ? C.red : '#7a2a26');
  out.push(`<rect x="70" y="-306" width="80" height="36" rx="8" fill="none" stroke="#fff" stroke-width="4" opacity="${0.4 + 0.6 * bright}"/><rect x="152" y="-296" width="8" height="16" rx="2" fill="#fff"/>`);
  out.push(`<rect x="76" y="-300" width="${68 * batt}" height="24" rx="4" fill="${bc}"/><text x="40" y="-278" text-anchor="end" ${FONT} font-size="30" fill="#fff" opacity="${0.4 + 0.6 * bright}">${Math.round(batt * 100)}%</text>`);
  // app grid
  for (let i = 0; i < 12; i++) {
    const c = i % 3, r = Math.floor(i / 3);
    const k = i < apps ? 1 : 0;
    if (!k && opts.closeT != null) { // shrinking out
      const at = opts.closeT + (11 - i) * 0.12, p = clamp((t - at) / 0.25);
      if (p < 1) out.push(`<g transform="translate(${-110 + c * 110} ${-180 + r * 120}) scale(${(1 - p).toFixed(2)})"><rect x="-42" y="-42" width="84" height="84" rx="20" fill="${APPS[i]}" opacity="${bright}"/></g>`);
      continue;
    }
    out.push(`<rect x="${-152 + c * 110}" y="${-222 + r * 120}" width="84" height="84" rx="20" fill="${APPS[i]}" opacity="${0.35 + 0.65 * bright}"/>`);
  }
  out.push('</g>');
  return out.join('');
}

// --- A: battery saving on the phone ---
function partA(t) {
  const s = [`<rect width="${W}" height="${H}" fill="#3b4a72"/>`];
  for (let i = 0; i < 18; i++) s.push(`<circle cx="${(i * 233) % W}" cy="${(i * 149) % 800}" r="${40 + (i % 3) * 20}" fill="#425384"/>`);
  const lowPow = t > 6.2, bright = keys(t, [[7.4, 1], [8.4, 0.35]]);
  const closing = t > 9.0;
  s.push(phone(t, 1060, 470, 0.92, { lowPow, bright, apps: closing ? 0 : 12, closeT: closing ? 9.0 : null, batt: 0.12 }));
  // settings chips next to the phone
  s.push(L.pill(t, 1560, 'LOW POWER  ON', 6.2, { y: 300, fs: 38, h: 66, fill: '#ffe9b0' }));
  s.push(L.pill(t, 1560, 'BRIGHTNESS  LOW', 7.4, { y: 420, fs: 38, h: 66 }));
  s.push(L.pill(t, 1560, 'CLOSE APPS', 9.0, { y: 540, fs: 38, h: 66 }));
  s.push(L.character({ x: 420, y: 900, s: 0.92, face: 1, expr: t < 6 ? 'worried' : 'focused', armR: 50, hold: 'phone', blink: L.blinkAt(t) }));
  return s.join('');
}

// --- B: texts get through, calls don't ---
function partB(t) {
  const s = [`<rect width="${W}" height="${H}" fill="#9fc6e8"/><rect y="812" width="${W}" height="${H}" fill="#6c6f7a"/>`];
  s.push(`<rect x="140" y="420" width="260" height="392" fill="#b9a7a0"/><rect x="430" y="520" width="200" height="292" fill="#a9b0bf"/>`);
  // cell tower
  s.push(`<path d="M1560 812 L1620 300 L1680 812 Z" fill="none" stroke="#5a6070" stroke-width="12"/><line x1="1580" y1="640" x2="1660" y2="640" stroke="#5a6070" stroke-width="8"/><line x1="1595" y1="480" x2="1645" y2="480" stroke="#5a6070" stroke-width="8"/>`);
  s.push(`<rect x="1600" y="270" width="40" height="70" rx="6" fill="#3b3f4a"/>`);
  for (let k = 1; k < 4; k++) { const a = 0.3 + 0.7 * ((Math.sin(t * 5 - k) + 1) / 2); s.push(`<path d="M${1620 - k * 34} ${300 - k * 10} Q1620 ${240 - k * 26} ${1620 + k * 34} ${300 - k * 10}" stroke="#fff" stroke-width="7" fill="none" opacity="${a.toFixed(2)}"/>`); }
  s.push(L.character({ x: 330, y: 900, s: 0.92, face: 1, expr: 'focused', armR: 50, hold: 'phone', blink: L.blinkAt(t) }));
  // text bubble flies to the tower and lands
  const p1 = easeInOut(pulse(t, 12.0, 14.0));
  const bx = 560 + p1 * 960, by = 470 - Math.sin(p1 * Math.PI) * 160;
  if (t > 11.8 && t < 15.2) s.push(`<g transform="translate(${bx} ${by})"><rect x="-90" y="-46" width="180" height="92" rx="30" fill="#4cc36b"/><path d="M-50 40 L-70 70 L-20 44 Z" fill="#4cc36b"/>${[-40, 0, 40].map(d => `<circle cx="${d}" cy="0" r="10" fill="#fff"/>`).join('')}</g>`);
  if (t > 14.0) s.push(L.popCard(t, 14.0, 1460, 200, L.stampCheck(0.55), { r: 56 }));
  if (t > 14.2) s.push(L.pill(t, 1460, 'TEXT SENT', 14.2, { y: 268, fs: 36, h: 62, fill: '#dff3e4' }));
  // a call stalls halfway with broken signal
  const p2 = easeOut(pulse(t, 15.4, 17.0));
  if (t > 15.3) {
    const cx = 560 + p2 * 480, cy = 640;
    s.push(`<path d="M600 ${cy} L${cx - 40} ${cy}" stroke="#e5483b" stroke-width="8" stroke-dasharray="20 18"/>`);
    s.push(`<g transform="translate(${cx} ${cy}) rotate(${Math.sin(t * 20) * (t > 17 ? 8 : 0)})"><circle r="54" fill="${C.red}"/><path d="M-26 -18 Q-30 -30 -18 -30 L-8 -14 Q-4 -8 -10 -2 Q0 14 14 22 Q20 16 26 20 L34 30 Q34 42 22 40 Q-16 34 -26 -18 Z" fill="#fff"/></g>`);
  }
  if (t > 17.0) s.push(L.popCard(t, 17.0, 1040, 520, L.stampX(0.45), { r: 50 }));
  return s.join('');
}

// --- C: charge in the car, outside only ---
function car(x, y, t) {
  return `<g transform="translate(${x} ${y})">
    <path d="M-330 -60 Q-330 -120 -270 -126 L-170 -136 L-90 -230 L170 -230 L250 -136 L330 -120 Q360 -110 360 -60 L360 -10 L-330 -10 Z" fill="#c8553d"/>
    <path d="M-70 -214 L70 -214 L70 -140 L-150 -140 Z" fill="#bfe3ff" opacity="0.55"/><path d="M90 -214 L160 -214 L225 -140 L90 -140 Z" fill="#bfe3ff" opacity="0.55"/>
    <rect x="72" y="-218" width="16" height="82" fill="#a2402c"/>
    <circle cx="-200" cy="-8" r="58" fill="#1d1f26"/><circle cx="-200" cy="-8" r="24" fill="#9aa3b2"/><circle cx="220" cy="-8" r="58" fill="#1d1f26"/><circle cx="220" cy="-8" r="24" fill="#9aa3b2"/>
    <rect x="320" y="-96" width="36" height="18" rx="6" fill="#ffe08a"/></g>`;
}
function partC(t) {
  const s = [`<rect width="${W}" height="${H}" fill="#9fc6e8"/><circle cx="300" cy="180" r="70" fill="#ffe08a"/>`];
  s.push(`<rect x="0" y="420" width="420" height="392" fill="#b9a7a0"/><rect x="1500" y="380" width="420" height="432" fill="#a9b0bf"/>`);
  for (let i = 0; i < 4; i++) s.push(`<path d="M${600 + i * 180} 812 Q${640 + i * 180} 700 ${680 + i * 180} 812" fill="#7cbf5a"/>`);
  s.push(`<rect y="812" width="${W}" height="${H}" fill="#55585f"/>`);
  // hero sits inside the car: only head/shoulders through the window
  s.push(`<clipPath id="win"><path d="M-70 -214 L70 -214 L70 -140 L-150 -140 Z" transform="translate(900 840)"/></clipPath>`);
  s.push(car(900, 840, t));
  s.push(`<g clip-path="url(#win)">${L.character({ x: 880, y: 950, s: 0.8, face: 1, expr: 'happy', armR: 30, blink: L.blinkAt(t) })}</g>`);
  s.push(`<g transform="translate(900 840)"><path d="M-70 -214 L70 -214 L70 -140 L-150 -140 Z" fill="#bfe3ff" opacity="0.3"/></g>`);
  // charging cable + phone on dashboard with a rising battery
  const ch = clamp((t - 20.5) / 6) * 0.6 + 0.12;
  s.push(L.popCard(t, 20.4, 1180, 420, `<g transform="scale(0.24)">${phone(t, 0, 0, 1, { lowPow: true, batt: ch, bright: 1 })}</g>`, { r: 110 }));
  s.push(L.pill(t, 1180, 'CHARGING', 21.0, { y: 548, fs: 36, h: 62, fill: '#dff3e4' }));
  // garage = no
  const garage = `<g><path d="M-60 -10 L0 -56 L60 -10 L60 50 L-60 50 Z" fill="#8b95a5"/><rect x="-40" y="0" width="80" height="50" fill="#5a6070"/>${[10, 22, 34].map(y => `<line x1="-40" y1="${y}" x2="40" y2="${y}" stroke="#3b3f4a" stroke-width="4"/>`).join('')}</g>`;
  s.push(L.popCard(t, 24.4, 1640, 300, garage + `<g transform="translate(0 0)">${t > 24.9 ? L.stampX(0.55) : ''}</g>`, { r: 86 }));
  s.push(L.pill(t, 1640, 'NOT IN A GARAGE', 25.0, { y: 404, fs: 34, h: 60 }));
  return s.join('');
}

function frame(t) {
  const s = [];
  if (t < 11) s.push(partA(t)); else if (t < 19) s.push(partB(t)); else s.push(partC(t));
  s.push(dip(t, 11), dip(t, 19));
  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', 'DAY 3', 0.3), L.pill(t, 'right', '12% BATTERY', 0.45));
  s.push(L.captions(t, [
    [2.4, 2.8, 10.6, '12% BATTERY — ', 'SAVE IT.'],
    [11.4, 11.8, 18.6, 'TEXT — ', "DON'T CALL."],
    [19.4, 19.8, null, 'CAR CHARGING — ', 'OUTSIDE ONLY.'],
  ]));
  return s.join('\n');
}

L.render(frame, DUR, 'scene6.mp4');
