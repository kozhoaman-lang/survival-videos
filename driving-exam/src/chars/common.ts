import { BrowP, EyeP } from '../rig/Face';
import { HandPose } from '../rig/Hand';
export type View = 'front' | '34' | 'side' | 'back';
export type Emotion = 'neutral' | 'joy' | 'pride' | 'confused' | 'fear' | 'tired' | 'shock';
export type Mouth = 'closed' | 'A' | 'O' | 'I' | 'M' | 'grin' | 'smirk' | 'wavy' | 'grimace' | 'flat' | 'shock' | 'frown';
export type FaceP = { bL: BrowP; bR: BrowP; eL: EyeP; eR: EyeP; mouth: Mouth; blush: number; sweat: number; tilt: number; extra?: '?' | '!' | 'zzz' | '' };
export type Pose = {
  aL: [number, number]; aR: [number, number]; hL: HandPose; hR: HandPose;
  lL: [number, number]; lR: [number, number];
  headRot: number; headDx: number; headDy: number; lean: number; squash: number; breath: number;
};
export const basePose = (p: Partial<Pose> = {}): Pose => ({
  aL: [8, -8], aR: [-8, 8], hL: 'relaxed', hR: 'relaxed', lL: [3, -2], lR: [-3, 2],
  headRot: 0, headDx: 0, headDy: 0, lean: 0, squash: 1, breath: 0, ...p,
});
const E = (o: Partial<EyeP> = {}): EyeP => ({ lidTop: 0.12, lidBot: 0, lookX: 0, lookY: 0, pupil: 1, ...o });
const B = (y = 0, rot = 0, arch = 4): BrowP => ({ y, rot, arch });
export function face(e: Emotion, who: 'd' | 'b' = 'd'): FaceP {
  const heavy = who === 'b' ? 0.33 : 0;
  const base: FaceP = { bL: B(), bR: B(), eL: E({ lidTop: 0.12 + heavy }), eR: E({ lidTop: 0.12 + heavy }), mouth: 'closed', blush: who === 'd' ? 0.25 : 0, sweat: 0, tilt: 0, extra: '' };
  switch (e) {
    case 'joy': return { ...base, bL: B(-8, 4, 8), bR: B(-8, 4, 8), eL: E({ lidTop: 0, lidBot: 0.38, pupil: 1.08 }), eR: E({ lidTop: 0, lidBot: 0.38, pupil: 1.08 }), mouth: 'grin', blush: 0.7, tilt: -4 };
    case 'pride': return { ...base, bL: B(-10, -6, 9), bR: B(2, -10, 3), eL: E({ lidTop: 0.42 + heavy * 0.3, lidBot: 0.12, lookX: 0.35, lookY: -0.1 }), eR: E({ lidTop: 0.42 + heavy * 0.3, lidBot: 0.12, lookX: 0.35, lookY: -0.1 }), mouth: 'smirk', blush: 0.35, tilt: -7 };
    case 'confused': return { ...base, bL: B(-12, 6, 10), bR: B(5, -12, 1), eL: E({ lidTop: 0.05 + heavy * 0.5, lookX: 0.6, lookY: -0.65, size: 1.06 }), eR: E({ lidTop: 0.3 + heavy * 0.5, lookX: 0.6, lookY: -0.65, size: 0.94 }), mouth: 'wavy', tilt: 8, extra: '?' };
    case 'fear': return { ...base, bL: B(-10, 18, 2), bR: B(-10, 18, 2), eL: E({ lidTop: 0, pupil: 0.5, size: 1.1 }), eR: E({ lidTop: 0, pupil: 0.5, size: 1.1 }), mouth: 'grimace', sweat: 1, tilt: 3, blush: 0 };
    case 'tired': return { ...base, bL: B(5, 8, 1), bR: B(5, 8, 1), eL: E({ lidTop: 0.6, lidBot: 0.12, lookY: 0.35, pupil: 0.95, lidTiltOut: 4 }), eR: E({ lidTop: 0.6, lidBot: 0.12, lookY: 0.35, pupil: 0.95, lidTiltOut: 4 }), mouth: 'flat', tilt: 6, blush: 0, extra: who === 'b' ? 'zzz' : '' };
    case 'shock': return { ...base, bL: B(-20, 6, 11), bR: B(-20, 6, 11), eL: E({ lidTop: 0, pupil: 0.38, size: 1.2 }), eR: E({ lidTop: 0, pupil: 0.38, size: 1.2 }), mouth: 'shock', tilt: 0, blush: 0, extra: '!' };
    default: return base;
  }
}
