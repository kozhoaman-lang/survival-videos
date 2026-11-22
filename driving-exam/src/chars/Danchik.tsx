// Danchik, 20: skinny, long limbs, slouchy; backwards navy cap, orange hoodie, light ripped jeans, white sneakers.
// Built from separate SVG parts (head, brows, eyes, lids, mouth, torso, upper arm, forearm, hand, thigh, shin, foot).
import React from 'react';
import { Part, Ln, Tone, capsule, capShadow, capRim, GroundShadow, lerp } from '../rig/prims';
import { PAL } from '../rig/palette';
import { Eye, Brow } from '../rig/Face';
import { Hand } from '../rig/Hand';
import { View, Mouth, FaceP, Pose, basePose, face as faceOf, Emotion } from './common';

const S = PAL.dSkin, H = PAL.dHair, CP = PAL.cap, HD = PAL.hoodie, J = PAL.jeans;

// ---------------------------------------------------------------- mouth
export const DMouth: React.FC<{ kind: Mouth; x: number; y: number; sx?: number }> = ({ kind, x, y, sx = 1 }) => {
  const L = S.line;
  const open = (d: string, teethTop = -6, teethBot = 4, lower = false, tongue = true, gap = true) => (
    <Part t={{ ...S, base: PAL.mouthIn, line: L }} d={d} sw={3.4} under={false}>
      {tongue && <ellipse cx={2} cy={30} rx={20} ry={14} fill={PAL.tongue} />}
      {tongue && <path d="M2 19 L2 28" stroke={PAL.tongueSh} strokeWidth={2} />}
      <rect x={-40} y={teethTop - 10} width={80} height={teethBot - teethTop + 10} fill={PAL.teeth} />
      <rect x={-40} y={teethBot - 2.5} width={80} height={2.5} fill={PAL.teethSh} />
      {gap && <rect x={-1.6} y={teethTop - 10} width={3.6} height={teethBot - teethTop + 10} fill={PAL.mouthIn} />}
      {[-15, -8, 8, 15].map(t => <path key={t} d={`M${t} ${teethTop - 6} L${t} ${teethBot - 1}`} stroke={PAL.teethSh} strokeWidth={1.4} />)}
      {lower && <rect x={-40} y={10} width={80} height={20} fill={PAL.teeth} />}
      {lower && <path d="M-40 10 L40 10" stroke={PAL.teethSh} strokeWidth={1.4} />}
    </Part>
  );
  let el: React.ReactNode = null;
  switch (kind) {
    case 'closed': el = <g><Ln d="M-30 -5 Q0 14 30 -5" c={L} w={3.8} /><Ln d="M-29 -5 Q-26 -2 -27 2" c={L} w={2.4} /><Ln d="M29 -5 Q26 -2 27 2" c={L} w={2.4} />
      <path d="M-10 9 Q0 14 10 9" fill="none" stroke={S.sh} strokeWidth={3} strokeLinecap="round" /></g>; break;
    case 'M': el = <g><Ln d="M-17 2 Q-8 -1 0 1 Q8 -1 17 2" c={L} w={3.8} /><path d="M-11 6 Q0 13 11 6" fill="none" stroke={S.sh} strokeWidth={3.5} strokeLinecap="round" />
      <path d="M-12 -3 Q0 -7 12 -3" fill="none" stroke={S.sh} strokeWidth={2.4} strokeLinecap="round" opacity={0.8} /></g>; break;
    case 'A': el = open('M-24 -3 Q0 -7 24 -3 Q21 27 0 30 Q-21 27 -24 -3Z', -4, 5); break;
    case 'O': el = open('M-13 -4 Q0 -8 13 -4 Q17 12 11 24 Q0 32 -11 24 Q-17 12 -13 -4Z', -5, 1, false, true, true); break;
    case 'I': el = open('M-29 -2 Q0 -5 29 -2 Q24 15 0 16 Q-24 15 -29 -2Z', -3, 4, true, false); break;
    case 'grin': el = <g transform="scale(1.2)">{open('M-34 -6 Q0 2 34 -6 Q28 34 0 37 Q-28 34 -34 -6Z', -4, 9)}<Ln d="M-37 -10 Q-34 -6 -35 -1" c={L} w={2.6} /><Ln d="M37 -10 Q34 -6 35 -1" c={L} w={2.6} /></g>; break;
    case 'smirk': el = <g><Ln d="M-20 4 Q4 10 25 -8" c={L} w={3.8} /><Ln d="M23 -12 Q26 -8 30 -7" c={L} w={2.6} /><path d="M-4 12 Q6 13 13 7" fill="none" stroke={S.sh} strokeWidth={3} strokeLinecap="round" /></g>; break;
    case 'wavy': el = <g><Ln d="M-22 4 Q-14 -4 -6 3 Q2 10 10 3 Q16 -2 22 2" c={L} w={3.6} /><path d="M-6 12 Q2 15 8 12" fill="none" stroke={S.sh} strokeWidth={2.6} strokeLinecap="round" /></g>; break;
    case 'grimace': el = <Part t={{ ...S, base: PAL.teeth, line: L }} d="M-30 -7 Q0 -11 30 -7 Q35 4 30 15 Q0 19 -30 15 Q-35 4 -30 -7Z" sw={3.4} under={false}>
      <path d="M-40 4 Q0 7 40 4" stroke={PAL.teethSh} strokeWidth={2.2} fill="none" />
      {[-21, -12, -4, 4, 12, 21].map(t => <path key={t} d={`M${t} -12 L${t} 20`} stroke={PAL.teethSh} strokeWidth={1.8} />)}
      <rect x={-1.6} y={-12} width={3.4} height={16} fill={PAL.mouthIn} />
    </Part>; break;
    case 'flat': el = <g><Ln d="M-18 4 Q0 2 18 5" c={L} w={3.6} /><path d="M-8 11 Q0 13 8 11" fill="none" stroke={S.sh} strokeWidth={2.6} strokeLinecap="round" /></g>; break;
    case 'frown': el = <g><Ln d="M-20 8 Q0 -4 20 8" c={L} w={3.6} /></g>; break;
    case 'shock': el = <Part t={{ ...S, base: PAL.mouthIn, line: L }} d="M-15 -6 Q0 -10 15 -6 Q22 22 13 40 Q0 50 -13 40 Q-22 22 -15 -6Z" sw={3.4} under={false}>
      <ellipse cx={0} cy={44} rx={14} ry={10} fill={PAL.tongue} />
      <rect x={-20} y={-16} width={40} height={13} fill={PAL.teeth} /><rect x={-1.6} y={-16} width={3.4} height={13} fill={PAL.mouthIn} />
      <path d="M-2 0 Q0 8 2 0" fill={PAL.tongueSh} />
    </Part>; break;
  }
  return <g transform={`translate(${x},${y}) scale(${sx},1)`}>{el}</g>;
};

// ---------------------------------------------------------------- small parts
const Ear: React.FC<{ x: number; y: number; dir: 1 | -1; s?: number; t?: Tone }> = ({ x, y, dir, s = 1, t = S }) => (
  <g transform={`translate(${x},${y}) scale(${dir * s},${s})`}>
    <Part t={t} d="M-4 -19 C9 -25 20 -12 18 3 C16 18 7 27 -4 22 C-1 8 -1 -8 -4 -19Z" sh="M4 8 C10 14 14 20 4 30 L30 30 L30 0Z" rim="M2 -20 C12 -20 18 -10 17 0" sw={4} />
    <path d="M3 -11 C11 -13 13 -3 11 5 C9 12 5 14 2 12 C6 6 6 -3 3 -11Z" fill={t.sh} />
    <Ln d="M3 -11 C11 -13 13 -3 11 5 C9 11 5 14 2 12" c={t.line} w={2.6} />
    <Ln d="M4 -2 Q8 0 6 6" c={t.deep} w={2} />
  </g>
);

const Freckles: React.FC<{ x: number; sx: number }> = ({ x, sx }) => (
  <g transform={`translate(${x},0) scale(${sx},1)`} fill="#B5704F" opacity={0.85}>
    {[[-19, 27, 2.1], [-12, 31, 1.7], [-24, 33, 1.6], [-6, 22, 1.5], [7, 22, 1.5], [14, 30, 1.9], [21, 27, 1.6], [24, 33, 1.5], [-15, 36, 1.3], [17, 36, 1.3]]
      .map(([a, b, r], i) => <circle key={i} cx={a} cy={b} r={r} />)}
  </g>
);

const Sweat: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M0 -14 C6 -4 10 2 10 7 C10 13 5 17 0 17 C-5 17 -10 13 -10 7 C-10 2 -6 -4 0 -14Z" fill="#BFE6FF" stroke="#5C9BD1" strokeWidth={2.6} />
    <ellipse cx={-3.5} cy={6} rx={2.4} ry={4} fill="#fff" />
  </g>
);

export const Extra: React.FC<{ kind?: string; x: number; y: number }> = ({ kind, x, y }) => {
  if (!kind) return null;
  const col = kind === '!' ? '#FF4A3D' : kind === '?' ? '#FFB400' : '#7C8BD6';
  if (kind === 'zzz') return <g transform={`translate(${x},${y})`} fontFamily="Montserrat" fontWeight={900} fill="#8A97E0" stroke="#3B4590" strokeWidth={3} paintOrder="stroke">
    <text x={0} y={0} fontSize={30}>z</text><text x={18} y={-22} fontSize={38}>z</text><text x={40} y={-50} fontSize={48}>Z</text></g>;
  return <g transform={`translate(${x},${y}) rotate(12)`}>
    <text x={0} y={0} fontSize={78} fontFamily="Montserrat" fontWeight={900} fill={col} stroke="#3A2418" strokeWidth={6} paintOrder="stroke" textAnchor="middle">{kind}</text>
  </g>;
};

// ---------------------------------------------------------------- head (front / three-quarter)
export const DanchikHead: React.FC<{ t?: number; f: FaceP; mouth?: Mouth }> = ({ t = 0, f, mouth }) => {
  const R = 75 - 12 * t, Lx = -76 - 3 * t, cx = 16 * t;
  const headD = `M${6 * t} -82 C${46} -84 ${R} -54 ${R} -8 C${R} 34 ${58 - 8 * t + cx} 70 ${30 + cx} 88 C${18 + cx} 95 ${-18 + cx} 95 ${-30 + cx * 0.6} 88 C-58 70 ${Lx} 36 ${Lx} -8 C${Lx} -54 -46 -84 ${6 * t} -82Z`;
  const eLx = -31 + 30 * t, eRx = 31 + 22 * t, nx = 40 * t, mx = 30 * t;
  const eRs = 1 - 0.42 * t, eLs = 1 - 0.04 * t;
  const sh = `M${R - 20} -90 C${R - 6} -40 ${R - 14} 30 ${36 + cx} 100 L200 100 L200 -90Z`;
  const capX = 34 * t;
  return (
    <g>
      {/* back hair mass + visor (behind) */}
      <Part t={H} d={`M${Lx - 4} -50 C${Lx - 14} -26 ${Lx - 10} 0 ${Lx - 4} 14 L${Lx - 14} 24 L${Lx + 2} 22 L${Lx - 4} 36 L${Lx + 12} 22 C${Lx + 18} 0 ${Lx + 16} -30 ${Lx + 26} -50Z`} sh={`M${Lx + 4} -60 L${Lx + 40} -60 L${Lx + 40} 40 L${Lx + 6} 40Z`} />
      <Part t={H} d={`M${R + 4} -50 C${R + 14} -26 ${R + 10} 0 ${R + 4} 14 L${R + 14} 24 L${R - 2} 22 L${R + 2} 34 L${R - 12} 22 C${R - 18} 0 ${R - 16} -30 ${R - 26} -50Z`} sh={`M${R - 40} -60 L${R + 40} -60 L${R + 40} 40 L${R - 40} 40Z`} />
      {t > 0.2 && <Part t={CP} d={`M${-62 + capX * 0.2} -66 C${-96} -72 ${-128} -66 ${-142} -52 C${-130} -40 ${-100} -40 ${-70 + capX * 0.2} -50Z`} sh="M-150 -58 L-60 -58 L-60 -30 L-150 -30Z" rim="M-135 -55 C-120 -66 -96 -70 -70 -64" />}
      {t < 0.35 && <Ear x={R - 2} y={6} dir={1} s={1 - t} />}
      {/* face */}
      <Part t={S} d={headD} sh={sh} rim={`M${Lx + 3} -40 C${Lx + 3} 10 -60 60 -40 84`}>
        {/* cap shadow on forehead */}
        <path d="M-100 -70 L100 -70 L100 -42 C60 -30 -60 -30 -100 -42Z" fill={S.sh} />
        <path d="M-100 -70 L100 -70 L100 -48 C60 -40 -60 -40 -100 -48Z" fill={S.deep} />
        {/* jaw underside / cheek bone */}
        <path d={`M${-40 + cx} 96 C${-20 + cx} 84 ${20 + cx} 84 ${44 + cx} 96Z`} fill={S.sh} />
        {/* blush */}
        <ellipse cx={eLx - 4} cy={46} rx={16 * eLs} ry={8} fill="#F08A78" opacity={0.25 + f.blush * 0.4} />
        <ellipse cx={eRx + 2} cy={46} rx={15 * eRs} ry={8} fill="#F08A78" opacity={0.25 + f.blush * 0.4} />
      </Part>
      {t >= 0.35 && <Ear x={Lx + 26 + 6 * t} y={8} dir={-1} s={0.95} />}
      {/* nose (with shadow under it) */}
      <g transform={`translate(${nx},0)`}>
        <path d={`M${4 + 6 * t} 14 C${8 + 8 * t} 24 ${12 + 6 * t} 34 ${10 + 4 * t} 40 L${3} 40Z`} fill={S.sh} opacity={0.9} />
        <path d="M-11 47 Q1 56 13 47 Q1 51 -11 47Z" fill={S.deep} opacity={0.8} />
        <Ln d={`M-9 36 C-13 45 -5 50 0 48 C5 50 ${13 + 4 * t} 45 ${9 + 3 * t} 36`} c={S.line} w={3.2} />
        <Ln d={`M${5 + 5 * t} 14 C${8 + 6 * t} 22 ${10 + 6 * t} 28 ${9 + 4 * t} 34`} c={S.line} w={2.2} o={0.7} />
        <circle cx={-3} cy={40} r={3.6} fill={S.hi} />
        <ellipse cx={-5} cy={46} rx={2.4} ry={1.6} fill={S.deep} /><ellipse cx={6 + 2 * t} cy={46} rx={2.4} ry={1.6} fill={S.deep} />
      </g>
      <Freckles x={nx * 0.8} sx={1 - 0.3 * t} />
      {/* eyes + brows (separate layers) */}
      <Eye cx={eLx} cy={8} rx={19} ry={23} p={f.eL} skin={S} iris={PAL.dIris} outer={-1} sx={eLs} />
      <Eye cx={eRx} cy={8} rx={19} ry={23} p={f.eR} skin={S} iris={PAL.dIris} outer={1} sx={eRs} />
      <DMouth kind={mouth ?? f.mouth} x={mx} y={64} sx={1 - 0.22 * t} />
      {/* bangs falling on the forehead */}
      <g transform={`translate(${capX * 0.8},0)`}>
        <Part t={H} sw={3.6} d="M-46 -52 C-50 -40 -55 -30 -62 -20 C-48 -28 -40 -38 -34 -50Z" rim="M-47 -48 C-50 -40 -54 -32 -58 -24" />
        <Part t={H} sw={3.6} d="M-22 -50 C-20 -36 -26 -22 -34 -12 C-16 -24 -8 -36 -8 -52Z" sh="M-16 -60 L10 -60 L10 0 L-20 0Z" rim="M-21 -46 C-21 -36 -25 -26 -30 -18" />
        <Part t={H} sw={3.6} d="M4 -52 C12 -40 10 -28 2 -16 C22 -28 26 -42 20 -54Z" sh="M14 -60 L40 -60 L40 0 L12 0Z" />
        <Part t={H} sw={3.6} d="M32 -50 C42 -42 48 -34 54 -26 C52 -38 48 -48 44 -54Z" />
      </g>
      {/* brows above everything on the face */}
      <Brow x={eLx + 13 * eLs} y={-31} p={f.bL} len={40} th={12} t={H} dir={-1} sx={eLs} />
      <Brow x={eRx - 13 * eRs} y={-31} p={f.bR} len={40} th={12} t={H} dir={1} sx={eRs} />
      {/* backwards cap */}
      <g transform={`translate(${6 * t},0)`}>
        <Part t={CP} d="M-84 -56 C-88 -100 -52 -126 0 -126 C52 -126 88 -100 84 -56 C50 -46 -50 -46 -84 -56Z"
          sh="M30 -140 C70 -110 70 -70 58 -40 L120 -40 L120 -140Z" deep="M-100 -60 C-50 -48 50 -48 100 -60 L100 -40 L-100 -40Z"
          hi="M-70 -84 C-62 -112 -34 -124 -6 -126 C-34 -116 -56 -100 -62 -78Z" rim="M-84 -60 C-88 -96 -58 -126 -10 -129" />
        <g transform={`translate(${capX - 6 * t},0) scale(${1 - 0.25 * t},1)`}>
          {/* panel seams + eyelets */}
          <Ln d="M0 -131 C-24 -110 -36 -84 -40 -50" c={CP.line} w={2.4} /><Ln d="M0 -131 C24 -110 36 -84 40 -50" c={CP.line} w={2.4} />
          <Ln d="M0 -131 C-48 -118 -70 -92 -76 -54" c={CP.line} w={2} o={0.7} /><Ln d="M0 -131 C48 -118 70 -92 76 -54" c={CP.line} w={2} o={0.7} />
          <circle cx={-46} cy={-100} r={2.6} fill={CP.deep} /><circle cx={46} cy={-100} r={2.6} fill={CP.deep} />
          <ellipse cx={0} cy={-131} rx={9} ry={4.5} fill={CP.hi} stroke={CP.line} strokeWidth={2.4} />
          {/* snapback opening with hair tuft poking out */}
          <path d="M-23 -47 C-23 -80 23 -80 23 -47Z" fill={H.deep} stroke={CP.line} strokeWidth={3} />
          <Part t={H} sw={3.4} d="M-19 -52 C-26 -62 -30 -74 -22 -84 C-22 -74 -16 -68 -11 -66 C-14 -78 -8 -92 4 -94 C-2 -84 0 -74 5 -68 C8 -78 18 -84 26 -80 C18 -76 16 -66 18 -52Z" sh="M4 -100 L30 -100 L30 -48 L4 -48Z" hi="M-6 -72 C-6 -82 -2 -88 2 -90 C0 -82 -2 -76 -2 -70Z M-22 -74 C-22 -78 -20 -80 -18 -82 C-19 -78 -19 -75 -18 -72Z" />
          <path d="M-26 -58 C-10 -54 10 -54 26 -58 L26 -48 C10 -44 -10 -44 -26 -48Z" fill="#20222A" stroke="#0E1016" strokeWidth={2.6} />
          {[-16, -8, 0, 8].map(x => <circle key={x} cx={x} cy={-52} r={2} fill="#5A5E6E" />)}
          <circle cx={16} cy={-52} r={3} fill="#C9CED8" stroke="#555" strokeWidth={1} />
          {/* small logo */}
          <circle cx={0} cy={-102} r={10} fill="#E8833A" stroke="#7E3420" strokeWidth={2.4} />
          <path d="M0 -109 L2.4 -104 L7.6 -103.6 L3.6 -100.2 L4.8 -95 L0 -97.8 L-4.8 -95 L-3.6 -100.2 L-7.6 -103.6 L-2.4 -104Z" fill="#FFF3DF" />
        </g>
        {/* side tufts under the cap */}
        <Part t={H} sw={3.4} d={`M${Lx - 6} -56 L${Lx - 22} -44 L${Lx - 6} -42 L${Lx - 18} -28 L${Lx + 2} -36 L${Lx + 4} -54Z`} />
        <Part t={H} sw={3.4} d={`M${R + 2} -56 L${R + 18} -44 L${R + 2} -42 L${R + 12} -28 L${R - 4} -36 L${R - 6} -54Z`} />
      </g>
      {f.sweat > 0 && <><Sweat x={R - 6} y={-36} s={f.sweat} /><Sweat x={Lx + 10} y={-14} s={f.sweat * 0.7} /></>}
      <Extra kind={f.extra || undefined} x={R + 40} y={-110} />
    </g>
  );
};

// ---------------------------------------------------------------- head (side, facing right)
export const DanchikHeadSide: React.FC<{ f: FaceP; mouth?: Mouth }> = ({ f, mouth }) => {
  const d = 'M-6 -82 C40 -84 66 -58 68 -28 L70 -10 C73 0 80 14 90 28 C94 36 86 41 76 40 C75 45 77 50 74 54 C77 58 74 64 70 66 C70 76 66 92 42 95 C24 97 10 90 2 82 L-24 64 C-62 52 -82 14 -78 -32 C-72 -66 -42 -82 -6 -82Z';
  return (
    <g>
      <Part t={H} d="M-80 -52 C-96 -24 -92 10 -76 36 L-86 46 L-66 42 L-68 56 L-52 40 C-40 20 -40 -20 -30 -52Z" sh="M-60 -60 L0 -60 L0 60 L-60 60Z" />
      <Part t={CP} d="M-72 -66 C-104 -72 -140 -64 -158 -50 C-142 -38 -104 -40 -70 -50Z" sh="M-170 -58 L-60 -58 L-60 -30 L-170 -30Z" rim="M-150 -53 C-130 -66 -100 -70 -74 -64" />
      <Part t={S} d={d} sh="M-10 70 C10 86 30 92 60 90 L100 110 L-40 110Z" rim="M-74 -30 C-76 0 -70 30 -50 50">
        <path d="M-100 -72 L100 -72 L100 -40 C60 -30 0 -34 -100 -44Z" fill={S.sh} />
        <path d="M-100 -72 L100 -72 L100 -48 C60 -40 0 -42 -100 -50Z" fill={S.deep} />
        <path d="M72 46 C64 50 60 56 66 60" fill="none" stroke={S.sh} strokeWidth={4} />
        <ellipse cx={44} cy={44} rx={14} ry={8} fill="#F08A78" opacity={0.25 + f.blush * 0.4} />
      </Part>
      <Ear x={-12} y={10} dir={-1} s={1} />
      <Ln d="M76 36 C80 33 84 33 86 36" c={S.line} w={2.6} />
      <circle cx={80} cy={22} r={3} fill={S.hi} />
      <g fill="#B5704F">{[[62, 26], [68, 30], [58, 32], [72, 20]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={1.7} />)}</g>
      <Eye cx={50} cy={6} rx={19} ry={23} p={{ ...f.eL, lookX: Math.max(0.75, f.eL.lookX) }} skin={S} iris={PAL.dIris} outer={1} sx={0.48} />
      <DMouth kind={mouth ?? f.mouth} x={62} y={62} sx={0.5} />
      <Brow x={38} y={-28} p={f.bR} len={32} th={12} t={H} dir={1} sx={0.9} />
      <Part t={H} sw={3.6} d="M46 -52 C58 -40 62 -30 66 -18 C70 -32 66 -46 58 -56Z" />
      <Part t={H} sw={3.6} d="M24 -52 C30 -42 30 -32 26 -22 C40 -32 44 -44 38 -54Z" />
      <Part t={CP} d="M-88 -50 C-94 -100 -56 -132 -4 -132 C50 -132 78 -100 76 -54 C40 -44 -40 -42 -88 -50Z"
        sh="M24 -140 C56 -110 58 -70 50 -40 L120 -40 L120 -140Z" deep="M-100 -58 C-50 -48 40 -46 100 -56 L100 -40 L-100 -40Z"
        hi="M-70 -84 C-62 -112 -34 -124 -6 -126 C-34 -116 -56 -100 -62 -78Z" rim="M-84 -60 C-88 -96 -58 -126 -10 -129">
        <path d="M54 -48 C54 -78 90 -78 90 -48Z" fill={H.deep} />
      </Part>
      <Ln d="M-4 -131 C10 -110 20 -84 22 -48" c={CP.line} w={2.4} /><Ln d="M-4 -131 C-34 -110 -50 -84 -54 -50" c={CP.line} w={2} o={0.7} />
      <ellipse cx={-4} cy={-131} rx={8} ry={4} fill={CP.hi} stroke={CP.line} strokeWidth={2.4} />
      <circle cx={-34} cy={-98} r={8} fill="#E8833A" stroke="#7E3420" strokeWidth={2} />
      <Part t={H} sw={3.4} d="M58 -52 L62 -88 L70 -64 L82 -92 L80 -60 L92 -72 L82 -48Z" sh="M72 -100 L100 -100 L100 -40 L72 -40Z" />
      {f.sweat > 0 && <Sweat x={10} y={-30} s={f.sweat} />}
      <Extra kind={f.extra || undefined} x={60} y={-120} />
    </g>
  );
};

// ---------------------------------------------------------------- head (back)
export const DanchikHeadBack: React.FC = () => (
  <g>
    <Ear x={-74} y={8} dir={-1} /><Ear x={74} y={8} dir={1} />
    <Part t={S} d="M-28 30 C-30 60 -26 80 -24 100 L24 100 C26 80 30 60 28 30Z" sh="M6 20 L60 20 L60 100 L6 100Z" />
    <Part t={H} d="M0 -84 C50 -84 80 -52 78 -6 C76 20 66 38 46 50 L36 60 L28 48 L14 62 L6 48 L-6 62 L-12 48 L-26 60 L-34 48 C-62 36 -78 20 -78 -6 C-80 -52 -50 -84 0 -84Z"
      sh="M20 -90 C60 -60 60 20 40 90 L120 90 L120 -90Z" hi="M-50 -20 C-46 -30 -40 -34 -34 -30 C-40 -22 -44 -10 -46 0Z M10 10 C14 2 20 0 24 4 C18 10 16 18 14 26Z" rim="M-74 -10 C-74 20 -62 46 -40 66">
      {[[-40, 10], [-10, 22], [22, 8], [-24, -16], [36, 26]].map(([x, y], i) => <path key={i} d={`M${x} ${y} q6 14 0 26`} fill="none" stroke={H.deep} strokeWidth={2.4} />)}
    </Part>
    {/* cap from behind = its front panel with the logo, brim pointing at us */}
    <Part t={CP} d="M-88 -52 C-92 -100 -54 -132 0 -132 C54 -132 92 -100 88 -52 C50 -42 -50 -42 -88 -52Z"
      sh="M30 -140 C70 -110 70 -70 58 -40 L120 -40 L120 -140Z" hi="M-70 -84 C-62 -112 -34 -124 -6 -126 C-34 -116 -56 -100 -62 -78Z" rim="M-84 -60 C-88 -96 -58 -126 -10 -129" />
    <Ln d="M0 -131 L0 -50" c={CP.line} w={2.4} />
    <ellipse cx={0} cy={-131} rx={9} ry={4.5} fill={CP.hi} stroke={CP.line} strokeWidth={2.4} />
    <circle cx={0} cy={-88} r={15} fill="#E8833A" stroke="#7E3420" strokeWidth={3} />
    <path d="M0 -99 L3.6 -91.5 L11.4 -90.9 L5.4 -85.8 L7.2 -78 L0 -82.2 L-7.2 -78 L-5.4 -85.8 L-11.4 -90.9 L-3.6 -91.5Z" fill="#FFF3DF" />
    <Part t={CP} d="M-92 -54 C-80 -20 80 -20 92 -54 C60 -64 -60 -64 -92 -54Z" sh="M-100 -40 C-40 -26 40 -26 100 -40 L100 0 L-100 0Z" hi="M-70 -54 C-30 -58 30 -58 70 -54 C30 -50 -30 -50 -70 -54Z" />
    <Ln d="M-80 -46 C-40 -34 40 -34 80 -46" c={CP.rim} w={1.6} o={0.6} />
  </g>
);

// ---------------------------------------------------------------- limbs
const Arm: React.FC<{ x: number; y: number; a: [number, number]; hand: Pose['hL']; flip: boolean; dim?: boolean; holding?: React.ReactNode }> = ({ x, y, a, hand, flip, dim, holding }) => {
  const bend = a[1];
  const inner = bend > 0 ? -1 : 1;
  const folds = Math.min(3, 1 + Math.floor(Math.abs(bend) / 28));
  return (
    <g transform={`translate(${x},${y}) rotate(${a[0]})`} style={dim ? { filter: 'brightness(0.8) saturate(1.1)' } : undefined}>
      <Part t={HD} d={capsule(96, 38, 30, 3)} sh={capShadow(96, 38, 30, 0.12)} rim={capRim(96, 38, 30)}
        deep={`M-24 10 Q-16 22 -21 34 L-30 34 L-30 10Z`} />
      {/* armpit / shoulder folds */}
      <Ln d="M-8 22 Q-2 30 -6 40" c={HD.line} w={2.4} o={0.8} />
      <g transform={`translate(0,90) rotate(${bend})`}>
        {/* forearm sleeve, a bit long: covers half the hand */}
        <Part t={HD} d={capsule(88, 31, 33, 1)} sh={capShadow(88, 31, 33, 0.12)} rim={capRim(88, 31, 33)}
          deep={`M${inner * 18} -6 Q${inner * 6} ${6 + Math.abs(bend) * 0.08} ${inner * 18} ${18 + Math.abs(bend) * 0.12}Z`} />
        {Array.from({ length: folds }).map((_, i) => <Ln key={i} d={`M${inner * 15} ${4 + i * 8} Q${inner * 4} ${8 + i * 8} ${inner * 10} ${14 + i * 8}`} c={HD.line} w={2.6} />)}
        <Ln d="M-12 58 Q-2 64 10 58" c={HD.line} w={2.2} o={0.7} /><Ln d="M-8 68 Q2 72 12 67" c={HD.line} w={2.2} o={0.6} />
        <g transform="translate(0,82)">
          <Hand t={S} pose={hand} flip={flip} scale={1.25}>{holding}</Hand>
          {/* rib cuff over the hand */}
          <Part t={HD} d="M-17 -6 L17 -6 C19 2 18 8 17 12 C6 15 -6 15 -17 12 C-18 8 -19 2 -17 -6Z" sh="M8 -10 L30 -10 L30 20 L8 20Z" sw={4} under={false} />
          {[-11, -5.5, 0, 5.5, 11].map(xx => <path key={xx} d={`M${xx} -3 L${xx} 11`} stroke={HD.sh} strokeWidth={1.4} opacity={0.7} />)}
        </g>
      </g>
    </g>
  );
};

const Shoe: React.FC<{ view: View; flip?: boolean }> = ({ view, flip }) => {
  const N = PAL.sneaker, SO = PAL.sole;
  if (view === 'side' || view === '34') {
    const k = view === '34' ? 0.72 : 1;
    return <g transform={`scale(${flip ? -k : k},1)`}>
      <Part t={SO} d="M-28 14 L46 14 C50 16 50 22 44 24 L-26 24 C-31 22 -31 16 -28 14Z" sh="M-30 20 L60 20 L60 30 L-30 30Z" />
      <Part t={N} d="M-24 -12 C-12 -14 0 -12 8 -6 C22 0 38 4 44 11 L44 16 L-26 16 C-28 6 -28 -6 -24 -12Z" sh="M-30 6 C0 10 30 10 50 8 L50 20 L-30 20Z" rim="M-20 -10 C-8 -12 2 -10 8 -5" />
      <path d="M-14 4 C2 0 18 4 30 10" fill="none" stroke={PAL.laceB} strokeWidth={4} strokeLinecap="round" />
      <Ln d="M28 4 C34 6 40 8 44 12" c={N.line} w={2.4} />
      {[0, 7, 14].map(i => <path key={i} d={`M${-4 + i} ${-6 + i * 0.4} l6 4`} stroke={PAL.laceA} strokeWidth={3.4} strokeLinecap="round" />)}
      <Part t={N} d="M-28 -16 C-22 -20 -14 -18 -14 -12 L-24 -8Z" sw={3} />
      <ellipse cx={-6} cy={-4} rx={3} ry={2} fill="#fff" />
    </g>;
  }
  if (view === 'back') return <g>
    <Part t={SO} d="M-24 14 L24 14 C27 17 27 22 22 24 L-22 24 C-27 22 -27 17 -24 14Z" sh="M-30 20 L30 20 L30 30 L-30 30Z" />
    <Part t={N} d="M-18 -10 C-23 2 -24 10 -22 16 L22 16 C24 10 23 2 18 -10 C8 -14 -8 -14 -18 -10Z" sh="M6 -20 L40 -20 L40 20 L6 20Z" rim="M-17 -6 C-20 2 -21 8 -20 13" />
    <Part t={N} d="M-6 -16 L6 -16 L7 2 L-7 2Z" fill={PAL.laceB} sw={3} />
  </g>;
  return <g transform={flip ? 'scale(-1,1)' : undefined}>
    <Part t={SO} d="M-27 14 L27 14 C30 17 30 22 25 24 L-25 24 C-30 22 -30 17 -27 14Z" sh="M4 20 L40 20 L40 30 L4 30Z" />
    <Part t={N} d="M-19 -8 C-26 4 -28 12 -25 16 L25 16 C28 12 26 4 19 -8 C9 -12 -9 -12 -19 -8Z" sh="M8 -20 L40 -20 L40 20 L8 20Z" rim="M-18 -5 C-23 3 -25 9 -24 13" />
    <path d="M-12 7 C-4 12 4 12 12 7 L12 15 L-12 15Z" fill={N.sh} />
    {[-6, 0, 6].map((yy, i) => <g key={i}><path d={`M-8 ${yy - 2} L8 ${yy + 2}`} stroke={PAL.laceA} strokeWidth={3.4} strokeLinecap="round" /><path d={`M-8 ${yy + 2} L8 ${yy - 2}`} stroke={PAL.laceB} strokeWidth={3.4} strokeLinecap="round" /></g>)}
    <path d="M-8 6 Q-14 14 -10 18 M8 6 Q16 12 12 18" fill="none" stroke={PAL.laceA} strokeWidth={2.6} strokeLinecap="round" />
  </g>;
};

const jeanShin = (len: number, w1: number, w2: number) => {
  const a = w1 / 2, b = w2 / 2;
  return `M${-a} 0 C${-a - 2} ${len * 0.4} ${-b - 1} ${len * 0.8} ${-b - 2} ${len} L${-b} ${len + 4} Q0 ${len + 9} ${b} ${len + 4} L${b + 2} ${len} C${b + 1} ${len * 0.8} ${a + 2} ${len * 0.4} ${a} 0 A${a} ${a * 0.7} 0 0 0 ${-a} 0Z`;
};

const Leg: React.FC<{ x: number; y: number; a: [number, number]; view: View; flipShoe?: boolean; back?: boolean; dim?: boolean }> = ({ x, y, a, view, flipShoe, back, dim }) => {
  const bend = Math.abs(a[1]);
  return (
    <g transform={`translate(${x},${y}) rotate(${a[0]})`} style={dim ? { filter: 'brightness(0.8) saturate(1.1)' } : undefined}>
      <Part t={J} d={capsule(114, 44, 35, 2)} sh={capShadow(114, 44, 35, 0.1)} rim={capRim(114, 44, 35)}>
        {back && <path d="M-16 14 L4 14 L3 38 L-6 44 L-15 38Z" fill={J.sh} stroke={J.line} strokeWidth={2.2} />}
      </Part>
      <Ln d="M-14 30 Q-6 36 -12 44" c={J.line} w={2} o={0.5} />
      <g transform={`translate(0,112) rotate(${a[1]})`}>
        <g transform={`translate(0,84) rotate(${-(a[0] + a[1])}) scale(1.35)`}><Shoe view={view} flip={flipShoe} /></g>
        <Part t={J} d={jeanShin(76, 35, 36)} sh={capShadow(76, 35, 36, 0.1)} rim={capRim(76, 35, 36)}
          deep={`M-20 ${70} Q0 ${76} 20 ${70} L20 ${90} L-20 ${90}Z`} />
        {/* knee wear (front only) */}
        {!back && view !== 'side' && <g>
          <path d="M-12 -8 C-6 -11 4 -10 10 -7 C12 -2 11 4 9 7 C2 9 -6 9 -11 6 C-13 2 -13 -4 -12 -8Z" fill={J.hi} />
          <path d="M-9 -1 C-3 1 3 1 8 -1" stroke="#4A6597" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          {[-6, -3, 3, 6].map(yy => <path key={yy} d={`M-11 ${yy} L10 ${yy + 0.5}`} stroke="#fff" strokeWidth={1.4} opacity={0.95} />)}
        </g>}
        {view === 'side' && <path d="M8 -8 C14 -6 16 2 14 8 L8 6Z" fill={J.hi} />}
        <Ln d={`M-12 ${8 + bend * 0.05} Q0 ${2} 12 ${6 + bend * 0.05}`} c={J.line} w={2.2} o={0.7} />
        {/* stacked hem folds */}
        <Ln d="M-17 58 Q-6 54 6 60" c={J.line} w={2.2} /><Ln d="M-4 68 Q8 64 17 68" c={J.line} w={2.2} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- full body
export const Danchik: React.FC<{
  view?: View; emotion?: Emotion; f?: FaceP; mouth?: Mouth; pose?: Partial<Pose>; x?: number; y?: number; scale?: number; shadow?: boolean;
  holdR?: React.ReactNode;
}> = ({ view = 'front', emotion = 'neutral', f, mouth, pose: pp, x = 0, y = 0, scale = 1, shadow = true, holdR }) => {
  const P = basePose(pp);
  const F = f ?? faceOf(emotion, 'd');
  const t = view === '34' ? 0.55 : 0;
  const br = P.breath;
  const headY = -506 + P.headDy, headX = P.headDx + (view === '34' ? 10 : 0);
  const sq = P.squash, sx = 1 / Math.sqrt(sq);

  const neck = (dx = 0, rot = 0, w = 15) => <g transform={`translate(${dx},${-382}) rotate(${rot})`}>
    <Part t={S} d={`M${-w} 0 L${-w + 1} -46 L${w - 1} -46 L${w} 0Z`} sh="M3 -60 L30 -60 L30 10 L3 10Z" rim="M-11 -6 L-11 -40" />
    <path d="M-16 -46 L16 -46 L16 -28 Q0 -22 -16 -28Z" fill={S.deep} opacity={0.85} />
    <Ln d="M2 -24 Q5 -18 2 -12" c={S.line} w={2} o={0.6} />
  </g>;

  let body: React.ReactNode;
  if (view === 'side') {
    body = <g>
      <Arm x={-10} y={-360 - br} a={[P.aR[0] - 4, P.aR[1]]} hand={P.hR} flip dim />
      <Leg x={-6} y={-226} a={[P.lR[0] + 4, P.lR[1]]} view="side" dim />
      <Leg x={6} y={-226} a={[P.lL[0] - 6, P.lL[1]]} view="side" />
      {neck(6, 12, 19)}
      <Part t={HD} d="M-40 -406 C-20 -398 8 -396 26 -394 C32 -386 30 -376 22 -370 C0 -374 -22 -378 -42 -386Z" sh="M0 -410 L40 -410 L40 -360 L0 -360Z" />
      <g transform={`translate(0,${-br * 0.5})`}>
        <Part t={HD} d="M-32 -394 C-56 -382 -62 -352 -60 -320 C-58 -284 -54 -252 -50 -232 L-52 -214 L46 -214 L44 -232 C50 -268 46 -306 40 -336 C34 -366 22 -390 10 -394Z"
          sh="M-70 -330 C-40 -320 -40 -260 -60 -200 L-80 -200 L-80 -330Z" deep="M-60 -236 L60 -236 L60 -200 L-60 -200Z" rim="M30 -340 C38 -310 40 -270 36 -244">
          <path d="M-56 -238 L50 -238" stroke={HD.line} strokeWidth={2.4} />
          {[-40, -24, -8, 8, 24, 38].map(xx => <path key={xx} d={`M${xx} -236 L${xx} -216`} stroke={HD.sh} strokeWidth={1.8} />)}
          <path d="M20 -300 C34 -296 44 -284 46 -250 L14 -250 C20 -270 22 -286 20 -300Z" fill={HD.sh} />
          <Ln d="M20 -300 C22 -286 20 -270 14 -250" c={HD.line} w={2.6} />
        </Part>
        <Part t={HD} d="M-34 -400 C-66 -398 -72 -360 -56 -340 C-44 -350 -30 -372 -18 -394Z" sh="M-50 -410 L-20 -410 L-20 -330 L-50 -330Z" rim="M-38 -398 C-60 -394 -66 -366 -58 -346" />
        <path d="M24 -372 C28 -350 30 -330 26 -312" fill="none" stroke="#F4E6D8" strokeWidth={3.4} strokeLinecap="round" />
        <rect x={23} y={-316} width={6} height={10} rx={2} fill={PAL.metal.base} stroke={PAL.metal.line} strokeWidth={1.4} />
      </g>
      <Arm x={-2} y={-360 - br} a={[P.aL[0] + 2, P.aL[1]]} hand={P.hL} flip={false} />
      <g transform={`translate(${6 + P.headDx},${headY + 18}) rotate(${P.headRot + F.tilt * 0.5})`}><DanchikHeadSide f={F} mouth={mouth} /></g>
    </g>;
  } else {
    const back = view === 'back';
    const shL = -66 + 8 * t, shR = 66 - 22 * t;
    const torso = <g transform={`translate(${5 * t},${-br * 0.5}) scale(${1 - 0.16 * t},1)`}>
      {/* jeans seat / crotch under the hoodie */}
      <Part t={J} d="M-48 -240 L48 -240 L44 -196 Q0 -180 -44 -196Z" sh="M10 -250 L60 -250 L60 -180 L10 -180Z" />
      {!back && <Part t={HD} d="M-46 -394 C-48 -432 48 -432 46 -394Z" sh="M10 -440 L60 -440 L60 -390 L10 -390Z" />}
      <Part t={HD} d="M-24 -392 C-42 -388 -62 -382 -72 -364 C-80 -338 -76 -290 -74 -250 L-72 -220 C-40 -212 40 -212 72 -220 L74 -250 C76 -290 80 -338 72 -364 C62 -382 42 -388 24 -392Z"
        sh="M34 -400 C52 -360 56 -300 48 -214 L100 -214 L100 -400Z" deep="M-80 -238 C-40 -230 40 -230 80 -238 L80 -200 L-80 -200Z"
        rim="M-70 -360 C-77 -330 -74 -290 -72 -252">
        <path d="M-74 -238 C-40 -230 40 -230 74 -238" fill="none" stroke={HD.line} strokeWidth={2.6} />
        {[-56, -40, -24, -8, 8, 24, 40, 56].map(xx => <path key={xx} d={`M${xx} -234 L${xx} -218`} stroke={HD.sh} strokeWidth={1.8} />)}
        {/* armpit + belly folds */}
        <Ln d="M-62 -342 Q-52 -334 -46 -322" c={HD.line} w={2.6} /><Ln d="M62 -342 Q52 -334 46 -322" c={HD.line} w={2.6} />
        <Ln d="M-34 -258 Q-24 -252 -12 -256" c={HD.line} w={2.2} o={0.7} /><Ln d="M18 -260 Q28 -254 38 -258" c={HD.line} w={2.2} o={0.7} />
        {!back && <g transform={`translate(${18 * t},0)`}>
          {/* kangaroo pocket */}
          <path d="M-46 -302 L46 -302 L54 -246 L-54 -246Z" fill={HD.base} />
          <path d="M-46 -302 L46 -302 L48 -292 L-48 -292Z" fill={HD.sh} />
          <path d="M-46 -302 C-56 -282 -60 -262 -54 -246 L-46 -246 C-50 -262 -48 -282 -40 -298Z" fill={HD.deep} />
          <path d="M46 -302 C56 -282 60 -262 54 -246 L46 -246 C50 -262 48 -282 40 -298Z" fill={HD.deep} />
          <Ln d="M-46 -302 L46 -302 M-46 -302 C-56 -282 -60 -262 -54 -246 M46 -302 C56 -282 60 -262 54 -246" c={HD.line} w={3} />
          <Ln d="M-40 -296 L40 -296" c={HD.rim} w={1.6} o={0.6} />
        </g>}
        {back && <g>
          {/* hood lying on the back */}
          <path d="M-50 -392 C-64 -352 -46 -312 0 -298 C46 -312 64 -352 50 -392Z" fill={HD.base} stroke={HD.line} strokeWidth={3.4} />
          <path d="M12 -390 C40 -360 40 -320 0 -298 C46 -312 64 -352 50 -392Z" fill={HD.sh} />
          <Ln d="M0 -390 L0 -300" c={HD.line} w={2.4} />
          <path d="M-46 -330 C-30 -310 -14 -302 0 -298" fill="none" stroke={HD.deep} strokeWidth={3} />
        </g>}
      </Part>
      {!back && <g transform={`translate(${14 * t},0)`}>
        {/* hood collar ring and drawstrings */}
        <Part t={HD} d="M-52 -398 C-58 -370 -26 -350 0 -347 C26 -350 58 -370 52 -398 C42 -404 30 -392 20 -386 C12 -380 6 -374 0 -370 C-6 -374 -12 -380 -20 -386 C-30 -392 -42 -404 -52 -398Z"
          sh="M10 -400 C40 -390 54 -380 54 -370 L54 -340 L10 -340Z" rim="M-50 -394 C-54 -372 -30 -356 -6 -352" />
        <circle cx={-12} cy={-362} r={3.2} fill={HD.deep} /><circle cx={12} cy={-362} r={3.2} fill={HD.deep} />
        <path d={`M-12 -362 C-16 -340 -10 -322 -14 ${-300 - br}`} fill="none" stroke="#F4E6D8" strokeWidth={3.6} strokeLinecap="round" />
        <path d={`M12 -362 C16 -344 12 -328 15 ${-306 - br}`} fill="none" stroke="#F4E6D8" strokeWidth={3.6} strokeLinecap="round" />
        <rect x={-17} y={-304 - br} width={6} height={11} rx={2} fill={PAL.metal.base} stroke={PAL.metal.line} strokeWidth={1.4} />
        <rect x={12} y={-310 - br} width={6} height={11} rx={2} fill={PAL.metal.base} stroke={PAL.metal.line} strokeWidth={1.4} />
      </g>}
      {back && <Part t={HD} d="M-46 -396 C-40 -384 40 -384 46 -396 C36 -410 -36 -410 -46 -396Z" />}
    </g>;
    body = <g>
      {t > 0 && <Arm x={shR} y={-362 - br} a={P.aR} hand={P.hR} flip={false} dim holding={holdR} />}
      <Leg x={-24 + 2 * t} y={-228} a={P.lL} view={back ? 'back' : view} flipShoe={!back && t === 0} back={back} />
      <Leg x={24 - 4 * t} y={-228} a={P.lR} view={back ? 'back' : view} back={back} dim={t > 0} />
      {neck(8 * t)}
      {torso}
      <Arm x={shL} y={-362 - br} a={P.aL} hand={P.hL} flip={!back} />
      {t === 0 && <Arm x={shR} y={-362 - br} a={P.aR} hand={P.hR} flip={back} holding={holdR} />}
      <g transform={`translate(${headX},${headY}) rotate(${P.headRot + F.tilt})`}>
        {back ? <DanchikHeadBack /> : <DanchikHead t={t} f={F} mouth={mouth} />}
      </g>
    </g>;
  }
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {shadow && <GroundShadow rx={110} ry={18} x={20} />}
      <g transform={`rotate(${P.lean}) scale(${sx},${sq})`}>{body}</g>
    </g>
  );
};
