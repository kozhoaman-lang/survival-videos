// Bakyt ake, ~50: round belly, short neck, broad shoulders, bald crown, thick greying mustache, heavy lids & eye bags.
// Examiner shirt with epaulettes, breast pocket, badge, strained belly button. Progression level 1..6 (more bags, more grey,
// plaster on the forehead and a coffee stain at 6).
import React from 'react';
import { Part, Ln, Tone, capsule, capShadow, capRim, GroundShadow } from '../rig/prims';
import { PAL } from '../rig/palette';
import { Eye, Brow } from '../rig/Face';
import { Hand } from '../rig/Hand';
import { Clipboard, Cup, Badge } from './Props';
import { Extra } from './Danchik';
import { View, Mouth, FaceP, Pose, basePose, face as faceOf, Emotion } from './common';

const S = PAL.bSkin, H = PAL.bHair, SH = PAL.shirt, PN = PAL.pants;
const GREY = '#C9C7CC';

const mustTone = (lvl: number): Tone => ({ ...H, hi: lvl >= 5 ? '#BDBBC0' : '#8A8686' });

// ---------------------------------------------------------------- mouth (lower lip / opening under the mustache)
const BMouth: React.FC<{ kind: Mouth; x: number; y: number; sx?: number }> = ({ kind, x, y, sx = 1 }) => {
  const L = S.line;
  const open = (d: string, teeth = true, tongue = true) => <Part t={{ ...S, base: PAL.mouthIn, line: L }} d={d} sw={3.4} under={false}>
    {tongue && <ellipse cx={0} cy={22} rx={16} ry={10} fill={PAL.tongue} />}
    {teeth && <rect x={-30} y={-12} width={60} height={13} fill={PAL.teeth} />}
    {teeth && <path d="M-8 -12 L-8 1 M8 -12 L8 1 M0 -12 L0 1" stroke={PAL.teethSh} strokeWidth={1.4} />}
  </Part>;
  let el: React.ReactNode;
  switch (kind) {
    case 'A': el = open('M-20 -2 Q0 -4 20 -2 Q17 24 0 26 Q-17 24 -20 -2Z'); break;
    case 'O': el = open('M-11 -2 Q0 -4 11 -2 Q14 14 9 22 Q0 28 -9 22 Q-14 14 -11 -2Z', false); break;
    case 'I': el = open('M-24 -2 Q0 -4 24 -2 Q20 12 0 13 Q-20 12 -24 -2Z', true, false); break;
    case 'shock': el = open('M-14 -2 Q0 -5 14 -2 Q19 26 10 38 Q0 44 -10 38 Q-19 26 -14 -2Z', false); break;
    case 'grimace': el = <Part t={{ ...S, base: PAL.teeth, line: L }} d="M-24 -3 Q0 -6 24 -3 Q27 6 24 12 Q0 15 -24 12 Q-27 6 -24 -3Z" sw={3.4} under={false}>
      <path d="M-30 4 L30 4" stroke={PAL.teethSh} strokeWidth={2} />{[-14, -5, 5, 14].map(t => <path key={t} d={`M${t} -8 L${t} 16`} stroke={PAL.teethSh} strokeWidth={1.6} />)}</Part>; break;
    case 'grin': el = open('M-26 -4 Q0 2 26 -4 Q20 22 0 24 Q-20 22 -26 -4Z'); break;
    case 'smirk': el = <g><path d="M-14 4 Q0 9 18 0 Q4 12 -14 4Z" fill={S.sh} /><Ln d="M-14 3 Q2 8 18 -2" c={L} w={3.4} /></g>; break;
    case 'frown': case 'flat': case 'wavy':
      el = <g><path d="M-14 6 Q0 1 14 6 Q0 13 -14 6Z" fill={S.sh} /><Ln d={kind === 'wavy' ? 'M-14 4 Q-6 0 0 4 Q6 8 14 3' : 'M-14 6 Q0 1 14 6'} c={L} w={3.4} /></g>; break;
    case 'M': el = <g><path d="M-12 -2 Q0 -6 12 -2 Q14 6 8 12 Q0 15 -8 12 Q-14 6 -12 -2Z" fill="#B86A5A" stroke={L} strokeWidth={2.6} /><Ln d="M-11 2 Q0 4 11 2" c={L} w={3} /><Ln d="M-14 -1 l-3 -3 M14 -1 l3 -3" c={L} w={2.2} /></g>; break;
    default: el = <g><path d="M-18 0 Q0 -2 18 0 Q10 12 0 12 Q-10 12 -18 0Z" fill="#B86A5A" stroke={L} strokeWidth={2.6} /><path d="M-10 4 Q0 6 10 4" stroke="#D88E7C" strokeWidth={2.4} fill="none" strokeLinecap="round" /></g>;
  }
  return <g transform={`translate(${x},${y}) scale(${sx},1)`}>{el}</g>;
};

const Mustache: React.FC<{ x: number; y: number; sx?: number; lvl: number; droop?: number }> = ({ x, y, sx = 1, lvl, droop = 0 }) => {
  const g = Math.min(1, 0.12 + lvl * 0.14);
  const d = `M0 -10 C10 -14 24 -14 34 -8 C44 -2 50 8 52 ${20 + droop} C46 ${18 + droop} 42 16 38 18 C34 ${24 + droop * 0.5} 28 22 24 17 C18 22 12 20 8 16 C4 20 -4 20 -8 16 C-12 20 -18 22 -24 17 C-28 22 -34 ${24 + droop * 0.5} -38 18 C-42 16 -46 ${18 + droop} -52 ${20 + droop} C-50 8 -44 -2 -34 -8 C-24 -14 -10 -14 0 -10Z`;
  const strands = [-38, -24, -9, 7, 21, 36];
  return <g transform={`translate(${x},${y}) scale(${sx},1)`}>
    <Part t={mustTone(lvl)} d={d} sh="M4 -2 C20 6 40 10 60 16 L60 40 L4 40Z" deep="M-60 14 C-30 22 30 22 60 14 L60 40 L-60 40Z" hi="M-30 -8 C-20 -12 -8 -11 -2 -8 C-10 -7 -20 -5 -28 -3Z M8 -8 C18 -12 30 -11 36 -6 C28 -6 18 -5 10 -4Z" sw={4} />
    {strands.map((sx2, i) => { const grey = ((i * 37) % 9) / 9 < g; return <path key={i} d={`M${sx2 * 0.5} ${-6} Q${sx2 * 0.85} ${2} ${sx2 * 1.05} ${12 + Math.abs(sx2) * 0.08}`} fill="none" stroke={grey ? '#A9A6AC' : '#4E4848'} strokeWidth={grey ? 1.8 : 1.5} strokeLinecap="round" opacity={grey ? 0.75 : 0.6} />; })}
    {g > 0.5 && <path d="M-46 14 q4 -8 12 -12 M40 12 q-4 -8 -10 -12" stroke={GREY} strokeWidth={2.4} fill="none" strokeLinecap="round" />}
  </g>;
};

const Ear: React.FC<{ x: number; y: number; dir: 1 | -1; s?: number }> = ({ x, y, dir, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${dir * s},${s})`}>
    <Part t={S} d="M-6 -24 C10 -30 24 -16 22 2 C20 20 10 30 -4 26 C0 10 0 -10 -6 -24Z" sh="M4 8 C12 16 16 24 4 34 L34 34 L34 0Z" rim="M0 -24 C12 -24 20 -12 21 0" sw={4} />
    <path d="M3 -14 C13 -16 15 -4 13 6 C11 14 6 17 2 15 C7 7 7 -4 3 -14Z" fill={S.sh} />
    <Ln d="M3 -14 C13 -16 15 -4 13 6 C11 14 6 17 2 15" c={S.line} w={2.6} />
  </g>
);

const Bags: React.FC<{ x: number; y: number; sx: number; lvl: number }> = ({ x, y, sx, lvl }) => {
  const n = Math.floor(lvl / 2);
  const dark = 0.2 + lvl * 0.08;
  return <g transform={`translate(${x},${y}) scale(${sx},1)`}>
    <path d="M-16 3 Q0 12 16 3 Q2 22 -16 3Z" fill="#9A6470" opacity={Math.min(0.6, dark * 0.8)} />
    {Array.from({ length: n }).map((_, i) => <path key={i} d={`M${-15 + i * 2} ${4 + i * 6} Q0 ${16 + i * 6} ${15 - i * 2} ${4 + i * 6}`} fill="none" stroke="#7B4A52" strokeWidth={2.2} opacity={0.75} strokeLinecap="round" />)}
  </g>;
};

const Plaster: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = -24 }) => (
  <g transform={`translate(${x},${y}) rotate(${r})`}>
    <rect x={-26} y={-8} width={52} height={16} rx={8} fill="#F0C9A0" stroke="#B98760" strokeWidth={2.4} />
    <rect x={-9} y={-6} width={18} height={12} rx={2} fill="#FBE6CF" stroke="#C99A72" strokeWidth={1.4} />
    {[-20, -15, 15, 20].map(px => [-3, 3].map(py => <circle key={px + '' + py} cx={px} cy={py} r={0.9} fill="#B98760" />))}
    <g transform={`translate(${-26},0) rotate(90)`}><rect x={-26} y={-8} width={52} height={16} rx={8} fill="#F0C9A0" stroke="#B98760" strokeWidth={2.4} transform="translate(26,-26) rotate(0)" opacity={0} /></g>
  </g>
);

// ---------------------------------------------------------------- head front / 3-4
export const BakytHead: React.FC<{ t?: number; f: FaceP; mouth?: Mouth; lvl?: number }> = ({ t = 0, f, mouth, lvl = 1 }) => {
  const R = 81 - 12 * t, Lx = -81 - 2 * t, cx = 14 * t;
  const d = `M${6 * t} -86 C${52} -86 ${R} -58 ${R} -12 C${R + 2} 30 ${R} 56 ${60 - 6 * t + cx} 74 C${44 + cx} 90 ${20 + cx} 95 ${cx} 95 C${-20 + cx} 95 ${-44} 90 -60 74 C${Lx} 56 ${Lx - 2} 30 ${Lx} -12 C${Lx} -58 -52 -86 ${6 * t} -86Z`;
  const eLx = -30 + 28 * t, eRx = 30 + 20 * t, nx = 36 * t, mx = 28 * t;
  const eLs = 1 - 0.04 * t, eRs = 1 - 0.42 * t;
  const g = Math.min(1, 0.12 + lvl * 0.14);
  const crop = { ...H, base: lvl >= 4 ? '#7A7472' : '#5E5755', sh: lvl >= 4 ? '#5C5654' : '#47403E', deep: '#2E2828', line: '#3A3333', rim: '#B5B0B0' };
  const sideHair = (x: number, dir: 1 | -1) => <g transform={`translate(${x},-12) scale(${dir * 1.25},1.3)`}>
    <Part t={crop} d="M4 -40 C-2 -34 -6 -24 -6 -12 C-7 2 -6 16 -2 30 C2 36 8 36 10 30 C8 24 12 20 9 14 C13 8 9 2 12 -4 C8 -10 13 -16 10 -22 C13 -28 9 -34 11 -40Z" sh="M4 -60 L20 -60 L20 40 L4 40Z" sw={2.8} under={false} />
    {[-40, -30, -20, -10, 0, 10].map((yy, i) => <path key={yy} d={`M${-2 + (i % 2) * 3} ${yy} q3 3 4 7`} fill="none" stroke={(i * 0.17 + 0.05) < g ? GREY : crop.rim} strokeWidth={1.8} strokeLinecap="round" opacity={0.9} />)}
  </g>;
  return (
    <g>
      <Part t={S} d={d} sh={`M${R - 22} -90 C${R - 6} -40 ${R - 12} 40 ${30 + cx} 100 L200 100 L200 -90Z`} rim={`M${Lx + 3} -40 C${Lx + 3} 10 ${Lx + 6} 50 -50 80`}
        hi={`M${-40 + 10 * t} -70 C${-30 + 10 * t} -80 ${-10 + 10 * t} -82 ${0 + 10 * t} -78 C${-14 + 10 * t} -74 ${-28 + 10 * t} -68 ${-34 + 10 * t} -60Z`}>
        {/* jowls + double chin */}
        <path d={`M${-56 + cx} 70 C${-30 + cx} 104 ${30 + cx} 104 ${56 + cx} 70 L${56 + cx} 110 L${-56 + cx} 110Z`} fill={S.sh} />
        <path d={`M${-30 + cx} 88 Q${cx} 98 ${30 + cx} 88`} fill="none" stroke={S.line} strokeWidth={2.6} opacity={0.7} />
        <ellipse cx={eLx - 6} cy={42} rx={18 * eLs} ry={10} fill="#D07C66" opacity={0.28} />
        <ellipse cx={eRx + 4} cy={42} rx={16 * eRs} ry={10} fill="#D07C66" opacity={0.28} />
      </Part>
      {sideHair(Lx + 2 + (t >= 0.35 ? 22 : 0), -1)}{t < 0.5 && sideHair(R - 2, 1)}
      {t < 0.35 && <Ear x={R - 2} y={8} dir={1} s={1 - t} />}
      {t < 0.35 && <Ear x={Lx + 2} y={8} dir={-1} s={1} />}
      {t >= 0.35 && <Ear x={Lx + 28 + 6 * t} y={10} dir={-1} s={0.95} />}
      {/* lonely comb-over strands */}
      <g transform={`translate(${12 * t},0)`} fill="none" strokeLinecap="round">
        <path d="M-30 -80 C-10 -92 14 -90 34 -76" stroke={H.base} strokeWidth={2.6} />
        <path d="M-24 -76 C-6 -86 16 -84 30 -70" stroke={lvl > 3 ? GREY : H.base} strokeWidth={2.2} />
        <path d="M-18 -84 C0 -96 22 -92 28 -82" stroke={H.base} strokeWidth={2} />
      </g>
      {/* forehead wrinkles */}
      <g transform={`translate(${20 * t},0)`}>
        <Ln d="M-32 -52 Q0 -58 32 -52" c={S.line} w={2.4} o={0.55} />
        <Ln d="M-24 -42 Q0 -47 24 -42" c={S.line} w={2.2} o={0.45} />
        {lvl >= 3 && <Ln d="M-18 -62 Q0 -66 18 -62" c={S.line} w={2} o={0.4} />}
      </g>
      <Bags x={eLx} y={12} sx={eLs} lvl={lvl} /><Bags x={eRx} y={12} sx={eRs} lvl={lvl} />
      <Eye cx={eLx} cy={2} rx={17} ry={14} p={f.eL} skin={S} iris={PAL.bIris} outer={-1} sx={eLs} soft />
      <Eye cx={eRx} cy={2} rx={17} ry={14} p={f.eR} skin={S} iris={PAL.bIris} outer={1} sx={eRs} soft />
      {/* nasolabial folds */}
      <Ln d={`M${nx - 22} 36 Q${nx - 32} 50 ${nx - 36} 62`} c={S.line} w={2.4} o={0.6} />
      <Ln d={`M${nx + 22} 36 Q${nx + 32} 50 ${nx + 34} 62`} c={S.line} w={2.4} o={0.6} />
      <BMouth kind={mouth ?? f.mouth} x={mx} y={80} sx={(1 - 0.2 * t) * 1.15} />
      <Mustache x={mx} y={52} sx={(1 - 0.2 * t) * 0.94} lvl={lvl} droop={f.mouth === 'shock' ? 6 : 0} />
      {/* big nose */}
      <g transform={`translate(${nx},0)`}>
        <Part t={S} d={`M-4 6 C-6 18 -16 24 -18 34 C-20 46 -8 50 0 47 C8 50 ${20 + 4 * t} 46 ${18 + 4 * t} 34 C${16 + 2 * t} 24 6 18 4 6Z`} sh={`M4 4 C8 20 ${22 + 4 * t} 30 ${20 + 4 * t} 50 L40 50 L40 0Z`} hi="M-6 30 C-6 26 -2 24 2 26 C0 28 -2 30 -2 33Z" sw={3.6} />
        <ellipse cx={-7} cy={43} rx={3.4} ry={2} fill={S.deep} /><ellipse cx={8 + 2 * t} cy={43} rx={3.4} ry={2} fill={S.deep} />
      </g>
            <Brow x={eLx + 12 * eLs} y={-26} p={f.bL} len={40} th={14} t={{ ...H, hi: g > 0.5 ? GREY : H.hi }} dir={-1} sx={eLs} />
      <Brow x={eRx - 12 * eRs} y={-26} p={f.bR} len={40} th={14} t={{ ...H, hi: g > 0.5 ? GREY : H.hi }} dir={1} sx={eRs} />
      {lvl >= 6 && <Plaster x={34 + 14 * t} y={-60} />}
      {f.sweat > 0 && <path d="M60 -40 C66 -30 70 -24 70 -18 C70 -10 64 -6 60 -6 C54 -6 50 -10 50 -18 C50 -24 54 -30 60 -40Z" fill="#BFE6FF" stroke="#5C9BD1" strokeWidth={2.6} />}
      <Extra kind={f.extra || undefined} x={R + 30} y={-96} />
    </g>
  );
};

// ---------------------------------------------------------------- head side (facing right)
export const BakytHeadSide: React.FC<{ f: FaceP; mouth?: Mouth; lvl?: number }> = ({ f, mouth, lvl = 1 }) => {
  const d = 'M-4 -86 C44 -88 70 -60 72 -24 L74 -4 C80 6 88 14 94 26 C100 38 94 48 82 48 L80 52 C82 66 80 80 66 90 C50 100 20 102 -4 96 C-30 92 -60 70 -76 30 C-88 -4 -78 -60 -40 -80 C-30 -84 -16 -86 -4 -86Z';
  return (
    <g>
      <Part t={S} d={d} sh="M-20 80 C10 100 50 100 70 86 L100 120 L-40 120Z" rim="M-74 20 C-82 -10 -76 -50 -44 -76"
        hi="M-30 -74 C-14 -82 8 -82 20 -76 C4 -74 -12 -70 -22 -64Z">
        <path d="M-4 92 Q30 100 60 88" fill="none" stroke={S.line} strokeWidth={2.4} opacity={0.6} />
        <ellipse cx={44} cy={40} rx={16} ry={10} fill="#D07C66" opacity={0.28} />
      </Part>
      <Part t={{ ...H, base: "#5E5755", sh: "#47403E", line: "#3A3333", rim: "#B5B0B0" }} d="M-72 -30 C-80 -6 -76 26 -58 52 C-48 56 -38 50 -30 44 C-36 40 -30 34 -34 28 C-28 22 -34 16 -28 10 C-34 2 -28 -6 -32 -14 C-26 -20 -32 -26 -28 -32 C-40 -36 -60 -36 -72 -30Z" sh="M-60 -50 L-20 -50 L-20 60 L-60 60Z" sw={2.8} under={false}>
        {[[-62, -20], [-56, 0], [-60, 20], [-48, 36], [-44, -10]].map(([a, b], i) => <path key={i} d={`M${a} ${b} q4 3 5 8`} stroke="#C9C7CC" strokeWidth={1.8} fill="none" />)}
      </Part>
      <Ear x={-16} y={10} dir={-1} s={1} />
      <Ln d="M30 -54 Q48 -56 62 -50" c={S.line} w={2.4} o={0.55} /><Ln d="M34 -44 Q50 -46 62 -40" c={S.line} w={2.2} o={0.45} />
      <Bags x={56} y={14} sx={0.5} lvl={lvl} />
      <Eye cx={56} cy={2} rx={15} ry={15} p={{ ...f.eL, lookX: Math.max(0.7, f.eL.lookX) }} skin={S} iris={PAL.bIris} outer={1} sx={0.5} soft />
      <BMouth kind={mouth ?? f.mouth} x={70} y={72} sx={0.5} />
      <Mustache x={74} y={58} sx={0.62} lvl={lvl} />
      <Ln d="M84 44 C88 40 92 40 94 44" c={S.line} w={2.4} />
      <circle cx={88} cy={28} r={3.4} fill={S.hi} />
      <Brow x={42} y={-26} p={f.bR} len={30} th={14} t={H} dir={1} sx={0.9} />
      {lvl >= 6 && <Plaster x={52} y={-62} r={-30} />}
      <Extra kind={f.extra || undefined} x={70} y={-100} />
    </g>
  );
};

export const BakytHeadBack: React.FC<{ lvl?: number }> = ({ lvl = 1 }) => {
  const g = Math.min(1, 0.12 + lvl * 0.14);
  return <g>
    <Ear x={-80} y={10} dir={-1} /><Ear x={80} y={10} dir={1} />
    <Part t={S} d="M0 -86 C52 -86 82 -58 82 -12 C82 30 76 64 50 84 C30 96 -30 96 -50 84 C-76 64 -82 30 -82 -12 C-82 -58 -52 -86 0 -86Z"
      sh="M30 -90 C70 -50 70 40 40 100 L120 100 L120 -90Z" hi="M-40 -66 C-30 -78 -8 -82 6 -78 C-10 -74 -24 -68 -32 -58Z" rim="M-78 -20 C-80 20 -70 56 -48 80" />
    <Part t={{ ...H, base: lvl >= 4 ? '#88827F' : '#6E6866', sh: '#55504E', deep: '#2E2828', line: '#3A3333', rim: '#C5C0C0' }} d="M-80 -30 C-84 10 -76 50 -50 70 C-20 84 20 84 50 70 C76 50 84 10 80 -30 C76 -22 72 -20 66 -14 C60 -14 56 -8 48 -6 C40 -2 34 0 24 -2 C16 2 8 0 0 2 C-8 0 -16 2 -24 -2 C-34 0 -40 -2 -48 -6 C-56 -8 -60 -14 -66 -14 C-72 -20 -76 -22 -80 -30Z"
      sh="M20 -10 L90 -10 L90 90 L20 90Z" sw={3.4}>
      {Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M${-70 + i * 10.5} ${-6 + Math.abs(i - 6.5) * -1.5} l2 14`} stroke={i % Math.max(1, Math.round(3 - g * 2)) === 0 ? GREY : H.rim} strokeWidth={2.2} opacity={0.8} />)}
    </Part>
    <Ln d="M-40 92 Q0 100 40 92" c={S.line} w={2.6} o={0.7} /><Ln d="M-30 102 Q0 108 30 102" c={S.line} w={2.4} o={0.6} />
  </g>;
};

// ---------------------------------------------------------------- limbs
const BArm: React.FC<{ x: number; y: number; a: [number, number]; hand: Pose['hL']; flip: boolean; dim?: boolean; holding?: React.ReactNode; hairy?: boolean }> = ({ x, y, a, hand, flip, dim, holding }) => {
  const inner = a[1] > 0 ? -1 : 1;
  return (
    <g transform={`translate(${x},${y}) rotate(${a[0]})`} style={dim ? { filter: 'brightness(0.8) saturate(1.1)' } : undefined}>
      {/* skin upper arm under the short sleeve */}
      <Part t={S} d={capsule(88, 44, 38, 2)} sh={capShadow(88, 44, 38, 0.15)} rim={capRim(88, 44, 38)} />
      <g transform={`translate(0,84) rotate(${a[1]})`}>
        <Part t={S} d={capsule(78, 38, 32, 3)} sh={capShadow(78, 38, 32, 0.15)} rim={capRim(78, 38, 32)}
          deep={`M${inner * 22} -8 Q${inner * 6} ${4 + Math.abs(a[1]) * 0.06} ${inner * 22} ${16 + Math.abs(a[1]) * 0.08}Z`} />
        {[[-8, 20], [4, 30], [-4, 44], [8, 52], [-10, 58]].map(([hx, hy], i) => <path key={i} d={`M${hx} ${hy} l4 -3`} stroke={H.base} strokeWidth={1.6} opacity={0.55} strokeLinecap="round" />)}
        {Math.abs(a[1]) > 25 && <Ln d={`M${inner * 16} 2 Q${inner * 6} 6 ${inner * 12} 12`} c={S.line} w={2.4} />}
        <g transform="translate(0,72)"><Hand t={S} pose={hand} flip={flip} scale={1.4}>{holding}</Hand></g>
      </g>
      {/* short sleeve */}
      <Part t={SH} d="M-28 -6 C-32 18 -30 40 -28 56 C-10 62 10 62 28 56 C32 40 32 18 28 -6Z" sh="M6 -10 C14 20 14 40 10 64 L40 64 L40 -10Z"
        deep="M-30 48 C-10 56 10 56 30 48 L30 70 L-30 70Z" rim="M-25 0 C-28 20 -27 38 -25 50" />
      <Ln d="M-26 48 C-10 54 10 54 26 48" c={SH.line} w={2.4} />
      <Ln d="M-14 14 Q-6 22 -12 32" c={SH.line} w={2.2} o={0.7} />
      <Ln d="M10 30 Q16 36 12 44" c={SH.line} w={2} o={0.6} />
    </g>
  );
};

const BShoe: React.FC<{ view: View; flip?: boolean }> = ({ view, flip }) => {
  const T = PAL.shoe;
  if (view === 'side' || view === '34') {
    const k = view === '34' ? 0.75 : 1;
    return <g transform={`scale(${flip ? -k : k},1)`}>
      <Part t={T} d="M-30 -10 C-14 -14 4 -12 14 -6 C30 0 44 4 48 12 L48 20 L-32 20 C-34 8 -34 -4 -30 -10Z" sh="M-34 10 L52 10 L52 24 L-34 24Z"
        hi="M14 -2 C24 2 34 4 40 8 C32 8 22 6 14 2Z" rim="M-26 -10 C-14 -13 2 -11 12 -6" />
      <rect x={-34} y={17} width={84} height={7} rx={3} fill="#121216" />
      <Ln d="M-4 -8 C2 -2 10 0 18 0" c={T.rim} w={1.6} o={0.5} />
    </g>;
  }
  return <g transform={flip ? 'scale(-1,1)' : undefined}>
    <Part t={T} d="M-24 -8 C-31 4 -32 12 -30 18 L30 18 C32 12 31 4 24 -8 C12 -12 -12 -12 -24 -8Z" sh="M8 -20 L40 -20 L40 24 L8 24Z"
      hi={view === 'back' ? undefined : 'M-14 2 C-10 -2 -2 -2 2 0 C-4 2 -10 4 -12 6Z'} rim="M-22 -5 C-27 3 -29 9 -28 14" />
    <rect x={-32} y={16} width={64} height={8} rx={3} fill="#121216" />
  </g>;
};

const BLeg: React.FC<{ x: number; y: number; a: [number, number]; view: View; flipShoe?: boolean; dim?: boolean }> = ({ x, y, a, view, flipShoe, dim }) => (
  <g transform={`translate(${x},${y}) rotate(${a[0]})`} style={dim ? { filter: 'brightness(0.8) saturate(1.1)' } : undefined}>
    <Part t={PN} d={capsule(90, 66, 50, 3)} sh={capShadow(90, 66, 50, 0.12)} rim={capRim(90, 66, 50)} />
    {view !== 'back' && <Ln d={view === 'side' ? 'M22 8 L18 86' : 'M-4 10 L-2 88'} c={PN.hi!} w={2.2} />}
    <Ln d="M-18 50 Q-8 56 -14 66" c={PN.line} w={2} o={0.6} />
    <g transform={`translate(0,86) rotate(${a[1]})`}>
      <g transform={`translate(0,64) rotate(${-(a[0] + a[1])}) scale(1.05)`}><BShoe view={view} flip={flipShoe} /></g>
      <Part t={PN} d={`M-25 0 C-26 30 -26 50 -26 64 L-25 68 Q0 72 25 68 L26 64 C26 50 26 30 25 0 A25 18 0 0 0 -25 0Z`} sh={capShadow(64, 50, 50, 0.12)} rim={capRim(64, 50, 50)} />
      {view !== 'back' && <Ln d={view === 'side' ? 'M18 0 L18 66' : 'M-2 2 L-1 66'} c={PN.hi!} w={2.2} />}
      <Ln d="M-20 6 Q-8 2 6 6" c={PN.line} w={2} o={0.6} />
    </g>
  </g>
);

// ---------------------------------------------------------------- body
export const Bakyt: React.FC<{
  view?: View; emotion?: Emotion; f?: FaceP; mouth?: Mouth; pose?: Partial<Pose>; x?: number; y?: number; scale?: number; shadow?: boolean;
  lvl?: number; props?: boolean;
}> = ({ view = 'front', emotion = 'neutral', f, mouth, pose: pp, x = 0, y = 0, scale = 1, shadow = true, lvl = 1, props = true }) => {
  const P = basePose({ aL: [16, -104], aR: [-12, -112], hL: 'grip', hR: 'grip', lL: [2, -1], lR: [-2, 1], ...pp });
  const F = f ?? faceOf(emotion, 'b');
  const t = view === '34' ? 0.55 : 0;
  const br = P.breath;
  const sq = P.squash, sx = 1 / Math.sqrt(sq);
  const headY = -456 + P.headDy, headX = P.headDx + (view === '34' ? 8 : 0);
  const board = props ? <g transform={`translate(-2,20) rotate(${(P.aL[0] + P.aL[1])}) translate(30,8)`}><Clipboard /></g> : undefined;
  const cup = props ? <g transform={`translate(0,14) rotate(${-(P.aR[0] + P.aR[1])})`}><Cup scale={1.25} /></g> : undefined;

  let body: React.ReactNode;
  if (view === 'side') {
    body = <g>
      <BArm x={-12} y={-336 - br} a={[-30, -70]} hand="grip" flip dim holding={props ? <g transform="translate(0,14) rotate(-100)"><Cup scale={1.25} /></g> : undefined} />
      <BLeg x={-12} y={-180} a={[4, -2]} view="side" dim />
      <BLeg x={10} y={-180} a={[-4, 2]} view="side" />
      <g transform={`translate(0,${-br * 0.5})`}>
        <Part t={PN} d="M-60 -196 L66 -196 L60 -146 L-56 -146Z" sh="M20 -200 L80 -200 L80 -140 L20 -140Z" />
        <Part t={SH} d="M-40 -372 C-70 -358 -78 -320 -74 -280 C-70 -240 -66 -210 -62 -186 L70 -182 C118 -196 132 -250 108 -296 C92 -330 66 -360 34 -372Z"
          sh="M-80 -300 C-50 -290 -50 -220 -70 -170 L-90 -170 L-90 -300Z" deep="M-70 -198 C0 -186 60 -184 120 -200 L120 -170 L-70 -170Z"
          rim="M70 -320 C98 -300 116 -260 104 -214">
          <path d="M40 -340 C74 -320 96 -280 92 -220" fill="none" stroke={SH.line} strokeWidth={2.2} opacity={0.6} />
          {[-320, -290, -258, -226].map(yy => <circle key={yy} cx={46 + (yy + 340) * 0.55} cy={yy} r={4} fill="#EEF4FB" stroke={SH.line} strokeWidth={1.8} />)}
          <Ln d="M60 -250 l-14 -8 M62 -244 l-16 2" c={SH.line} w={2} o={0.7} />
          {lvl >= 6 && <path d="M86 -270 c10 4 16 16 10 26 c-4 8 -2 16 -6 22 c-6 -6 -14 -8 -16 -20 c-2 -14 4 -26 12 -28Z" fill="#8A5A34" opacity={0.85} />}
        </Part>
        <Part t={PAL.belt} d="M-62 -200 L70 -196 L68 -180 L-60 -184Z" sw={3.4} />
        <Part t={SH} d="M-36 -382 C-16 -366 20 -362 40 -372 L44 -356 C20 -346 -16 -350 -40 -362Z" sh="M0 -390 L50 -390 L50 -340 L0 -340Z" />
        <Part t={PAL.epaul} d="M-30 -374 L10 -370 L10 -360 L-30 -364Z" sw={3} />
      </g>
      <BArm x={2} y={-338 - br} a={[18, -96]} hand="grip" flip={false} holding={props ? <g transform="translate(-2,22) rotate(78)"><Clipboard side /></g> : undefined} />
      <g transform={`translate(${12 + P.headDx},${headY + 6}) rotate(${P.headRot + F.tilt * 0.4})`}><BakytHeadSide f={F} mouth={mouth} lvl={lvl} /></g>
    </g>;
  } else {
    const back = view === 'back';
    const shL = -104 + 12 * t, shR = 104 - 30 * t;
    const torso = <g transform={`translate(${6 * t},${-br * 0.5}) scale(${1 - 0.18 * t},1)`}>
      <Part t={PN} d="M-104 -196 L104 -196 L98 -140 Q0 -120 -98 -140Z" sh="M30 -200 L120 -200 L120 -120 L30 -120Z" />
      <Part t={PAL.belt} d="M-104 -198 L104 -198 L104 -178 L-104 -178Z" sh="M60 -200 L110 -200 L110 -170 L60 -170Z" sw={3.4} />
      {!back && <g transform={`translate(${16 * t},0)`}><Part t={PAL.metal} d="M-14 -190 L14 -190 L14 -168 L-14 -168Z" sw={3} hi="M-10 -188 L-2 -188 L-4 -184 L-10 -184Z" /></g>}
      <Part t={SH} d="M-36 -372 C-70 -368 -98 -362 -106 -342 C-116 -314 -114 -286 -116 -264 C-130 -240 -128 -206 -108 -190 C-72 -170 72 -170 108 -190 C128 -206 130 -240 116 -264 C114 -286 116 -314 106 -342 C98 -362 70 -368 36 -372Z"
        sh="M56 -380 C90 -330 104 -250 70 -170 L140 -170 L140 -380Z" deep="M-120 -214 C-60 -186 60 -186 120 -214 L120 -160 L-120 -160Z"
        rim="M-104 -336 C-112 -310 -112 -284 -114 -262 C-124 -240 -124 -214 -110 -196">
        {/* belly tension lines + underside */}
        <Ln d="M-86 -330 Q-74 -318 -66 -300" c={SH.line} w={2.4} /><Ln d="M86 -330 Q74 -318 66 -300" c={SH.line} w={2.4} />
        <Ln d="M-100 -230 Q-84 -224 -70 -228" c={SH.line} w={2.2} o={0.7} /><Ln d="M98 -236 Q84 -228 70 -232" c={SH.line} w={2.2} o={0.7} />
        {!back && <g transform={`translate(${18 * t},0)`}>
          <Ln d="M0 -364 L0 -176" c={SH.line} w={2.6} />
          <path d="M6 -364 L6 -176" stroke={SH.sh} strokeWidth={3} />
          {/* strained button: fabric pulled into an X, undershirt peeking */}
          <path d="M-7 -246 Q0 -252 7 -246 Q0 -236 -7 -246Z" fill="#F7F5EE" stroke={SH.line} strokeWidth={1.8} />
          <path d="M-7 -222 Q0 -228 7 -222 Q0 -213 -7 -222Z" fill="#F7F5EE" stroke={SH.line} strokeWidth={1.8} />
          <Ln d="M-30 -250 Q-14 -240 -4 -236 M30 -250 Q14 -240 4 -236 M-30 -220 Q-14 -230 -4 -234 M30 -220 Q14 -230 4 -234" c={SH.line} w={2} o={0.75} />
          {[-338, -304, -270, -234, -200].map(yy => <g key={yy}><circle cx={0} cy={yy} r={5} fill="#EEF4FB" stroke={SH.line} strokeWidth={2} /><circle cx={-1.6} cy={yy - 1.6} r={1.6} fill="#fff" /></g>)}
          {/* breast pocket with pen */}
          <Part t={SH} d="M36 -322 L80 -322 L80 -278 Q58 -272 36 -278Z" sh="M66 -330 L90 -330 L90 -270 L66 -270Z" sw={3} under={false}>
            <path d="M36 -322 L80 -322 L80 -310 L36 -310Z" fill={SH.sh} />
          </Part>
          <Part t={SH} d="M34 -324 L82 -324 L82 -310 L58 -304 L34 -310Z" sw={3} />
          <circle cx={58} cy={-310} r={3} fill="#EEF4FB" stroke={SH.line} strokeWidth={1.6} />
          <rect x={44} y={-334} width={6} height={22} rx={2} fill="#2747A8" stroke="#162C70" strokeWidth={1.6} />
          <rect x={45} y={-336} width={4} height={5} fill="#D7DCE6" />
          {/* badge */}
          <g transform="translate(-58,-296) rotate(-4)"><Badge s={0.92} /></g>
          {lvl >= 6 && <g><path d="M22 -262 c14 2 24 14 20 28 c-2 10 4 20 -2 30 c-6 -4 -10 -12 -16 -10 c-10 4 -18 -4 -16 -14 c2 -10 -6 -16 0 -24 c4 -6 8 -10 14 -10Z" fill="#8A5A34" opacity={0.85} />
            <circle cx={50} cy={-226} r={4} fill="#8A5A34" opacity={0.8} /><circle cx={16} cy={-200} r={3} fill="#8A5A34" opacity={0.8} /></g>}
        </g>}
        {back && <g>
          <Ln d="M-100 -326 Q0 -306 100 -326" c={SH.line} w={2.6} />
          <Ln d="M0 -326 L0 -300" c={SH.line} w={2.2} />
          <Ln d="M-10 -300 Q0 -296 10 -300" c={SH.line} w={2.2} />
          <Ln d="M-40 -230 Q-20 -222 0 -226" c={SH.line} w={2} o={0.6} />
        </g>}
      </Part>
      {/* collar + epaulettes */}
      {!back ? <g transform={`translate(${18 * t},0)`}>
        <Part t={SH} d="M-44 -378 C-30 -368 -12 -360 0 -352 L-16 -334 C-30 -346 -42 -360 -48 -370Z" sh="M-60 -360 L0 -340 L0 -330 L-60 -330Z" sw={3.4} />
        <Part t={SH} d="M44 -378 C30 -368 12 -360 0 -352 L16 -334 C30 -346 42 -360 48 -370Z" sh="M0 -360 L60 -360 L60 -330 L0 -330Z" sw={3.4} />
      </g> : <Part t={SH} d="M-46 -380 C-20 -372 20 -372 46 -380 L44 -366 C20 -360 -20 -360 -44 -366Z" sh="M10 -390 L60 -390 L60 -360 L10 -360Z" />}
      <Part t={PAL.epaul} d="M-46 -372 L-96 -356 L-92 -342 L-44 -360Z" sh="M-100 -350 L-40 -350 L-40 -340 L-100 -340Z" rim="M-50 -368 L-92 -354" sw={3.4} />
      <Part t={PAL.epaul} d="M46 -372 L96 -356 L92 -342 L44 -360Z" sh="M40 -350 L100 -350 L100 -340 L40 -340Z" sw={3.4} />
      <circle cx={-56} cy={-363} r={4} fill="#E8C35A" stroke="#8A6A1E" strokeWidth={1.6} /><circle cx={56} cy={-363} r={4} fill="#E8C35A" stroke="#8A6A1E" strokeWidth={1.6} />
    </g>;
    const neck = <g transform={`translate(${8 * t},0)`}>
      <Part t={S} d="M-38 -350 L-36 -400 L36 -400 L38 -350Z" sh="M10 -410 L50 -410 L50 -340 L10 -340Z" />
      <path d="M-40 -400 L40 -400 L40 -382 Q0 -374 -40 -382Z" fill={S.deep} opacity={0.8} />
    </g>;
    body = <g>
      {t > 0 && <BArm x={shR} y={-338 - br} a={P.aR} hand={P.hR} flip={false} dim holding={cup} />}
      <BLeg x={-48 + 4 * t} y={-180} a={P.lL} view={back ? 'back' : view} flipShoe={!back && t === 0} />
      <BLeg x={48 - 10 * t} y={-180} a={P.lR} view={back ? 'back' : view} dim={t > 0} />
      {neck}
      {torso}
      <BArm x={shL} y={-338 - br} a={back ? [8, -6] : P.aL} hand={back ? 'relaxed' : P.hL} flip={!back} holding={back ? undefined : board} />
      {t === 0 && <BArm x={shR} y={-338 - br} a={back ? [-8, 6] : P.aR} hand={back ? 'relaxed' : P.hR} flip={back} holding={back ? undefined : cup} />}
      <g transform={`translate(${headX},${headY}) rotate(${P.headRot + F.tilt})`}>
        {back ? <BakytHeadBack lvl={lvl} /> : <BakytHead t={t} f={F} mouth={mouth} lvl={lvl} />}
      </g>
    </g>;
  }
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {shadow && <GroundShadow rx={140} ry={20} x={20} />}
      <g transform={`rotate(${P.lean}) scale(${sx},${sq})`}>{body}</g>
    </g>
  );
};
