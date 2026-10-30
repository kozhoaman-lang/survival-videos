// Scene 3 — Hour 6: the fridge is a ticking clock (35 s)
const L = require('./lib');
const { W, H, C, keys, clamp, easeOut, easeInOut, pulse, mix, FONT } = L;
const DUR = 35;
const rnd = L.rng(7);
const mist = Array.from({ length: 26 }, () => ({ y: 470 + rnd() * 300, d: rnd() * 1.6, r: 18 + rnd() * 26, sp: 120 + rnd() * 160 }));

const food = {
  milk: `<g><path d="M-26 -20 L-26 46 L26 46 L26 -20 L14 -42 L-14 -42 Z" fill="#f5f7fb" stroke="#555" stroke-width="3"/><rect x="-26" y="0" width="52" height="24" fill="${C.blue}"/><rect x="-10" y="-54" width="20" height="14" fill="#c9d4e6"/></g>`,
  meat: `<g><path d="M-44 -6 C-44 -40 30 -44 42 -14 C52 14 20 40 -10 34 C-34 30 -44 18 -44 -6 Z" fill="#d6504a" stroke="#7a2a26" stroke-width="4"/><path d="M-20 -8 C-6 -20 16 -16 22 -2" stroke="#f3c6b8" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="22" cy="10" r="9" fill="#f6e6dc"/></g>`,
  leftovers: `<g><rect x="-46" y="-16" width="92" height="50" rx="10" fill="#cfe3f5" stroke="#557" stroke-width="3"/><rect x="-50" y="-30" width="100" height="18" rx="6" fill="${C.green}"/><circle cx="-18" cy="10" r="10" fill="#e9a23b"/><circle cx="8" cy="14" r="9" fill="#d6504a"/><circle cx="24" cy="4" r="8" fill="#7cbf5a"/></g>`,
  can: `<g><rect x="-30" y="-40" width="60" height="80" rx="8" fill="#b8c0cc" stroke="#555" stroke-width="3"/><rect x="-30" y="-18" width="60" height="38" fill="${C.orange}"/><ellipse cx="0" cy="-40" rx="30" ry="7" fill="#d9dee6" stroke="#555" stroke-width="3"/></g>`,
};

function fmt(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = sec % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function kitchen(t) {
  const s = [];
  s.push(`<rect width="${W}" height="${H}" fill="${C.wall}"/>`);
  // tiles behind counter
  for (let y = 380; y < 600; y += 44) for (let x = 1060; x < W; x += 64) s.push(`<rect x="${x + 2}" y="${y + 2}" width="60" height="40" fill="#323b60"/>`);
  s.push(`<rect y="812" width="${W}" height="${H - 812}" fill="#3a3346"/><rect y="806" width="${W}" height="10" fill="${C.trim}"/>`);
  for (let x = 0; x < W; x += 120) s.push(`<rect x="${x}" y="816" width="3" height="${H}" fill="#302a3b"/>`);
  // upper cabinets
  s.push(`<rect x="1060" y="150" width="860" height="200" fill="#55607d"/>`);
  for (let x = 1076; x < W; x += 212) s.push(`<rect x="${x}" y="166" width="196" height="168" rx="6" fill="#65708f"/><rect x="${x + 160}" y="240" width="10" height="40" rx="5" fill="#c9cfdb"/>`);
  // counter
  s.push(`<rect x="1060" y="620" width="860" height="192" fill="#5d6680"/><rect x="1048" y="602" width="884" height="24" rx="4" fill="#c9cfdb"/>`);
  for (let x = 1076; x < W; x += 212) s.push(`<rect x="${x}" y="640" width="196" height="156" rx="6" fill="#6f7894"/><rect x="${x + 160}" y="700" width="10" height="40" rx="5" fill="#c9cfdb"/>`);
  // battery lantern on the counter
  s.push(`<rect x="1676" y="536" width="58" height="70" rx="10" fill="#3b3f4a"/><rect x="1684" y="548" width="42" height="44" rx="6" fill="${C.lamp}"/><path d="M1684 536 Q1705 512 1726 536" stroke="#3b3f4a" stroke-width="6" fill="none"/>`);
  return s.join('');
}

function fridge(t) {
  const s = [];
  const fx = 520, fw = 420;
  // body + interior (visible when door opens)
  s.push(`<rect x="${fx - 10}" y="170" width="${fw + 20}" height="644" rx="22" fill="#b9c1cf"/>`);
  const ang = keys(t, [[17.3, 0], [18.1, 1], [19.6, 1], [20.3, 0]]);
  // lower (fridge) compartment interior
  s.push(`<rect x="${fx + 8}" y="434" width="${fw - 16}" height="366" fill="#8f9bb0"/>`);
  [520, 610, 700].forEach(y => s.push(`<rect x="${fx + 8}" y="${y}" width="${fw - 16}" height="8" fill="#c9d1de"/>`));
  s.push(`<g transform="translate(${fx + 40} 500)">${food.milk}</g><g transform="translate(${fx + 140} 580) scale(0.8)">${food.meat}</g><g transform="translate(${fx + 260} 666) scale(0.8)">${food.leftovers}</g>`);
  // freezer door
  s.push(`<rect x="${fx}" y="180" width="${fw}" height="236" rx="16" fill="#e2e7ef"/><rect x="${fx + 24}" y="210" width="14" height="170" rx="7" fill="#9aa3b2"/>`);
  // fridge door (swings toward camera: narrower as it opens)
  const dw = fw * (1 - 0.82 * ang);
  s.push(`<rect x="${fx}" y="428" width="${dw}" height="380" rx="16" fill="${mix('#e2e7ef', '#c3cad6', ang)}"/>`);
  if (ang < 0.3) s.push(`<rect x="${fx + 24}" y="450" width="14" height="190" rx="7" fill="#9aa3b2"/>`);
  // fridge timer display
  if (ang < 0.15 && t > 2.6) {
    const rem = 4 * 3600 - Math.max(0, t - 3) * 300;
    const col = rem > 3 * 3600 ? C.green : rem > 2 * 3600 ? '#f2b134' : C.red;
    const pop = L.spring((t - 2.6) / 0.6);
    s.push(`<g transform="translate(${fx + fw / 2 + 20} 560) scale(${pop.toFixed(3)})"><rect x="-150" y="-50" width="300" height="100" rx="14" fill="#14171f" stroke="${C.pillInk}" stroke-width="5"/>
      <text x="0" y="24" text-anchor="middle" font-family="DejaVu Sans Mono" font-weight="bold" font-size="62" fill="${col}">${fmt(rem)}</text></g>`);
  }
  // freezer display: 48 HRS (full) → 24 HRS (half)
  if (t > 8.0) {
    const half = t > 11.4;
    const pop = L.spring((t - 8.0) / 0.6);
    s.push(`<g transform="translate(${fx + fw / 2 + 30} 298) scale(${pop.toFixed(3)})"><rect x="-150" y="-52" width="300" height="104" rx="14" fill="#14171f" stroke="${C.pillInk}" stroke-width="5"/>
      <text x="-40" y="22" text-anchor="middle" ${FONT} font-size="56" fill="#9fd3ff">${half ? '24' : '48'} HRS</text>
      <rect x="84" y="-34" width="40" height="68" rx="6" fill="none" stroke="#9fd3ff" stroke-width="4"/>
      <rect x="90" y="${half ? 0 : -28}" width="28" height="${half ? 28 : 56}" fill="#9fd3ff"/></g>`);
  }
  // cold air escaping
  if (ang > 0.05) {
    mist.forEach(m => {
      const age = t - 17.4 - m.d * 0.6;
      if (age < 0 || age > 2.6) return;
      const x = fx + dw + 30 + age * m.sp, a = 0.55 * (1 - age / 2.6);
      s.push(`<circle cx="${x.toFixed(1)}" cy="${(m.y + age * 20).toFixed(1)}" r="${(m.r + age * 12).toFixed(1)}" fill="#cfeaff" opacity="${a.toFixed(2)}"/>`);
    });
  }
  return s.join('');
}

function hero(t) {
  const x = keys(t, [[0, 1460], [13.8, 1460], [16.4, 1130], [20.6, 1130], [21.6, 1260]]);
  const walking = (t > 13.8 && t < 16.4) || (t > 20.6 && t < 21.6);
  let expr = t < 3 ? 'neutral' : 'focused';
  if (t > 8 && t < 13) expr = 'worried';
  if (t > 18.2 && t < 20.6) expr = 'scared';
  if (t > 23) expr = 'happy';
  const armR = keys(t, [[16.4, 8], [17.0, 72], [19.8, 72], [20.4, 8]]);
  return { x, y: 900, s: 0.92, face: t > 13.6 && t < 20.6 ? -1 : (t >= 20.6 && t < 21.7 ? 1 : -1), expr, armR, armL: 8, walk: walking ? t * 9 : 0, bob: walking ? -Math.abs(Math.sin(t * 9)) * 8 : 0, blink: L.blinkAt(t) };
}

function frame(t) {
  const s = [kitchen(t), fridge(t)];
  const h = hero(t);
  s.push(L.character(h));
  s.push(L.darkness(0.5, [
    { type: 'circle', x: 1705, y: 570, r: 900, a: 0.95, core: 0.15 },
    { type: 'circle', x: 730, y: 500, r: 520, a: 0.6, core: 0.2 },
  ]));
  s.push(L.glow(1705, 570, 220, '#ffe7a3', 0.35));

  if (t > 8.3) s.push(L.pill(t, 750, t > 11.4 ? 'HALF FULL' : 'FULL FREEZER', 8.3, { y: 82, fs: 38, h: 66 }));
  s.push(L.popCard(t, 18.4, 730, 620, L.stampX(0.75), { r: 80, out: 21.0 }));
  // eat first / later
  s.push(L.popCard(t, 23.4, 1160, 240, food.milk, { r: 78 }));
  s.push(L.popCard(t, 24.0, 1360, 240, food.meat, { r: 78 }));
  s.push(L.popCard(t, 24.6, 1560, 240, food.leftovers, { r: 78 }));
  s.push(L.pill(t, 1360, 'EAT FIRST', 25.2, { y: 336, fs: 40, h: 70, fill: '#dff3e4' }));
  s.push(L.popCard(t, 27.4, 1780, 240, food.can, { r: 78, fill: '#e6e6e6' }));
  s.push(L.pill(t, 1780, 'LATER', 28.0, { y: 336, fs: 40, h: 70 }));

  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', 'HOUR 6', 0.3), L.pill(t, 'right', 'FOOD CLOCK', 0.45));
  s.push(L.captions(t, [
    [1.8, 2.25, 13.6, 'THE FOOD CLOCK — ', 'IS TICKING.'],
    [14.3, 14.75, 21.8, 'KEEP THE FRIDGE — ', 'CLOSED.'],
    [22.6, 23.05, null, 'PERISHABLES — ', 'FIRST.'],
  ]));
  return s.join('\n');
}

L.render(frame, DUR, 'scene3.mp4');
