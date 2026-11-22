// Character sheets: turnaround, 6 emotions, 5 mouth shapes, hands / progression / props, height lineup.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { MONT } from '../fonts';
import { Danchik, DanchikHead } from '../chars/Danchik';
import { Bakyt, BakytHead } from '../chars/Bakyt';
import { Hand, HandPose } from '../rig/Hand';
import { Cup, Clipboard, Badge } from '../chars/Props';
import { PAL } from '../rig/palette';
import { face, Emotion, Mouth } from '../chars/common';
import { useUid } from '../rig/prims';

const INK = '#2B2235';
const Paper: React.FC<{ w: number; h: number; children: React.ReactNode; accent: string }> = ({ w, h, children, accent }) => (
  <AbsoluteFill style={{ background: '#F4EBDA' }}>
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ fontFamily: MONT }}>
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 L0 0 0 40" fill="none" stroke="#E6D8BE" strokeWidth="1.5" /></pattern>
        <radialGradient id="vig" cx="50%" cy="45%" r="75%"><stop offset="60%" stopColor="#000" stopOpacity="0" /><stop offset="100%" stopColor="#6B4A2A" stopOpacity="0.18" /></radialGradient>
      </defs>
      <rect width={w} height={h} fill="url(#grid)" />
      <rect x={0} y={0} width={w} height={14} fill={accent} />
      {children}
      <rect width={w} height={h} fill="url(#vig)" />
    </svg>
  </AbsoluteFill>
);
const Card: React.FC<{ x: number; y: number; w: number; h: number; title: string; tint: string }> = ({ x, y, w, h, title, tint }) => (
  <g>
    <rect x={x + 6} y={y + 8} width={w} height={h} rx={28} fill="#C9B596" opacity={0.45} />
    <rect x={x} y={y} width={w} height={h} rx={28} fill={tint} stroke="#D8C6A6" strokeWidth={3} />
    <text x={x + 34} y={y + 58} fontSize={36} fontWeight={900} fill={INK} letterSpacing={2}>{title}</text>
  </g>
);
const Label: React.FC<{ x: number; y: number; t: string; s?: number; c?: string }> = ({ x, y, t, s = 30, c = INK }) =>
  <text x={x} y={y} fontSize={s} fontWeight={800} fill={c} textAnchor="middle" letterSpacing={1.5}>{t}</text>;
const Swatch: React.FC<{ x: number; y: number; c: string; n: string }> = ({ x, y, c, n }) => (
  <g><rect x={x} y={y} width={54} height={54} rx={12} fill={c} stroke={INK} strokeWidth={3} /><text x={x + 66} y={y + 25} fontSize={20} fontWeight={800} fill={INK}>{n}</text><text x={x + 66} y={y + 49} fontSize={18} fontWeight={800} fill="#7A6A5A">{c}</text></g>
);
const Crop: React.FC<{ x: number; y: number; w: number; h: number; children: React.ReactNode }> = ({ x, y, w, h, children }) => {
  const id = useUid();
  return <g>
    <clipPath id={id}><rect x={x} y={y} width={w} height={h} rx={26} /></clipPath>
    <rect x={x} y={y} width={w} height={h} rx={26} fill="#FFF8EC" />
    <g clipPath={`url(#${id})`}>{children}</g>
    <rect x={x} y={y} width={w} height={h} rx={26} fill="none" stroke="#D8C6A6" strokeWidth={3} />
  </g>;
};

const EMO: [Emotion, string][] = [['joy', 'РАДОСТЬ'], ['pride', 'ГОРДОСТЬ'], ['confused', 'РАСТЕРЯННОСТЬ'], ['fear', 'ИСПУГ'], ['tired', 'УСТАЛОСТЬ'], ['shock', 'ШОК']];
const MOUTHS: [Mouth, string][] = [['closed', 'ЗАКРЫТ'], ['A', '«А»'], ['O', '«О»'], ['I', '«И»'], ['M', '«М»']];
const VIEWS: ['front' | '34' | 'side' | 'back', string][] = [['front', 'СПЕРЕДИ'], ['34', '3/4'], ['side', 'СБОКУ'], ['back', 'СО СПИНЫ']];

export const W = 2400, HH = 3330;

export const SheetDanchik: React.FC = () => (
  <Paper w={W} h={HH} accent="#E8833A">
    <text x={70} y={120} fontSize={92} fontWeight={900} fill={INK}>ДАНЧИК</text>
    <text x={560} y={120} fontSize={40} fontWeight={800} fill="#9A5A2A">20 лет · весёлый и наивный</text>
    {[['#E8B48A', 'кожа'], ['#E8833A', 'толстовка'], ['#2E3A55', 'кепка'], ['#9DBCE0', 'джинсы'], ['#2E2424', 'волосы']].map(([c, n], i) =>
      <Swatch key={c} x={1230 + i * 232} y={62} c={c} n={n} />)}
    <Card x={50} y={170} w={2300} h={1220} title="РАЗВОРОТ" tint="#FBF3E4" />
    {VIEWS.map(([v, n], i) => <g key={v}><Danchik view={v} x={330 + i * 580} y={1270} scale={1.62} /><Label x={330 + i * 580 + 20} y={1350} t={n} /></g>)}
    <Card x={50} y={1420} w={2300} h={620} title="ЭМОЦИИ" tint="#FFF1E2" />
    {EMO.map(([e, n], i) => <g key={e}><g transform={`translate(${245 + i * 382},${1735}) scale(1.45)`}><DanchikHead f={face(e, 'd')} /></g><Label x={245 + i * 382} y={2010} t={n} s={28} /></g>)}
    <Card x={50} y={2070} w={2300} h={560} title="РОТ ДЛЯ РЕЧИ (ЛИПСИНК)" tint="#FBF3E4" />
    {MOUTHS.map(([m, n], i) => <g key={m}>
      <Crop x={110 + i * 446} y={2160} w={400} h={380}><g transform={`translate(${310 + i * 446},${2300}) scale(2.6)`}><DanchikHead f={face('neutral', 'd')} mouth={m} /></g></Crop>
      <Label x={310 + i * 446} y={2600} t={n} s={34} /></g>)}
    <Card x={50} y={2660} w={2300} h={600} title="КИСТИ: 4 ПАЛЬЦА + БОЛЬШОЙ, КОСТЯШКИ" tint="#FFF1E2" />
    {([['relaxed', 'свободно', 0], ['wave', 'машет', 180], ['fist', 'кулак', 0], ['point', 'указывает', -90], ['thumb', 'класс', -90], ['grip', 'хват', 0]] as [HandPose, string, number][]).map(([p, n, r], i) =>
      <g key={p}><g transform={`translate(${250 + i * 382},${2880}) rotate(${r}) scale(3.4) translate(0,-20)`}>
        {p === 'grip' ? <Hand t={PAL.dSkin} pose={p}><g transform="translate(0,22) scale(0.85)"><Cup /></g></Hand> : <Hand t={PAL.dSkin} pose={p} />}
        {p !== 'grip' && <g transform="translate(0,-4)"><path d="M-17 -6 L17 -6 C19 2 18 8 17 12 C6 15 -6 15 -17 12 C-18 8 -19 2 -17 -6Z" fill={PAL.hoodie.base} stroke={PAL.hoodie.line} strokeWidth={3} />
          {[-11, -5.5, 0, 5.5, 11].map(xx => <path key={xx} d={`M${xx} -3 L${xx} 11`} stroke={PAL.hoodie.sh} strokeWidth={1.4} />)}</g>}</g>
        <Label x={250 + i * 382} y={3080} t={n} s={28} /></g>)}
    <text x={110} y={3170} fontSize={28} fontWeight={800} fill="#7A6A5A">Рукав толстовки закрывает половину кисти. Каждая часть тела — отдельный SVG-слой.</text>
    <text x={110} y={3215} fontSize={28} fontWeight={800} fill="#7A6A5A">Свет сверху слева: контровой край слева, тени справа, цветные; контур 3 / 5 px.</text>
  </Paper>
);

export const SheetBakyt: React.FC = () => (
  <Paper w={W} h={HH} accent="#A9C8E8">
    <text x={70} y={120} fontSize={92} fontWeight={900} fill={INK}>БАКЫТ АКЕ</text>
    <text x={720} y={120} fontSize={40} fontWeight={800} fill="#4A5E9A">≈50 лет · экзаменатор</text>
    {[['#D9A57A', 'кожа'], ['#A9C8E8', 'рубашка'], ['#3B3F52', 'брюки'], ['#2A2727', 'усы']].map(([c, n], i) =>
      <Swatch key={c} x={1560 + i * 200} y={62} c={c} n={n} />)}
    <Card x={50} y={170} w={2300} h={1220} title="РАЗВОРОТ" tint="#F1F5FB" />
    {VIEWS.map(([v, n], i) => <g key={v}><Bakyt view={v} x={320 + i * 580} y={1270} scale={1.62} /><Label x={320 + i * 580 + 20} y={1350} t={n} /></g>)}
    <Card x={50} y={1420} w={2300} h={620} title="ЭМОЦИИ" tint="#EAF1FA" />
    {EMO.map(([e, n], i) => <g key={e}><g transform={`translate(${245 + i * 382},${1740}) scale(1.45)`}><BakytHead f={face(e, 'b')} lvl={2} /></g><Label x={245 + i * 382} y={2010} t={n} s={28} /></g>)}
    <Card x={50} y={2070} w={2300} h={560} title="РОТ ДЛЯ РЕЧИ (ПОД УСАМИ)" tint="#F1F5FB" />
    {MOUTHS.map(([m, n], i) => <g key={m}>
      <Crop x={110 + i * 446} y={2160} w={400} h={380}><g transform={`translate(${310 + i * 446},${2250}) scale(2.6)`}><BakytHead f={face('neutral', 'b')} mouth={m} lvl={2} /></g></Crop>
      <Label x={310 + i * 446} y={2600} t={n} s={34} /></g>)}
    <Card x={50} y={2660} w={1420} h={620} title="ПРОГРЕССИЯ ПО ПОПЫТКАМ" tint="#EAF1FA" />
    {[[1, 'попытка 1'], [3, 'попытка 3'], [6, 'попытка 6']].map(([l, n], i) => <g key={i}>
      <g transform={`translate(${300 + i * 440},${2960}) scale(1.55)`}><BakytHead f={face(l === 6 ? 'tired' : 'neutral', 'b')} lvl={l as number} /></g>
      <Label x={300 + i * 440} y={3240} t={n as string} s={30} /></g>)}
    <Card x={1500} y={2660} w={850} h={620} title="РЕКВИЗИТ" tint="#F1F5FB" />
    <g transform="translate(1640,3000) scale(2.3)"><Clipboard /></g>
    <g transform="translate(1900,2990) scale(3.2)"><Cup /></g>
    <g transform="translate(2170,2990) scale(2.6)"><Badge /></g>
    <Label x={1640} y={3240} t="планшет" s={28} /><Label x={1900} y={3240} t="кофе" s={28} /><Label x={2170} y={3240} t="бейдж" s={28} />
  </Paper>
);

export const Lineup: React.FC = () => {
  const s = 1.9, g = 1500;
  const head = 214 * s;
  return (
    <Paper w={W} h={1700} accent="#2E3A55">
      <text x={70} y={120} fontSize={80} fontWeight={900} fill={INK}>СРАВНЕНИЕ РОСТА</text>
      {[0, 1, 2, 3].map(i => <g key={i}>
        <path d={`M120 ${g - i * head} L2280 ${g - i * head}`} stroke="#B9A584" strokeWidth={3} strokeDasharray="14 12" />
        {i > 0 && <text x={130} y={g - i * head - 12} fontSize={26} fontWeight={800} fill="#9A8466">{i} гол.</text>}
      </g>)}
      <Danchik view="34" x={820} y={g} scale={s} emotion="joy" pose={{ aL: [18, -30], aR: [-150, -20], hR: 'wave' }} />
      <Bakyt view="34" x={1560} y={g} scale={s} emotion="tired" lvl={2} />
      <Label x={820} y={g + 120} t="ДАНЧИК — высокий и худой" s={36} />
      <Label x={1580} y={g + 120} t="БАКЫТ АКЕ — ниже и вдвое шире" s={36} />
    </Paper>
  );
};
