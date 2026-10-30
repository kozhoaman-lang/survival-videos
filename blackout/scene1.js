// Scene 1 — Hook: the city goes dark. Renders SVG frames with sharp, encodes with ffmpeg.
const sharp = require('/opt/npm-tools/node_modules/sharp');
const { spawn } = require('child_process');

const W = 1920, H = 1080, FPS = 30, DUR = 20;
const FRAMES = FPS * DUR;
const ONLY = process.argv[2] ? Number(process.argv[2]) : null; // render a single frame (seconds) for preview
const OUT = process.argv[3] || 'scene1.mp4';

// ---------- helpers ----------
let seed = 42;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);
const easeInOut = t => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const spring = t => { t = clamp(t); return 1 - Math.exp(-6 * t) * Math.cos(10 * t); };
const mix = (c1, c2, t) => {
  const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const a = p(c1), b = p(c2);
  return '#' + a.map((v, i) => Math.round(lerp(v, b[i], clamp(t))).toString(16).padStart(2, '0')).join('');
};

// ---------- palette ----------
const C = {
  sky: '#1d2642', skyDark: '#10162a',
  bgBuild: ['#262f4d', '#2b3352', '#30344f'],
  fgBuild: ['#35263a', '#3a2f45', '#4a3436', '#2e3550', '#463a3a'],
  winOn: '#e9c46a', winOn2: '#f1d488', winOff: '#1c2238', winOffBg: '#1f2742',
  street: '#272b36', sidewalk: '#454a57', curb: '#5b6170', lane: '#c9b98f',
  pole: '#1b1f2a', lamp: '#ffe7a3', moon: '#efe6cf',
  pill: '#f4e4c4', pillInk: '#3a281c', orange: '#f26b2a',
};

// ---------- timeline (seconds) ----------
const T = {
  flickerStart: 5.7, blackout: 6.4, wave: 0.7,
  cap1: 6.9, cap1b: 7.35, cap1Out: 13.4,
  cap2: 13.8, cap2b: 14.25,
  pillIn: 0.4, pillSwap: 13.8,
};

// ---------- build city geometry once ----------
function makeBuildings(layer) {
  const out = [];
  let x = -40;
  while (x < W + 40) {
    const w = layer === 'bg' ? 140 + rnd() * 160 : 200 + rnd() * 230;
    const gap = layer === 'bg' ? 0 : 10 + rnd() * 30;
    const top = layer === 'bg' ? 140 + rnd() * 260 : 300 + rnd() * 260;
    const color = (layer === 'bg' ? C.bgBuild : C.fgBuild)[Math.floor(rnd() * (layer === 'bg' ? 3 : 5))];
    const win = layer === 'bg' ? { w: 18, h: 22, gx: 34, gy: 42 } : { w: 34, h: 40, gx: 62, gy: 74 };
    const windows = [];
    const cols = Math.floor((w - 30) / win.gx), rows = Math.floor((840 - top - 40) / win.gy);
    const ox = x + (w - (cols - 1) * win.gx - win.w) / 2;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const wx = ox + c * win.gx, wy = top + 34 + r * win.gy;
      const lit = rnd() < (layer === 'bg' ? 0.55 : 0.6);
      windows.push({
        x: wx, y: wy, lit, warm: rnd() < 0.5,
        off: T.blackout + (wx / W) * T.wave + rnd() * 0.12,
        flick: rnd() < 0.5,
      });
    }
    out.push({ x, w, top, color, win, windows, roof: layer === 'fg' && rnd() < 0.5 });
    x += w + gap;
  }
  return out;
}
const bg = makeBuildings('bg');
const fg = makeBuildings('fg');

// a few windows later light up with dim flashlight glow (people with torches)
const torches = [];
{
  const pool = fg.flatMap(b => b.windows).filter(w => w.y < 700);
  [10.2, 11.6, 15.1, 16.8].forEach(t => torches.push({ win: pool[Math.floor(rnd() * pool.length)], t }));
}
const stars = Array.from({ length: 70 }, () => ({ x: rnd() * W, y: rnd() * 420, r: 1 + rnd() * 1.8, ph: rnd() * 6 }));
const poles = [260, 960, 1660];

// ---------- frame ----------
function lightLevel(t) { // 1 = full power, 0 = dark (used for street lamps / sky)
  if (t < T.flickerStart) return 1;
  if (t < T.blackout) { // flicker
    const k = (t - T.flickerStart) / (T.blackout - T.flickerStart);
    return (Math.sin(k * 40) > 0.2 || k < 0.15) ? 1 : 0.25;
  }
  return clamp(1 - (t - T.blackout) / 0.25);
}

function windowOn(w, t) {
  if (!w.lit) return 0;
  if (t < T.flickerStart) return 1;
  if (t < w.off) {
    if (!w.flick) return 1;
    const k = (t - T.flickerStart) * 22 + w.x * 0.01;
    return Math.sin(k) > -0.3 ? 1 : 0.15;
  }
  return 0;
}

function frameSVG(t) {
  const L = lightLevel(t);
  const dark = clamp((t - T.blackout) / 1.2);
  const zoom = lerp(1, 1.07, easeInOut(t / DUR));
  const s = [];
  s.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
  s.push(`<defs>
    <radialGradient id="moonGlow"><stop offset="0" stop-color="${C.moon}" stop-opacity="0.35"/><stop offset="1" stop-color="${C.moon}" stop-opacity="0"/></radialGradient>
    <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.lamp}" stop-opacity="0.3"/><stop offset="1" stop-color="${C.lamp}" stop-opacity="0.05"/></linearGradient>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.82"/></linearGradient>
    <radialGradient id="torch"><stop offset="0" stop-color="#dfe9ff" stop-opacity="0.9"/><stop offset="1" stop-color="#9fb6ff" stop-opacity="0"/></radialGradient>
  </defs>`);
  s.push(`<rect width="${W}" height="${H}" fill="${mix(C.sky, C.skyDark, dark)}"/>`);

  // world (pushed-in)
  s.push(`<g transform="translate(${W / 2} ${H * 0.55}) scale(${zoom}) translate(${-W / 2} ${-H * 0.55})">`);

  // stars + moon (more visible after blackout)
  const starA = 0.15 + 0.75 * dark;
  stars.forEach(st => s.push(`<circle cx="${st.x}" cy="${st.y}" r="${st.r}" fill="#fff" opacity="${(starA * (0.6 + 0.4 * Math.sin(t * 2 + st.ph))).toFixed(3)}"/>`));
  s.push(`<circle cx="1390" cy="175" r="${160}" fill="url(#moonGlow)" opacity="${0.3 + 0.7 * dark}"/>`);
  s.push(`<circle cx="1390" cy="175" r="52" fill="${C.moon}" opacity="${0.8 + 0.2 * dark}"/>`);

  // buildings
  for (const layer of [bg, fg]) {
    for (const b of layer) {
      s.push(`<rect x="${b.x}" y="${b.top}" width="${b.w}" height="${900 - b.top}" fill="${mix(b.color, '#151a2b', dark * 0.35)}"/>`);
      if (b.roof) s.push(`<rect x="${b.x + 14}" y="${b.top - 16}" width="${b.w - 28}" height="16" fill="${mix(b.color, '#000000', 0.25)}"/>`);
      for (const w of b.windows) {
        const on = windowOn(w, t);
        const offCol = layer === bg ? C.winOffBg : C.winOff;
        const col = on > 0 ? mix(offCol, w.warm ? C.winOn : C.winOn2, on) : offCol;
        s.push(`<rect x="${w.x.toFixed(1)}" y="${w.y.toFixed(1)}" width="${b.win.w}" height="${b.win.h}" fill="${col}"/>`);
      }
    }
  }
  // flashlight glows in dark windows
  for (const tr of torches) {
    const a = clamp((t - tr.t) / 0.4) * (0.75 + 0.25 * Math.sin(t * 5 + tr.t));
    if (a > 0) {
      const sway = Math.sin(t * 1.7 + tr.t) * 8;
      s.push(`<rect x="${tr.win.x}" y="${tr.win.y}" width="34" height="40" fill="#2a3456" opacity="${a.toFixed(2)}"/>`);
      s.push(`<circle cx="${tr.win.x + 17 + sway}" cy="${tr.win.y + 22}" r="16" fill="url(#torch)" opacity="${a.toFixed(2)}"/>`);
    }
  }

  // street
  s.push(`<rect x="-200" y="840" width="${W + 400}" height="34" fill="${mix(C.sidewalk, '#2c303b', dark * 0.5)}"/>`);
  s.push(`<rect x="-200" y="872" width="${W + 400}" height="10" fill="${mix(C.curb, '#383c48', dark * 0.5)}"/>`);
  s.push(`<rect x="-200" y="882" width="${W + 400}" height="${H}" fill="${mix(C.street, '#1a1d26', dark * 0.6)}"/>`);
  for (let x = -60; x < W + 100; x += 220) s.push(`<rect x="${x}" y="975" width="110" height="10" fill="${C.lane}" opacity="${0.55 - 0.3 * dark}"/>`);

  // street lamps
  for (const px of poles) {
    if (L > 0.02) s.push(`<polygon points="${px + 40},430 ${px - 150},880 ${px + 230},880" fill="url(#cone)" opacity="${L.toFixed(2)}"/>`);
    s.push(`<rect x="${px - 6}" y="420" width="12" height="456" fill="${C.pole}"/>`);
    s.push(`<rect x="${px - 6}" y="420" width="70" height="10" fill="${C.pole}"/>`);
    s.push(`<rect x="${px + 22}" y="414" width="44" height="18" rx="4" fill="${C.pole}"/>`);
    s.push(`<rect x="${px + 26}" y="430" width="36" height="7" rx="3" fill="${mix('#3a3f4d', C.lamp, L)}"/>`);
  }
  // traffic light
  {
    const tx = 1290;
    s.push(`<rect x="${tx - 5}" y="660" width="10" height="216" fill="${C.pole}"/>`);
    s.push(`<rect x="${tx - 26}" y="560" width="52" height="128" rx="10" fill="#14171f"/>`);
    const cols = ['#e5483b', '#f2b134', '#4cc36b'];
    cols.forEach((c, i) => {
      const lit = i === 2 ? L : 0;
      s.push(`<circle cx="${tx}" cy="${585 + i * 39}" r="14" fill="${mix('#2a2e38', c, lit)}"/>`);
      if (lit > 0.1) s.push(`<circle cx="${tx}" cy="${585 + i * 39}" r="30" fill="${c}" opacity="${(0.25 * lit).toFixed(2)}"/>`);
    });
  }
  s.push(`</g>`);

  // ---------- overlay UI (not zoomed) ----------
  s.push(`<rect x="0" y="700" width="${W}" height="380" fill="url(#shade)"/>`);
  s.push(pill(t, 'left', 'DAY 0', T.pillIn, null));
  s.push(pill(t, 'right', t < T.pillSwap ? '8:47 PM' : '7 DAYS', T.pillIn + 0.15, t >= T.pillSwap ? T.pillSwap + 0.1 : null));
  if (t >= T.cap1 && t < T.cap1Out + 0.3) s.push(caption(t, 'THE CITY — ', 'GOES DARK.', T.cap1, T.cap1b, T.cap1Out));
  if (t >= T.cap2) s.push(caption(t, '7 DAYS — ', 'NO POWER.', T.cap2, T.cap2b, null));
  s.push(`</svg>`);
  return s.join('\n');
}

function pill(t, side, label, tin, swapAt) {
  const start = swapAt ?? tin;
  const k = spring((t - start) / 0.6);
  if (t < start) return '';
  const fs = 46, padX = 34, h = 82;
  const w = label.length * fs * 0.62 + padX * 2;
  const x = side === 'left' ? 56 : W - 56 - w, y = 46;
  const cx = x + w / 2, cy = y + h / 2;
  return `<g transform="translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})">
    <rect x="${x + 4}" y="${y + 7}" width="${w}" height="${h}" rx="${h / 2}" fill="#000" opacity="0.35"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${C.pill}" stroke="${C.pillInk}" stroke-width="5"/>
    <text x="${cx}" y="${cy + fs * 0.36}" text-anchor="middle" font-family="DejaVu Sans" font-stretch="condensed" font-weight="bold" font-size="${fs}" fill="${C.pillInk}" letter-spacing="1">${label}</text>
  </g>`;
}

function caption(t, a, b, tA, tB, tOut) {
  let op = easeOut((t - tA) / 0.3), dy = (1 - easeOut((t - tA) / 0.35)) * 40;
  if (tOut !== null && t > tOut) { op *= 1 - clamp((t - tOut) / 0.3); }
  const opB = easeOut((t - tB) / 0.3);
  const sB = 1 + 0.18 * (1 - spring((t - tB) / 0.5));
  const fs = 104, y = 1000 + dy;
  return `<g opacity="${op.toFixed(3)}">
    <text xml:space="preserve" x="${W / 2 + 5}" y="${y + 6}" text-anchor="middle" font-family="DejaVu Sans" font-stretch="condensed" font-weight="bold" font-size="${fs}" fill="#000" opacity="0.55">${a}${b}</text>
    <text xml:space="preserve" x="${W / 2}" y="${y}" text-anchor="middle" font-family="DejaVu Sans" font-stretch="condensed" font-weight="bold" font-size="${fs}"><tspan fill="#ffffff">${a}</tspan><tspan fill="${C.orange}" fill-opacity="${opB.toFixed(3)}" font-size="${(fs * (t >= tB ? sB : 1)).toFixed(1)}">${b}</tspan></text>
  </g>`;
}

// ---------- render ----------
async function render() {
  if (ONLY !== null) {
    await sharp(Buffer.from(frameSVG(ONLY))).png().toFile(`preview_${ONLY}.png`);
    return;
  }
  const ff = spawn('ffmpeg', ['-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT], { stdio: ['pipe', 'ignore', 'inherit'] });
  for (let f = 0; f < FRAMES; f++) {
    const buf = await sharp(Buffer.from(frameSVG(f / FPS))).removeAlpha().raw().toBuffer();
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 60 === 0) process.stderr.write(`frame ${f}/${FRAMES}\n`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
}
render();
