// Scene 10 — Outro: the city is lit again, recap, subscribe (20 s)
const L = require('./lib');
const { W, H, C, keys, clamp, easeOut, easeInOut, pulse, mix, FONT } = L;
const DUR = 20;
const rnd = L.rng(42); // same seed as Scene 1 → same skyline

function makeBuildings(layer) {
  const out = []; let x = -40;
  while (x < W + 40) {
    const w = layer === 'bg' ? 140 + rnd() * 160 : 200 + rnd() * 230;
    const gap = layer === 'bg' ? 0 : 10 + rnd() * 30;
    const top = layer === 'bg' ? 140 + rnd() * 260 : 300 + rnd() * 260;
    const color = (layer === 'bg' ? ['#262f4d', '#2b3352', '#30344f'] : ['#35263a', '#3a2f45', '#4a3436', '#2e3550', '#463a3a'])[Math.floor(rnd() * (layer === 'bg' ? 3 : 5))];
    const win = layer === 'bg' ? { w: 18, h: 22, gx: 34, gy: 42 } : { w: 34, h: 40, gx: 62, gy: 74 };
    const windows = [];
    const cols = Math.floor((w - 30) / win.gx), rows = Math.floor((840 - top - 40) / win.gy);
    const ox = x + (w - (cols - 1) * win.gx - win.w) / 2;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const wx = ox + c * win.gx, wy = top + 34 + r * win.gy;
      const lit = rnd() < (layer === 'bg' ? 0.55 : 0.6);
      windows.push({ x: wx, y: wy, lit, warm: rnd() < 0.5, off: 0, flick: rnd() < 0.5 });
    }
    out.push({ x, w, top, color, win, windows, roof: layer === 'fg' && rnd() < 0.5 });
    x += w + gap;
  }
  return out;
}
const bg = makeBuildings('bg'), fg = makeBuildings('fg');

const recap = [
  ['fridge', `<g><rect x="-34" y="-50" width="68" height="100" rx="10" fill="#e2e7ef" stroke="#555" stroke-width="4"/><line x1="-34" y1="-12" x2="34" y2="-12" stroke="#555" stroke-width="4"/><rect x="-24" y="-40" width="6" height="20" fill="#9aa3b2"/><rect x="-24" y="0" width="6" height="30" fill="#9aa3b2"/></g>`],
  ['water', `<g><path d="M-26 -26 L-26 40 Q-26 46 -20 46 L20 46 Q26 46 26 40 L26 -26 Q26 -36 14 -40 L8 -46 L-8 -46 L-14 -40 Q-26 -36 -26 -26 Z" fill="#dcefff" stroke="#3a5a7a" stroke-width="4"/><rect x="-26" y="0" width="52" height="46" fill="#4aa3e0" opacity="0.7"/></g>`],
  ['phone', `<g><rect x="-26" y="-48" width="52" height="96" rx="10" fill="#14161c"/><rect x="-20" y="-40" width="40" height="80" rx="6" fill="#4cc36b"/></g>`],
  ['generator', `<g transform="scale(0.45)"><rect x="-110" y="-80" width="220" height="140" rx="14" fill="#f2b134" stroke="#3a281c" stroke-width="10"/><rect x="-80" y="-50" width="90" height="70" rx="8" fill="#3b3f4a"/><circle cx="60" cy="-16" r="26" fill="#3b3f4a"/></g>`],
  ['trash', `<g><path d="M-34 -30 L34 -30 L26 46 L-26 46 Z" fill="#6c7484" stroke="#3a3f4d" stroke-width="4"/><rect x="-40" y="-44" width="80" height="14" rx="5" fill="#55607d"/></g>`],
];

function frame(t) {
  const s = [`<rect width="${W}" height="${H}" fill="#1d2642"/>`];
  const zoom = keys(t, [[0, 1.07], [20, 1.0]]);
  s.push(`<g transform="translate(${W / 2} ${H * 0.55}) scale(${zoom}) translate(${-W / 2} ${-H * 0.55})">`);
  s.push(`<circle cx="1390" cy="175" r="52" fill="#efe6cf" opacity="0.8"/>`);
  for (const layer of [bg, fg]) for (const b of layer) {
    s.push(`<rect x="${b.x}" y="${b.top}" width="${b.w}" height="${900 - b.top}" fill="${b.color}"/>`);
    if (b.roof) s.push(`<rect x="${b.x + 14}" y="${b.top - 16}" width="${b.w - 28}" height="16" fill="${mix(b.color, '#000000', 0.25)}"/>`);
    for (const w of b.windows) s.push(`<rect x="${w.x.toFixed(1)}" y="${w.y.toFixed(1)}" width="${b.win.w}" height="${b.win.h}" fill="${w.lit ? (w.warm ? C.winOn : '#f1d488') : (layer === bg ? '#1f2742' : C.winOff)}"/>`);
  }
  s.push(`<rect x="-200" y="840" width="${W + 400}" height="34" fill="#454a57"/><rect x="-200" y="872" width="${W + 400}" height="10" fill="#5b6170"/><rect x="-200" y="882" width="${W + 400}" height="${H}" fill="#272b36"/>`);
  for (const px of [260, 960, 1660]) {
    s.push(`<polygon points="${px + 40},430 ${px - 150},880 ${px + 230},880" fill="#ffe7a3" opacity="0.18"/>`);
    s.push(`<rect x="${px - 6}" y="420" width="12" height="456" fill="#1b1f2a"/><rect x="${px - 6}" y="420" width="70" height="10" fill="#1b1f2a"/><rect x="${px + 26}" y="430" width="36" height="7" rx="3" fill="#ffe7a3"/>`);
  }
  s.push(`<rect x="1285" y="660" width="10" height="216" fill="#1b1f2a"/><rect x="1264" y="560" width="52" height="128" rx="10" fill="#14171f"/><circle cx="1290" cy="585" r="14" fill="#2a2e38"/><circle cx="1290" cy="624" r="14" fill="#2a2e38"/><circle cx="1290" cy="663" r="14" fill="#4cc36b"/>`);
  s.push(`</g>`);
  s.push(L.character({ x: 520, y: 900, s: 0.82, face: 1, expr: 'happy', hold: 'flashlight', armR: 20, armL: t > 1.2 && t < 3.5 ? 150 : 8, blink: L.blinkAt(t) }));
  // recap icons
  recap.forEach(([, g], i) => s.push(L.popCard(t, 4.0 + i * 0.7, 560 + i * 200, 330, g, { r: 74, out: 15.0 })));
  // subscribe
  if (t > 15.6) {
    const k = L.spring((t - 15.6) / 0.6);
    s.push(`<g transform="translate(960 380) scale(${k.toFixed(3)})"><rect x="-230" y="-58" width="460" height="116" rx="58" fill="${C.red}" stroke="${C.pillInk}" stroke-width="6"/><text x="0" y="22" text-anchor="middle" ${FONT} font-size="62" fill="#fff">SUBSCRIBE</text></g>`);
  }
  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', '7 DAYS', 0.3), L.pill(t, 'right', 'SURVIVED', 0.45));
  s.push(L.captions(t, [
    [1.4, 1.8, 9.8, 'YOU — ', 'SURVIVED.'],
    [10.2, 10.6, 15.2, 'NOW — ', 'YOU KNOW.'],
    [15.8, 16.2, null, 'NEXT SCENARIO — ', 'SOON.'],
  ]));
  const fade = clamp((t - 19.2) / 0.8);
  if (fade > 0) s.push(`<rect width="${W}" height="${H}" fill="#000" opacity="${fade.toFixed(2)}"/>`);
  return s.join('\n');
}

L.render(frame, DUR, 'scene10.mp4');
