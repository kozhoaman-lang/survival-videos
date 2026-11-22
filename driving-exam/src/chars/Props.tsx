// Props: clipboard, paper coffee cup (with sloshing coffee), examiner badge.
import React from 'react';
import { Part, Ln } from '../rig/prims';
import { PAL } from '../rig/palette';

/** clipboard, centered on its middle; ~74x100 */
export const Clipboard: React.FC<{ rot?: number; side?: boolean }> = ({ rot = 0, side }) => side ? (
  <g transform={`rotate(${rot})`}>
    <Part t={PAL.board} d="M-5 -52 L5 -52 L5 52 L-5 52Z" sh="M0 -60 L10 -60 L10 60 L0 60Z" sw={4} />
    <Part t={PAL.metal} d="M-4 -60 L8 -60 L8 -44 L-4 -44Z" sw={3} />
  </g>
) : (
  <g transform={`rotate(${rot})`}>
    <Part t={PAL.board} d="M-37 -50 Q-37 -54 -33 -54 L33 -54 Q37 -54 37 -50 L37 50 Q37 54 33 54 L-33 54 Q-37 54 -37 50Z"
      sh="M20 -60 L50 -60 L50 60 L20 60Z" rim="M-34 -48 L-34 48" />
    <Part t={PAL.paper} d="M-31 -42 L31 -42 L31 48 L-31 48Z" sh="M-31 38 L31 38 L31 50 L-31 50Z" sw={3} under={false}>
      {[-24, -14, -4, 6, 16, 26, 36].map(y => <path key={y} d={`M-14 ${y} L24 ${y}`} stroke="#9AA3C2" strokeWidth={2} />)}
      {[-24, -14, -4, 6, 16, 26, 36].map((y, i) => <rect key={'b' + y} x={-25} y={y - 4} width={7} height={7} fill="none" stroke="#6E7898" strokeWidth={1.4} />)}
      <path d="M-24 -24 l3 3 l5 -7" stroke="#E04848" strokeWidth={2} fill="none" />
      <path d="M-24 -14 l6 6 M-18 -14 l-6 6" stroke="#E04848" strokeWidth={2} />
    </Part>
    <Part t={PAL.metal} d="M-18 -60 L18 -60 L22 -46 L-22 -46Z" sh="M4 -64 L30 -64 L30 -40 L4 -40Z" hi="M-14 -58 L-2 -58 L-4 -55 L-14 -55Z" sw={3.4} />
    <circle cx={0} cy={-57} r={4} fill={PAL.metal.deep} stroke={PAL.metal.line} strokeWidth={1.6} />
  </g>
);

/** paper coffee cup; origin at the cup's center. slosh: -1..1 tilts the coffee surface (only visible if lidOff) */
export const Cup: React.FC<{ rot?: number; scale?: number; lidOff?: boolean; slosh?: number; glow?: number; stain?: boolean }> = ({ rot = 0, scale = 1, lidOff, slosh = 0, glow = 0, stain }) => (
  <g transform={`rotate(${rot}) scale(${scale})`}>
    {glow > 0 && <circle r={70} fill="#FFF3B0" opacity={glow * 0.5} />}
    <Part t={PAL.cup} d="M-19 -24 L19 -24 L15 28 Q0 31 -15 28Z" sh="M6 -30 L30 -30 L30 34 L4 34Z" rim="M-16 -20 L-13 24" hi="M-12 -18 L-8 -18 L-6 22 L-10 22Z" />
    <Part t={PAL.sleeve} d="M-18 -10 L18 -10 L16 14 L-16 14Z" sh="M6 -14 L26 -14 L26 18 L4 18Z" sw={3.4} under={false}>
      <path d="M-18 -4 L18 -4 M-17 8 L17 8" stroke={PAL.sleeve.deep} strokeWidth={1.4} opacity={0.6} />
    </Part>
    <circle cx={-4} cy={2} r={5.5} fill="none" stroke="#FAF0DC" strokeWidth={2} />
    <path d="M-6 3 q2 -5 4 0 q2 -5 4 0" fill="none" stroke="#FAF0DC" strokeWidth={1.6} />
    {!lidOff && <g>
      <Part t={PAL.lid} d="M-23 -24 Q-23 -30 -19 -31 L19 -31 Q23 -30 23 -24 Z" sh="M6 -36 L30 -36 L30 -20 L6 -20Z" sw={3.4} />
      <Part t={PAL.lid} d="M-17 -31 Q-15 -38 -8 -39 L8 -39 Q15 -38 17 -31Z" sh="M4 -44 L24 -44 L24 -28 L4 -28Z" hi="M-12 -36 L-2 -37 L-3 -34 L-12 -33Z" sw={3.2} />
      <ellipse cx={8} cy={-37} rx={3.5} ry={1.4} fill="#0E0B0C" />
    </g>}
    {lidOff && <g>
      <ellipse cx={0} cy={-24} rx={19} ry={5} fill="#F2EEE6" stroke={PAL.cup.line} strokeWidth={3} />
      <path d={`M-16 ${-22 + slosh * 4} Q0 ${-25 - slosh * 2} 16 ${-22 - slosh * 4} Q0 ${-18} -16 ${-22 + slosh * 4}Z`} fill="#6B3A1E" />
    </g>}
    {stain && <path d="M10 -6 q4 8 0 16 q-3 -4 -2 -8Z" fill="#7A4A2A" opacity={0.7} />}
  </g>
);

/** clip-on examiner badge, ~56x70 */
export const Badge: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <rect x={-6} y={-42} width={12} height={10} rx={2} fill={PAL.metal.base} stroke={PAL.metal.line} strokeWidth={2} />
    <Part t={{ ...PAL.paper, base: '#FFFFFF', line: '#2B3A6B' }} d="M-28 -34 L28 -34 Q31 -34 31 -31 L31 31 Q31 34 28 34 L-28 34 Q-31 34 -31 31 L-31 -31 Q-31 -34 -28 -34Z" sh="M-31 26 L31 26 L31 40 L-31 40Z" sw={3}>
      <rect x={-31} y={-34} width={62} height={12} fill="#2B4C9B" />
      <text x={0} y={-25} fontSize={7} fill="#fff" textAnchor="middle" fontFamily="Montserrat" fontWeight={900}>ГРС · КР</text>
    </Part>
    <rect x={-24} y={-17} width={22} height={27} fill="#CFE0F2" stroke="#2B3A6B" strokeWidth={1.6} />
    <circle cx={-13} cy={-7} r={6} fill="#D9A57A" />
    <path d="M-19 -9 Q-13 -15 -7 -9" fill="#2A2727" />
    <path d="M-17 -3 Q-13 -6 -9 -3 Q-13 -1 -17 -3Z" fill="#2A2727" />
    <path d="M-22 10 Q-13 1 -4 10Z" fill="#A9C8E8" />
    <rect x={2} y={-14} width={22} height={3} fill="#9AA3C2" /><rect x={2} y={-7} width={18} height={3} fill="#9AA3C2" /><rect x={2} y={0} width={20} height={3} fill="#9AA3C2" />
    <text x={0} y={24} fontSize={8.2} fill="#1E2A55" textAnchor="middle" fontFamily="Montserrat" fontWeight={900} textLength={54} lengthAdjust="spacingAndGlyphs">ЭКЗАМЕНАТОР</text>
  </g>
);
