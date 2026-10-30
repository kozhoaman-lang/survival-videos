// Scene 9 — Day 7: power returns, reconnect slowly, throw out spoiled food (28 s)
const L = require('./lib');
const { W, H, C, keys, clamp, easeOut, easeIn, easeInOut, pulse, mix, FONT } = L;
const DUR = 28;
const dip = (t, at) => { const d = 1 - clamp(Math.abs(t - at) / 0.3); return d > 0 ? `<rect width="${W}" height="${H}" fill="#000" opacity="${d.toFixed(2)}"/>` : ''; };
const food = {
  milk: `<g><path d="M-26 -20 L-26 46 L26 46 L26 -20 L14 -42 L-14 -42 Z" fill="#f5f7fb" stroke="#555" stroke-width="3"/><rect x="-26" y="0" width="52" height="24" fill="${C.blue}"/><rect x="-10" y="-54" width="20" height="14" fill="#c9d4e6"/></g>`,
  meat: `<g><path d="M-44 -6 C-44 -40 30 -44 42 -14 C52 14 20 40 -10 34 C-34 30 -44 18 -44 -6 Z" fill="#d6504a" stroke="#7a2a26" stroke-width="4"/><path d="M-20 -8 C-6 -20 16 -16 22 -2" stroke="#f3c6b8" stroke-width="7" fill="none" stroke-linecap="round"/></g>`,
  eggs: `<g><ellipse cx="-22" cy="0" rx="20" ry="26" fill="#f6efe4" stroke="#8a7a66" stroke-width="3"/><ellipse cx="22" cy="0" rx="20" ry="26" fill="#f6efe4" stroke="#8a7a66" stroke-width="3"/></g>`,
  leftovers: `<g><rect x="-46" y="-16" width="92" height="50" rx="10" fill="#cfe3f5" stroke="#557" stroke-width="3"/><rect x="-50" y="-30" width="100" height="18" rx="6" fill="${C.green}"/><circle cx="-18" cy="10" r="10" fill="#e9a23b"/><circle cx="8" cy="14" r="9" fill="#d6504a"/></g>`,
};
const tvIcon = `<g><rect x="-50" y="-34" width="100" height="64" rx="6" fill="#1d1f26"/><rect x="-42" y="-26" width="84" height="48" fill="#4a8fd8"/><rect x="-8" y="30" width="16" height="12" fill="#1d1f26"/><rect x="-26" y="40" width="52" height="8" rx="3" fill="#1d1f26"/></g>`;
const laptopIcon = `<g><path d="M-40 -34 L40 -34 L40 20 L-40 20 Z" fill="#c7ccd6" stroke="#555" stroke-width="3"/><rect x="-32" y="-26" width="64" height="38" fill="#4a8fd8"/><rect x="-54" y="20" width="108" height="10" rx="4" fill="#9aa3b2"/></g>`;
const hourglass = `<g><path d="M-30 -44 L30 -44 L4 0 L30 44 L-30 44 L-4 0 Z" fill="#f4e4c4" stroke="#3a281c" stroke-width="6" stroke-linejoin="round"/><path d="M-16 -30 L16 -30 L0 -6 Z" fill="#e9a23b"/><path d="M-20 38 L20 38 L0 18 Z" fill="#e9a23b"/></g>`;

function room(t, power) {
  const s = [`<rect width="${W}" height="${H}" fill="${C.wall}"/><rect y="812" width="${W}" height="${H}" fill="${C.floor}"/><rect y="806" width="${W}" height="10" fill="${C.trim}"/>`];
  s.push(`<rect x="100" y="160" width="380" height="380" rx="8" fill="${C.trim}"/><rect x="116" y="176" width="348" height="348" fill="#121a31"/>`);
  [[116, 380, 70], [190, 330, 60], [255, 400, 55], [312, 350, 70], [385, 420, 79]].forEach(([x, y, w], bi) => {
    s.push(`<rect x="${x}" y="${y}" width="${w}" height="${524 - y}" fill="#1f2846"/>`);
    let k = 0;
    for (let wy = y + 14; wy < 510; wy += 26) for (let wx = x + 10; wx < x + w - 12; wx += 20) {
      const on = power > 0 && t > 2.4 + ((bi * 7 + k++ * 3) % 11) * 0.12;
      s.push(`<rect x="${wx}" y="${wy}" width="9" height="12" fill="${on ? C.winOn : '#18203a'}"/>`);
    }
  });
  s.push(`<rect x="286" y="176" width="8" height="348" fill="${C.trim}"/><rect x="116" y="346" width="348" height="8" fill="${C.trim}"/>`);
  s.push(`<rect x="520" y="700" width="460" height="112" rx="6" fill="${C.woodDark}"/><rect x="520" y="700" width="460" height="16" fill="${C.wood}"/>`);
  s.push(`<rect x="540" y="452" width="300" height="190" rx="8" fill="#0d0f15"/><rect x="552" y="464" width="276" height="166" fill="${t > 6.4 ? '#4a8fd8' : '#161a24'}"/><rect x="676" y="642" width="28" height="44" fill="#0d0f15"/><rect x="630" y="682" width="120" height="14" rx="5" fill="#0d0f15"/>`);
  // lamp (left on in Hour 1)
  s.push(`<ellipse cx="1660" cy="808" rx="70" ry="12" fill="#1c1f29"/><rect x="1654" y="470" width="12" height="338" fill="#1c1f29"/><path d="M1586 520 L1614 420 L1706 420 L1734 520 Z" fill="${power > 0 ? '#fff1c4' : '#e8d8b0'}"/>`);
  return s.join('');
}

function partA(t) {
  // flicker, then steady
  let power = 0;
  if (t > 1.0) power = (t < 2.4 ? (Math.sin(t * 38) > 0.1 ? 1 : 0) : 1);
  const s = [room(t, power)];
  const jump = t > 2.6 && t < 3.6 ? -Math.abs(Math.sin((t - 2.6) * Math.PI * 2)) * 50 : 0;
  s.push(L.character({ x: 1260, y: 900, s: 0.92, face: 1, expr: t > 2.4 ? 'happy' : 'neutral', armL: t > 2.6 ? 150 : 8, armR: t > 2.6 ? 150 : 8, bob: jump, blink: L.blinkAt(t) }));
  const dark = t < 1 ? 0.6 : power ? lerpDark(t) : 0.6;
  s.push(L.darkness(dark, [{ type: 'circle', x: 1660, y: 470, r: 800 * (power ? 1 : 0.01), a: 0.9, core: 0.2 }]));
  if (power) s.push(L.glow(1660, 470, 260, '#fff1c4', 0.5));
  // reconnect one device at a time
  s.push(L.popCard(t, 5.6, 620, 330, tvIcon, { r: 80 }));
  s.push(L.popCard(t, 6.6, 850, 330, hourglass, { r: 64 }));
  s.push(L.popCard(t, 7.8, 1080, 330, laptopIcon, { r: 80 }));
  s.push(L.pill(t, 850, 'WAIT A FEW MINUTES', 6.9, { y: 430, fs: 36, h: 62 }));
  return s.join('');
  function lerpDark(t) { return 0.6 - 0.48 * easeOut(pulse(t, 2.4, 3.6)); }
}

function partB(t) {
  const s = [`<rect width="${W}" height="${H}" fill="${C.wall}"/>`];
  s.push(`<rect y="812" width="${W}" height="${H - 812}" fill="#3a3346"/><rect y="806" width="${W}" height="10" fill="${C.trim}"/>`);
  const fx = 420, fw = 420;
  s.push(`<rect x="${fx - 10}" y="170" width="${fw + 20}" height="644" rx="22" fill="#b9c1cf"/>`);
  s.push(`<rect x="${fx}" y="180" width="${fw}" height="236" rx="16" fill="#e2e7ef"/>`);
  // open fridge: lit interior now that power is back
  s.push(`<rect x="${fx + 8}" y="434" width="${fw - 16}" height="366" fill="#f6f8fc"/>`);
  [520, 610, 700].forEach(y => s.push(`<rect x="${fx + 8}" y="${y}" width="${fw - 16}" height="8" fill="#c9d1de"/>`));
  s.push(`<rect x="${fx}" y="428" width="${fw * 0.18}" height="380" rx="12" fill="#c3cad6"/>`);
  // timer from Scene 3 ran out
  const blink = Math.sin(t * 6) > -0.3;
  s.push(`<g transform="translate(${fx + fw / 2} 298)"><rect x="-150" y="-50" width="300" height="100" rx="14" fill="#14171f" stroke="${C.pillInk}" stroke-width="5"/><text x="0" y="24" text-anchor="middle" font-family="DejaVu Sans Mono" font-weight="bold" font-size="62" fill="${blink ? C.red : '#5a1f1b'}">0:00:00</text></g>`);
  // food: sits in the fridge, then flies into the trash
  const trashX = 1420;
  const items = [['milk', 500, 480, 20.6], ['meat', 640, 570, 21.2], ['eggs', 520, 660, 21.8], ['leftovers', 680, 750, 22.4]];
  items.forEach(([k, x0, y0, at]) => {
    const p = easeInOut(pulse(t, at, at + 0.8));
    if (p >= 1) return;
    const x = x0 + (trashX - x0) * p, y = y0 - Math.sin(p * Math.PI) * 260 + (640 - y0) * p;
    s.push(`<g transform="translate(${x} ${y}) rotate(${p * 200}) scale(${0.9 - p * 0.3})">${food[k]}</g>`);
  });
  // trash can
  const lid = t > 20.3 ? -24 : 0;
  s.push(`<path d="M${trashX - 90} 640 L${trashX + 90} 640 L${trashX + 70} 812 L${trashX - 70} 812 Z" fill="#6c7484" stroke="#3a3f4d" stroke-width="6"/><rect x="${trashX - 100}" y="${616 + lid}" width="200" height="26" rx="8" fill="#55607d" transform="rotate(${lid} ${trashX + 100} 640)"/>`);
  [-40, 0, 40].forEach(d => s.push(`<line x1="${trashX + d}" y1="664" x2="${trashX + d * 0.8}" y2="790" stroke="#3a3f4d" stroke-width="6"/>`));
  s.push(L.character({ x: 1060, y: 900, s: 0.92, face: -1, expr: t < 20 ? 'worried' : 'focused', armR: t > 20.4 && t < 23.4 ? 60 : 8, blink: L.blinkAt(t) }));
  s.push(L.pill(t, fx + fw / 2, 'TIME RAN OUT', 15.4, { y: 82, fs: 40, h: 70 }));
  return s.join('');
}

function frame(t) {
  const s = [t < 11 ? partA(t) : partB(t), dip(t, 11)];
  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', 'DAY 7', 0.3), L.pill(t, 'right', 'POWER BACK', 2.6));
  s.push(L.captions(t, [
    [4.0, 4.4, 10.6, 'ONE DEVICE — ', 'AT A TIME.'],
    [11.6, 12.0, 19.8, 'THE 4-HOUR CLOCK — ', 'RAN OUT.'],
    [20.2, 20.6, null, 'WHEN IN DOUBT — ', 'THROW IT OUT.'],
  ]));
  return s.join('\n');
}

L.render(frame, DUR, 'scene9.mp4');
