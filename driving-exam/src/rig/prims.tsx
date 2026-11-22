// Shared drawing primitives: cel-shaded parts with colored, variable-width outlines.
import React, { useId } from 'react';

export type Tone = { base: string; sh: string; deep: string; line: string; rim: string; hi?: string };

export const useUid = () => 'u' + useId().replace(/[^a-zA-Z0-9]/g, '');

export const OUT = 5;   // outer silhouette
export const IN = 3;    // inner details

/**
 * A cel-shaded part: base fill, shadow (2 tones darker) and deep fold shadow (3 tones darker)
 * clipped to the shape, rim light on the sun side (top-left), and a colored outline that is
 * thicker on the shadow side (an offset underlay) -> variable line weight.
 */
export const Part: React.FC<{
  d: string; t: Tone; sh?: string; deep?: string; rim?: string; hi?: string;
  sw?: number; under?: boolean; children?: React.ReactNode; opacity?: number; fill?: string;
}> = ({ d, t, sh, deep, rim, hi, sw = OUT, under = true, children, opacity, fill }) => {
  const id = useUid();
  return (
    <g opacity={opacity}>
      {under && <path d={d} fill={t.line} stroke={t.line} strokeWidth={sw} strokeLinejoin="round" transform="translate(1.3,1.7)" />}
      <path d={d} fill={fill ?? t.base} />
      <clipPath id={id}><path d={d} /></clipPath>
      <g clipPath={`url(#${id})`}>
        {sh && <path d={sh} fill={t.sh} />}
        {deep && <path d={deep} fill={t.deep} />}
        {children}
        {hi && <path d={hi} fill={t.hi ?? t.rim} opacity={0.85} />}
        {rim && <path d={rim} fill="none" stroke={t.rim} strokeWidth={3.2} strokeLinecap="round" opacity={0.95} />}
      </g>
      <path d={d} fill="none" stroke={t.line} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  );
};

/** inner detail line (3 px), colored */
export const Ln: React.FC<{ d: string; c: string; w?: number; o?: number; cap?: 'round' | 'butt' }> = ({ d, c, w = IN, o, cap = 'round' }) =>
  <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap={cap} strokeLinejoin="round" opacity={o} />;

/** tapered stroke (brush line), drawn as a filled crescent between two curves */
export function taper(x1: number, y1: number, cx: number, cy: number, x2: number, y2: number, w: number) {
  // perpendicular offset at middle
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L * w, ny = dx / L * w;
  return `M${x1} ${y1} Q${cx + nx} ${cy + ny} ${x2} ${y2} Q${cx - nx} ${cy - ny} ${x1} ${y1}Z`;
}

/** capsule limb along +y: top width w1, bottom width w2, slight muscle/cloth bulge */
export function capsule(len: number, w1: number, w2: number, bulge = 0, bulgeR = bulge) {
  const a = w1 / 2, b = w2 / 2;
  return `M${-a} 0 C${-a - bulge} ${len * 0.35} ${-b - bulge * 0.5} ${len * 0.72} ${-b} ${len}` +
    ` A${b} ${b * 0.85} 0 0 0 ${b} ${len}` +
    ` C${b + bulgeR * 0.5} ${len * 0.72} ${a + bulgeR} ${len * 0.35} ${a} 0` +
    ` A${a} ${a * 0.85} 0 0 0 ${-a} 0Z`;
}
/** shadow half of a capsule (right side, away from the sun) */
export function capShadow(len: number, w1: number, w2: number, k = 0.18) {
  return `M${w1 * k} -40 C${w1 * k + 4} ${len * 0.4} ${w2 * k + 4} ${len * 0.7} ${w2 * k} ${len + 40} L200 ${len + 40} L200 -40Z`;
}
export function capRim(len: number, w1: number, w2: number) {
  const a = w1 / 2 - 3.5, b = w2 / 2 - 3.5;
  return `M${-a} ${4} C${-a - 1} ${len * 0.35} ${-b - 1} ${len * 0.7} ${-b} ${len - 4}`;
}

export const deg = (r: number) => r * 180 / Math.PI;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

/** soft cast shadow on the ground, 30% */
export const GroundShadow: React.FC<{ rx: number; ry?: number; x?: number; color?: string }> = ({ rx, ry = rx * 0.14, x = 0, color = '#2b2347' }) => {
  const id = useUid();
  return <g>
    <filter id={id} x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation={ry * 0.45} /></filter>
    <ellipse cx={x} cy={0} rx={rx} ry={ry} fill={color} opacity={0.3} filter={`url(#${id})`} />
  </g>;
};
