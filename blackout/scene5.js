// Scene 5 — Day 2: water (35 s). Daytime, so no darkness overlay.
const L = require('./lib');
const { W, H, C, keys, clamp, easeOut, easeInOut, pulse, mix, FONT } = L;
const DUR = 35;
const WATER = '#4aa3e0';
const dip = (t, at) => { const d = 1 - clamp(Math.abs(t - at) / 0.3); return d > 0 ? `<rect width="${W}" height="${H}" fill="#000" opacity="${d.toFixed(2)}"/>` : ''; };

const jug = `<g><path d="M-30 -30 L-30 44 Q-30 52 -22 52 L22 52 Q30 52 30 44 L30 -30 Q30 -40 18 -44 L10 -50 L-10 -50 L-18 -44 Q-30 -40 -30 -30 Z" fill="#dcefff" stroke="#3a5a7a" stroke-width="4"/>
  <rect x="-10" y="-62" width="20" height="14" rx="3" fill="#3a8fd8"/><rect x="-30" y="0" width="60" height="52" fill="${WATER}" opacity="0.7"/><path d="M14 -30 Q40 -24 30 4" stroke="#3a5a7a" stroke-width="5" fill="none"/></g>`;
const person = `<g fill="#3a281c"><circle cx="0" cy="-30" r="20"/><path d="M-30 46 Q-30 -2 0 -2 Q30 -2 30 46 Z"/></g>`;

// --- A: building cross-section, pump stops, water drains ---
function partA(t) {
  const s = [`<rect width="${W}" height="${H}" fill="#9fc6e8"/>`];
  s.push(`<circle cx="1620" cy="190" r="70" fill="#ffe08a"/>`);
  s.push(`<rect y="812" width="${W}" height="${H}" fill="#6c6f7a"/><rect y="806" width="${W}" height="10" fill="#4e515a"/>`);
  // neighbour buildings
  s.push(`<rect x="120" y="360" width="300" height="452" fill="#b9a7a0"/><rect x="1440" y="420" width="360" height="392" fill="#a9b0bf"/>`);
  // the building, cut open
  s.push(`<rect x="600" y="110" width="720" height="702" fill="#e7dccd" stroke="#5a4a3e" stroke-width="8"/>`);
  const floors = 6, fh = 100;
  for (let i = 0; i < floors; i++) {
    const y = 130 + i * fh;
    s.push(`<rect x="616" y="${y}" width="560" height="${fh - 12}" fill="#f6efe4"/><rect x="600" y="${y + fh - 12}" width="720" height="12" fill="#5a4a3e"/>`);
    s.push(`<rect x="1080" y="${y + 30}" width="60" height="10" rx="4" fill="#8b95a5"/><rect x="1080" y="${y + 30}" width="10" height="26" rx="3" fill="#8b95a5"/>`);
  }
  // basement pump
  s.push(`<rect x="1150" y="720" width="150" height="86" rx="10" fill="#6f7894" stroke="#3a3f4d" stroke-width="5"/>`);
  const spin = t < 7.0 ? t * 720 : 7.0 * 720;
  s.push(`<g transform="translate(1225 763) rotate(${spin % 360})"><circle r="30" fill="#c9cfdb"/>${[0, 120, 240].map(a => `<rect x="-6" y="-28" width="12" height="28" rx="4" fill="#3a3f4d" transform="rotate(${a})"/>`).join('')}</g>`);
  // water pipe and level
  const top = keys(t, [[0, 140], [7.4, 140], [10, 806]]);
  s.push(`<rect x="1196" y="130" width="34" height="590" fill="#d9dee6" stroke="#3a3f4d" stroke-width="4"/>`);
  s.push(`<rect x="1200" y="${top}" width="26" height="${Math.max(0, 716 - top)}" fill="${WATER}"/>`);
  for (let i = 0; i < floors; i++) {
    const y = 130 + i * fh;
    s.push(`<rect x="1140" y="${y + 30}" width="56" height="10" fill="#8b95a5"/>`);
    if (top < y + 30) { // faucet still runs
      for (let d = 0; d < 3; d++) { const dy = ((t * 2 + d / 3) % 1) * 30; s.push(`<circle cx="1085" cy="${y + 60 + dy}" r="5" fill="${WATER}"/>`); }
    }
  }
  // tiny hero on the top floor
  s.push(L.character({ x: 900, y: 218, s: 0.18, face: 1, expr: t > 8.5 ? 'scared' : 'neutral', armR: 30 }));
  if (t > 7.0) s.push(L.popCard(t, 7.0, 1225, 640, L.stampX(0.5), { r: 52, out: 9.8 }));
  s.push(L.popCard(t, 2.6, 1440, 300, L.icon.bolt, { r: 70, out: 6.8 }));
  s.push(L.pill(t, 1225, 'PUMP', 3.0, { y: 846, fs: 36, h: 62 }));
  return s.join('');
}

// --- bathroom used in B and D ---
function bathroom(t, fill, toiletFocus) {
  const s = [`<rect width="${W}" height="${H}" fill="#b8c7d6"/>`];
  for (let y = 0; y < 812; y += 64) for (let x = 0; x < W; x += 64) s.push(`<rect x="${x + 2}" y="${y + 2}" width="60" height="60" fill="#c8d5e2"/>`);
  s.push(`<rect y="812" width="${W}" height="${H}" fill="#7d8796"/><rect y="806" width="${W}" height="10" fill="#5b6472"/>`);
  s.push(`<rect x="200" y="140" width="260" height="200" rx="8" fill="#5b6472"/><rect x="214" y="154" width="232" height="172" fill="#9fd0f5"/>`);
  // tub
  const lvl = lerpY(fill);
  s.push(`<rect x="1080" y="600" width="660" height="212" rx="40" fill="#ffffff" stroke="#8b95a5" stroke-width="6"/>`);
  s.push(`<clipPath id="tub"><rect x="1100" y="610" width="620" height="186" rx="32"/></clipPath><rect x="1100" y="${lvl}" width="620" height="${800 - lvl}" fill="${WATER}" opacity="0.85" clip-path="url(#tub)"/>`);
  s.push(`<rect x="1110" y="520" width="16" height="80" fill="#8b95a5"/><rect x="1110" y="520" width="80" height="18" rx="6" fill="#8b95a5"/>`);
  // toilet
  s.push(`<rect x="720" y="560" width="150" height="110" rx="12" fill="#ffffff" stroke="#8b95a5" stroke-width="5"/><path d="M700 680 L900 680 Q890 780 820 790 L780 812 L740 812 L760 790 Q700 760 700 680 Z" fill="#ffffff" stroke="#8b95a5" stroke-width="5"/>`);
  return s.join('');
  function lerpY(f) { return 790 - f * 160; }
}

// --- B: fill the tub and pots ---
function partB(t) {
  const fill = easeInOut(pulse(t, 10.3, 16.8));
  const s = [bathroom(t, fill)];
  if (t < 17) s.push(`<rect x="1172" y="538" width="14" height="${Math.max(0, 790 - fill * 160 - 538)}" fill="${WATER}" opacity="0.9"/>`);
  // pots on the floor filling too
  [[420, 0.2], [560, 0.5]].forEach(([x, d]) => {
    const f = easeInOut(pulse(t, 11 + d * 4, 16));
    s.push(`<rect x="${x - 56}" y="726" width="112" height="86" rx="12" fill="#6c7484"/><rect x="${x - 50}" y="${806 - f * 70}" width="100" height="${f * 70}" fill="${WATER}"/><rect x="${x - 70}" y="736" width="16" height="10" rx="4" fill="#3a3f4d"/><rect x="${x + 54}" y="736" width="16" height="10" rx="4" fill="#3a3f4d"/>`);
  });
  s.push(L.character({ x: 300, y: 900, s: 0.92, face: 1, expr: 'focused', armR: 40, blink: L.blinkAt(t) }));
  s.push(L.popCard(t, 12.0, 1410, 420, L.stampCheck(0.6), { r: 66, out: 16.6 }));
  return s.join('');
}

// --- C: one gallon per person per day ---
function partC(t) {
  const s = [`<rect width="${W}" height="${H}" fill="#2f4a7a"/>`];
  for (let i = 0; i < 26; i++) s.push(`<circle cx="${(i * 197) % W}" cy="${(i * 131) % 760}" r="${30 + (i % 4) * 14}" fill="#355486"/>`);
  s.push(L.popCard(t, 17.3, 600, 330, person, { r: 100 }));
  s.push(L.popCard(t, 17.7, 1320, 330, `<g transform="scale(1.3)">${jug}</g>`, { r: 100 }));
  if (t > 17.9) s.push(`<text x="960" y="370" text-anchor="middle" ${FONT} font-size="120" fill="#fff" opacity="${easeOut(pulse(t, 17.9, 18.2)).toFixed(2)}">=</text>`);
  s.push(L.pill(t, 960, 'PER PERSON · PER DAY', 18.6, { y: 470, fs: 44, h: 78 }));
  // seven days of jugs
  for (let d = 0; d < 7; d++) {
    const at = 20.0 + d * 0.22;
    if (t < at) continue;
    const k = L.spring((t - at) / 0.5);
    s.push(`<g transform="translate(${420 + d * 180} 680) scale(${(0.9 * k).toFixed(3)})">${jug}</g>`);
  }
  s.push(L.pill(t, 960, '7 DAYS = 7 GALLONS EACH', 21.8, { y: 770, fs: 38, h: 66 }));
  return s.join('');
}

// --- D: tub water is for flushing, not drinking ---
function partD(t) {
  const s = [bathroom(t, 1)];
  // bucket moves from tub to toilet
  const bx = keys(t, [[25.0, 1180], [27.0, 940]]);
  s.push(L.character({ x: keys(t, [[24, 1000], [25, 1000], [27, 1060]]), y: 900, s: 0.92, face: -1, expr: 'focused', armR: 30, blink: L.blinkAt(t) }));
  s.push(`<g transform="translate(${bx} 720)"><path d="M-40 -40 L40 -40 L30 40 L-30 40 Z" fill="#e0a43b" stroke="#7a5420" stroke-width="5"/><rect x="-38" y="-36" width="76" height="16" fill="${WATER}"/><path d="M-40 -40 Q0 -90 40 -40" stroke="#555" stroke-width="5" fill="none"/></g>`);
  s.push(L.popCard(t, 27.4, 800, 420, L.stampCheck(0.6), { r: 66 }));
  s.push(L.pill(t, 800, 'FLUSH', 27.8, { y: 510, fs: 40, h: 70, fill: '#dff3e4' }));
  // a glass of tub water — crossed out
  s.push(L.popCard(t, 29.4, 1420, 420, `<g><path d="M-26 -40 L26 -40 L20 40 L-20 40 Z" fill="#dcefff" stroke="#3a5a7a" stroke-width="4"/><rect x="-22" y="-10" width="44" height="48" fill="${WATER}" opacity="0.7"/></g>`, { r: 66 }));
  if (t > 30.0) s.push(`<g transform="translate(1420 420)">${L.stampX(0.6)}</g>`);
  s.push(L.pill(t, 1420, "DON'T DRINK", 30.2, { y: 510, fs: 40, h: 70 }));
  return s.join('');
}

function frame(t) {
  const s = [];
  if (t < 10) s.push(partA(t)); else if (t < 17) s.push(partB(t)); else if (t < 24) s.push(partC(t)); else s.push(partD(t));
  s.push(dip(t, 10), dip(t, 17), dip(t, 24));
  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', 'DAY 2', 0.3), L.pill(t, 'right', 'WATER', 0.45));
  s.push(L.captions(t, [
    [2.0, 2.4, 9.6, 'NO POWER — ', 'NO PUMPS.'],
    [10.6, 11.0, 16.6, 'FILL THE TUB — ', 'NOW.'],
    [17.6, 18.0, 23.6, 'ONE GALLON — ', 'PER DAY.'],
    [24.6, 25.0, null, 'TUB WATER — ', 'FLUSH ONLY.'],
  ]));
  return s.join('\n');
}

L.render(frame, DUR, 'scene5.mp4');
