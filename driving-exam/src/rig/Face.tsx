// Eye (sclera / iris / pupil / two highlights / separate lid layers) and brow (separate layer).
import React from 'react';
import { useUid, Tone } from './prims';
import { PAL } from './palette';

export type EyeP = {
  lidTop: number;  // 0 open .. 1 closed
  lidBot: number;  // 0 .. 1 (raised lower lid = smile squint)
  lidTiltIn?: number; lidTiltOut?: number; // y offset of the upper-lid edge at inner / outer corner (angry / sad)
  lookX: number; lookY: number; pupil: number; size?: number;
};

export const Eye: React.FC<{
  cx: number; cy: number; rx: number; ry: number; p: EyeP; skin: Tone; iris: { base: string; sh: string; hi: string };
  outer: 1 | -1; sx?: number; heavy?: number; soft?: boolean;
}> = ({ cx, cy, rx, ry, p, skin, iris, outer, sx = 1, heavy = 0, soft }) => {
  const id = useUid();
  const s = p.size ?? 1;
  rx *= s; ry *= s;
  const lt = Math.min(1, p.lidTop), lb = p.lidBot;
  const ye = -ry + lt * 2.08 * ry;
  const ti = p.lidTiltIn ?? 0, to = p.lidTiltOut ?? 0;
  const xin = -outer * (rx + 4), xout = outer * (rx + 4);
  const sag = ry * 0.42 * (1 - lt);
  const lid = `M${xin} ${-ry - 40} L${xout} ${-ry - 40} L${xout} ${ye + to} Q0 ${ye + sag + (ti + to) / 2} ${xin} ${ye + ti}Z`;
  const yb = ry - lb * ry * 1.15;
  const bot = `M${-rx - 4} ${ry + 30} L${rx + 4} ${ry + 30} L${rx + 4} ${yb + 3} Q0 ${yb - ry * 0.35 * lb} ${-rx - 4} ${yb + 3}Z`;
  const ir = rx * 0.6, ix = p.lookX * rx * 0.38, iy = p.lookY * ry * 0.34;
  const closed = lt >= 0.98;
  return (
    <g transform={`translate(${cx},${cy}) scale(${sx},1)`}>
      <clipPath id={id}><ellipse rx={rx} ry={ry} /></clipPath>
      <ellipse rx={rx} ry={ry} fill={PAL.sclera} />
      <g clipPath={`url(#${id})`}>
        <ellipse cx={0} cy={-ry * 0.95} rx={rx * 1.3} ry={ry * 0.55} fill={PAL.scleraSh} />
        <g transform={`translate(${ix},${iy})`}>
          <circle r={ir} fill={iris.base} />
          <path d={`M${-ir} 0 A${ir} ${ir} 0 0 1 ${ir} 0 Q0 ${-ir * 0.35} ${-ir} 0Z`} fill={iris.sh} />
          <path d={`M${-ir * 0.75} ${ir * 0.45} Q0 ${ir * 1.05} ${ir * 0.75} ${ir * 0.45}`} fill="none" stroke={iris.hi} strokeWidth={ir * 0.22} strokeLinecap="round" />
          <circle r={ir * 0.52 * p.pupil} fill={PAL.pupil} />
          <circle cx={-ir * 0.32} cy={-ir * 0.36} r={ir * 0.3} fill="#fff" />
          <circle cx={ir * 0.36} cy={ir * 0.34} r={ir * 0.13} fill="#fff" />
          <circle r={ir} fill="none" stroke={iris.sh} strokeWidth={1.6} />
        </g>
        {/* lids: separate skin layers */}
        <path d={lid} fill={skin.base} />
        <path d={`M${xin} ${ye + ti - 7} Q0 ${ye + sag - 7 + (ti + to) / 2} ${xout} ${ye + to - 7} L${xout} ${ye + to} Q0 ${ye + sag + (ti + to) / 2} ${xin} ${ye + ti}Z`} fill={skin.sh} opacity={lt > 0.05 ? 1 : 0} />
        {lb > 0.01 && <path d={bot} fill={skin.base} />}
      </g>
      {soft ? <path d={`M${-rx} 0 A${rx} ${ry} 0 0 0 ${rx} 0`} fill="none" stroke={skin.line} strokeWidth={2.2} opacity={closed ? 0 : 0.8} /> : <ellipse rx={rx} ry={ry} fill="none" stroke={PAL.eyeLine} strokeWidth={3} opacity={closed ? 0 : 1} />}
      {/* lash line on the lid edge */}
      {!closed && lt > 0.04 && <path d={`M${xin * 0.98} ${ye + ti} Q0 ${ye + sag + (ti + to) / 2} ${xout * 0.98} ${ye + to}`} fill="none" stroke={PAL.eyeLine} strokeWidth={4.5} strokeLinecap="round" />}
      {!closed && lt <= 0.04 && <path d={`M${-rx * 0.9} ${-ry * 0.45} Q0 ${-ry * 1.25} ${rx * 0.9} ${-ry * 0.45}`} fill="none" stroke={PAL.eyeLine} strokeWidth={5} strokeLinecap="round" />}
      {closed && <path d={`M${-rx} ${ye - 2} Q0 ${ye + ry * 0.45} ${rx} ${ye - 2}`} fill="none" stroke={PAL.eyeLine} strokeWidth={4.5} strokeLinecap="round" />}
      {/* outer lash flick */}
      <path d={`M${outer * rx * 0.86} ${(closed ? ye : Math.max(ye, -ry * 0.5)) + to * 0.5} l${outer * 6} ${-4}`} stroke={PAL.eyeLine} strokeWidth={3.4} strokeLinecap="round" />
      {lb > 0.01 && <path d={`M${-rx * 0.85} ${yb + 2} Q0 ${yb - ry * 0.35 * lb - 1} ${rx * 0.85} ${yb + 2}`} fill="none" stroke={skin.line} strokeWidth={2.4} strokeLinecap="round" />}
      {/* lid crease */}
      <path d={`M${-rx * 0.8} ${-ry - 5 - heavy * 4} Q0 ${-ry - 11 - heavy * 3} ${rx * 0.85} ${-ry - 5 - heavy * 4}`} fill="none" stroke={skin.line} strokeWidth={2} opacity={0.55} strokeLinecap="round" />
    </g>
  );
};

export type BrowP = { y: number; rot: number; arch: number };
/** brow: tapered, thick at the inner end. Positive rot raises the inner end (worry); negative = angry. */
export const Brow: React.FC<{ x: number; y: number; p: BrowP; len: number; th: number; t: Tone; dir: 1 | -1; sx?: number }> = ({ x, y, p, len, th, t, dir, sx = 1 }) => {
  const a = p.arch;
  const d = `M0 ${-th * 0.55} C${len * 0.35} ${-th * 0.6 - a} ${len * 0.7} ${-th * 0.45 - a} ${len} ${-a * 0.1 + 4}` +
    ` C${len * 0.72} ${th * 0.15 - a * 0.85} ${len * 0.35} ${th * 0.45 - a * 0.9} 0 ${th * 0.5} C${-th * 0.35} ${th * 0.3} ${-th * 0.35} ${-th * 0.4} 0 ${-th * 0.55}Z`;
  return (
    <g transform={`translate(${x},${y + p.y}) scale(${dir * sx},1) rotate(${p.rot + 6},${len / 2},0)`}>
      <path d={d} fill={t.base} stroke={t.line} strokeWidth={2.4} strokeLinejoin="round" />
      <path d={`M${len * 0.12} ${-th * 0.2} C${len * 0.4} ${-th * 0.35 - a} ${len * 0.65} ${-th * 0.3 - a} ${len * 0.85} ${-a * 0.2 - 1}`} fill="none" stroke={t.hi ?? t.rim} strokeWidth={2} strokeLinecap="round" opacity={0.8} />
      <path d={`M${len * 0.2} ${th * 0.2 - a * 0.5} l6 -3 M${len * 0.45} ${th * 0.05 - a * 0.8} l6 -3`} stroke={t.deep} strokeWidth={1.4} opacity={0.7} />
    </g>
  );
};
