const sharp = require('/opt/npm-tools/node_modules/sharp');
const L = require('../lib');
const { W, H, mix, rng } = L;
const FN = `font-family="Inter, DejaVu Sans" font-weight="900"`;
function txt(x, y, s, fs, fill, o = {}) {
  const anchor = o.anchor || 'start', sw = o.sw || fs * 0.13;
  return `<text x="${x + fs * 0.04}" y="${y + fs * 0.07}" text-anchor="${anchor}" ${FN} font-size="${fs}" fill="#000" stroke="#000" stroke-width="${sw}" stroke-linejoin="round" opacity="0.55">${s}</text>
  <text x="${x}" y="${y}" text-anchor="${anchor}" ${FN} font-size="${fs}" fill="${fill}" stroke="#12091a" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke">${s}</text>`;
}
const vignette = a => `<defs><radialGradient id="vg" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${a}"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#vg)"/>`;

// ---- face overlay (thumbnail-only, drawn over the hero's head) ----
function face(kind, x, y, sc, flip = 1, id = kind) {
  const D = '#2a160e', eye = (cx, r, pr) => `<circle cx="${cx}" cy="-380" r="${r}" fill="#fff" stroke="${D}" stroke-width="5"/><circle cx="${cx}" cy="-378" r="${pr}" fill="${D}"/>`;
  const brow = (a, b) => `<path d="${a}" stroke="#5a3820" stroke-width="9" stroke-linecap="round" fill="none"/><path d="${b}" stroke="#5a3820" stroke-width="9" stroke-linecap="round" fill="none"/>`;
  let f = '';
  if (kind === 'A') f = eye(-26, 23, 6) + eye(26, 23, 6) + brow('M-50 -412 L-12 -420', 'M12 -420 L50 -412') + `<ellipse cx="0" cy="-338" rx="17" ry="24" fill="${D}"/><ellipse cx="0" cy="-330" rx="10" ry="10" fill="#c9524a"/><path d="M64 -440 Q82 -410 64 -396 Q46 -410 64 -440 Z" fill="#6fc4ff" stroke="#2a6fa8" stroke-width="3"/>`;
  if (kind === 'C') f = eye(-26, 26, 8) + eye(26, 26, 8) + brow('M-52 -414 L-10 -424', 'M10 -424 L52 -414') + `<ellipse cx="0" cy="-336" rx="21" ry="29" fill="${D}"/><ellipse cx="0" cy="-324" rx="12" ry="11" fill="#c9524a"/>`;
  if (kind === 'W') f = eye(-26, 22, 7) + eye(26, 22, 7) + brow('M-50 -404 L-12 -420', 'M12 -420 L50 -404') + `<path d="M-26 -336 Q-13 -352 0 -338 Q13 -324 26 -340" stroke="${D}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M64 -440 Q82 -410 64 -396 Q46 -410 64 -440 Z" fill="#6fc4ff" stroke="#2a6fa8" stroke-width="3"/>`;
  return `<g transform="translate(${x} ${y}) scale(${sc * flip} ${sc})"><defs><clipPath id="fc${id}"><circle cx="0" cy="-390" r="72"/></clipPath></defs><g clip-path="url(#fc${id})"><rect x="-80" y="-412" width="160" height="110" fill="#e7b08a"/></g><circle cx="-46" cy="-350" r="10" fill="#e48f7a" opacity="0.6"/><circle cx="46" cy="-350" r="10" fill="#e48f7a" opacity="0.6"/>${f}</g>`;
}

// ---- city skyline (same look as scene1) ----
function buildings(layer, seed) {
  const r = rng(seed), out = []; let x = -40;
  while (x < W + 40) {
    const w = layer === 'bg' ? 140 + r() * 160 : 200 + r() * 230, gap = layer === 'bg' ? 0 : 10 + r() * 30, top = layer === 'bg' ? 160 + r() * 260 : 320 + r() * 260;
    const pal = layer === 'bg' ? ['#262f4d', '#2b3352', '#30344f'] : ['#35263a', '#3a2f45', '#4a3436', '#2e3550', '#463a3a'];
    const win = layer === 'bg' ? { w: 22, h: 28, gx: 40, gy: 52 } : { w: 40, h: 48, gx: 70, gy: 84 };
    const cols = Math.floor((w - 30) / win.gx), rows = Math.floor((840 - top - 40) / win.gy), ox = x + (w - (cols - 1) * win.gx - win.w) / 2, wins = [];
    for (let rr = 0; rr < rows; rr++) for (let c = 0; c < cols; c++) wins.push({ x: ox + c * win.gx, y: top + 34 + rr * win.gy, lit: r() < 0.7, warm: r() < 0.5 });
    out.push({ x, w, top, color: pal[Math.floor(r() * pal.length)], win, wins }); x += w + gap;
  }
  return out;
}
const BG = buildings('bg', 11), FG = buildings('fg', 23);
function city(lit, o = {}) {
  const s = [], d = lit ? 0 : 1, id = 'sk' + (lit ? 1 : 0) + (o.id || '');
  s.push(`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lit ? (o.warm ? '#5a3a7a' : '#1b2447') : '#03050f'}"/><stop offset="1" stop-color="${lit ? (o.warm ? '#ffb070' : '#3a3f73') : '#121a38'}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id})"/>`);
  const rs = rng(5); for (let i = 0; i < (lit ? 25 : 120); i++) s.push(`<circle cx="${(rs() * W).toFixed(0)}" cy="${(rs() * 480).toFixed(0)}" r="${(1.2 + rs() * 2).toFixed(1)}" fill="#fff" opacity="${lit ? 0.4 : 0.9}"/>`);
  if (o.moon !== false) { const mx = o.moonX || 1480; s.push(L.glow(mx, 190, 380, '#a8c4ff', lit ? 0.25 : 0.55), `<circle cx="${mx}" cy="190" r="86" fill="#f4efd8"/><circle cx="${mx - 26}" cy="168" r="15" fill="#dcd5b8"/><circle cx="${mx + 28}" cy="214" r="11" fill="#dcd5b8"/>`); }
  for (const layer of [BG, FG]) for (const b of layer) {
    s.push(`<rect x="${b.x}" y="${b.top}" width="${b.w}" height="${900 - b.top}" fill="${mix(b.color, lit ? '#2a2f55' : '#0f1428', lit ? 0.0 : 0.3)}"/>`);
    if (!lit) s.push(`<rect x="${b.x}" y="${b.top}" width="5" height="${900 - b.top}" fill="#6a86c8" opacity="0.35"/>`);
    for (const w of b.wins) { const on = lit && w.lit; s.push(`<rect x="${w.x.toFixed(0)}" y="${w.y.toFixed(0)}" width="${b.win.w}" height="${b.win.h}" fill="${on ? (w.warm ? '#ffd873' : '#ffe9a0') : (lit ? '#1c2238' : '#0a0e1e')}"/>`); }
  }
  s.push(`<rect y="840" width="${W}" height="34" fill="${lit ? '#454a57' : '#2a2e3a'}"/><rect y="874" width="${W}" height="${H}" fill="${lit ? '#2f3340' : '#12151f'}"/>`);
  if (lit) [260, 960, 1660].forEach(px => s.push(`<polygon points="${px + 40},430 ${px - 150},880 ${px + 230},880" fill="#ffe7a3" opacity="0.16"/><rect x="${px - 6}" y="420" width="12" height="456" fill="#1b1f2a"/><rect x="${px + 22}" y="414" width="44" height="18" rx="4" fill="#1b1f2a"/><rect x="${px + 26}" y="430" width="36" height="7" rx="3" fill="#ffe7a3"/>`));
  else [260, 960, 1660].forEach(px => s.push(`<rect x="${px - 6}" y="420" width="12" height="456" fill="#0a0d16"/><rect x="${px + 22}" y="414" width="44" height="18" rx="4" fill="#0a0d16"/>`));
  return s.join('');
}

function A() {
  const s = [city(false, { moonX: 1450 })];
  const hero = { x: 1590, y: 1350, s: 1.9, face: -1, expr: 'scared', armL: 40, armR: 105, hold: 'flashlight' };
  const h = L.handR(hero, 190 + 74);
  const ang = Math.atan2(-0.55, -1), sp = 0.33, len = 1150;
  const p = a => `${(h.x + Math.cos(a) * len).toFixed(0)},${(h.y + Math.sin(a) * len).toFixed(0)}`;
  s.push(`<defs><radialGradient id="bm" gradientUnits="userSpaceOnUse" cx="${h.x}" cy="${h.y}" r="${len}"><stop offset="0" stop-color="#fff3c4" stop-opacity="0.95"/><stop offset="0.55" stop-color="#fff3c4" stop-opacity="0.6"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></radialGradient></defs><polygon points="${h.x},${h.y} ${p(ang - sp)} ${p(ang + sp)}" fill="url(#bm)"/><polygon points="${h.x},${h.y} ${p(ang - sp * 0.4)} ${p(ang + sp * 0.4)}" fill="url(#bm)"/>`, L.glow(h.x, h.y, 140, '#fff6c0', 0.9));
  s.push(L.character(hero), face('A', 1590, 1350, 1.9, -1));
  s.push(vignette(0.55));
  s.push(txt(70, 330, '7 DAYS', 330, '#ffffff'), txt(70, 590, 'NO POWER', 212, '#ff7a1a'));
  return s.join('');
}
function B() {
  const s = [];
  s.push(`<rect width="${W}" height="${H}" fill="#232a47"/><rect y="800" width="${W}" height="${H}" fill="#2e2a3a"/><rect y="792" width="${W}" height="12" fill="#14182b"/>`);
  s.push(`<rect x="1260" y="120" width="300" height="300" rx="8" fill="#14182b"/><rect x="1274" y="134" width="272" height="272" fill="#0d1430"/><circle cx="1470" cy="210" r="28" fill="#f4efd8"/>`);
  const r = rng(8); let hz = '';
  for (let i = 0; i < 24; i++) hz += `<circle cx="${(700 + r() * 1100).toFixed(0)}" cy="${(200 + r() * 550).toFixed(0)}" r="${(110 + r() * 150).toFixed(0)}" fill="${i % 2 ? '#9bd08a' : '#b4bfa8'}" opacity="0.17"/>`;
  s.push(hz);
  s.push(`<g transform="translate(1130 1010) scale(2.5)"><rect x="-110" y="-120" width="220" height="140" rx="14" fill="#f2b134" stroke="#3a281c" stroke-width="6"/><rect x="-120" y="-132" width="240" height="20" rx="8" fill="#2a2e3a"/><rect x="-80" y="-90" width="90" height="70" rx="8" fill="#3b3f4a"/><circle cx="60" cy="-56" r="26" fill="#3b3f4a"/><rect x="96" y="-150" width="16" height="40" fill="#2a2e3a"/><circle cx="-80" cy="30" r="22" fill="#1d1f26"/><circle cx="80" cy="30" r="22" fill="#1d1f26"/></g>`);
  for (let i = 0; i < 9; i++) s.push(`<circle cx="${1300 + i * 22 + Math.sin(i) * 20}" cy="${690 - i * 55}" r="${40 + i * 12}" fill="#a8d88f" opacity="0.5"/>`);
  s.push(L.character({ x: 1720, y: 1350, s: 1.8, face: -1, expr: 'scared', armL: 55, armR: 55 }), face('W', 1720, 1350, 1.8, -1, 'W'));
  s.push(`<rect width="${W}" height="${H}" fill="#8fd07a" opacity="0.10"/>`);
  s.push(vignette(0.6));
  s.push(`<g transform="translate(1420 250) scale(1.7)"><path d="M0 -118 L112 70 L-112 70 Z" fill="#000" opacity="0.4" transform="translate(6 8)"/><path d="M0 -118 L112 70 L-112 70 Z" fill="#e5252a" stroke="#fff" stroke-width="12" stroke-linejoin="round"/><rect x="-9" y="-62" width="18" height="76" rx="9" fill="#fff"/><circle cx="0" cy="40" r="11" fill="#fff"/></g>`);
  s.push(txt(1110, 640, 'CO', 140, '#c8ffb0', { sw: 22 }));
  s.push(txt(70, 250, 'THIS', 250, '#ffffff'), txt(70, 500, 'KILLS', 300, '#ff7a1a'), txt(70, 740, 'PEOPLE', 250, '#ffffff'));
  return s.join('');
}
function Cc() {
  const SX = 700, zz = []; for (let y = -20, i = 0; y <= H + 40; y += 90, i++) zz.push([SX + (i % 2 ? 45 : -45), y]);
  zz.push([SX, H + 60]); zz.unshift([SX, -60]);
  const pts = zz.map(p => p.join(',')).join(' ');
  const s = [city(true, { id: 'L', moon: false, warm: true })];
  s.push(`<rect width="${SX + 50}" height="${H}" fill="#ff9a3a" opacity="0.14"/>`);
  s.push(`<defs><clipPath id="rightHalf"><polygon points="${pts} ${W},${H + 40} ${W},-20"/></clipPath></defs><g clip-path="url(#rightHalf)">${city(false, { id: 'R', moon: false })}<rect width="${W}" height="${H}" fill="#02040c" opacity="0.35"/></g>`);
  s.push(`<polyline points="${pts}" fill="none" stroke="#ffe14a" stroke-width="40" stroke-linejoin="miter" opacity="0.35"/><polyline points="${pts}" fill="none" stroke="#ffe14a" stroke-width="20" stroke-linejoin="miter"/><polyline points="${pts}" fill="none" stroke="#fff" stroke-width="8" stroke-linejoin="miter"/>`);
  s.push(L.character({ x: 1190, y: 1350, s: 1.65, expr: 'worried', armL: 30, armR: 30 }), face('W', 1190, 1350, 1.65, 1, 'WC'));
  s.push(txt(1380, 270, 'CITY', 290, '#ffffff', { anchor: 'middle' }), txt(1380, 470, 'BLACKOUT', 160, '#ff7a1a', { anchor: 'middle' }));
  s.push(L.pill(10, 'left', '7 DAYS', 0, { y: 46, fs: 64, h: 100 }));
  return s.join('');
}
(async () => {
  const wrap = i => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${i}</svg>`;
  const bufs = [];
  for (const [n, f] of [['A', A], ['B', B], ['C', Cc]]) {
    const out = `/home/claude/blackout/thumbs/thumb_${n}.png`;
    await sharp(Buffer.from(wrap(f()))).resize(1280, 720).png({ compressionLevel: 9 }).toFile(out);
    bufs.push(await sharp(out).resize(320, 180).png().toBuffer());
  }
  await sharp({ create: { width: 1000, height: 180, channels: 3, background: '#0f0f0f' } }).composite(bufs.map((b, i) => ({ input: b, left: i * 340, top: 0 }))).png().toFile('/home/claude/blackout/thumbs/preview_small.png');
})();
