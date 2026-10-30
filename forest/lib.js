// Shared pieces for the blackout video: helpers, palette, UI (pills/captions), character, lighting, renderer.
const sharp = require('/opt/npm-tools/node_modules/sharp');
const { spawn } = require('child_process');

const W = 1920, H = 1080, FPS = 30;

// ---------- math / color ----------
function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; }
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);
const easeIn = t => Math.pow(clamp(t), 3);
const easeInOut = t => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const spring = t => { t = clamp(t); return 1 - Math.exp(-6 * t) * Math.cos(10 * t); };
const pulse = (t, a, b) => clamp((t - a) / (b - a)); // 0..1 progress between a and b
const mix = (c1, c2, t) => {
  const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const a = p(c1), b = p(c2);
  return '#' + a.map((v, i) => Math.round(lerp(v, b[i], clamp(t))).toString(16).padStart(2, '0')).join('');
};
// animate a value through keyframes [[t, v], ...] with easeInOut between them
function keys(t, kf) {
  if (t <= kf[0][0]) return kf[0][1];
  for (let i = 1; i < kf.length; i++) {
    if (t <= kf[i][0]) return lerp(kf[i - 1][1], kf[i][1], easeInOut((t - kf[i - 1][0]) / (kf[i][0] - kf[i - 1][0])));
  }
  return kf[kf.length - 1][1];
}

const C = {
  sky: '#1d2642', skyDark: '#10162a',
  winOn: '#e9c46a', winOff: '#1c2238',
  wall: '#2c3456', wallDark: '#20263f', floor: '#3a2f3a', trim: '#1a1f33',
  wood: '#8a5a3c', woodDark: '#6b4430', metal: '#9aa3b2', metalDark: '#6c7484',
  pill: '#f4e4c4', pillInk: '#3a281c', orange: '#f26b2a', red: '#e5483b', green: '#4cc36b', blue: '#4a8fd8',
  lamp: '#ffe7a3', skin: '#e7b08a', jacket: '#2f4a7a', pants: '#2b2f3a', beanie: '#f26b2a',
};

const FONT = `font-family="DejaVu Sans" font-stretch="condensed" font-weight="bold"`;

// ---------- UI ----------
function pill(t, side, label, tin, opts = {}) {
  if (t < tin) return '';
  const k = spring((t - tin) / 0.6);
  const fs = opts.fs || 46, padX = 34, h = opts.h || 82;
  const w = label.length * fs * 0.62 + padX * 2;
  let x, y = opts.y ?? 46;
  if (side === 'left') x = 56; else if (side === 'right') x = W - 56 - w; else x = side - w / 2;
  const cx = x + w / 2, cy = y + h / 2;
  return `<g transform="translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})">
    <rect x="${x + 4}" y="${y + 7}" width="${w}" height="${h}" rx="${h / 2}" fill="#000" opacity="0.35"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${opts.fill || C.pill}" stroke="${C.pillInk}" stroke-width="5"/>
    <text x="${cx}" y="${cy + fs * 0.36}" text-anchor="middle" ${FONT} font-size="${fs}" fill="${opts.ink || C.pillInk}" letter-spacing="1">${label}</text>
  </g>`;
}

// bottom caption: white part + orange part; visible from tA (orange from tB) until tOut
function caption(t, a, b, tA, tB, tOut = null) {
  if (t < tA || (tOut !== null && t > tOut + 0.3)) return '';
  let op = easeOut((t - tA) / 0.3);
  const dy = (1 - easeOut((t - tA) / 0.35)) * 40;
  if (tOut !== null && t > tOut) op *= 1 - clamp((t - tOut) / 0.3);
  const opB = easeOut((t - tB) / 0.3);
  const fs = Math.min(104, 1640 / ((a.length + b.length) * 0.6)), y = 1000 + dy;
  return `<g opacity="${op.toFixed(3)}">
    <text xml:space="preserve" x="${W / 2 + 5}" y="${y + 6}" text-anchor="middle" ${FONT} font-size="${fs}" fill="#000" opacity="0.55"><tspan>${a}</tspan><tspan fill-opacity="${opB.toFixed(3)}">${b}</tspan></text>
    <text xml:space="preserve" x="${W / 2}" y="${y}" text-anchor="middle" ${FONT} font-size="${fs}"><tspan fill="#ffffff">${a}</tspan><tspan fill="${C.orange}" fill-opacity="${opB.toFixed(3)}">${b}</tspan></text>
  </g>`;
}
// sequence of captions: [[tA, tB, tOut, a, b], ...]
const captions = (t, list) => list.map(c => caption(t, c[3], c[4], c[0], c[1], c[2])).join('');

function bottomShade() {
  return `<defs><linearGradient id="shadeB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.85"/></linearGradient></defs>
  <rect x="0" y="730" width="${W}" height="350" fill="url(#shadeB)"/>`;
}

// big icon card that pops in (used for item callouts)
function popCard(t, tin, cx, cy, inner, opts = {}) {
  if (t < tin) return '';
  const k = spring((t - tin) / 0.55);
  const r = opts.r || 78;
  const out = opts.out != null && t > opts.out ? 1 - easeIn((t - opts.out) / 0.3) : 1;
  return `<g transform="translate(${cx} ${cy}) scale(${(k * out).toFixed(3)})">
    <circle cx="5" cy="8" r="${r}" fill="#000" opacity="0.3"/>
    <circle r="${r}" fill="${opts.fill || C.pill}" stroke="${C.pillInk}" stroke-width="6"/>
    ${inner}
  </g>`;
}

// red X / green check stamps
const stampX = (s = 1) => `<g transform="scale(${s})" stroke="${C.red}" stroke-width="22" stroke-linecap="round"><line x1="-50" y1="-50" x2="50" y2="50"/><line x1="50" y1="-50" x2="-50" y2="50"/></g>`;
const stampCheck = (s = 1) => `<g transform="scale(${s})"><polyline points="-48,4 -14,38 52,-36" fill="none" stroke="${C.green}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/></g>`;

// ---------- simple icons (centered at 0,0, ~100px) ----------
const icon = {
  flashlight: `<g transform="rotate(-35)"><rect x="-16" y="-10" width="70" height="22" rx="6" fill="#3b3f4a"/><path d="M-16 -18 L-46 -26 L-46 30 L-16 22 Z" fill="#5a6070"/><rect x="-50" y="-26" width="8" height="56" rx="3" fill="${C.lamp}"/><rect x="18" y="-6" width="12" height="14" rx="3" fill="${C.orange}"/></g>`,
  battery: `<g><rect x="-22" y="-44" width="44" height="88" rx="8" fill="#3b3f4a"/><rect x="-10" y="-52" width="20" height="10" rx="3" fill="#3b3f4a"/><rect x="-14" y="-6" width="28" height="42" rx="4" fill="${C.green}"/><text x="0" y="-12" text-anchor="middle" ${FONT} font-size="28" fill="#fff">+</text></g>`,
  powerbank: `<g><rect x="-34" y="-46" width="68" height="92" rx="12" fill="#3b3f4a"/><rect x="-22" y="-30" width="44" height="10" rx="3" fill="${C.green}"/><rect x="-22" y="-14" width="44" height="10" rx="3" fill="${C.green}"/><rect x="-22" y="2" width="44" height="10" rx="3" fill="${C.green}"/><rect x="-22" y="18" width="44" height="10" rx="3" fill="#5a6070"/><rect x="-8" y="46" width="16" height="8" fill="#5a6070"/></g>`,
  bolt: `<path d="M12 -60 L-30 6 L-2 6 L-14 60 L32 -8 L4 -8 Z" fill="#ffd23f" stroke="${C.pillInk}" stroke-width="5" stroke-linejoin="round"/>`,
  plug: `<g><rect x="-26" y="-20" width="52" height="44" rx="8" fill="#e8e8e8" stroke="#555" stroke-width="3"/><rect x="-14" y="-40" width="8" height="22" fill="#b9b9b9"/><rect x="6" y="-40" width="8" height="22" fill="#b9b9b9"/><path d="M0 24 C0 50 30 40 30 70" stroke="#e8e8e8" stroke-width="8" fill="none"/></g>`,
};

// ---------- character (original: orange beanie, navy jacket, backpack) ----------
// feet at (x,y). armL/armR in degrees: 0 = hanging, 90 = straight forward/out. expr: neutral|worried|happy|scared|focused
function character(o) {
  const { x, y, s = 1, armL = 8, armR = 8, expr = 'neutral', blink = false, hold = null, face = 1, bob = 0, lean = 0, walk = 0 } = o;
  const legSwing = Math.sin(walk) * 16;
  const eyeRy = blink ? 1.6 : 10;
  const brows = {
    neutral: ['M-36 -402 L-14 -402', 'M14 -402 L36 -402'],
    worried: ['M-36 -398 L-14 -406', 'M14 -406 L36 -398'],
    scared: ['M-36 -406 L-14 -412', 'M14 -412 L36 -406'],
    happy: ['M-36 -406 L-14 -408', 'M14 -408 L36 -406'],
    focused: ['M-36 -408 L-14 -400', 'M14 -400 L36 -408'],
  }[expr];
  const mouth = {
    neutral: '<path d="M-12 -350 L12 -350" stroke="#5a2e22" stroke-width="5" stroke-linecap="round"/>',
    worried: '<path d="M-14 -346 Q0 -356 14 -346" stroke="#5a2e22" stroke-width="5" fill="none" stroke-linecap="round"/>',
    scared: '<ellipse cx="0" cy="-348" rx="10" ry="13" fill="#5a2e22"/>',
    happy: '<path d="M-18 -356 Q0 -334 18 -356 Z" fill="#5a2e22"/>',
    focused: '<path d="M-10 -349 L10 -351" stroke="#5a2e22" stroke-width="5" stroke-linecap="round"/>',
  }[expr];
  const held = hold ? `<g transform="translate(0 162)">${{
    phone: `<rect x="-14" y="-6" width="28" height="48" rx="5" fill="#15171c"/><rect x="-10" y="-1" width="20" height="36" rx="3" fill="#cfe0ff"/>`,
    flashlight: `<rect x="-11" y="-4" width="22" height="58" rx="5" fill="#3b3f4a"/><path d="M-11 50 L-18 74 L18 74 L11 50 Z" fill="#5a6070"/><rect x="-18" y="72" width="36" height="6" rx="2" fill="${C.lamp}"/>`,
    lantern: `<rect x="-20" y="0" width="40" height="52" rx="8" fill="#3b3f4a"/><rect x="-14" y="8" width="28" height="34" rx="5" fill="${C.lamp}"/><path d="M-14 0 Q0 -18 14 0" stroke="#3b3f4a" stroke-width="5" fill="none"/>`,
  }[hold]}</g>` : '';
  const arm = (side, ang) => {
    const sx = side * 62, rot = side === 1 ? -ang : ang;
    return `<g transform="translate(${sx} -312) rotate(${rot})">
      <rect x="-16" y="-6" width="32" height="150" rx="16" fill="${C.jacket}"/>
      <rect x="-16" y="118" width="32" height="14" fill="#263d66"/>
      <circle cx="0" cy="150" r="18" fill="${C.skin}"/>${side === 1 ? held : ''}
    </g>`;
  };
  return `<g transform="translate(${x} ${y + bob}) scale(${s * face} ${s}) rotate(${lean})">
    <ellipse cx="0" cy="4" rx="70" ry="12" fill="#000" opacity="0.28"/>
    <g transform="rotate(${legSwing} 0 -150)"><rect x="-40" y="-152" width="34" height="150" rx="12" fill="${C.pants}"/><ellipse cx="-20" cy="-4" rx="28" ry="12" fill="#17191f"/></g>
    <g transform="rotate(${-legSwing} 0 -150)"><rect x="6" y="-152" width="34" height="150" rx="12" fill="${C.pants}"/><ellipse cx="26" cy="-4" rx="28" ry="12" fill="#17191f"/></g>
    <rect x="-82" y="-318" width="40" height="130" rx="14" fill="#7a4a2c"/>
    ${arm(-1, armL)}
    <rect x="-64" y="-338" width="128" height="200" rx="36" fill="${C.jacket}"/>
    <rect x="-3" y="-330" width="6" height="186" fill="#3d5c94"/>
    <path d="M-40 -336 L-30 -200" stroke="#5a3820" stroke-width="10" stroke-linecap="round"/>
    <path d="M40 -336 L30 -200" stroke="#5a3820" stroke-width="10" stroke-linecap="round"/>
    <rect x="-22" y="-350" width="44" height="22" rx="8" fill="${C.skin}"/>
    <circle cx="-70" cy="-390" r="13" fill="${C.skin}"/><circle cx="70" cy="-390" r="13" fill="${C.skin}"/>
    <circle cx="0" cy="-390" r="72" fill="${C.skin}"/>
    <path d="M-76 -418 C-76 -500 76 -500 76 -418 Z" fill="${C.beanie}"/>
    <rect x="-80" y="-440" width="160" height="26" rx="12" fill="#d4561b"/>
    <circle cx="0" cy="-494" r="17" fill="#d4561b"/>
    <ellipse cx="-24" cy="-378" rx="7" ry="${eyeRy}" fill="#20160f"/><ellipse cx="24" cy="-378" rx="7" ry="${eyeRy}" fill="#20160f"/>
    <path d="${brows[0]}" stroke="#5a3820" stroke-width="6" stroke-linecap="round"/><path d="${brows[1]}" stroke="#5a3820" stroke-width="6" stroke-linecap="round"/>
    <circle cx="-42" cy="-356" r="9" fill="#e48f7a" opacity="0.5"/><circle cx="42" cy="-356" r="9" fill="#e48f7a" opacity="0.5"/>
    ${mouth}
    ${arm(1, armR)}
  </g>`;
}
// world position of right hand tip (for light sources)
function handR(o, extra = 190) {
  const { x, y, s = 1, armR = 8, face = 1, bob = 0 } = o;
  const a = (-armR) * Math.PI / 180;
  const hx = 62 + (-Math.sin(a)) * extra, hy = -312 + Math.cos(a) * extra;
  return { x: x + hx * s * face, y: y + bob + hy * s, ang: armR };
}
const blinkAt = (t, list = [1.2, 3.9, 6.1, 9.4, 12.8, 15.2, 18.7, 21.3, 24.9, 28.1, 31.6, 35.0, 38.4, 42.2]) => list.some(b => t > b && t < b + 0.13);

// ---------- darkness with light holes ----------
// lights: {type:'circle', x, y, r} | {type:'cone', x, y, dir(deg, 0 = right), len, spread(deg)}
let lightId = 0;
function darkness(alpha, lights, color = '#04060d') {
  if (alpha <= 0) return '';
  const id = 'dk' + (lightId++);
  const defs = [], shapes = [];
  lights.forEach((L, i) => {
    const gid = `${id}g${i}`;
    if (L.type === 'circle') {
      defs.push(`<radialGradient id="${gid}"><stop offset="0" stop-color="#000"/><stop offset="${L.core ?? 0.45}" stop-color="#000"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`);
      shapes.push(`<circle cx="${L.x}" cy="${L.y}" r="${L.r}" fill="url(#${gid})" opacity="${L.a ?? 1}"/>`);
    } else {
      const d = L.dir * Math.PI / 180, sp = L.spread * Math.PI / 180;
      const p1 = [L.x + Math.cos(d - sp) * L.len, L.y + Math.sin(d - sp) * L.len];
      const p2 = [L.x + Math.cos(d + sp) * L.len, L.y + Math.sin(d + sp) * L.len];
      defs.push(`<radialGradient id="${gid}" gradientUnits="userSpaceOnUse" cx="${L.x}" cy="${L.y}" r="${L.len}"><stop offset="0" stop-color="#000"/><stop offset="0.6" stop-color="#000"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`);
      shapes.push(`<polygon points="${L.x},${L.y} ${p1.join(',')} ${p2.join(',')}" fill="url(#${gid})" opacity="${L.a ?? 1}"/>`);
    }
  });
  return `<defs>${defs.join('')}<mask id="${id}"><rect width="${W}" height="${H}" fill="#fff"/>${shapes.join('')}</mask></defs>
  <rect width="${W}" height="${H}" fill="${color}" opacity="${alpha.toFixed(3)}" mask="url(#${id})"/>`;
}
// warm additive glow on top of a light
const glow = (x, y, r, color, a) => a > 0 ? `<defs><radialGradient id="gl${x | 0}${y | 0}"><stop offset="0" stop-color="${color}" stop-opacity="${a}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs><circle cx="${x}" cy="${y}" r="${r}" fill="url(#gl${x | 0}${y | 0})"/>` : '';

// ---------- renderer ----------
const svgWrap = inner => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${inner}</svg>`;

async function render(frameFn, dur, out) {
  const arg = process.argv[2];
  if (arg && arg !== 'full') { // previews: node sceneX.js 3,8,12
    for (const s of arg.split(',').map(Number)) await sharp(Buffer.from(svgWrap(frameFn(s)))).png().toFile(`${out.replace('.mp4', '')}_p${s}.png`);
    return;
  }
  const frames = Math.round(dur * FPS);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'inherit'] });
  for (let f = 0; f < frames; f++) {
    const buf = await sharp(Buffer.from(svgWrap(frameFn(f / FPS)))).removeAlpha().raw().toBuffer();
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('done', out);
}

module.exports = { W, H, FPS, rng, clamp, lerp, easeOut, easeIn, easeInOut, spring, pulse, mix, keys, C, FONT, pill, caption, captions, bottomShade, popCard, stampX, stampCheck, icon, character, handR, blinkAt, darkness, glow, render };
