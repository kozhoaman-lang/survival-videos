import { Tone } from './prims';
// Every material: base, shadow (2 tones darker, hue-shifted, never black), deep fold (3 tones), outline, rim light.
export const PAL = {
  // Danchik
  dSkin: { base: '#E8B48A', sh: '#C98665', deep: '#A9654E', line: '#9A5A44', rim: '#FFE3C6', hi: '#F7CFA8' } as Tone,
  hoodie: { base: '#E8833A', sh: '#BE5630', deep: '#923C27', line: '#87351F', rim: '#FFC98F', hi: '#F7A35E' } as Tone,
  cap: { base: '#2E3A55', sh: '#222A44', deep: '#171C33', line: '#141830', rim: '#7088B8', hi: '#4D5F88' } as Tone,
  dHair: { base: '#2E2424', sh: '#1E1618', deep: '#140E10', line: '#120B0C', rim: '#7A6262', hi: '#6B5555' } as Tone,
  jeans: { base: '#9DBCE0', sh: '#7090C4', deep: '#5573A8', line: '#4A6597', rim: '#E2EEFB', hi: '#C9DCF2' } as Tone,
  sneaker: { base: '#F5F4F0', sh: '#C8CBDA', deep: '#A2A6BC', line: '#7C8198', rim: '#FFFFFF', hi: '#FFFFFF' } as Tone,
  sole: { base: '#E4E1DA', sh: '#B9B6C4', deep: '#9A97A8', line: '#7C8198', rim: '#FFFFFF' } as Tone,
  laceA: '#FF4F8B', laceB: '#22C3B5',
  // Bakyt
  bSkin: { base: '#D9A57A', sh: '#B67A58', deep: '#935B43', line: '#85513B', rim: '#F7D7B5', hi: '#EABF98' } as Tone,
  shirt: { base: '#A9C8E8', sh: '#7F8FC6', deep: '#6370AC', line: '#56619C', rim: '#EEF6FF', hi: '#CFE2F5' } as Tone,
  epaul: { base: '#46598F', sh: '#36457A', deep: '#283562', line: '#222D55', rim: '#8EA2D6' } as Tone,
  pants: { base: '#3B3F52', sh: '#2C2F44', deep: '#202236', line: '#181A2B', rim: '#7D84A6', hi: '#5A6080' } as Tone,
  shoe: { base: '#26252C', sh: '#1A1A22', deep: '#111118', line: '#0D0D12', rim: '#8D8DA0', hi: '#9A9AB0' } as Tone,
  bHair: { base: '#2A2727', sh: '#1B1919', deep: '#121010', line: '#0E0C0C', rim: '#8C8888', hi: '#7A7676' } as Tone,
  belt: { base: '#5A3A28', sh: '#432A1D', deep: '#2F1C13', line: '#2A180F', rim: '#9A6A4C' } as Tone,
  // props
  board: { base: '#B98245', sh: '#966132', deep: '#744722', line: '#6A4020', rim: '#E9B77A' } as Tone,
  paper: { base: '#FBF8EE', sh: '#D9D6E4', deep: '#BAB6CC', line: '#8E8AA6', rim: '#FFFFFF' } as Tone,
  metal: { base: '#C3C8D3', sh: '#8C93A8', deep: '#6A7088', line: '#555B72', rim: '#FFFFFF', hi: '#FFFFFF' } as Tone,
  cup: { base: '#FAF7F0', sh: '#D3D0DF', deep: '#B4B0C6', line: '#8E8AA6', rim: '#FFFFFF', hi: '#FFFFFF' } as Tone,
  sleeve: { base: '#B4794A', sh: '#8F5636', deep: '#6E3F27', line: '#6A3C24', rim: '#E2AC7C' } as Tone,
  lid: { base: '#3B3436', sh: '#2A2426', deep: '#1C1819', line: '#151112', rim: '#8E8486', hi: '#A79B9D' } as Tone,
  // eyes
  eyeLine: '#3A2418', sclera: '#FFFFFF', scleraSh: '#D7DCEC',
  dIris: { base: '#7A4523', sh: '#4E2A14', hi: '#B8783E' },
  bIris: { base: '#4B3426', sh: '#2E1E15', hi: '#7D5B44' },
  pupil: '#1A0F0B',
  mouthIn: '#5A1E26', tongue: '#D8606C', tongueSh: '#B04452', teeth: '#FFFDF6', teethSh: '#D8D6E4',
};
