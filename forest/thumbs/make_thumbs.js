const sharp = require('/opt/npm-tools/node_modules/sharp');
const L = require('../lib'); const F = require('../forest_lib');
const { W, H } = L;
const FN = `font-family="Inter, DejaVu Sans" font-weight="900"`;
const T = 20;
function txt(x, y, s, fs, fill, o = {}) {
  const anchor = o.anchor || 'start', rot = o.rot ? ` transform="rotate(${o.rot} ${x} ${y})"` : '';
  const sw = o.sw || fs * 0.13;
  return `<g${rot}><text x="${x + fs * 0.04}" y="${y + fs * 0.07}" text-anchor="${anchor}" ${FN} font-size="${fs}" fill="#000" stroke="#000" stroke-width="${sw}" stroke-linejoin="round" opacity="0.5">${s}</text>
  <text x="${x}" y="${y}" text-anchor="${anchor}" ${FN} font-size="${fs}" fill="${fill}" stroke="#1a0f08" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke">${s}</text></g>`;
}
const vignette = (a = 0.5) => `<defs><radialGradient id="vg" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${a}"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#vg)"/>`;


function face(kind, x, y, sc) {
  const D = '#2a160e', eye = (cx, r, pr, extra = '') => `<circle cx="${cx}" cy="-380" r="${r}" fill="#fff" stroke="${D}" stroke-width="5"/>${pr ? `<circle cx="${cx}" cy="-378" r="${pr}" fill="${D}"/>` : ''}${extra}`;
  const brow = (a, b) => `<path d="${a}" stroke="#5a3820" stroke-width="9" stroke-linecap="round" fill="none"/><path d="${b}" stroke="#5a3820" stroke-width="9" stroke-linecap="round" fill="none"/>`;
  let f = '';
  if (kind === 'A') f = eye(-26, 23, 6) + eye(26, 23, 6) + brow('M-50 -412 L-12 -420', 'M12 -420 L50 -412') + `<ellipse cx="0" cy="-338" rx="17" ry="24" fill="${D}"/><ellipse cx="0" cy="-330" rx="10" ry="10" fill="#c9524a"/><path d="M64 -440 Q82 -410 64 -396 Q46 -410 64 -440 Z" fill="#6fc4ff" stroke="#2a6fa8" stroke-width="3"/>`;
  if (kind === 'B') { const sp = cx => `<circle cx="${cx}" cy="-380" r="19" fill="${D}"/><circle cx="${cx - 6}" cy="-387" r="7" fill="#fff"/><circle cx="${cx + 7}" cy="-373" r="4" fill="#fff"/>`;
    f = sp(-26) + sp(26) + brow('M-48 -410 Q-30 -424 -10 -414', 'M10 -414 Q30 -424 48 -410') + `<path d="M-34 -358 Q0 -300 34 -358 Z" fill="${D}" stroke="${D}" stroke-width="5" stroke-linejoin="round"/><path d="M-26 -357 L26 -357 L22 -348 L-22 -348 Z" fill="#fff"/><path d="M-16 -330 Q0 -346 16 -330 Q0 -318 -16 -330 Z" fill="#e0605a"/>`
    + [[-74, -440], [76, -430]].map(([a, b]) => `<path d="M${a} ${b - 22} L${a + 6} ${b - 6} L${a + 22} ${b} L${a + 6} ${b + 6} L${a} ${b + 22} L${a - 6} ${b + 6} L${a - 22} ${b} L${a - 6} ${b - 6} Z" fill="#fff6a8" stroke="#ffb020" stroke-width="3"/>`).join(''); }
  if (kind === 'C') f = eye(-26, 26, 8) + eye(26, 26, 8) + brow('M-52 -414 L-10 -424', 'M10 -424 L52 -414') + `<ellipse cx="0" cy="-336" rx="21" ry="29" fill="${D}"/><ellipse cx="0" cy="-324" rx="12" ry="11" fill="#c9524a"/>`;
  return `<g transform="translate(${x} ${y}) scale(${sc})"><defs><clipPath id="fc${kind}"><circle cx="0" cy="-390" r="72"/></clipPath></defs><g clip-path="url(#fc${kind})"><rect x="-80" y="-412" width="160" height="110" fill="#e7b08a"/></g><circle cx="-46" cy="-350" r="10" fill="#e48f7a" opacity="0.6"/><circle cx="46" cy="-350" r="10" fill="#e48f7a" opacity="0.6"/>${f}</g>`;
}
function A() {
  const s = [];
  s.push(F.forestBackdrop(T, { time: 'night', clearing: 0.5, seed: 3 }));
  s.push(F.tree(80, 1000, 2.0, 'pine', { time: 'night', shadow: false }), F.tree(1000, 800, 1.1, 'pine', { time: 'night', shadow: false }));
  s.push(L.darkness(0.4, [{ type: 'circle', x: 1100, y: 900, r: 1000 }]));
  s.push(L.glow(1100, 850, 800, '#ff8a2a', 0.5));
  s.push(F.eyesInBush(T, 300, 1010, 1.9, { time: 'night', seed: 1 }), F.eyesInBush(T, 800, 830, 1.2, { time: 'night', seed: 4 }));
  s.push(F.campfire(T, 1020, 1040, 1.6, { lit: 1, time: 'night' }));
  s.push(L.glow(1090, 800, 450, '#ffb050', 0.55));
  s.push(L.character({ x: 1520, y: 1350, s: 1.9, expr: 'scared', armL: 40, armR: 50, face: 1 }), face('A', 1520, 1350, 1.9));
  s.push(L.glow(1350, 700, 600, '#ff9a3a', 0.35));
  s.push(vignette(0.45));
  s.push(txt(70, 330, 'LOST', 330, '#ffffff'), txt(70, 610, '7 DAYS', 270, '#ff7a1a'));
  return s.join('');
}
function B() {
  const s = [];
  s.push(F.forestBackdrop(T, { time: 'day', clearing: 1, seed: 2 }));
  // thick smoke column
  const r = L.rng(9); const parts = [];
  for (let i = 0; i < 30; i++) { const ph = i / 30, yy = -ph * 700, xx = Math.sin(ph * 7) * (14 + ph * 30) + ph * ph * 60 + (r() - 0.5) * 60, rr = 60 + ph * 70 + r() * 25; parts.push(`<circle cx="${xx.toFixed(0)}" cy="${yy.toFixed(0)}" r="${rr.toFixed(0)}" fill="${L.mix('#c4cad6', '#ffffff', ph)}"/>`); }
  const sm = parts.reverse().join('');
  s.push(F.campfire(T, 1620, 960, 1.2, { lit: 1 }), `<g transform="translate(1620 900)">${sm}</g>`);
  s.push(F.sosRocks(530, 1040, 1050, 1, { depth: 300 }));
  s.push(L.character({ x: 1170, y: 1290, s: 1.65, expr: 'happy', armL: 158, armR: 158 }), face('B', 1170, 1290, 1.65));
  s.push(F.helicopter(T, 1560, 310, 1.5, -1, {}));
  s.push(txt(70, 270, '7 DAYS', 270, '#ffffff'), txt(70, 510, 'LOST', 270, '#ff7a1a'), txt(78, 640, 'IN THE WOODS', 110, '#ffffff', { sw: 18 }));
  return s.join('');
}
function Cc() {
  const s = [];
  s.push(F.forestBackdrop(T, { time: 'day', clearing: 0.3, seed: 5 }));
  s.push(F.tree(1850, 800, 1.5, 'pine', { shadow: false }));
  s.push(`<rect width="${W}" height="${H}" fill="#000" opacity="0.12"/>`);
  s.push(`<defs><radialGradient id="mg"><stop offset="0" stop-color="#fff7b0" stop-opacity="0.45"/><stop offset="1" stop-color="#fff7b0" stop-opacity="0"/></radialGradient></defs><circle cx="1300" cy="800" r="600" fill="url(#mg)"/>`);
  s.push(F.mushrooms(1340, 1030, 4.6, { kind: 'red' }));
  s.push(L.character({ x: 560, y: 1290, s: 1.5, expr: 'scared', armL: 25, armR: 82, face: 1 }), face('C', 560, 1290, 1.5));
  // warning sign: skull triangle + red X
  s.push(F.skull(1760, 520, 1.5, { warning: true }));
  s.push(`<g fill="none" stroke="#000" stroke-width="46" opacity="0.4" transform="translate(5 7)"><circle cx="1470" cy="640" r="210"/><line x1="1322" y1="492" x2="1618" y2="788"/></g><g fill="none" stroke="#e5252a" stroke-width="40" stroke-linecap="round"><circle cx="1470" cy="640" r="210"/><line x1="1322" y1="492" x2="1618" y2="788"/></g>`);
  s.push(txt(70, 270, "DON'T", 290, '#ffffff'), txt(70, 530, 'EAT THIS', 250, '#ffd23f'));
  s.push(L.pill(10, 'right', 'DAY 4', 0, { y: 50, fs: 70, h: 110 }));
  return s.join('');
}
(async () => {
  const wrap = i => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${i}</svg>`;
  const names = [['A', A], ['B', B], ['C', Cc]];
  const bufs = [];
  for (const [n, f] of names) {
    const out = `/home/claude/forest/thumbs/thumb_${n}.png`;
    await sharp(Buffer.from(wrap(f()))).resize(1280, 720).png({ compressionLevel: 9, palette: false }).toFile(out);
    bufs.push(await sharp(out).resize(320, 180).png().toBuffer());
  }
  await sharp({ create: { width: 320 * 3 + 40, height: 180, channels: 3, background: '#0f0f0f' } })
    .composite(bufs.map((b, i) => ({ input: b, left: i * 340, top: 0 }))).png().toFile('/home/claude/forest/thumbs/preview_small.png');
})();
