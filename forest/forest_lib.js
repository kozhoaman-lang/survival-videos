// Forest asset library for "7 days lost in the forest". Every function returns an SVG string (no <svg> wrapper).
// Ground baseline convention: (x, y) = where the object touches the ground. t = seconds.
const L = require('./lib');
const { W, H, C, FONT, clamp, lerp, mix, easeOut, easeInOut, spring, pulse, rng } = L;

let _uid = 0;
const uid = p => `${p}${_uid++}`;
const mod = (a, n) => ((a % n) + n) % n;
const jit = (i, k = 0) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
const f1 = v => (Math.round(v * 10) / 10);
const G = (x, y, s, inner, extra = '') => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})" ${extra}>${inner}</g>`;
const HZ = 640; // horizon / start of ground

// ---------- palettes ----------
const PAL = {
  day: { skyT: '#7cc4ee', skyB: '#dff3ff', far: '#8dbb9a', mid: '#5aa06c', near: '#3a8656', ground: '#62a24e', groundB: '#4a8a3c', tuft: '#3f7a35',
    pineA: '#2f7d4f', pineB: '#3f9a62', leafA: '#4aa05a', leafB: '#68bd6c', trunk: '#7a4e34', trunkD: '#5e3a28', bush: '#3f9150', bushB: '#58b064',
    rock: '#9aa0ab', rockB: '#bcc2cc', rockD: '#6e7480', dirt: '#b08a5a', dirtD: '#8f6c43', water: '#4aa3d8', waterL: '#c4e9ff', shade: '#000000', fog: '#e6f6ff', log: '#7d5236' },
  dusk: { skyT: '#3d3b78', skyB: '#f2a45f', far: '#6a5b8c', mid: '#473f73', near: '#322e5a', ground: '#4a4a5a', groundB: '#3a3a4c', tuft: '#2f3047',
    pineA: '#2a3158', pineB: '#3a4272', leafA: '#34416b', leafB: '#4b5688', trunk: '#4a3340', trunkD: '#38262f', bush: '#2f3d62', bushB: '#44537f',
    rock: '#6d6f86', rockB: '#8b8da6', rockD: '#4e5068', dirt: '#8a6a58', dirtD: '#6c5043', water: '#5d7fbf', waterL: '#f6b98a', shade: '#1a1240', fog: '#e59a78', log: '#5d3d3a' },
  night: { skyT: '#060a1c', skyB: '#17254a', far: '#16254a', mid: '#101c3a', near: '#0b142c', ground: '#142845', groundB: '#0d1b33', tuft: '#0a1730',
    pineA: '#0e1c36', pineB: '#17294a', leafA: '#13264a', leafB: '#1d3560', trunk: '#1c2440', trunkD: '#141a30', bush: '#102340', bushB: '#1a3560',
    rock: '#3a4766', rockB: '#52628a', rockD: '#26304a', dirt: '#2f3a5a', dirtD: '#222c47', water: '#1b3868', waterL: '#7fa8e8', shade: '#02040c', fog: '#243a6a', log: '#222a46' },
};
const pal = t => PAL[t] || PAL.day;

// ---------- trees / plants / rocks ----------
function pineShape(p, col1, col2, trunk, detail) {
  const tiers = [[-70, -190, 104], [-150, -282, 84], [-232, -372, 62], [-300, -436, 40]];
  let s = `<rect x="-14" y="-90" width="28" height="90" rx="5" fill="${trunk}"/>`;
  tiers.forEach(([b, tp, hw]) => {
    s += `<path d="M${-hw} ${b} Q0 ${b + 18} ${hw} ${b} L0 ${tp} Z" fill="${col1}"/>`;
    if (detail) s += `<path d="M0 ${tp} L${hw} ${b} Q${hw / 2} ${b + 12} 0 ${b + 9} Z" fill="${col2}"/>`;
  });
  return s;
}
function leafyShape(p, col1, col2, trunk, detail) {
  let s = `<path d="M-17 0 Q-12 -90 -8 -190 L8 -190 Q12 -90 17 0 Z" fill="${trunk}"/>`;
  if (detail) s += `<path d="M0 -110 L38 -170" stroke="${trunk}" stroke-width="10" stroke-linecap="round"/>`;
  const cs = [[0, -240, 90], [-72, -190, 66], [72, -190, 66], [-42, -300, 62], [46, -292, 64]];
  cs.forEach(([x, y, r]) => s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${col1}"/>`);
  if (detail) cs.forEach(([x, y, r]) => s += `<circle cx="${x + r * 0.22}" cy="${y - r * 0.25}" r="${r * 0.68}" fill="${col2}" opacity="0.8"/>`);
  return s;
}
// one tree. kind 'pine' | 'leafy'. o: {time, t (sway), shadow}
function tree(x, y, s = 1, kind = 'pine', o = {}) {
  const p = pal(o.time);
  const sway = o.t != null ? Math.sin(o.t * 1.4 + x * 0.013) * 0.9 : 0;
  const shape = kind === 'pine' ? pineShape(p, p.pineA, p.pineB, p.trunk, true) : leafyShape(p, p.leafA, p.leafB, p.trunk, true);
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})">${o.shadow === false ? '' : `<ellipse cx="0" cy="4" rx="${kind === 'pine' ? 90 : 110}" ry="16" fill="#000" opacity="0.22"/>`}<g transform="rotate(${sway.toFixed(2)})">${shape}</g></g>`;
}
function bush(x, y, s = 1, o = {}) {
  const p = pal(o.time);
  const cs = [[0, -50, 52], [-52, -34, 40], [52, -34, 40], [-24, -76, 36], [28, -72, 38]];
  let g = `<ellipse cx="0" cy="3" rx="100" ry="13" fill="#000" opacity="0.22"/>`;
  cs.forEach(([cx, cy, r]) => g += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${p.bush}"/>`);
  cs.forEach(([cx, cy, r]) => g += `<circle cx="${cx + r * 0.25}" cy="${cy - r * 0.25}" r="${r * 0.6}" fill="${p.bushB}" opacity="0.8"/>`);
  if (o.berries) [[-30, -50], [20, -30], [40, -62], [-6, -78], [-52, -28]].forEach(([bx, by]) => g += `<circle cx="${bx}" cy="${by}" r="6" fill="${o.berries}"/>`);
  return G(x, y, s, g);
}
function log(x, y, s = 1, o = {}) {
  const p = pal(o.time);
  const body = `<ellipse cx="0" cy="3" rx="190" ry="16" fill="#000" opacity="0.25"/>
    <rect x="-170" y="-76" width="330" height="74" rx="30" fill="${p.log}"/>
    <rect x="-170" y="-76" width="330" height="26" rx="13" fill="${mix(p.log, '#ffffff', 0.12)}"/>
    <path d="M-120 -60 L-60 -58 M-20 -26 L50 -24 M70 -62 L120 -60 M-140 -30 L-100 -28" stroke="${p.trunkD}" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="160" cy="-39" rx="26" ry="37" fill="${mix(p.log, '#e8c9a0', 0.55)}" stroke="${p.trunkD}" stroke-width="4"/>
    <ellipse cx="160" cy="-39" rx="15" ry="22" fill="none" stroke="${p.trunkD}" stroke-width="3"/><ellipse cx="160" cy="-39" rx="6" ry="9" fill="none" stroke="${p.trunkD}" stroke-width="3"/>
    <path d="M-80 -76 L-100 -112 L-86 -112 L-62 -76 Z" fill="${p.log}"/>
    <ellipse cx="-90" cy="-78" rx="46" ry="10" fill="${p.bush}"/><ellipse cx="-80" cy="-82" rx="28" ry="7" fill="${p.bushB}"/>`;
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${(o.face === -1 ? -s : s)} ${s})">${body}</g>`;
}
function rocks(x, y, s = 1, o = {}) {
  const p = pal(o.time), n = o.n || 3, r = rng(o.seed || 7);
  let g = `<ellipse cx="0" cy="3" rx="${60 + n * 30}" ry="14" fill="#000" opacity="0.22"/>`;
  for (let i = 0; i < n; i++) {
    const cx = (i - (n - 1) / 2) * 70 + (r() - 0.5) * 20, w = 40 + r() * 34, h = 30 + r() * 32;
    g += `<path d="M${cx - w} 0 L${cx - w * 0.8} ${-h * 0.7} L${cx - w * 0.2} ${-h} L${cx + w * 0.55} ${-h * 0.85} L${cx + w} ${-h * 0.2} L${cx + w * 0.9} 0 Z" fill="${p.rock}"/>
      <path d="M${cx - w * 0.2} ${-h} L${cx + w * 0.55} ${-h * 0.85} L${cx + w * 0.2} ${-h * 0.4} L${cx - w * 0.5} ${-h * 0.55} Z" fill="${p.rockB}"/>
      <path d="M${cx + w * 0.2} ${-h * 0.4} L${cx + w} ${-h * 0.2} L${cx + w * 0.9} 0 L${cx + w * 0.1} 0 Z" fill="${p.rockD}" opacity="0.8"/>`;
  }
  return G(x, y, s, g);
}

// ---------- backdrop ----------
function silTree(kind, x, y, s, col, trunk, hl) {
  let g = kind === 'pine' ? pineShape(null, col, hl || col, trunk, !!hl) : leafyShape(null, col, hl || col, trunk, false);
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s.toFixed(3)})">${g}</g>`;
}
// time: 'day'|'dusk'|'night'; clearing 0..1 opens a gap in the middle; pan = camera offset in px (positive = scene slides left)
function forestBackdrop(t, o = {}) {
  const time = o.time || 'day', p = pal(time), pan = o.pan || 0, clearing = o.clearing || 0, seed = o.seed || 1;
  const gid = uid('sky');
  const out = [`<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.skyT}"/><stop offset="1" stop-color="${p.skyB}"/></linearGradient>
    <linearGradient id="${gid}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.ground}"/><stop offset="1" stop-color="${p.groundB}"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#${gid})"/>`];
  // sky bodies
  if (time === 'day') {
    out.push(L.glow(1500, 170, 260, '#fff6c0', 0.5), `<circle cx="1500" cy="170" r="66" fill="#fff3b0"/>`);
    for (let i = 0; i < 5; i++) { const cx = mod(i * 470 + t * 7 - pan * 0.05, W + 500) - 250, cy = 110 + (i % 3) * 70; out.push(`<g opacity="0.92" fill="#fff"><ellipse cx="${cx}" cy="${cy}" rx="110" ry="30"/><ellipse cx="${cx - 50}" cy="${cy - 20}" rx="60" ry="30"/><ellipse cx="${cx + 40}" cy="${cy - 28}" rx="70" ry="34"/></g>`); }
  } else if (time === 'dusk') {
    out.push(L.glow(1330, 560, 700, '#ff9a4a', 0.55), `<circle cx="1330" cy="590" r="105" fill="#ffd08a"/>`);
    for (let i = 0; i < 4; i++) out.push(`<rect x="${mod(i * 520 + t * 5 - pan * 0.05, W + 700) - 400}" y="${150 + i * 70}" width="${420 + (i % 2) * 120}" height="${18 + (i % 2) * 8}" rx="12" fill="#7a5ca0" opacity="0.55"/>`);
  } else {
    const r = rng(seed * 13 + 5);
    for (let i = 0; i < 110; i++) { const sx = r() * W, sy = r() * 520, sr = 0.8 + r() * 1.9, tw = 0.5 + 0.5 * Math.sin(t * (1.2 + r() * 2) + i); out.push(`<circle cx="${sx.toFixed(0)}" cy="${sy.toFixed(0)}" r="${sr.toFixed(1)}" fill="#fff" opacity="${(0.35 + 0.65 * tw).toFixed(2)}"/>`); }
    out.push(L.glow(1480, 160, 340, '#9fc0ff', 0.4), `<circle cx="1480" cy="160" r="68" fill="#f4efd8"/><circle cx="1458" cy="142" r="12" fill="#dcd5b8"/><circle cx="1504" cy="180" r="9" fill="#dcd5b8"/><circle cx="1490" cy="130" r="6" fill="#dcd5b8"/>`);
  }
  // far hills
  const hill = (base, amp, ph, col, f) => { let d = `M-10 ${HZ + 40}`; for (let x = -10; x <= W + 10; x += 40) d += ` L${x} ${(base - amp * (0.5 + 0.5 * Math.sin((x + pan * f) * 0.004 + ph)) - amp * 0.4 * Math.sin((x + pan * f) * 0.011 + ph * 2)).toFixed(1)}`; return `<path d="${d} L${W + 10} ${HZ + 40} Z" fill="${col}"/>`; };
  out.push(hill(HZ - 30, 90, 1 + seed, mix(p.far, p.skyB, 0.35), 0.06), hill(HZ - 5, 60, 3 + seed, p.far, 0.12));
  // ground
  out.push(`<rect x="0" y="${HZ - 8}" width="${W}" height="${H - HZ + 8}" fill="url(#${gid}g)"/>`);
  const cc = 960 - pan, halfClear = clearing * 520;
  if (clearing > 0) {
    out.push(`<ellipse cx="${cc}" cy="${HZ + 60}" rx="${halfClear * 1.45 + 40}" ry="${70 + 80 * clearing}" fill="${time === 'night' ? '#2a4a7e' : time === 'dusk' ? '#f0a070' : '#9fdb7a'}" opacity="${time === 'night' ? 0.35 : 0.5}"/>`);
  }
  // fog bands
  const fog = (y, h, a) => { const id = uid('fog'); return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.fog}" stop-opacity="0"/><stop offset="0.5" stop-color="${p.fog}" stop-opacity="${a}"/><stop offset="1" stop-color="${p.fog}" stop-opacity="0"/></linearGradient></defs><rect x="0" y="${y}" width="${W}" height="${h}" fill="url(#${id})"/>`; };
  // tree rows (far to near)
  const rows = [
    { y: HZ + 6, s: 0.30, sp: 64, f: 0.16, col: mix(p.far, p.mid, 0.4), k: 'a' },
    { y: HZ + 40, s: 0.46, sp: 98, f: 0.3, col: p.mid, k: 'b' },
    { y: HZ + 96, s: 0.74, sp: 150, f: 0.52, col: mix(p.mid, p.near, 0.6), k: 'c', hl: true },
    { y: HZ + 190, s: 1.12, sp: 250, f: 0.82, col: p.near, k: 'd', hl: true },
  ];
  rows.forEach((R, ri) => {
    const m = 130 * R.s, n = Math.ceil((W + 2 * m) / R.sp), span = n * R.sp;
    const arr = [];
    for (let i = 0; i < n; i++) {
      const bx = i * R.sp + jit(i, seed + ri) * R.sp * 0.8;
      const x = mod(bx - pan * R.f + m, span) - m;
      const gap = clearing * (440 - ri * 20);
      if (clearing > 0 && Math.abs(x - (960 - pan * R.f * 0.0)) < gap * (R.y > HZ + 80 ? 1.1 : 0.9)) continue;
      const sc = R.s * (0.8 + jit(i, 9 + ri) * 0.45), kind = jit(i, 3 + ri) > (time === 'night' ? 0.25 : 0.4) ? 'pine' : 'leafy';
      const yy = R.y + (jit(i, 5) - 0.5) * 14 * R.s;
      arr.push([yy, x, sc, kind]);
    }
    arr.sort((a, b) => a[0] - b[0]);
    arr.forEach(([yy, x, sc, kind]) => {
      if (ri >= 2) out.push(`<ellipse cx="${f1(x)}" cy="${f1(yy + 3)}" rx="${(95 * sc).toFixed(0)}" ry="${(14 * sc).toFixed(0)}" fill="#000" opacity="0.2"/>`);
      out.push(silTree(kind, x, yy, sc, R.col, mix(R.col, '#000000', 0.35), R.hl ? mix(R.col, '#ffffff', time === 'night' ? 0.1 : 0.14) : null));
    });
    if (ri === 1) out.push(fog(HZ - 10, 120, time === 'night' ? 0.18 : 0.3));
    if (ri === 2) out.push(fog(HZ + 70, 140, time === 'night' ? 0.1 : 0.16));
  });
  // grass tufts on the ground (moves 1:1 with pan)
  const tr = rng(seed * 31 + 3);
  for (let i = 0; i < 46; i++) {
    const bx = tr() * (W + 300), yy = HZ + 160 + tr() * (H - HZ - 170), x = mod(bx - pan + 150, W + 300) - 150, sc = 0.5 + (yy - HZ) / 500;
    if (clearing > 0 && Math.abs(x - cc) < halfClear * 0.9 && yy < HZ + 260) continue;
    out.push(`<path d="M${f1(x - 10 * sc)} ${f1(yy)} L${f1(x - 6 * sc)} ${f1(yy - 18 * sc)} L${f1(x - 1 * sc)} ${f1(yy)} L${f1(x + 3 * sc)} ${f1(yy - 24 * sc)} L${f1(x + 8 * sc)} ${f1(yy)} L${f1(x + 13 * sc)} ${f1(yy - 15 * sc)} L${f1(x + 14 * sc)} ${f1(yy)} Z" fill="${p.tuft}"/>`);
  }
  return out.join('');
}
// big dark trunks / leaves at the screen edges, draw AFTER characters to frame the shot
function forestForeground(t, o = {}) {
  const p = pal(o.time), pan = o.pan || 0, c = mix(p.near, '#000000', 0.55), tc = mix(p.trunk, '#000000', 0.5);
  const tk = (x, w, lean) => `<path d="M${x - w / 2} ${H + 20} L${x - w / 2 + lean} -20 L${x + w / 2 + lean} -20 L${x + w / 2} ${H + 20} Z" fill="${tc}"/>`;
  const lx = -pan * 1.3, o1 = mod(lx + 120, 2400) - 300, o2 = mod(lx + 1800, 2400) - 300;
  let g = '';
  [[o1, 170, 30], [o2, 120, -20]].forEach(([x, w, l]) => { if (x > -260 && x < W + 260) g += tk(x, w, l); });
  const sw = Math.sin(t * 1.1) * 6;
  g += `<path d="M-20 -10 Q200 ${150 + sw} 420 -10 Z" fill="${c}"/><path d="M${W - 460} -10 Q${W - 220} ${130 - sw} ${W + 20} -10 Z" fill="${c}"/>`;
  return `<g opacity="${o.opacity ?? 1}">${g}</g>`;
}

// ---------- trail ----------
// dirt path from bottom (x0,y0) to the distance (x1,y1); fade 1 = full, 0 = gone (fades into the distance); bend curves it sideways
function trail(t, o = {}) {
  const { x0 = 960, y0 = H + 10, x1 = 1010, y1 = HZ + 6, w0 = 560, w1 = 36, bend = 0, fade = 1 } = o, p = pal(o.time);
  const N = 28, Lp = [], Rp = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, cx = lerp(x0, x1, u) + bend * Math.sin(u * Math.PI) * (1 - u * 0.3), cy = lerp(y0, y1, Math.pow(u, 0.92)), w = lerp(w0, w1, Math.pow(u, 0.7));
    Lp.push(`${f1(cx - w / 2)},${f1(cy)}`); Rp.push(`${f1(cx + w / 2)},${f1(cy)}`);
  }
  const id = uid('tr'), fd = clamp(fade);
  const stops = `<stop offset="0" stop-color="#fff" stop-opacity="${clamp(fd * 2)}"/><stop offset="${clamp(fd).toFixed(2)}" stop-color="#fff" stop-opacity="${clamp(fd * 2)}"/><stop offset="${clamp(fd + 0.3).toFixed(2)}" stop-color="#fff" stop-opacity="0"/>`;
  const r = rng(11);
  let deco = '';
  for (let i = 0; i < 16; i++) { const u = 0.04 + r() * 0.8, cx = lerp(x0, x1, u) + bend * Math.sin(u * Math.PI) * (1 - u * 0.3), cy = lerp(y0, y1, Math.pow(u, 0.92)), w = lerp(w0, w1, Math.pow(u, 0.7)), sc = 1 - u * 0.8; deco += `<ellipse cx="${f1(cx + (r() - 0.5) * w * 0.7)}" cy="${f1(cy)}" rx="${(14 * sc).toFixed(1)}" ry="${(6 * sc).toFixed(1)}" fill="${p.dirtD}"/>`; }
  // two faint wheel/foot ruts
  const rut = k => { let d = ''; for (let i = 0; i <= N; i++) { const u = i / N, cx = lerp(x0, x1, u) + bend * Math.sin(u * Math.PI) * (1 - u * 0.3), cy = lerp(y0, y1, Math.pow(u, 0.92)), w = lerp(w0, w1, Math.pow(u, 0.7)); d += `${i ? 'L' : 'M'}${f1(cx + k * w * 0.18)} ${f1(cy)}`; } return `<path d="${d}" fill="none" stroke="${p.dirtD}" stroke-width="5" opacity="0.5" stroke-dasharray="26 14"/>`; };
  return `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y1}">${stops}</linearGradient><mask id="${id}m"><rect width="${W}" height="${H}" fill="url(#${id})"/></mask></defs>
    <g mask="url(#${id}m)"><polygon points="${Lp.join(' ')} ${Rp.reverse().join(' ')}" fill="${p.dirt}"/>${rut(-1)}${rut(1)}${deco}</g>`;
}

// ---------- stream ----------
// water band across the screen. y = top-left bank y, h = height; slope tilts it (px of y change across width)
function stream(t, o = {}) {
  const { y = 800, h = 170, slope = 0, time } = o, p = pal(time), id = uid('st');
  const top = x => y + slope * (x / W) + Math.sin(x * 0.006 + 1) * 10, bot = x => top(x) + h + Math.sin(x * 0.005) * 12;
  let a = '', b = '';
  for (let x = -20; x <= W + 20; x += 40) { a += `${x},${f1(top(x))} `; }
  for (let x = W + 20; x >= -20; x -= 40) { b += `${x},${f1(bot(x))} `; }
  let g = `<polygon points="${a} ${b}" fill="${mix(p.dirt, p.ground, 0.4)}" transform="translate(0 -12) "/>`; // bank
  g += `<polygon points="${a} ${b}" fill="${p.water}"/>`;
  g += `<defs><clipPath id="${id}"><polygon points="${a} ${b}"/></clipPath></defs><g clip-path="url(#${id})">`;
  for (let i = 0; i < 16; i++) {
    const sp = 40 + jit(i, 2) * 50, x = mod(jit(i, 1) * (W + 300) + t * sp, W + 300) - 150, row = (i % 4) / 3, yy = top(x) + 24 + row * (h - 50) + Math.sin(t * 1.5 + i) * 3, wd = 60 + jit(i, 4) * 80;
    g += `<path d="M${f1(x - wd / 2)} ${f1(yy)} Q${f1(x)} ${f1(yy - 9)} ${f1(x + wd / 2)} ${f1(yy)}" stroke="${p.waterL}" stroke-width="5" fill="none" stroke-linecap="round" opacity="${(0.35 + 0.4 * Math.sin(t * 2 + i) ** 2).toFixed(2)}"/>`;
  }
  // ring ripples
  for (let i = 0; i < 4; i++) {
    const ph = mod(t * 0.5 + i * 0.25, 1), x = 300 + i * 450 + jit(i, 8) * 100, yy = y + h * 0.5 + (i % 2) * 20;
    g += `<ellipse cx="${x}" cy="${f1(top(x) + (yy - y))}" rx="${(10 + ph * 60).toFixed(1)}" ry="${(4 + ph * 18).toFixed(1)}" fill="none" stroke="${p.waterL}" stroke-width="4" opacity="${(1 - ph).toFixed(2)}"/>`;
  }
  g += '</g>';
  g += `<polygon points="${a} ${b}" fill="none" stroke="${mix(p.water, '#000000', 0.25)}" stroke-width="5" opacity="0.5"/>`;
  return g;
}

// ---------- campfire ----------
function tongue(w, h, lean, fill) {
  return `<path d="M${-w} 0 C${-w * 1.05} ${-h * 0.32} ${-w * 0.35} ${-h * 0.58} ${lean} ${-h} C${w * 0.35} ${-h * 0.58} ${w * 1.05} ${-h * 0.32} ${w} 0 Z" fill="${fill}"/>`;
}
// ground-level center (x,y). o: {smoky, pot, bubbles 0..1, lit 0..1, stones, time}
function campfire(t, x, y, s = 1, o = {}) {
  const { smoky = false, pot = false, bubbles = 0, lit = 1, stones = true } = o, p = pal(o.time);
  const back = [], front = [];
  if (stones) {
    const n = 11;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.2, sx = Math.cos(a) * 92, sy = Math.sin(a) * 28, r = 17 + jit(i, 4) * 8;
      const st = `<ellipse cx="${f1(sx)}" cy="${f1(sy + 6)}" rx="${r + 2}" ry="${r * 0.5}" fill="#000" opacity="0.25"/><ellipse cx="${f1(sx)}" cy="${f1(sy - 3)}" rx="${r}" ry="${r * 0.75}" fill="${p.rock}"/><ellipse cx="${f1(sx - r * 0.2)}" cy="${f1(sy - r * 0.35)}" rx="${r * 0.55}" ry="${r * 0.3}" fill="${p.rockB}"/>`;
      (Math.sin(a) < 0 ? back : front).push(st);
    }
  }
  let g = '';
  if (lit > 0) {
    const id = uid('fg');
    g += `<defs><radialGradient id="${id}"><stop offset="0" stop-color="#ff9a3a" stop-opacity="${(0.55 * lit * (0.9 + 0.1 * Math.sin(t * 9))).toFixed(2)}"/><stop offset="1" stop-color="#ff9a3a" stop-opacity="0"/></radialGradient></defs><ellipse cx="0" cy="-60" rx="${(340).toFixed(0)}" ry="${(250).toFixed(0)}" fill="url(#${id})"/>`;
  }
  g += back.join('');
  if (pot) g += `<path d="M-120 6 L-6 -196" stroke="${p.trunkD}" stroke-width="11" stroke-linecap="round"/><path d="M30 -12 L6 -196" stroke="${p.trunk}" stroke-width="9" stroke-linecap="round"/>`;
  g += `<g transform="rotate(-10 0 -10)"><rect x="-76" y="-26" width="150" height="26" rx="12" fill="${p.trunkD}"/><ellipse cx="74" cy="-13" rx="6" ry="13" fill="#c9a06a"/></g>
    <g transform="rotate(12 0 -10)"><rect x="-74" y="-22" width="148" height="24" rx="11" fill="${p.trunk}"/></g>
    <ellipse cx="0" cy="-8" rx="52" ry="12" fill="#ff6a2a" opacity="${(0.9 * lit).toFixed(2)}"/>`;
  if (lit > 0) {
    const fh = (pot ? 105 : 150) * lit;
    const fl = (cx, h, w, ph, fill, lw = 1) => `<g transform="translate(${cx} -8)">${tongue(w * lw, h * (0.82 + 0.18 * Math.sin(t * 11 + ph)) * (0.9 + 0.1 * Math.sin(t * 17 + ph * 2)), Math.sin(t * 6 + ph) * 12, fill)}</g>`;
    g += fl(-40, fh * 0.65, 30, 0.5, '#ff6a2a') + fl(42, fh * 0.7, 30, 2.1, '#ff6a2a') + fl(0, fh, 46, 1.3, '#ff7a2e');
    g += fl(-18, fh * 0.62, 24, 3.2, '#ffb02e') + fl(20, fh * 0.7, 24, 4.4, '#ffb02e') + fl(0, fh * 0.72, 30, 0.2, '#ffb02e');
    g += fl(0, fh * 0.42, 17, 5.1, '#fff1a8');
    for (let i = 0; i < 7; i++) {
      const ph = mod(t * 0.7 + i / 7, 1), sx = Math.sin(i * 2.1 + t * 2) * 40 * ph + (jit(i, 1) - 0.5) * 70, sy = -40 - ph * 230 * (pot ? 0.8 : 1);
      g += `<circle cx="${f1(sx)}" cy="${f1(sy)}" r="${(4 * (1 - ph) + 1).toFixed(1)}" fill="#ffd36b" opacity="${(1 - ph).toFixed(2)}"/>`;
    }
  }
  if (pot) {
    const wob = Math.sin(t * 3) * 1.2;
    g += `<path d="M0 -196 L0 -178" stroke="#444" stroke-width="5"/>
      <path d="M-62 -178 Q0 -206 62 -178" stroke="#444" stroke-width="6" fill="none"/>
      <path d="M-54 -172 L-48 -104 Q0 -92 48 -104 L54 -172 Z" fill="#6c7484"/><path d="M-54 -172 L-48 -104 Q-30 -98 -22 -97 L-22 -172 Z" fill="#9aa3b2" opacity="0.7"/><rect x="-48" y="-150" width="96" height="9" fill="#4d5463" opacity="0.5"/>
      <ellipse cx="0" cy="-172" rx="54" ry="11" fill="#4d5463"/><ellipse cx="0" cy="-171" rx="47" ry="8" fill="${mix(p.water, '#ffffff', 0.15)}"/>`;
    const nb = Math.round(bubbles * 9);
    for (let i = 0; i < nb; i++) {
      const ph = mod(t * (1.4 + jit(i, 3)) + jit(i, 2), 1), bx = (jit(i, 5) - 0.5) * 70, r = 3 + jit(i, 6) * 5;
      g += `<circle cx="${f1(bx)}" cy="${f1(-172 - ph * 3)}" r="${(r * (0.4 + ph * 0.8)).toFixed(1)}" fill="#fff" opacity="${(0.9 - ph * 0.7).toFixed(2)}" stroke="${p.waterL}" stroke-width="1.5"/>`;
    }
    if (bubbles > 0.5) for (let i = 0; i < 3; i++) {
      const ph = mod(t * 0.6 + i / 3, 1);
      g += `<path d="M${-20 + i * 20} ${-185 - ph * 90} q10 -16 0 -30 t0 -30" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="${((1 - ph) * 0.55 * bubbles).toFixed(2)}"/>`;
    }
  }
  g += front.join('');
  if (smoky && lit > 0) {
    const N = 16, sm = mix(p.rockB, '#ffffff', 0.15), sd = mix(p.rockD, '#8a8f9c', 0.5);
    for (let i = 0; i < N; i++) {
      const ph = mod(t * 0.14 + i / N, 1), yy = -60 - ph * 940, xx = Math.sin(ph * 5 + i * 1.7) * (20 + ph * 50) + ph * ph * 90, r = 22 + ph * 70;
      g += `<circle cx="${f1(xx)}" cy="${f1(yy)}" r="${r.toFixed(1)}" fill="${mix(sd, sm, ph)}" opacity="${(Math.min(1, ph * 9) * (1 - ph) * 0.7).toFixed(2)}"/>`;
    }
  }
  return G(x, y, s, g);
}

// ---------- lean-to shelter ----------
// ground point (x,y). progress 0..1: log -> branches one by one -> leaf cover -> thick leaf bed. Open side faces the viewer
function shelter(x, y, s = 1, progress = 1, o = {}) {
  const p = pal(o.time), pr = clamp(progress), TOP = -150, DX = 190, N = 9;
  let g = `<ellipse cx="0" cy="4" rx="330" ry="18" fill="#000" opacity="0.22"/>`;
  g += `<polygon points="14,-142 14,0 190,0" fill="#2a2024" opacity="0.9"/>`;
  g += `<rect x="-262" y="-152" width="276" height="148" rx="66" fill="${p.log}"/><rect x="-262" y="-152" width="276" height="48" rx="24" fill="${mix(p.log, '#ffffff', 0.12)}"/>
    <path d="M-210 -118 L-130 -116 M-170 -50 L-80 -48 M-60 -100 L-6 -98" stroke="${p.trunkD}" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="-222" cy="-78" rx="26" ry="62" fill="${mix(p.log, '#e8c9a0', 0.5)}" stroke="${p.trunkD}" stroke-width="5"/><ellipse cx="-222" cy="-78" rx="13" ry="32" fill="none" stroke="${p.trunkD}" stroke-width="4"/><ellipse cx="-222" cy="-78" rx="4" ry="10" fill="none" stroke="${p.trunkD}" stroke-width="3"/>`;
  // thick leaf bed (last stage)
  const bedCols = ['#d9a441', '#c9742f', '#9aa83c', '#e0b84f', '#b5652c'];
  const bedK = clamp((pr - 0.8) / 0.2); let bed = '';
  for (let i = 0; i < 30; i++) {
    const k = clamp(bedK * 1.6 - i * 0.025);
    if (k <= 0) continue;
    const row = Math.floor(i / 10), col = i % 10, bx = 34 + col * 15 + (row % 2) * 7 + (jit(i, 1) - 0.5) * 8, by = -6 - row * 11 - Math.sin(col / 9 * Math.PI) * 6 * row;
    bed += `<g transform="translate(${f1(bx)} ${f1(by)}) rotate(${f1((jit(i, 3) - 0.5) * 60)}) scale(${spring(k).toFixed(2)})"><ellipse rx="28" ry="10" fill="${bedCols[i % 5]}" stroke="#00000022" stroke-width="2"/><path d="M-20 0 L20 0" stroke="#00000033" stroke-width="2"/></g>`;
  }
  // straight parallel branches, all at the same angle
  for (let i = 0; i < N; i++) {
    const k = easeOut(clamp((pr - 0.05 - i * 0.055) / 0.1));
    if (k <= 0) continue;
    const tx = -56 + i * 8, ty = TOP + 1, bx = tx + DX, by = 2;
    g += `<line x1="${tx}" y1="${ty}" x2="${f1(lerp(tx, bx, k))}" y2="${f1(lerp(ty, by, k))}" stroke="${i % 2 ? p.trunk : p.trunkD}" stroke-width="11" stroke-linecap="round"/>`;
  }
  // leaf cover over the branches
  const ang = Math.atan2(-TOP, DX) * 180 / Math.PI, nx = Math.sin(ang * Math.PI / 180), ny = -Math.cos(ang * Math.PI / 180), cover = clamp((pr - 0.55) / 0.25);
  if (cover > 0) g += `<polygon points="-62,-156 20,-156 ${DX + 24},6 ${DX - 52},6" fill="${p.bush}" opacity="${cover.toFixed(2)}"/>`;
  const greens = [p.bush, p.bushB, p.leafA, p.leafB];
  for (let i = 0; i < 50; i++) {
    const k = clamp((pr - 0.55 - (i % 10) * 0.012) / 0.08 * 1.0 - Math.floor(i / 10) * 0.0);
    if (k <= 0 || pr < 0.55 + (i / 50) * 0.2) continue;
    const u = 0.04 + (i % 10) / 9 * 0.9, row = Math.floor(i / 10) - 2;
    const cx = lerp(-24, DX - 30, u) + nx * row * 9 + (jit(i, 4) - 0.5) * 10, cy = lerp(TOP, -2, u) + ny * row * 9 + (jit(i, 5) - 0.5) * 8;
    g += `<g transform="translate(${f1(cx)} ${f1(cy)}) rotate(${f1(ang + (jit(i, 6) - 0.5) * 60)}) scale(${spring(clamp(k)).toFixed(2)})"><ellipse rx="30" ry="11" fill="${greens[i % 4]}"/><path d="M-22 0 L22 0" stroke="#00000033" stroke-width="2"/></g>`;
  }
  return G(x, y, s * 1.5, g + bed);
}

// ---------- whistle + sound waves ----------
const whistleIcon = `<g transform="rotate(-18)"><path d="M-6 -40 Q-6 -78 22 -74" stroke="${C.orange}" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="26" cy="-72" r="9" fill="none" stroke="#b9bfca" stroke-width="5"/>
  <rect x="-64" y="-16" width="60" height="32" rx="10" fill="#c9ced8"/><rect x="-64" y="-16" width="60" height="12" rx="6" fill="#eef1f6"/>
  <circle cx="22" cy="6" r="42" fill="#d5dae4" stroke="#7d8696" stroke-width="5"/><circle cx="22" cy="6" r="26" fill="#aab2c0"/><ellipse cx="22" cy="-14" rx="12" ry="5" fill="#505867"/>
  <rect x="-46" y="-28" width="30" height="14" rx="4" fill="#7d8696"/></g>`;
const whistle = (x, y, s = 1) => G(x, y, s, whistleIcon);
// three expanding bursts of arcs. (x,y) = source, dir in degrees (0 = right), t0 = first burst start
function whistleWaves(t, x, y, s = 1, o = {}) {
  const { t0 = 0, dir = 0, period = 0.85, dur = 1.5, bursts = 3, color = '#ffffff' } = o;
  let g = '';
  for (let b = 0; b < bursts; b++) {
    const k = (t - t0 - b * period) / dur;
    if (k < 0 || k > 1) continue;
    for (let a = 0; a < 2; a++) {
      const kk = clamp(k - a * 0.12); if (kk <= 0) continue;
      const r = 70 + easeOut(kk) * 560, half = 0.62 - 0.1 * kk, w = 16 * (1 - kk) + 3;
      const x1 = Math.cos(-half) * r, y1 = Math.sin(-half) * r, x2 = Math.cos(half) * r, y2 = Math.sin(half) * r;
      g += `<path d="M${f1(x1)} ${f1(y1)} A${r} ${r} 0 0 1 ${f1(x2)} ${f1(y2)}" stroke="${color}" stroke-width="${w.toFixed(1)}" fill="none" stroke-linecap="round" opacity="${((1 - kk) * 0.9).toFixed(2)}"/>`;
    }
  }
  return `<g transform="translate(${x} ${y}) scale(${s}) rotate(${dir})">${g}</g>`;
}

// ---------- signal mirror ----------
// mirror held at (x,y); beam goes to target [tx,ty]; flash: 'auto' (pulsing) or 0..1
function signalMirror(t, x, y, s = 1, o = {}) {
  const [tx, ty] = o.target || [x + 700, y - 700];
  const on = o.flash === undefined || o.flash === 'auto' ? (mod(t * 2.4, 1) < 0.5 ? 1 : 0.0) : o.flash;
  const ang = Math.atan2(ty - y, tx - x), d = Math.hypot(tx - x, ty - y), id = uid('bm');
  let g = '';
  if (on > 0) {
    const nx = -Math.sin(ang), ny = Math.cos(ang);
    g += `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x}" y1="${y}" x2="${tx}" y2="${ty}"><stop offset="0" stop-color="#fffbe0" stop-opacity="${0.95 * on}"/><stop offset="1" stop-color="#fff2a0" stop-opacity="0"/></linearGradient></defs>
      <polygon points="${f1(x + nx * 14)},${f1(y + ny * 14)} ${f1(tx + nx * 70)},${f1(ty + ny * 70)} ${f1(tx - nx * 70)},${f1(ty - ny * 70)} ${f1(x - nx * 14)},${f1(y - ny * 14)}" fill="url(#${id})"/>`;
  }
  let m = `<g transform="rotate(${f1(ang * 180 / Math.PI - 90 + 180)})"><rect x="-10" y="30" width="20" height="46" rx="8" fill="${C.skin}"/></g>`;
  m += `<g transform="rotate(${f1(ang * 180 / Math.PI + 180 - 35)})"><rect x="-52" y="-42" width="104" height="84" rx="12" fill="#6c7484"/><rect x="-44" y="-34" width="88" height="68" rx="7" fill="#cde9ff"/><path d="M-44 -34 L-6 -34 L-44 20 Z" fill="#fff" opacity="0.8"/><path d="M14 34 L44 34 L44 4 Z" fill="#8cc0ee"/><circle cx="0" cy="0" r="5" fill="#6c7484"/></g>`;
  if (on > 0) {
    const r = 55 + 25 * Math.sin(t * 40);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.3; m += `<line x1="${f1(Math.cos(a) * 40)}" y1="${f1(Math.sin(a) * 40)}" x2="${f1(Math.cos(a) * r * (i % 2 ? 0.8 : 1.25))}" y2="${f1(Math.sin(a) * r * (i % 2 ? 0.8 : 1.25))}" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="${on}"/>`; }
    m += `<circle r="20" fill="#fff" opacity="${on}"/>`;
  }
  return g + G(x, y, s, m);
}

// ---------- SOS in stones ----------
const STROKES = {
  S: [[0.92, 0.16], [0.75, 0.03], [0.3, 0.03], [0.1, 0.2], [0.14, 0.4], [0.5, 0.5], [0.88, 0.62], [0.92, 0.82], [0.72, 0.97], [0.3, 0.97], [0.08, 0.84]],
  O: Array.from({ length: 25 }, (_, i) => [0.5 + 0.46 * Math.cos(i / 24 * Math.PI * 2 - Math.PI / 2), 0.5 + 0.48 * Math.sin(i / 24 * Math.PI * 2 - Math.PI / 2)]),
};
function sample(pts, n) {
  const seg = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
  const out = [];
  for (let k = 0; k < n; k++) {
    let d = (k / (n - 1)) * tot, i = 0;
    while (i < seg.length - 1 && d > seg[i]) { d -= seg[i]; i++; }
    const u = seg[i] ? d / seg[i] : 0; out.push([lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)]);
  }
  return out;
}
// (x,y) = bottom-center of the sign on the ground; w = total width. progress 0..1 reveals stone by stone, S -> O -> S
function sosRocks(x, y, w = 1000, progress = 1, o = {}) {
  const p = pal(o.time), depth = o.depth ?? 190, lw = w * 0.29, gap = (w - 3 * lw) / 2;
  const stones = [];
  ['S', 'O', 'S'].forEach((ch, li) => {
    const pts = sample(STROKES[ch], ch === 'O' ? 22 : 20);
    const cx = -w / 2 + lw / 2 + li * (lw + gap);
    pts.forEach(([u, v], k) => {
      const sx = x + (cx + (u - 0.5) * lw) * lerp(0.8, 1, v), sy = y - (1 - v) * depth, rx = lerp(0.62, 1, v) * lw * 0.08;
      stones.push({ sx, sy, rx, k: stones.length });
    });
  });
  const N = stones.length, r = rng(3);
  let g = '';
  stones.sort((a, b) => a.sy - b.sy);
  stones.forEach(st => {
    const k = clamp(progress * (N + 3) - st.k);
    if (k <= 0) return;
    const sc = spring(clamp(k)) * (1 + 0.1 * (r() - 0.5)), rx = st.rx * (0.85 + jit(st.k, 6) * 0.35) * sc, ry = rx * 0.62;
    g += `<ellipse cx="${f1(st.sx + 4)}" cy="${f1(st.sy + ry * 0.7)}" rx="${(rx * 1.1).toFixed(1)}" ry="${(ry * 0.8).toFixed(1)}" fill="#000" opacity="0.3"/>
      <ellipse cx="${f1(st.sx)}" cy="${f1(st.sy)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="#f2f4f8" stroke="${p.rockD}" stroke-width="3"/><ellipse cx="${f1(st.sx - rx * 0.2)}" cy="${f1(st.sy - ry * 0.25)}" rx="${(rx * 0.55).toFixed(1)}" ry="${(ry * 0.4).toFixed(1)}" fill="#fff"/>`;
  });
  return g;
}

// ---------- flag ----------
// red cloth on a stick, stuck in the ground at (x,y), waving. o: {color, h (stick height)}
function flag(t, x, y, s = 1, o = {}) {
  const col = o.color || C.red, h = o.h || 330, wd = 190, hh = 120, N = 10;
  let g = `<ellipse cx="0" cy="5" rx="50" ry="10" fill="#000" opacity="0.25"/><rect x="-5" y="${-h}" width="10" height="${h}" rx="4" fill="#7a4e34"/><circle cx="0" cy="${-h - 2}" r="7" fill="#5e3a28"/>
    <path d="M-36 2 L-14 -22 L8 -26 L30 2 Z" fill="#8a8f9b"/><path d="M-14 -22 L8 -26 L18 -6 L-6 -4 Z" fill="#a8adb9"/>`;
  const top = [], bot = [], amp = 20;
  for (let i = 0; i <= N; i++) {
    const u = i / N, off = Math.sin(t * 6.5 - u * 5.5) * amp * u, ox = 5 + u * wd * (1 - 0.06 * Math.abs(Math.sin(t * 6.5 - u * 5.5))), top0 = -h + 8 + off, bot0 = -h + 8 + hh + off * 1.1 + u * 8;
    top.push([ox, top0]); bot.push([ox, bot0]);
  }
  for (let i = 0; i < N; i++) {
    const sh = Math.cos(t * 6.5 - ((i + 0.5) / N) * 5.5);
    g += `<polygon points="${top[i].map(f1)} ${top[i + 1].map(f1)} ${bot[i + 1].map(f1)} ${bot[i].map(f1)}" fill="${mix(col, sh > 0 ? '#ffffff' : '#000000', Math.abs(sh) * 0.14)}" stroke="${mix(col, sh > 0 ? '#ffffff' : '#000000', Math.abs(sh) * 0.14)}" stroke-width="1"/>`;
  }
  return G(x, y, s, g);
}

// ---------- helicopter ----------
// (x,y) = center of the body; facing 1 = nose right. Original shape: round red cabin, white stripe, tail boom
function helicopter(t, x, y, s = 1, facing = 1, o = {}) {
  const bob = Math.sin(t * 3) * 4 * s, tilt = (o.tilt ?? 4) + Math.sin(t * 1.7) * 1.5, a = t * 41;
  const blur = o.blur ?? 1;
  let g = `<g transform="rotate(${tilt.toFixed(2)})">
    <path d="M-70 -18 L-250 -34 L-262 -14 L-70 30 Z" fill="${C.red}"/><path d="M-236 -32 L-262 -78 L-224 -74 L-206 -33 Z" fill="#c23a2f"/>
    <g transform="translate(-248 -32)"><ellipse rx="${(6 + 22 * Math.abs(Math.cos(a * 1.3))).toFixed(1)}" ry="30" fill="#2b3040" opacity="0.55"/><rect x="-4" y="-30" width="8" height="60" rx="4" fill="#3b3f4a" transform="rotate(${(a * 40 % 360).toFixed(0)})" opacity="0.8"/></g>
    <ellipse cx="0" cy="0" rx="112" ry="68" fill="${C.red}"/><path d="M-110 20 Q0 70 108 22 L100 36 Q0 80 -104 38 Z" fill="#fff" opacity="0.9"/>
    <path d="M12 -52 Q92 -50 104 -4 L18 -2 Z" fill="#bfe3ff" stroke="#3b3f4a" stroke-width="5" stroke-linejoin="round"/><path d="M30 -46 L52 -46 L34 -8 L18 -8 Z" fill="#fff" opacity="0.6"/>
    <rect x="-70" y="-30" width="64" height="44" rx="8" fill="#a82e25"/>
    <line x1="-60" y1="78" x2="90" y2="78" stroke="#3b3f4a" stroke-width="8" stroke-linecap="round"/><path d="M-40 54 L-46 78 M50 58 L54 78" stroke="#3b3f4a" stroke-width="7"/><path d="M90 78 Q112 80 118 66" stroke="#3b3f4a" stroke-width="8" fill="none" stroke-linecap="round"/>
    <rect x="-8" y="-86" width="16" height="22" fill="#3b3f4a"/>
    <ellipse cx="0" cy="-88" rx="250" ry="${(8 + 6 * blur).toFixed(1)}" fill="#2b3040" opacity="${(0.22 * blur).toFixed(2)}"/>
    <line x1="${f1(-240 * Math.cos(a))}" y1="-88" x2="${f1(240 * Math.cos(a))}" y2="-88" stroke="#2b3040" stroke-width="9" stroke-linecap="round" opacity="0.85"/>
    <line x1="${f1(-240 * Math.cos(a + 1.57))}" y1="-89" x2="${f1(240 * Math.cos(a + 1.57))}" y2="-89" stroke="#3b3f4a" stroke-width="7" stroke-linecap="round" opacity="0.6"/>
    <circle cx="0" cy="-88" r="12" fill="#3b3f4a"/>`;
  if (o.light) g += `<circle cx="102" cy="30" r="9" fill="#fff6b0"/>`;
  g += '</g>';
  return `<g transform="translate(${f1(x)} ${f1(y + bob)}) scale(${s * facing} ${s})">${g}</g>`;
}
// tiny distant helicopter: dark dot + spinning blur, optionally blinking light
function helicopterFar(t, x, y, s = 1, facing = 1) {
  const a = t * 41, bob = Math.sin(t * 2.3 + x) * 3;
  return `<g transform="translate(${f1(x)} ${f1(y + bob)}) scale(${s * facing} ${s})" opacity="0.92"><path d="M-18 0 L-70 -6 L-70 2 L-16 8 Z" fill="#2c2f3d"/><ellipse cx="0" cy="2" rx="26" ry="15" fill="#2c2f3d"/><ellipse cx="0" cy="-20" rx="62" ry="3.5" fill="#2c2f3d" opacity="0.35"/><line x1="${f1(-58 * Math.cos(a))}" y1="-20" x2="${f1(58 * Math.cos(a))}" y2="-20" stroke="#2c2f3d" stroke-width="3"/><circle cx="-70" cy="-2" r="3" fill="#2c2f3d"/>${Math.sin(t * 6) > 0 ? '<circle cx="-4" cy="18" r="4" fill="#ff4a3a"/>' : ''}</g>`;
}

// ---------- phone screen ----------
// center (x,y). o: {battery 0..100, airplane, bars 0..4, noService, time:'3:12', message}
function phone(t, x, y, s = 1, o = {}) {
  const batt = clamp((o.battery ?? 18) / 100), bars = o.bars ?? 0, air = o.airplane ?? false, nos = o.noService ?? (bars === 0 && !air);
  const low = batt <= 0.2, bc = low ? (Math.sin(t * 7) > -0.3 ? C.red : '#7a2a26') : C.green;
  let g = `<rect x="-205" y="-370" width="410" height="740" rx="56" fill="#14161c"/><rect x="-185" y="-350" width="370" height="700" rx="40" fill="#18223a"/>
    <rect x="-50" y="-340" width="100" height="22" rx="11" fill="#14161c"/>`;
  // left: signal / no service
  g += `<g transform="translate(-166 -300)">`;
  for (let i = 0; i < 4; i++) g += `<rect x="${i * 14}" y="${24 - (i + 1) * 7}" width="9" height="${(i + 1) * 7}" rx="2" fill="#fff" opacity="${i < bars ? 1 : 0.22}"/>`;
  if (bars === 0 && !air) g += `<line x1="-4" y1="30" x2="58" y2="-8" stroke="${C.red}" stroke-width="5" stroke-linecap="round"/>`;
  g += `</g>`;
  if (air) g += `<g transform="translate(-60 -288) rotate(-45) scale(0.9)"><path d="M0 -22 L5 -6 L26 6 L26 12 L5 7 L3 18 L10 24 L10 28 L0 25 L-10 28 L-10 24 L-3 18 L-5 7 L-26 12 L-26 6 L-5 -6 Z" fill="#fff"/></g>`;
  // battery
  g += `<rect x="70" y="-306" width="80" height="36" rx="8" fill="none" stroke="#fff" stroke-width="4"/><rect x="152" y="-296" width="8" height="16" rx="2" fill="#fff"/><rect x="76" y="-300" width="${68 * batt}" height="24" rx="4" fill="${bc}"/>
    <text x="40" y="-278" text-anchor="end" ${FONT} font-size="30" fill="${low ? '#ff9a8f' : '#fff'}">${Math.round(batt * 100)}%</text>`;
  // clock and center content
  g += `<text x="0" y="-130" text-anchor="middle" ${FONT} font-size="116" fill="#fff" opacity="0.92">${o.time || '3:12'}</text>`;
  if (air) g += `<g transform="translate(0 20)"><circle r="82" fill="#f2b134"/><g transform="rotate(-45) scale(2.3)"><path d="M0 -22 L5 -6 L26 6 L26 12 L5 7 L3 18 L10 24 L10 28 L0 25 L-10 28 L-10 24 L-3 18 L-5 7 L-26 12 L-26 6 L-5 -6 Z" fill="#18223a"/></g></g><text x="0" y="170" text-anchor="middle" ${FONT} font-size="40" fill="#f2b134">AIRPLANE MODE</text>`;
  else if (nos) g += `<g transform="translate(0 10)">${[0, 1, 2, 3].map(i => `<rect x="${-62 + i * 34}" y="${42 - (i + 1) * 24}" width="22" height="${(i + 1) * 24}" rx="5" fill="#fff" opacity="0.2"/>`).join('')}<line x1="-86" y1="64" x2="78" y2="-60" stroke="${C.red}" stroke-width="14" stroke-linecap="round"/></g><text x="0" y="170" text-anchor="middle" ${FONT} font-size="54" fill="${C.red}">NO SERVICE</text>`;
  else g += `<g transform="translate(0 10)">${[0, 1, 2, 3].map(i => `<rect x="${-62 + i * 34}" y="${42 - (i + 1) * 24}" width="22" height="${(i + 1) * 24}" rx="5" fill="${C.green}" opacity="${i < bars ? 1 : 0.2}"/>`).join('')}</g>`;
  if (o.message) g += `<text x="0" y="262" text-anchor="middle" ${FONT} font-size="34" fill="#cfe0ff">${o.message}</text>`;
  g += `<rect x="-60" y="330" width="120" height="8" rx="4" fill="#fff" opacity="0.4"/>`;
  return G(x, y, s, g);
}

// ---------- trash-bag poncho (overlay for L.character) ----------
// pass the SAME x,y,s,face (and bob) you give character(). progress 0..1 pulls it on from the top; face hole shows the face
function poncho(t, x, y, s = 1, o = {}) {
  const { face = 1, progress = 1, bob = 0 } = o, pr = easeInOut(clamp(progress));
  if (pr <= 0) return '';
  const id = uid('pc'), rus = Math.sin(t * 5) * 3, N = 9;
  let hem = '', hl = '';
  const bot = -108;
  for (let i = 0; i <= N; i++) { const px = -134 + i * (268 / N); hem += ` L${f1(px)} ${f1(bot + (i % 2 ? 14 : -4) + rus * (i % 3 === 0 ? 1 : -0.5))}`; }
  const cape = `M-96 -312 Q-138 -300 -134 -214 L-138 ${bot}${hem} L138 ${bot} L134 -214 Q138 -300 96 -312 Z`;
  const g = `<defs><clipPath id="${id}"><rect x="-200" y="-540" width="400" height="${(pr * 450).toFixed(1)}"/></clipPath></defs><g clip-path="url(#${id})">
    <path d="${cape}" fill="#2f4a3a"/>
    <path d="M-110 -330 Q-126 -280 -122 -200 L-104 -200 Q-106 -280 -92 -334 Z" fill="#7fb097" opacity="0.7"/>
    <path d="M40 -326 L90 -250 L74 -246 L28 -320 Z M62 -200 L96 -150 L84 -146 L52 -196 Z" fill="#8fc2a8" opacity="0.55"/>
    <path d="M-60 -290 L-30 -230 M30 -300 L10 -240 M-100 -170 L-70 -130 M70 -180 L100 -140" stroke="#1b2d23" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
    <rect x="-136" y="-216" width="272" height="20" fill="#9aa3b2"/><rect x="-136" y="-216" width="272" height="7" fill="#c9ced8"/>
    <path d="M-96 -408 a96 112 0 1 0 192 0 a96 112 0 1 0 -192 0 Z M-56 -366 a56 48 0 1 0 112 0 a56 48 0 1 0 -112 0 Z" fill="#375a45" fill-rule="evenodd"/>
    <path d="M-76 -470 Q-60 -496 -20 -506" stroke="#8fc2a8" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.9"/>
    <ellipse cx="0" cy="-366" rx="56" ry="48" fill="none" stroke="#1b2d23" stroke-width="5"/>
  </g>`;
  return `<g transform="translate(${x} ${y + bob}) scale(${s * face} ${s})">${g}</g>`;
}

// ---------- plants ----------
function mushrooms(x, y, s = 1, o = {}) {
  const kind = o.kind || 'mix';
  const one = (cx, h, w, cap, dots, stem = '#f1e7d0') => `<g transform="translate(${cx} 0)"><path d="M${-w * 0.2} 0 Q${-w * 0.25} ${-h * 0.5} ${-w * 0.18} ${-h} L${w * 0.18} ${-h} Q${w * 0.25} ${-h * 0.5} ${w * 0.2} 0 Z" fill="${stem}"/>
    <path d="M${-w} ${-h} Q${-w} ${-h - w * 0.95} 0 ${-h - w * 0.95} Q${w} ${-h - w * 0.95} ${w} ${-h} Q0 ${-h + w * 0.18} ${-w} ${-h} Z" fill="${cap}"/>
    ${dots ? `<circle cx="${-w * 0.4}" cy="${-h - w * 0.45}" r="${w * 0.14}" fill="#fff"/><circle cx="${w * 0.25}" cy="${-h - w * 0.6}" r="${w * 0.17}" fill="#fff"/><circle cx="${w * 0.58}" cy="${-h - w * 0.28}" r="${w * 0.1}" fill="#fff"/><circle cx="${-w * 0.05}" cy="${-h - w * 0.25}" r="${w * 0.09}" fill="#fff"/>` : ''}</g>`;
  let g = `<ellipse cx="0" cy="3" rx="90" ry="10" fill="#000" opacity="0.2"/>`;
  if (kind === 'red') g += one(-40, 50, 34, '#e5483b', true) + one(30, 70, 44, '#e5483b', true) + one(80, 34, 24, '#e5483b', true);
  else if (kind === 'brown') g += one(-40, 50, 34, '#a8704a', false) + one(30, 70, 44, '#8a5a3c', false) + one(80, 34, 24, '#b98558', false);
  else g += one(-46, 44, 30, '#a8704a', false) + one(8, 78, 48, '#e5483b', true) + one(66, 38, 26, '#d9c7a0', false, '#efe3c6');
  return G(x, y, s, g);
}
function berries(x, y, s = 1, o = {}) {
  const col = o.color || '#d6306a', hi = '#ffffff';
  let g = `<path d="M0 0 Q-6 -80 4 -150" stroke="#3f7a35" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  [[-1, -60], [1, -95], [-1, -125]].forEach(([d, yy]) => g += `<path d="M${d * 2} ${yy} q${d * 50} -30 ${d * 70} ${-6} q${-d * 24} 30 ${-d * 70} 6 Z" fill="#4aa05a"/>`);
  [[-22, -150], [4, -166], [28, -146], [-8, -132], [16, -126], [-30, -120], [38, -120]].forEach(([bx, by]) => g += `<circle cx="${bx}" cy="${by}" r="14" fill="${col}"/><circle cx="${bx - 4}" cy="${by - 5}" r="4" fill="${hi}" opacity="0.7"/>`);
  return G(x, y, s, g);
}
// centered (0,0) warning skull, ~100px
const skullIcon = `<g><path d="M-52 22 Q-60 -62 0 -62 Q60 -62 52 22 Q50 34 34 34 L34 54 L-34 54 L-34 34 Q-50 34 -52 22 Z" fill="#f4f1e6" stroke="${C.pillInk}" stroke-width="6" stroke-linejoin="round"/>
  <ellipse cx="-22" cy="-6" rx="14" ry="17" fill="${C.pillInk}"/><ellipse cx="22" cy="-6" rx="14" ry="17" fill="${C.pillInk}"/><path d="M0 12 L-7 28 L7 28 Z" fill="${C.pillInk}"/>
  <path d="M-16 54 L-16 38 M0 54 L0 38 M16 54 L16 38" stroke="${C.pillInk}" stroke-width="5"/></g>`;
function skull(x, y, s = 1, o = {}) {
  const tri = o.warning ? `<path d="M0 -118 L112 70 L-112 70 Z" fill="#ffd23f" stroke="${C.pillInk}" stroke-width="9" stroke-linejoin="round"/>` : '';
  return G(x, y, s, tri + (o.warning ? `<g transform="translate(0 6) scale(0.62)">${skullIcon}</g>` : skullIcon));
}

// ---------- creatures ----------
// bush with two glowing eyes that blink now and then. (x,y) = bush base
function eyesInBush(t, x, y, s = 1, o = {}) {
  const sd = o.seed || 0, ph = mod(t * 0.37 + sd * 0.31, 1), blink = ph > 0.93 && ph < 0.98, look = Math.sin(t * 0.6 + sd) * 4, glw = 0.7 + 0.3 * Math.sin(t * 2 + sd);
  const id = uid('ey');
  const eye = cx => `<g transform="translate(${cx} -58)"><circle r="34" fill="url(#${id})" opacity="${glw.toFixed(2)}"/><ellipse rx="17" ry="${blink ? 1.8 : 12}" fill="#ffe94a"/>${blink ? '' : `<ellipse cx="${look.toFixed(1)}" rx="4.5" ry="10" fill="#1b1500"/>`}</g>`;
  const g = `<defs><radialGradient id="${id}"><stop offset="0" stop-color="#fff27a" stop-opacity="0.7"/><stop offset="1" stop-color="#fff27a" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="0" cy="3" rx="130" ry="14" fill="#000" opacity="0.25"/>
    ${[[0, -64, 74], [-80, -46, 56], [80, -46, 56], [-40, -100, 48], [44, -96, 52], [0, -110, 40]].map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#0a1224"/>`).join('')}
    ${[[-80, -46, 56], [80, -46, 56]].map(([cx, cy, r]) => `<circle cx="${cx + 10}" cy="${cy - 14}" r="${r * 0.55}" fill="#12203b"/>`).join('')}
    ${eye(-24)}${eye(26)}`;
  return G(x, y, s, g);
}
// side-view deer, feet at (x,y). face 1 = looks right. o: {walk (radians phase) , time}
function deer(t, x, y, s = 1, o = {}) {
  const { face = 1, walk = 0, sil = false } = o, p = pal(o.time);
  const nt = c => o.time === 'night' ? mix(c, '#0a1224', 0.62) : c;
  const body = sil ? '#0a1224' : nt('#a8704a'), belly = sil ? '#0a1224' : nt('#d6b48a'), dark = sil ? '#0a1224' : nt('#6e4529'), head = Math.sin(t * 1.3) * 2, ear = Math.sin(t * 5) > 0.92 ? -14 : 0;
  const leg = (lx, ph, back) => { const a = Math.sin(walk + ph) * 18; return `<g transform="rotate(${a.toFixed(1)} ${lx} -135)"><path d="M${lx - 8} -140 L${lx - 5} -4 L${lx + 5} -4 L${lx + 8} -140 Z" fill="${back ? dark : body}"/><rect x="${lx - 8}" y="-10" width="16" height="10" rx="3" fill="#2b1c14"/></g>`; };
  let g = `<ellipse cx="0" cy="3" rx="120" ry="12" fill="#000" opacity="0.22"/>${leg(-68, 0, true)}${leg(62, Math.PI, true)}
    <path d="M-100 -170 Q-120 -190 -112 -200 Q-90 -190 -92 -170 Z" fill="${sil ? body : '#fff'}"/>
    <ellipse cx="0" cy="-160" rx="106" ry="50" fill="${body}"/><ellipse cx="4" cy="-134" rx="90" ry="22" fill="${belly}" opacity="${sil ? 0 : 0.9}"/>
    <path d="M60 -190 Q96 -250 112 -290 L140 -280 Q122 -230 106 -170 Z" fill="${body}"/>
    ${leg(-44, Math.PI, false)}${leg(86, 0, false)}
    <g transform="translate(0 ${head.toFixed(1)})"><ellipse cx="138" cy="-292" rx="40" ry="24" transform="rotate(24 138 -292)" fill="${body}"/><circle cx="170" cy="-278" r="9" fill="#1b1410"/>${sil ? '' : '<circle cx="144" cy="-296" r="5" fill="#1b1410"/>'}
    <g transform="rotate(${ear} 118 -306)"><ellipse cx="112" cy="-316" rx="11" ry="25" transform="rotate(-35 112 -316)" fill="${dark}"/></g>
    <path d="M124 -308 L112 -362 M118 -334 L92 -350 M112 -362 L96 -388 M124 -308 L146 -366 M136 -336 L160 -350" stroke="${sil ? '#0a1224' : '#cdbb98'}" stroke-width="7" stroke-linecap="round" fill="none"/></g>`;
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s * face} ${s})">${g}</g>`;
}
// generic bear (original simple shape), feet at (x,y). o: {sil, face, walk}
function bear(t, x, y, s = 1, o = {}) {
  const { face = 1, walk = 0, sil = false } = o;
  const nt = k => o.time === 'night' ? mix(k, '#070b18', 0.5) : k;
  const c = sil ? '#070b18' : nt('#4a3328'), c2 = sil ? '#070b18' : nt('#5e4435'), dk = sil ? '#070b18' : nt('#33231b'), mz = sil ? '#070b18' : nt('#c49a74');
  const leg = (lx, ph, col) => `<g transform="rotate(${(Math.sin(walk + ph) * 14).toFixed(1)} ${lx} -110)"><rect x="${lx - 22}" y="-118" width="44" height="116" rx="20" fill="${col}"/><ellipse cx="${lx}" cy="-4" rx="30" ry="12" fill="${dk}"/></g>`;
  const br = Math.sin(t * 2.2) * 2;
  const g = `<ellipse cx="0" cy="3" rx="170" ry="14" fill="#000" opacity="0.25"/>${leg(-98, 0, dk)}${leg(66, Math.PI, dk)}
    <ellipse cx="0" cy="-150" rx="150" ry="${(88 + br).toFixed(1)}" fill="${c}"/><ellipse cx="62" cy="-196" rx="82" ry="64" fill="${c}"/>${sil ? '' : `<ellipse cx="-20" cy="-190" rx="80" ry="30" fill="${c2}" opacity="0.7"/>`}
    ${leg(-58, Math.PI, c)}${leg(106, 0, c)}
    <g transform="translate(0 ${(Math.sin(t * 1.5) * 3).toFixed(1)})"><circle cx="164" cy="-196" r="14" fill="${c}"/><circle cx="196" cy="-232" r="19" fill="${c}"/><ellipse cx="194" cy="-182" rx="62" ry="52" fill="${c}"/>
    <ellipse cx="238" cy="-170" rx="42" ry="30" fill="${mz}"/><ellipse cx="274" cy="-178" rx="12" ry="9" fill="#14100e"/>${sil ? '' : '<circle cx="214" cy="-204" r="6" fill="#14100e"/><path d="M246 -150 Q258 -144 270 -152" stroke="#14100e" stroke-width="4" fill="none"/>'}</g>`;
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s * face} ${s})">${g}</g>`;
}

// ---------- search volunteers ----------
function person(walk, o) {
  const sw = Math.sin(walk) * 20, bounce = Math.abs(Math.sin(walk)) * -5;
  const { skin, hair, shirt, hat } = o;
  return `<g transform="translate(0 ${bounce.toFixed(1)})">
    <ellipse cx="0" cy="4" rx="64" ry="11" fill="#000" opacity="0.25"/>
    <g transform="rotate(${sw.toFixed(1)} 0 -170)"><rect x="-30" y="-176" width="28" height="170" rx="12" fill="#2f3b52"/><ellipse cx="-12" cy="-6" rx="26" ry="11" fill="#2a1d16"/></g>
    <g transform="rotate(${(-sw).toFixed(1)} 0 -170)"><rect x="2" y="-176" width="28" height="170" rx="12" fill="#2f3b52"/><ellipse cx="20" cy="-6" rx="26" ry="11" fill="#2a1d16"/></g>
    <g transform="translate(-4 -312) rotate(${(-sw * 1.3).toFixed(1)})"><rect x="-13" y="-6" width="26" height="130" rx="13" fill="${shirt}"/><circle cx="0" cy="130" r="14" fill="${skin}"/></g>
    <rect x="-52" y="-340" width="104" height="180" rx="30" fill="${shirt}"/>
    <path d="M-52 -330 L-52 -190 L-20 -190 L-20 -336 Z M52 -330 L52 -190 L20 -190 L20 -336 Z" fill="#ff7a1a"/><rect x="-52" y="-190" width="104" height="30" fill="#ff7a1a"/>
    <rect x="-52" y="-290" width="104" height="14" fill="#e8f35a"/><rect x="-52" y="-230" width="104" height="14" fill="#e8f35a"/>
    <rect x="-18" y="-354" width="36" height="22" rx="8" fill="${skin}"/>
    <circle cx="0" cy="-392" r="52" fill="${skin}"/>
    ${hat === 'cap' ? `<path d="M-54 -400 C-54 -460 54 -460 54 -400 Z" fill="#2e6b4a"/><rect x="-6" y="-416" width="74" height="14" rx="7" fill="#2e6b4a"/>` : hat === 'helmet' ? `<path d="M-58 -396 C-58 -470 58 -470 58 -396 Z" fill="#f4f4f4"/><rect x="-60" y="-404" width="120" height="14" rx="6" fill="#d8dce4"/>` : `<path d="M-52 -394 C-56 -450 52 -458 54 -404 Q30 -424 -52 -394 Z" fill="${hair}"/>`}
    <ellipse cx="14" cy="-388" rx="5" ry="8" fill="#20160f"/><ellipse cx="32" cy="-388" rx="5" ry="8" fill="#20160f"/><path d="M16 -366 Q26 -358 36 -366" stroke="#5a2e22" stroke-width="4" fill="none" stroke-linecap="round"/>
    <g transform="translate(4 -312) rotate(${(sw * 1.3).toFixed(1)})"><rect x="-13" y="-6" width="26" height="130" rx="13" fill="${shirt}"/><circle cx="0" cy="130" r="14" fill="${skin}"/></g>
  </g>`;
}
function dogShape(walk, wag) {
  const leg = (lx, ph) => `<g transform="rotate(${(Math.sin(walk + ph) * 28).toFixed(1)} ${lx} -56)"><rect x="${lx - 7}" y="-60" width="14" height="58" rx="6" fill="#b87a3e"/><ellipse cx="${lx + 2}" cy="-2" rx="11" ry="6" fill="#8a5a2c"/></g>`;
  return `<ellipse cx="0" cy="3" rx="80" ry="9" fill="#000" opacity="0.22"/>${leg(-38, 0)}${leg(34, Math.PI)}
    <path d="M-62 -84 Q${-100 + wag} ${-120} ${-92 + wag} ${-140}" stroke="#c88b4a" stroke-width="12" fill="none" stroke-linecap="round"/>
    <ellipse cx="0" cy="-78" rx="70" ry="32" fill="#c88b4a"/><path d="M-40 -100 Q0 -112 40 -100 L40 -78 L-40 -78 Z" fill="#8a5a2c" opacity="0.6"/>
    <rect x="-20" y="-104" width="46" height="26" rx="8" fill="#ff7a1a"/>
    ${leg(-18, Math.PI)}${leg(52, 0)}
    <circle cx="78" cy="-108" r="29" fill="#c88b4a"/><ellipse cx="104" cy="-98" rx="22" ry="15" fill="#e6c08c"/><ellipse cx="122" cy="-102" rx="7" ry="6" fill="#1b1410"/><circle cx="82" cy="-116" r="4.5" fill="#1b1410"/>
    <path d="M62 -128 Q40 -126 48 -92 Q64 -96 70 -118 Z" fill="#8a5a2c"/><rect x="56" y="-88" width="30" height="8" rx="4" fill="#d6306a"/>`;
}
// two volunteers + a dog on a leash, walking. (x,y) = feet of the lead person. face 1 = walking right. speed in steps/sec
function volunteers(t, x, y, s = 1, o = {}) {
  const { face = 1, walking = true, speed = 1 } = o, w = walking ? t * 6.5 * speed : 0, wag = Math.sin(t * 14) * 12;
  const A = { skin: '#e7b08a', hair: '#3a2a22', shirt: '#4b5d82', hat: 'cap' }, B = { skin: '#c68a62', hair: '#1c1a1a', shirt: '#6b4a5a', hat: 'helmet' };
  const g = `<g transform="translate(-200 0) scale(0.97)">${person(w + 1.6, B)}</g>
    <path d="M30 -180 Q170 -110 306 -98" stroke="#2b2f3a" stroke-width="5" fill="none"/>
    <g transform="translate(250 0) scale(0.95)">${dogShape(w * 1.1, wag)}</g>${person(w, A)}`;
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s * face} ${s})">${g}</g>`;
}

// ---------- thermometer / rain ----------
// center (x,y). level 0..1 (cold -> hot). o: {label}
function thermometer(x, y, s = 1, level = 0.3, o = {}) {
  const lv = clamp(level), col = mix('#4a8fd8', C.red, lv), top = lerp(104, -138, lv);
  let g = `<rect x="-6" y="-170" width="64" height="300" fill="none"/>`;
  for (let i = 0; i <= 10; i++) g += `<line x1="32" y1="${-140 + i * 24.4}" x2="${i % 5 === 0 ? 58 : 46}" y2="${-140 + i * 24.4}" stroke="${C.pillInk}" stroke-width="4" stroke-linecap="round"/>`;
  g += `<rect x="-30" y="-170" width="60" height="290" rx="30" fill="#f4f8ff" stroke="${C.pillInk}" stroke-width="7"/><circle cx="0" cy="136" r="48" fill="#f4f8ff" stroke="${C.pillInk}" stroke-width="7"/>
    <circle cx="0" cy="136" r="40" fill="#f4f8ff"/><circle cx="0" cy="136" r="34" fill="${col}"/>
    <rect x="-11" y="${f1(top)}" width="22" height="${f1(130 - top)}" rx="11" fill="${col}"/><circle cx="-12" cy="124" r="9" fill="#fff" opacity="0.55"/>`;
  if (o.label) g += `<text x="0" y="238" text-anchor="middle" ${FONT} font-size="54" fill="#fff" stroke="${C.pillInk}" stroke-width="10" paint-order="stroke">${o.label}</text>`;
  return G(x, y, s, g);
}
// full-screen rain overlay. o: {intensity 0..1.5, wet 0..1 (darkens the scene), wind}
function rain(t, o = {}) {
  const { intensity = 1, wet = 0, wind = -0.22 } = o, n = Math.round(170 * intensity), r = rng(77);
  let g = '';
  if (wet > 0) { const id = uid('wt'); g += `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14224a" stop-opacity="${(0.55 * wet).toFixed(2)}"/><stop offset="1" stop-color="#0a1230" stop-opacity="${(0.4 * wet).toFixed(2)}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id})"/>`; }
  for (let i = 0; i < n; i++) {
    const x0 = r() * (W + 400), sp = 1300 + r() * 700, len = 40 + r() * 50, off = r() * (H + 200), yy = mod(t * sp + off, H + 200) - 100;
    const xx = mod(x0 + wind * (yy + 100) * 1.0, W + 400) - 200;
    g += `<line x1="${f1(xx)}" y1="${f1(yy)}" x2="${f1(xx + wind * len)}" y2="${f1(yy + len)}" stroke="#cfe4ff" stroke-width="${(2 + r() * 2).toFixed(1)}" stroke-linecap="round" opacity="${(0.25 + r() * 0.35).toFixed(2)}"/>`;
  }
  for (let i = 0; i < Math.round(36 * intensity); i++) {
    const ph = mod(t * 2.2 + r(), 1), x = r() * W, yy = HZ + 80 + r() * (H - HZ - 100);
    g += `<ellipse cx="${f1(x)}" cy="${f1(yy)}" rx="${(4 + ph * 22).toFixed(1)}" ry="${(1.5 + ph * 7).toFixed(1)}" fill="none" stroke="#dbeaff" stroke-width="2.5" opacity="${((1 - ph) * 0.6).toFixed(2)}"/>`;
  }
  return g;
}

// ---------- STOP tiles ----------
const STOP_ICONS = {
  S: `<g><circle cx="0" cy="0" r="38" fill="#ffd23f" stroke="${C.pillInk}" stroke-width="5"/><path d="M-22 -8 Q-14 -16 -6 -8 M6 -8 Q14 -16 22 -8" stroke="${C.pillInk}" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M-16 12 Q0 26 16 12" stroke="${C.pillInk}" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M48 -6 q12 -8 24 0 M48 8 q14 -8 28 0 M48 22 q12 -8 24 0" stroke="#4a8fd8" stroke-width="4" fill="none" stroke-linecap="round"/></g>`,
  T: `<g><circle cx="0" cy="-8" r="32" fill="#ffd23f" stroke="${C.pillInk}" stroke-width="5"/><rect x="-14" y="22" width="28" height="18" rx="5" fill="#9aa3b2" stroke="${C.pillInk}" stroke-width="4"/><path d="M-10 -6 L0 14 L10 -6" stroke="${C.pillInk}" stroke-width="4" fill="none" stroke-linejoin="round"/>${[-70, -40, 0, 40, 70].map(a => `<line x1="${Math.sin(a * Math.PI / 180) * 44}" y1="${-8 - Math.cos(a * Math.PI / 180) * 44}" x2="${Math.sin(a * Math.PI / 180) * 58}" y2="${-8 - Math.cos(a * Math.PI / 180) * 58}" stroke="${C.pillInk}" stroke-width="4" stroke-linecap="round"/>`).join('')}</g>`,
  O: `<g><path d="M-54 0 Q0 -50 54 0 Q0 50 -54 0 Z" fill="#fff" stroke="${C.pillInk}" stroke-width="5" stroke-linejoin="round"/><circle cx="0" cy="0" r="22" fill="#4a8fd8" stroke="${C.pillInk}" stroke-width="4"/><circle cx="0" cy="0" r="10" fill="${C.pillInk}"/><circle cx="-6" cy="-7" r="5" fill="#fff"/></g>`,
  P: `<g><path d="M-52 -34 L-18 -44 L18 -34 L52 -44 L52 34 L18 44 L-18 34 L-52 44 Z" fill="#f4e4c4" stroke="${C.pillInk}" stroke-width="5" stroke-linejoin="round"/><path d="M-18 -44 L-18 34 M18 -34 L18 44" stroke="${C.pillInk}" stroke-width="3"/><path d="M-40 20 Q-20 -10 0 4 T36 -20" stroke="${C.red}" stroke-width="5" fill="none" stroke-dasharray="8 7" stroke-linecap="round"/><path d="M30 -30 L42 -18 M42 -30 L30 -18" stroke="${C.red}" stroke-width="5" stroke-linecap="round"/></g>`,
};
const STOP_META = [['S', 'CALM', '#e5483b'], ['T', 'THINK', '#f2a22a'], ['O', 'OBSERVE', '#4a8fd8'], ['P', 'PLAN', '#4cc36b']];
// one tile, pops in at tin. idx 0..3 (S,T,O,P). center (cx,cy)
function stopTile(t, tin, idx, cx, cy, s = 1, o = {}) {
  if (t < tin) return '';
  const [ch, word, col] = STOP_META[idx], k = spring((t - tin) / 0.55), hi = o.highlight ? 1 + 0.05 * Math.sin(t * 6) : 1;
  const g = `<rect x="-107" y="-135" width="224" height="300" rx="34" fill="#000" opacity="0.3" transform="translate(5 8)"/>
    <rect x="-112" y="-150" width="224" height="300" rx="34" fill="${C.pill}" stroke="${C.pillInk}" stroke-width="6"/>
    <rect x="-112" y="-150" width="224" height="150" rx="34" fill="${col}" stroke="${C.pillInk}" stroke-width="6"/><rect x="-109" y="-60" width="218" height="60" fill="${col}"/><line x1="-112" y1="0" x2="112" y2="0" stroke="${C.pillInk}" stroke-width="6"/>
    <text x="0" y="-26" text-anchor="middle" ${FONT} font-size="150" fill="#fff" stroke="${C.pillInk}" stroke-width="12" paint-order="stroke" stroke-linejoin="round">${ch}</text>
    <g transform="translate(0 62) scale(0.9)">${STOP_ICONS[ch]}</g>
    <text x="0" y="132" text-anchor="middle" ${FONT} font-size="34" fill="${C.pillInk}" letter-spacing="1">${word}</text>`;
  return `<g transform="translate(${cx} ${cy}) scale(${(s * k * hi).toFixed(3)})">${g}</g>`;
}
// all four, popping in one after another from tin. centered on (cx,cy)
function stopTiles(t, tin, cx, cy, s = 1, o = {}) {
  const gap = (o.gap ?? 260) * s, step = o.step ?? 0.45;
  return [0, 1, 2, 3].map(i => stopTile(t, tin + i * step, i, cx + (i - 1.5) * gap, cy, s, { highlight: o.highlight === i })).join('');
}

// ---------- top-down search-area map ----------
// (x,y) top-left, w,h. o: {zoneR, mover, still, dur, tin, labels}. Moving dot wanders out of the zone; still dot stays put
function searchMap(t, x, y, w = 1000, h = 700, o = {}) {
  const { zoneR = Math.min(w, h) * 0.3, mover = true, still = true, dur = 12, tin = 0, labels = true } = o, id = uid('mp');
  const cx = w / 2, cy = h / 2, s0 = [cx - zoneR * 0.18, cy + zoneR * 0.12];
  const r = rng(21);
  let g = `<defs><clipPath id="${id}"><rect width="${w}" height="${h}" rx="26"/></clipPath></defs><g clip-path="url(#${id})"><rect width="${w}" height="${h}" fill="#7fb06a"/>`;
  for (let i = 0; i < 9; i++) g += `<ellipse cx="${(r() * w).toFixed(0)}" cy="${(r() * h).toFixed(0)}" rx="${(90 + r() * 140).toFixed(0)}" ry="${(60 + r() * 90).toFixed(0)}" fill="#6ea05c" opacity="0.7"/>`;
  for (let i = 1; i <= 4; i++) g += `<ellipse cx="${w * 0.72}" cy="${h * 0.3}" rx="${i * 60}" ry="${i * 42}" fill="none" stroke="#5c8e50" stroke-width="3" opacity="0.8"/>`;
  g += `<path d="M-20 ${h * 0.8} C${w * 0.25} ${h * 0.6} ${w * 0.45} ${h * 0.95} ${w * 0.7} ${h * 0.75} S${w * 0.95} ${h * 0.55} ${w + 20} ${h * 0.6}" stroke="#4aa3d8" stroke-width="22" fill="none" stroke-linecap="round"/>`;
  g += `<path d="M${w * 0.1} -10 C${w * 0.15} ${h * 0.3} ${w * 0.3} ${h * 0.5} ${w * 0.38} ${h * 0.7}" stroke="#d8c196" stroke-width="10" fill="none" stroke-dasharray="22 12"/>`;
  for (let i = 0; i < 44; i++) { const tx = r() * w, ty = r() * h; g += `<circle cx="${tx.toFixed(0)}" cy="${ty.toFixed(0)}" r="${(9 + r() * 7).toFixed(0)}" fill="#3f7a4a" opacity="0.85"/>`; }
  // search zone
  g += `<circle cx="${cx}" cy="${cy}" r="${zoneR}" fill="#ffd23f" opacity="0.2"/><circle cx="${cx}" cy="${cy}" r="${zoneR}" fill="none" stroke="#ffd23f" stroke-width="7" stroke-dasharray="26 16" stroke-dashoffset="${(-t * 24).toFixed(1)}"/>`;
  const u = clamp((t - tin) / dur);
  if (mover) {
    const pos = k => { const a = 0.6 + k * 2.6, rr = k * zoneR * 1.9; return [s0[0] + Math.cos(a) * rr - rr * 0.0 + Math.sin(k * 38) * 5 * k, s0[1] + Math.sin(a) * rr * 0.8 + Math.cos(k * 31) * 5 * k]; };
    let d = '';
    for (let i = 0; i <= 60; i++) { const [px, py] = pos(u * i / 60); d += `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`; }
    const [mx, my] = pos(u), out = Math.hypot(mx - cx, my - cy) > zoneR;
    g += `<path d="${d}" fill="none" stroke="${C.red}" stroke-width="5" stroke-dasharray="3 12" stroke-linecap="round" opacity="0.9"/>
      <circle cx="${f1(mx)}" cy="${f1(my)}" r="${(22 + 6 * Math.sin(t * 6)).toFixed(1)}" fill="${C.red}" opacity="0.28"/><circle cx="${f1(mx)}" cy="${f1(my)}" r="14" fill="${C.red}" stroke="#fff" stroke-width="5"/>`;
    if (labels && u > 0.05) g += `<g transform="translate(${f1(mx + 28)} ${f1(my - 34)})"><rect x="0" y="-26" width="${out ? 190 : 150}" height="44" rx="22" fill="${C.pill}" stroke="${C.pillInk}" stroke-width="4"/><text x="${out ? 95 : 75}" y="6" text-anchor="middle" ${FONT} font-size="26" fill="${C.pillInk}">${out ? 'OUT OF ZONE' : 'MOVING'}</text></g>`;
  }
  if (still) {
    for (let i = 0; i < 2; i++) { const ph = mod(t * 0.7 + i * 0.5, 1); g += `<circle cx="${f1(s0[0])}" cy="${f1(s0[1])}" r="${(14 + ph * 60).toFixed(1)}" fill="none" stroke="${C.green}" stroke-width="5" opacity="${(1 - ph).toFixed(2)}"/>`; }
    g += `<circle cx="${f1(s0[0])}" cy="${f1(s0[1])}" r="15" fill="${C.green}" stroke="#fff" stroke-width="5"/>`;
    if (labels) g += `<g transform="translate(${f1(s0[0] - 190)} ${f1(s0[1] + 30)})"><rect x="0" y="-4" width="150" height="44" rx="22" fill="${C.pill}" stroke="${C.pillInk}" stroke-width="4"/><text x="75" y="27" text-anchor="middle" ${FONT} font-size="26" fill="${C.pillInk}">STILL</text></g>`;
  }
  g += `</g><rect x="0" y="0" width="${w}" height="${h}" rx="26" fill="none" stroke="${C.pillInk}" stroke-width="10"/><rect x="0" y="0" width="${w}" height="${h}" rx="26" fill="none" stroke="${C.pill}" stroke-width="4"/>`;
  return `<g transform="translate(${x} ${y})">${g}</g>`;
}

// ---------- icons for popCard (centered 0,0, ~100px, same convention as L.icon) ----------
const icons = {
  whistle: whistleIcon,
  skull: skullIcon,
  mirror: `<g transform="rotate(-20)"><rect x="-38" y="-46" width="76" height="92" rx="10" fill="#6c7484"/><rect x="-31" y="-39" width="62" height="78" rx="6" fill="#cde9ff"/><path d="M-31 -39 L-4 -39 L-31 10 Z" fill="#fff"/><path d="M8 39 L31 39 L31 14 Z" fill="#8cc0ee"/></g>`,
  flag: `<g><rect x="-30" y="-54" width="8" height="112" rx="3" fill="#7a4e34"/><path d="M-22 -50 Q10 -64 30 -48 Q50 -36 56 -46 L56 0 Q48 8 30 -4 Q10 -18 -22 -4 Z" fill="${C.red}"/></g>`,
  mushroom: `<g><rect x="-12" y="0" width="24" height="46" rx="8" fill="#f1e7d0"/><path d="M-54 6 Q-54 -56 0 -56 Q54 -56 54 6 Q0 18 -54 6 Z" fill="#e5483b"/><circle cx="-24" cy="-26" r="8" fill="#fff"/><circle cx="14" cy="-36" r="9" fill="#fff"/><circle cx="30" cy="-10" r="6" fill="#fff"/></g>`,
  fire: `<g transform="translate(0 40)">${tongue(40, 100, 0, '#ff7a2e')}<g>${tongue(24, 66, 2, '#ffb02e')}</g>${tongue(12, 36, 0, '#fff1a8')}</g>`,
  drop: `<path d="M0 -56 Q-46 6 -40 24 A40 40 0 0 0 40 24 Q46 6 0 -56 Z" fill="#4aa3d8" stroke="${C.pillInk}" stroke-width="5"/><path d="M-16 20 Q-14 34 0 38" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.8"/>`,
  shelter: `<g><path d="M-60 40 L-6 -44 L60 40 Z" fill="#6b4430"/><path d="M-6 -44 L60 40 L36 40 L-18 -26 Z" fill="#4cc36b" opacity="0.9"/><rect x="-60" y="34" width="120" height="10" rx="5" fill="#8a5a3c"/></g>`,
  helicopter: `<g><ellipse cx="0" cy="4" rx="36" ry="24" fill="${C.red}"/><path d="M-28 -2 L-66 -10 L-66 0 L-26 12 Z" fill="${C.red}"/><path d="M8 -16 Q32 -16 36 -2 L8 -2 Z" fill="#bfe3ff"/><line x1="-60" y1="-34" x2="60" y2="-34" stroke="${C.pillInk}" stroke-width="6" stroke-linecap="round"/><line x1="0" y1="-34" x2="0" y2="-20" stroke="${C.pillInk}" stroke-width="5"/><line x1="-30" y1="34" x2="40" y2="34" stroke="${C.pillInk}" stroke-width="6" stroke-linecap="round"/></g>`,
  eye: STOP_ICONS.O,
};

module.exports = {
  _internal: { uid, mod, jit, f1, G, HZ, pal, PAL },
  // environment
  forestBackdrop, forestForeground, tree, bush, log, rocks, trail, stream,
  // camp / survival
  campfire, shelter, whistle, whistleIcon, whistleWaves, signalMirror, sosRocks, flag, poncho,
  // air / tech
  helicopter, helicopterFar, phone,
  // plants / creatures
  mushrooms, berries, skull, eyesInBush, deer, bear, volunteers,
  // misc
  thermometer, rain, stopTile, stopTiles, searchMap, icons,
};
