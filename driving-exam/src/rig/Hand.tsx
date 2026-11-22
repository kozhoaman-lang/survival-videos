// Cartoon hand: palm, four two-segment fingers with knuckles, thumb. Wrist at (0,0), pointing +y.
import React from 'react';
import { Part, Ln, Tone, capsule, capShadow, capRim } from './prims';

export type HandPose = 'relaxed' | 'open' | 'wave' | 'fist' | 'point' | 'grip' | 'thumb' | 'flat';

const PALM = 'M-12 0 C-15 8 -17.5 17 -16.5 26 C-9 31 9 31 16.5 26 C17.5 16 15.5 8 12 0Z';

const Finger: React.FC<{ t: Tone; x: number; y: number; ang: number; curl: number; len: number; w: number }> = ({ t, x, y, ang, curl, len, w }) => {
  const l1 = len * 0.56, l2 = len * 0.5;
  return (
    <g transform={`translate(${x},${y}) rotate(${ang})`}>
      <Part t={t} d={capsule(l1 + 3, w, w * 0.95)} sh={capShadow(l1, w, w)} sw={3} under={false} />
      <g transform={`translate(0,${l1}) rotate(${curl})`}>
        <Part t={t} d={capsule(l2, w * 0.95, w * 0.85)} sh={capShadow(l2, w, w)} sw={3} under={false} />
        {/* nail hint */}
        <path d={`M${-w * 0.22} ${l2 - 4} Q0 ${l2 - 1.5} ${w * 0.22} ${l2 - 4}`} fill="none" stroke={t.deep} strokeWidth={1.4} opacity={0.6} />
      </g>
      {/* joint crease */}
      <Ln d={`M${-w * 0.3} ${l1} Q0 ${l1 + 1.6} ${w * 0.3} ${l1}`} c={t.line} w={1.6} o={0.8} />
    </g>
  );
};

export const Hand: React.FC<{ t: Tone; pose?: HandPose; flip?: boolean; scale?: number; children?: React.ReactNode; rot?: number }> = ({ t, pose = 'relaxed', flip, scale = 1, children, rot = 0 }) => {
  const fx = [-11.5, -4, 4, 11.5], len = [18, 21, 20, 15.5];
  let spread = [3, 1, -1, -4], curl = [22, 26, 30, 34];
  if (pose === 'open' || pose === 'flat') { spread = [10, 3, -4, -12]; curl = [4, 3, 3, 5]; }
  if (pose === 'wave') { spread = [20, 6, -8, -22]; curl = [0, 0, 0, 2]; }
  const fist = pose === 'fist' || pose === 'point' || pose === 'thumb' || pose === 'grip';
  const palm = <Part t={t} d={PALM} sh="M4 -5 C8 10 6 22 2 40 L40 40 L40 -5Z" deep="M-20 26 C-8 33 8 33 20 26 L20 40 L-20 40Z" rim="M-11 4 C-14 10 -15.5 17 -15 23" sw={4} />;
  const knuckles = <g>
    {fx.map((x, i) => <path key={i} d={`M${x - 3.6} 25.5 Q${x} 22 ${x + 3.6} 25.5`} fill="none" stroke={t.line} strokeWidth={1.5} strokeLinecap="round" opacity={0.6} />)}
    {fx.map((x, i) => <circle key={'h' + i} cx={x - 1.2} cy={23.6} r={1.3} fill={t.rim} opacity={0.7} />)}
  </g>;
  const thumb = (a: number, c: number) => <g transform={`translate(-12,7) rotate(${a})`}>
    <Part t={t} d={capsule(13, 11, 10)} sh={capShadow(13, 11, 10)} sw={3.4} />
    <g transform={`translate(0,11) rotate(${c})`}><Part t={t} d={capsule(11, 9.6, 8.4)} sh={capShadow(11, 9, 8)} sw={3.2} />
      <path d="M-2.2 7.5 Q0 9.5 2.2 7.5" fill="none" stroke={t.deep} strokeWidth={1.3} opacity={0.6} /></g>
    <Ln d="M-3 11 Q0 12.6 3 11" c={t.line} w={1.5} />
  </g>;
  // curled-finger block for fists / grips
  const curledRow = (y: number) => <g>
    {fx.map((x, i) => <Part key={i} t={t} sw={3.2} d={`M${x - 4.6} ${y} C${x - 5.4} ${y + 9} ${x - 4} ${y + 15} ${x} ${y + 15.5} C${x + 4} ${y + 15} ${x + 5.4} ${y + 9} ${x + 4.6} ${y} Z`} sh={`M${x + 1} ${y - 2} L${x + 8} ${y - 2} L${x + 8} ${y + 20} L${x + 1} ${y + 20}Z`} />)}
    {fx.map((x, i) => <path key={'k' + i} d={`M${x - 3} ${y + 5} Q${x} ${y + 3} ${x + 3} ${y + 5}`} fill="none" stroke={t.line} strokeWidth={1.5} opacity={0.8} />)}
  </g>;
  return (
    <g transform={`rotate(${rot}) scale(${flip ? -scale : scale},${scale})`}>
      {!fist && <>
        {[0, 1, 2, 3].map(i => <Finger key={i} t={t} x={fx[i]} y={24} ang={spread[i]} curl={curl[i]} len={len[i]} w={8.2} />)}
        {palm}{knuckles}
        {thumb(pose === 'wave' || pose === 'open' ? 48 : 28, pose === 'wave' ? -10 : 8)}
      </>}
      {fist && <>
        {palm}
        {pose === 'point' && <Finger t={t} x={-11.5} y={22} ang={4} curl={2} len={21} w={8.2} />}
        {children}
        {pose === 'point' ? <g>{[1, 2, 3].map(i => <Part key={i} t={t} sw={3.2} d={`M${fx[i] - 4.6} 20 C${fx[i] - 5.4} 29 ${fx[i] - 4} 35 ${fx[i]} 35.5 C${fx[i] + 4} 35 ${fx[i] + 5.4} 29 ${fx[i] + 4.6} 20Z`} />)}</g> : curledRow(pose === 'grip' ? 16 : 20)}
        {pose === 'thumb' ? <g transform="translate(-13,14) rotate(160)"><Part t={t} d={capsule(14, 11, 10)} sw={3.4} /><g transform="translate(0,12)"><Part t={t} d={capsule(11, 10, 8.5)} sw={3.2} /></g></g>
          : thumb(pose === 'grip' ? -38 : -48, -30)}
      </>}
    </g>
  );
};
