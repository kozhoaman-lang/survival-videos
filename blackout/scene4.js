// Scene 4 — Night 1: no candles (30 s)
const L = require('./lib');
const { W, H, C, keys, clamp, easeOut, easeInOut, pulse, mix, FONT } = L;
const DUR = 30;
const CUT = 14.0; // cut to the safe version of the room

function flame(x, y, s, ph, t) {
  const w = 1 + 0.12 * Math.sin(t * 13 + ph), lean = Math.sin(t * 7 + ph) * 4;
  return `<g transform="translate(${x} ${y}) scale(${(s * w).toFixed(3)} ${s.toFixed(3)})">
    <path d="M0 0 C-14 -10 -12 -30 ${lean} -52 C12 -30 14 -10 0 0 Z" fill="#ffb02e"/>
    <path d="M0 -2 C-7 -8 -6 -20 ${lean * 0.6} -32 C6 -20 7 -8 0 -2 Z" fill="#fff1a8"/></g>`;
}
function candle(x, y, lit, t, ph) {
  return `<rect x="${x - 12}" y="${y - 60}" width="24" height="60" rx="4" fill="#f3ead8"/><rect x="${x - 18}" y="${y - 6}" width="36" height="8" rx="3" fill="#b9a27c"/>
    <line x1="${x}" y1="${y - 60}" x2="${x}" y2="${y - 68}" stroke="#222" stroke-width="3"/>${lit > 0 ? flame(x, y - 64, 0.9 * lit, ph, t) : ''}`;
}
const truck = `<g transform="scale(0.9)"><rect x="-58" y="-14" width="80" height="40" rx="5" fill="${C.red}"/><path d="M22 -14 L44 -14 L58 6 L58 26 L22 26 Z" fill="${C.red}"/><rect x="30" y="-8" width="16" height="14" fill="#bfe3ff"/>
  <line x1="-54" y1="-22" x2="14" y2="-22" stroke="#cfd4dc" stroke-width="6"/><line x1="-46" y1="-28" x2="-46" y2="-16" stroke="#cfd4dc" stroke-width="4"/><line x1="-26" y1="-28" x2="-26" y2="-16" stroke="#cfd4dc" stroke-width="4"/><line x1="-6" y1="-28" x2="-6" y2="-16" stroke="#cfd4dc" stroke-width="4"/>
  <circle cx="-34" cy="28" r="12" fill="#222"/><circle cx="36" cy="28" r="12" fill="#222"/><rect x="-8" y="-38" width="16" height="10" rx="3" fill="#4a8fd8"/></g>`;

function room(t) {
  const s = [];
  s.push(`<rect width="${W}" height="${H}" fill="${C.wall}"/><rect y="812" width="${W}" height="${H - 812}" fill="${C.floor}"/><rect y="806" width="${W}" height="10" fill="${C.trim}"/>`);
  for (let x = 0; x < W; x += 160) s.push(`<rect x="${x}" y="816" width="4" height="${H}" fill="#2f2632"/>`);
  // window + curtains
  s.push(`<rect x="1330" y="170" width="400" height="390" rx="8" fill="${C.trim}"/><rect x="1346" y="186" width="368" height="358" fill="#121a31"/><circle cx="1640" cy="250" r="26" fill="#efe6cf"/>`);
  s.push(`<rect x="1290" y="140" width="480" height="16" rx="8" fill="#1a1f33"/>`);
  const fire = t < CUT ? easeOut(pulse(t, 8.2, 11.5)) : 0;
  const curtain = (x, w) => {
    let p = `<path d="M${x} 150 L${x + w} 150 L${x + w + 10} 800 L${x - 10} 800 Z" fill="${mix('#8c3b4a', '#3a1d20', fire * (x < 1500 ? 0.6 : 0))}"/>`;
    for (let k = 1; k < 4; k++) p += `<line x1="${x + (w * k) / 4}" y1="156" x2="${x + (w * k) / 4 + (k - 2) * 4}" y2="798" stroke="#6e2c38" stroke-width="5"/>`;
    return p;
  };
  s.push(curtain(1270, 110), curtain(1680, 110));
  // sofa
  s.push(`<rect x="150" y="560" width="560" height="120" rx="30" fill="#4f5b86"/><rect x="120" y="640" width="620" height="140" rx="30" fill="#5d6a98"/><rect x="150" y="770" width="30" height="40" fill="#1a1f33"/><rect x="680" y="770" width="30" height="40" fill="#1a1f33"/>`);
  // table
  s.push(`<rect x="880" y="616" width="420" height="22" rx="6" fill="${C.wood}"/><rect x="900" y="636" width="22" height="176" fill="${C.woodDark}"/><rect x="1258" y="636" width="22" height="176" fill="${C.woodDark}"/>`);
  return s.join('');
}

function frame(t) {
  const s = [room(t)];
  const lights = [{ type: 'circle', x: 1530, y: 360, r: 380, a: 0.6, core: 0.2 }];
  if (t < CUT) {
    // candles light one by one
    const xs = [960, 1050, 1140, 1236];
    xs.forEach((x, i) => {
      const lit = easeOut(pulse(t, 2.4 + i * 0.7, 2.7 + i * 0.7));
      s.push(candle(x, 618, lit, t, i * 1.7));
      if (lit > 0) lights.push({ type: 'circle', x, y: 560, r: 240 * lit, a: 0.9, core: 0.2 });
    });
    // the last candle leans into the curtain → curtain fire
    const fire = easeOut(pulse(t, 8.2, 11.5));
    if (fire > 0) {
      for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) {
        const grow = clamp((fire - r * 0.18) / 0.3);
        if (grow > 0) s.push(flame(1282 + c * 28 + (r % 2) * 12, 800 - r * 120, (1.6 + 0.6 * Math.sin(r + c)) * grow, r * 3 + c, t));
      }
      lights.push({ type: 'circle', x: 1320, y: 560, r: 300 + 420 * fire, a: 0.95, core: 0.25 });
    }
    // character lighting candles
    const h = { x: 770, y: 900, s: 0.92, face: 1, armR: keys(t, [[1.8, 8], [2.3, 58], [5.4, 58], [5.8, 8]]), expr: t > 6.1 ? 'scared' : t > 2.5 ? 'happy' : 'neutral', blink: L.blinkAt(t) };
    s.push(L.character(h));
    lights.push({ type: 'circle', x: 770, y: 640, r: 320, a: 0.5, core: 0.2 });
    s.push(L.darkness(0.68 - 0.2 * fire, lights));
    if (fire > 0) s.push(L.glow(1320, 560, 600, '#ff7a2e', 0.35 * fire));
    xs.forEach(x => { if (t > 2.4) s.push(L.glow(x, 548, 70, '#ffcf6b', 0.5)); });
    // red warning flash on "Don't."
    const fl = clamp(1 - Math.abs(t - 6.4) / 0.4) + (fire > 0.2 ? 0.25 * (0.5 + 0.5 * Math.sin(t * 8)) * fire : 0);
    if (fl > 0) s.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="${C.red}" stroke-width="40" opacity="${fl.toFixed(2)}"/>`);
    s.push(L.popCard(t, 6.3, 1050, 360, L.stampX(0.75), { r: 80, out: 8.4 }));
    s.push(L.popCard(t, 11.2, 420, 300, truck, { r: 86 }));
    s.push(L.pill(t, 420, 'HELP IS SLOWER', 11.6, { y: 410, fs: 38, h: 66 }));
  } else {
    // safe version: battery lantern on the table
    s.push(`<rect x="1056" y="530" width="68" height="88" rx="12" fill="#3b3f4a"/><rect x="1066" y="544" width="48" height="58" rx="8" fill="${C.lamp}"/><path d="M1066 530 Q1090 500 1114 530" stroke="#3b3f4a" stroke-width="7" fill="none"/>`);
    const jar = t > 20.0;
    if (jar) { // a single candle in a glass jar, watched
      s.push(`<rect x="914" y="546" width="58" height="72" rx="10" fill="#cfe3f5" opacity="0.5" stroke="#9fb6cc" stroke-width="3"/>${candle(943, 612, 1, t, 0.4).replace('height="60"', 'height="40"').replace(`y="552"`, `y="572"`)}`);
    }
    const h = { x: keys(t, [[CUT, 700], [20.0, 700], [21.4, 760]]), y: 900, s: 0.92, face: 1, hold: t < 20 ? 'flashlight' : null, armR: t < 20 ? 34 : 8, expr: t > 20.4 ? 'focused' : 'happy', blink: L.blinkAt(t), walk: t > 20 && t < 21.4 ? t * 9 : 0 };
    s.push(L.character(h));
    lights.push({ type: 'circle', x: 1090, y: 560, r: 760, a: 0.95, core: 0.2 });
    if (jar) lights.push({ type: 'circle', x: 943, y: 560, r: 240, a: 0.9, core: 0.2 });
    s.push(L.darkness(0.55, lights));
    s.push(L.glow(1090, 572, 200, '#ffe7a3', 0.45));
    s.push(L.popCard(t, 15.4, 1090, 330, L.stampCheck(0.7), { r: 74, out: 19.6 }));
    s.push(L.pill(t, 943, 'STAY CLOSE', 21.6, { y: 400, fs: 38, h: 66 }));
    // fade in from the cut
    const fade = 1 - clamp((t - CUT) / 0.35);
    if (fade > 0) s.push(`<rect width="${W}" height="${H}" fill="#000" opacity="${fade.toFixed(2)}"/>`);
  }
  if (t > CUT - 0.35 && t < CUT) s.push(`<rect width="${W}" height="${H}" fill="#000" opacity="${clamp((t - (CUT - 0.35)) / 0.35).toFixed(2)}"/>`);

  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', 'NIGHT 1', 0.3), L.pill(t, 'right', 'NO CANDLES', 0.45));
  s.push(L.captions(t, [
    [6.4, 6.75, 13.4, 'CANDLES — ', 'START FIRES.'],
    [14.6, 15.0, 19.8, 'NO CANDLES — ', 'USE LIGHTS.'],
    [20.4, 20.85, null, 'NEVER LEAVE IT — ', 'ALONE.'],
  ]));
  return s.join('\n');
}

L.render(frame, DUR, 'scene4.mp4');
