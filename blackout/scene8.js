// Scene 8 — Day 5: no power, no gas (25 s)
const L = require('./lib');
const { W, H, C, keys, clamp, easeOut, easeInOut, pulse, mix, FONT } = L;
const DUR = 25;
const dip = (t, at) => { const d = 1 - clamp(Math.abs(t - at) / 0.3); return d > 0 ? `<rect width="${W}" height="${H}" fill="#000" opacity="${d.toFixed(2)}"/>` : ''; };
const G = 650; // ground line

function pump(x, t) {
  return `<g transform="translate(${x} ${G})"><rect x="-90" y="-20" width="180" height="20" fill="#9aa3b2"/>
    <rect x="-60" y="-250" width="120" height="232" rx="10" fill="#e7e2d8" stroke="#3a3f4d" stroke-width="5"/>
    <rect x="-44" y="-226" width="88" height="54" rx="6" fill="#14171f"/><text x="0" y="-188" text-anchor="middle" font-family="DejaVu Sans Mono" font-weight="bold" font-size="26" fill="#2a2e38">0.00</text>
    <rect x="-60" y="-140" width="120" height="30" fill="${C.red}"/><path d="M60 -120 C110 -120 110 -40 80 -30" stroke="#1d1f26" stroke-width="8" fill="none"/><rect x="70" y="-46" width="26" height="40" rx="5" fill="#1d1f26"/></g>`;
}

function partA(t) {
  const s = [`<rect width="${W}" height="${H}" fill="#b9c8d8"/>`];
  s.push(`<rect y="${G}" width="${W}" height="${H - G}" fill="#7b5a43"/><rect y="${G}" width="${W}" height="14" fill="#55585f"/>`);
  // store + ATM
  s.push(`<rect x="1450" y="300" width="470" height="350" fill="#d9cbb5" stroke="#5a4a3e" stroke-width="6"/><rect x="1450" y="270" width="470" height="44" fill="${C.red}"/><rect x="1500" y="380" width="200" height="140" fill="#2a3044"/><rect x="1760" y="400" width="110" height="250" fill="#2a3044"/>`);
  s.push(`<rect x="1520" y="530" width="90" height="120" rx="8" fill="#6c7484" stroke="#3a3f4d" stroke-width="4"/><rect x="1534" y="546" width="62" height="40" fill="#14171f"/>`);
  // canopy
  s.push(`<rect x="200" y="170" width="1160" height="70" fill="#f4f1ea" stroke="#3a3f4d" stroke-width="6"/><rect x="200" y="214" width="1160" height="22" fill="${C.red}"/>`);
  s.push(`<rect x="330" y="240" width="28" height="410" fill="#c9cfdb"/><rect x="1200" y="240" width="28" height="410" fill="#c9cfdb"/>`);
  s.push(pump(560, t), pump(980, t));
  // underground tank, full of fuel
  s.push(`<rect x="420" y="690" width="700" height="130" rx="65" fill="#5a6070" stroke="#2a2e38" stroke-width="6"/><clipPath id="tank"><rect x="430" y="700" width="680" height="110" rx="55"/></clipPath><rect x="430" y="${keys(t, [[9.4, 820], [10.6, 712]])}" width="680" height="110" fill="#e9a23b" clip-path="url(#tank)"/>`);
  s.push(`<line x1="560" y1="${G}" x2="560" y2="694" stroke="#2a2e38" stroke-width="8"/><line x1="980" y1="${G}" x2="980" y2="694" stroke="#2a2e38" stroke-width="8"/>`);
  // hero tries the nozzle
  s.push(L.character({ x: 760, y: G + 40, s: 0.62, face: 1, expr: t > 3 ? 'worried' : 'neutral', armR: keys(t, [[1.5, 8], [2.2, 60]]), blink: L.blinkAt(t) }));
  // callouts
  s.push(L.popCard(t, 2.8, 770, 300, `${L.icon.plug}${t > 3.3 ? L.stampX(0.5) : ''}`, { r: 72, out: 8.8 }));
  s.push(L.popCard(t, 6.2, 1565, 420, `<g><rect x="-44" y="-28" width="88" height="56" rx="8" fill="#4a8fd8"/><rect x="-44" y="-14" width="88" height="12" fill="#1d1f26"/><rect x="-32" y="10" width="30" height="8" rx="2" fill="#f2b134"/></g>${t > 6.7 ? L.stampX(0.5) : ''}`, { r: 66, out: 14.6 }));
  s.push(L.pill(t, 1565, 'ATM + CARDS', 6.8, { y: 500, fs: 34, h: 60 }));
  s.push(L.pill(t, 770, 'TANK: FULL', 10.4, { y: 726, fs: 36, h: 60, fill: '#ffe9b0' }));
  s.push(L.pill(t, 770, 'PUMPS: OFF', 11.4, { y: 262, fs: 44, h: 76 }));
  return s.join('');
}

function partB(t) {
  const s = [`<rect width="${W}" height="${H}" fill="#2f4a7a"/>`];
  for (let i = 0; i < 22; i++) s.push(`<circle cx="${(i * 211) % W}" cy="${(i * 137) % 760}" r="${30 + (i % 4) * 14}" fill="#355486"/>`);
  // fuel gauge
  const ang = keys(t, [[15.6, -70], [17.0, 70]]);
  const gauge = `<g><path d="M-80 30 A90 90 0 0 1 80 30" stroke="#3a281c" stroke-width="10" fill="none"/><text x="-78" y="70" text-anchor="middle" ${FONT} font-size="34" fill="${C.red}">E</text><text x="78" y="70" text-anchor="middle" ${FONT} font-size="34" fill="${C.green}">F</text>
    <line x1="0" y1="40" x2="${Math.sin(ang * Math.PI / 180) * 80}" y2="${40 - Math.cos(ang * Math.PI / 180) * 80}" stroke="${C.orange}" stroke-width="10" stroke-linecap="round"/><circle cx="0" cy="40" r="12" fill="#3a281c"/></g>`;
  s.push(L.popCard(t, 15.3, 620, 380, gauge, { r: 130 }));
  s.push(L.pill(t, 620, 'FULL TANK', 16.2, { y: 540, fs: 44, h: 76 }));
  const cash = `<g>${[0, 1, 2].map(i => `<g transform="translate(${-10 + i * 10} ${-10 + i * 10}) rotate(${-8 + i * 6})"><rect x="-70" y="-38" width="140" height="76" rx="8" fill="#8ac17a" stroke="#3d6b34" stroke-width="5"/><circle r="22" fill="#cde8c4" stroke="#3d6b34" stroke-width="4"/><text x="0" y="12" text-anchor="middle" ${FONT} font-size="32" fill="#3d6b34">$</text></g>`).join('')}</g>`;
  s.push(L.popCard(t, 18.0, 1300, 380, cash, { r: 130 }));
  s.push(L.pill(t, 1300, 'CASH AT HOME', 18.8, { y: 540, fs: 44, h: 76 }));
  if (t > 17.6) s.push(`<text x="960" y="410" text-anchor="middle" ${FONT} font-size="120" fill="#fff" opacity="${easeOut(pulse(t, 17.6, 17.9)).toFixed(2)}">+</text>`);
  return s.join('');
}

function frame(t) {
  const s = [t < 15 ? partA(t) : partB(t), dip(t, 15)];
  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', 'DAY 5', 0.3), L.pill(t, 'right', 'NO PUMPS', 0.45));
  s.push(L.captions(t, [
    [2.4, 2.8, 14.6, 'NO POWER — ', 'NO GAS.'],
    [15.6, 16.0, null, 'BEFORE IT HAPPENS — ', 'PREP.'],
  ]));
  return s.join('\n');
}

L.render(frame, DUR, 'scene8.mp4');
