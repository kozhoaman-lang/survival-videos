// Scene 7 — Day 4: temperature + carbon monoxide (45 s)
const L = require('./lib');
const { W, H, C, keys, clamp, easeOut, easeInOut, pulse, mix, FONT } = L;
const DUR = 45;
const dip = (t, at) => { const d = 1 - clamp(Math.abs(t - at) / 0.3); return d > 0 ? `<rect width="${W}" height="${H}" fill="#000" opacity="${d.toFixed(2)}"/>` : ''; };
const rnd = L.rng(11);
const haze = Array.from({ length: 30 }, () => ({ x: 300 + rnd() * 1400, y: 200 + rnd() * 560, r: 80 + rnd() * 140, d: rnd() * 4 }));

function thermo(x, y, temp, hot) { // temp 30..100 °F
  const lvl = clamp((temp - 30) / 70);
  const col = hot ? C.red : mix('#4a8fd8', C.red, lvl);
  return `<g transform="translate(${x} ${y})">
    <rect x="-34" y="-300" width="68" height="330" rx="34" fill="#f4f4f4" stroke="${C.pillInk}" stroke-width="6"/>
    <circle cx="0" cy="40" r="58" fill="${col}" stroke="${C.pillInk}" stroke-width="6"/>
    <rect x="-16" y="${-270 + (1 - lvl) * 280}" width="32" height="${lvl * 280 + 30}" rx="12" fill="${col}"/>
    ${[0, 1, 2, 3].map(i => `<line x1="34" y1="${-250 + i * 70}" x2="56" y2="${-250 + i * 70}" stroke="${C.pillInk}" stroke-width="5"/>`).join('')}
    <text x="0" y="148" text-anchor="middle" ${FONT} font-size="64" fill="#fff">${Math.round(temp)}°F</text></g>`;
}
const generatorSVG = (vib = 0) => `<g transform="translate(${vib} 0)"><rect x="-110" y="-120" width="220" height="140" rx="14" fill="#f2b134" stroke="#3a281c" stroke-width="6"/>
  <rect x="-120" y="-132" width="240" height="20" rx="8" fill="#2a2e3a"/><rect x="-80" y="-90" width="90" height="70" rx="8" fill="#3b3f4a"/>
  <circle cx="60" cy="-56" r="26" fill="#3b3f4a"/><rect x="96" y="-150" width="16" height="40" fill="#2a2e3a"/>
  <circle cx="-80" cy="30" r="22" fill="#1d1f26"/><circle cx="80" cy="30" r="22" fill="#1d1f26"/></g>`;
const grillSVG = `<g><path d="M-50 -10 A50 50 0 0 0 50 -10 Z" fill="#2a2e3a"/><rect x="-56" y="-16" width="112" height="10" rx="4" fill="#5a6070"/><line x1="-30" y1="30" x2="-44" y2="56" stroke="#2a2e3a" stroke-width="6"/><line x1="30" y1="30" x2="44" y2="56" stroke="#2a2e3a" stroke-width="6"/><path d="M-20 -24 Q-14 -40 -20 -54 M0 -24 Q6 -40 0 -54 M20 -24 Q26 -40 20 -54" stroke="#9aa3b2" stroke-width="5" fill="none"/></g>`;
const stoveSVG = `<g><rect x="-56" y="-6" width="112" height="44" rx="6" fill="#4a8fd8" stroke="#2a3a5a" stroke-width="4"/><rect x="-40" y="-14" width="80" height="10" fill="#2a2e3a"/><path d="M0 -16 C-12 -24 -10 -40 0 -54 C10 -40 12 -24 0 -16 Z" fill="#ffb02e"/></g>`;

function apartment(t, frost) {
  const s = [`<rect width="${W}" height="${H}" fill="${mix(C.wall, '#3a4466', frost * 0.5)}"/>`];
  s.push(`<rect y="812" width="${W}" height="${H}" fill="${C.floor}"/><rect y="806" width="${W}" height="10" fill="${C.trim}"/>`);
  s.push(`<rect x="1240" y="170" width="420" height="380" rx="8" fill="${C.trim}"/><rect x="1256" y="186" width="388" height="348" fill="#b8d3ea"/>`);
  if (frost > 0) { s.push(`<clipPath id="glass"><rect x="1256" y="186" width="388" height="348"/></clipPath><g clip-path="url(#glass)">`); for (let i = 0; i < 9; i++) s.push(`<circle cx="${1256 + (i % 3) * 194}" cy="${186 + Math.floor(i / 3) * 174}" r="${110 * frost}" fill="#ffffff" opacity="0.55"/>`); s.push('</g>'); }
  s.push(`<rect x="1446" y="186" width="8" height="348" fill="${C.trim}"/>`);
  s.push(`<rect x="160" y="300" width="160" height="512" rx="6" fill="#55607d"/><circle cx="294" cy="560" r="10" fill="#c9cfdb"/>`);
  return s.join('');
}

// --- A: cold ---
function partA(t) {
  const frost = easeOut(pulse(t, 1, 8));
  const s = [apartment(t, frost)];
  s.push(`<rect width="${W}" height="${H}" fill="#9fd3ff" opacity="${(0.18 * frost).toFixed(2)}"/>`);
  s.push(thermo(560, 520, keys(t, [[1, 68], [7, 45]]), false));
  const shiver = t > 4 && t < 9 ? Math.sin(t * 60) * 3 : 0;
  s.push(L.character({ x: 960 + shiver, y: 900, s: 0.92, face: 1, expr: t < 9.5 ? 'worried' : 'neutral', blink: L.blinkAt(t) }));
  // layers: scarf, then blanket
  if (t > 8.0) s.push(`<g transform="translate(${960 + shiver} 900) scale(0.92)" opacity="${easeOut(pulse(t, 8.0, 8.3)).toFixed(2)}"><rect x="-58" y="-350" width="116" height="34" rx="14" fill="#c0392b"/><rect x="20" y="-330" width="30" height="90" rx="10" fill="#c0392b"/></g>`);
  if (t > 9.4) s.push(`<g transform="translate(${960} 900) scale(0.92)" opacity="${easeOut(pulse(t, 9.4, 9.8)).toFixed(2)}"><path d="M-96 -330 Q0 -370 96 -330 L110 -90 Q0 -60 -110 -90 Z" fill="#7a9a5a"/>${[-60, -20, 20, 60].map(x => `<line x1="${x}" y1="-340" x2="${x * 1.15}" y2="-80" stroke="#5f7d44" stroke-width="6"/>`).join('')}</g>`);
  s.push(L.pill(t, 960, 'LAYERS', 8.2, { y: 300, fs: 40, h: 70 }));
  // floor plan: live in one room
  const plan = `<g><rect x="-110" y="-80" width="220" height="160" fill="#f4e4c4" stroke="#3a281c" stroke-width="6"/><line x1="0" y1="-80" x2="0" y2="80" stroke="#3a281c" stroke-width="6"/><line x1="0" y1="0" x2="110" y2="0" stroke="#3a281c" stroke-width="6"/>
    <rect x="-104" y="-74" width="100" height="148" fill="#f26b2a" opacity="0.7"/><rect x="6" y="-74" width="98" height="70" fill="#9aa3b2"/><rect x="6" y="6" width="98" height="68" fill="#9aa3b2"/></g>`;
  s.push(L.popCard(t, 11.0, 1450, 680, plan, { r: 150 }));
  s.push(L.pill(t, 1450, 'ONE ROOM', 11.5, { y: 466, fs: 40, h: 70 }));
  return s.join('');
}

// --- B: hot ---
function partB(t) {
  const s = [`<rect width="${W}" height="${H}" fill="#f2c27a"/><circle cx="1600" cy="200" r="120" fill="#ffd23f"/><circle cx="1600" cy="200" r="170" fill="#ffd23f" opacity="0.3"/>`];
  s.push(`<rect y="812" width="${W}" height="${H}" fill="#c9875a"/>`);
  s.push(thermo(560, 520, keys(t, [[14, 80], [16.5, 97]]), true));
  const bottle = `<rect x="-14" y="-40" width="28" height="70" rx="8" fill="#9fd3ff" stroke="#3a5a7a" stroke-width="3"/><rect x="-8" y="-50" width="16" height="12" fill="#4a8fd8"/>`;
  s.push(L.character({ x: 960, y: 900, s: 0.92, face: 1, expr: 'focused', armR: keys(t, [[14.4, 8], [15.0, 150], [16.4, 150], [16.9, 30]]), blink: L.blinkAt(t) }));
  s.push(L.popCard(t, 15.0, 1300, 420, `<g transform="scale(1.6)">${bottle}</g>`, { r: 86 }));
  const bld = `<g><rect x="-50" y="-70" width="100" height="140" fill="#9aa3b2" stroke="#3a3f4d" stroke-width="5"/>${[0, 1, 2].map(i => `<line x1="-50" y1="${-70 + (i + 1) * 35}" x2="50" y2="${-70 + (i + 1) * 35}" stroke="#3a3f4d" stroke-width="4"/>`).join('')}<rect x="-46" y="36" width="92" height="31" fill="${C.green}"/><path d="M70 -40 L70 40 M56 24 L70 42 L84 24" stroke="#3a281c" stroke-width="7" fill="none" stroke-linecap="round"/></g>`;
  s.push(L.popCard(t, 16.6, 1600, 560, bld, { r: 100 }));
  s.push(L.pill(t, 1600, 'LOWEST FLOOR', 17.0, { y: 680, fs: 38, h: 66 }));
  return s.join('');
}

// --- C: generator indoors → carbon monoxide ---
function partC(t) {
  const s = [apartment(t, 0)];
  const vib = Math.sin(t * 70) * 2;
  s.push(`<g transform="translate(560 790)">${generatorSVG(vib)}</g>`);
  const fill = easeInOut(pulse(t, 20, 30));
  // exhaust puffs
  for (let k = 0; k < 6; k++) {
    const age = ((t * 0.8 + k / 6) % 1);
    s.push(`<circle cx="${676 + age * 120}" cy="${640 - age * 200}" r="${16 + age * 40}" fill="#9aa3b2" opacity="${(0.5 * (1 - age)).toFixed(2)}"/>`);
  }
  const drowsy = t > 27 && t < 33;
  s.push(L.character({ x: 1100, y: 900, s: 0.92, face: -1, expr: t > 26 ? 'worried' : 'neutral', blink: drowsy ? Math.sin(t * 3) > 0 : L.blinkAt(t), lean: drowsy ? Math.sin(t * 2) * 3 : 0 }));
  // invisible gas: faint gray haze that spreads
  haze.forEach(h => { const a = clamp(fill * 1.4 - h.d * 0.15) * 0.11; if (a > 0) s.push(`<circle cx="${h.x}" cy="${h.y}" r="${h.r * (0.6 + 0.4 * fill)}" fill="#c9ced8" opacity="${a.toFixed(3)}"/>`); });
  // red alert pulse
  const fl = t > 21 ? 0.25 + 0.25 * Math.sin(t * 6) : 0;
  if (fl > 0) s.push(`<rect width="${W}" height="${H}" fill="none" stroke="${C.red}" stroke-width="36" opacity="${fl.toFixed(2)}"/>`);
  // the three culprits
  [[21.0, 760, generatorSVG(0), 0.5], [21.5, 960, grillSVG, 1], [22.0, 1160, stoveSVG, 1]].forEach(([at, x, g, sc]) => {
    s.push(L.popCard(t, at, x, 300, `<g transform="scale(${sc})">${g}</g>${t > at + 0.5 ? L.stampX(0.55) : ''}`, { r: 82, out: 26.0 }));
  });
  if (t < 26) s.push(L.pill(t, 960, 'NEVER INDOORS', 22.6, { y: 410, fs: 40, h: 70 }));
  if (t > 26.2) {
    const k = L.spring((t - 26.2) / 0.6);
    s.push(`<g transform="translate(960 330) scale(${k.toFixed(3)})"><text x="0" y="60" text-anchor="middle" ${FONT} font-size="200" fill="#e9ecf2" opacity="0.85">CO</text></g>`);
    s.push(L.pill(t, 960, 'NO COLOR · NO SMELL', 27.0, { y: 430, fs: 40, h: 70 }));
  }
  return s.join('');
}

// --- D: generator outside, 20 ft from the house ---
function partD(t) {
  const s = [`<rect width="${W}" height="${H}" fill="#9fc6e8"/><circle cx="1700" cy="160" r="60" fill="#ffe08a"/>`];
  s.push(`<rect y="790" width="${W}" height="${H}" fill="#7cbf5a"/>`);
  // house
  s.push(`<rect x="120" y="400" width="560" height="400" fill="#e7dccd" stroke="#5a4a3e" stroke-width="8"/><path d="M90 410 L400 200 L710 410 Z" fill="#a24a3a" stroke="#5a4a3e" stroke-width="8"/>`);
  s.push(`<rect x="200" y="480" width="150" height="130" fill="#9fd3ff" stroke="#5a4a3e" stroke-width="6"/><rect x="460" y="560" width="130" height="240" fill="#7a4a2c" stroke="#5a4a3e" stroke-width="6"/>`);
  // generator far from the house
  const gx = keys(t, [[33.2, 900], [35.2, 1520]]);
  s.push(`<g transform="translate(${gx} 770)">${generatorSVG(Math.sin(t * 70) * 2)}</g>`);
  s.push(`<path d="M${gx - 110} 760 C${(gx + 680) / 2} 820 760 820 680 760" stroke="#2a2e3a" stroke-width="7" fill="none"/>`);
  if (t > 35.6) {
    const p = easeOut(pulse(t, 35.6, 36.4));
    const x2 = 700 + (gx - 820) * p;
    s.push(`<g stroke="${C.pillInk}" stroke-width="8" stroke-linecap="round"><line x1="700" y1="640" x2="${x2}" y2="640"/><line x1="700" y1="616" x2="700" y2="664"/>${p > 0.95 ? `<line x1="${x2}" y1="616" x2="${x2}" y2="664"/>` : ''}</g>`);
    s.push(L.pill(t, (700 + gx - 110) / 2, '20+ FEET', 36.4, { y: 520, fs: 48, h: 84 }));
  }
  s.push(L.character({ x: 1745, y: 900, s: 0.92, face: -1, expr: 'happy', armL: t > 37 ? 150 : 8, blink: L.blinkAt(t) }));
  s.push(L.popCard(t, 37.4, 1520, 420, L.stampCheck(0.6), { r: 66 }));
  return s.join('');
}

function frame(t) {
  const s = [];
  if (t < 14) s.push(partA(t)); else if (t < 19) s.push(partB(t)); else if (t < 33) s.push(partC(t)); else s.push(partD(t));
  s.push(dip(t, 14), dip(t, 19), dip(t, 33));
  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', 'DAY 4', 0.3), L.pill(t, 'right', 'INVISIBLE KILLER', 0.45));
  s.push(L.captions(t, [
    [2.4, 2.8, 13.6, 'COLD? — ', 'LAYER UP.'],
    [14.3, 14.7, 18.7, 'HOT? — ', 'DRINK WATER.'],
    [19.5, 19.9, 25.9, 'NO GENERATORS — ', 'INDOORS.'],
    [26.3, 26.7, 32.6, 'CARBON MONOXIDE — ', 'INVISIBLE.'],
    [33.6, 34.0, null, 'GENERATORS — ', 'OUTSIDE ONLY.'],
  ]));
  return s.join('\n');
}

L.render(frame, DUR, 'scene7.mp4');
