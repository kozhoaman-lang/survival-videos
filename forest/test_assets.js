const sharp = require('/opt/npm-tools/node_modules/sharp');
const L = require('./lib'); const F = require('./forest_lib');
const { W, H, C } = L;
const wrap = inner => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${inner}</svg>`;
const hero = (o) => L.character(Object.assign({ s: 0.9, expr: 'worried' }, o));
const frames = {
  // 1 day forest with trail, trees, log, rocks, bush, hero
  day: t => [F.forestBackdrop(t, { time: 'day', pan: 80 }), F.trail(t, { bend: 80, fade: 1 }), F.bush(260, 800, 1.1, { berries: '#d6306a' }), F.log(1500, 800, 0.9), F.rocks(1230, 770, 0.8), F.tree(150, 900, 1.2, 'pine'), F.tree(1780, 930, 1.3, 'leafy'),
    F.mushrooms(520, 960), F.berries(700, 980, 1.2), hero({ x: 960, y: 960 }), F.skull(1500, 280, 1, { warning: true }), F.forestForeground(t, { pan: 80 }),
    L.pill(t, 'left', 'DAY 1', 0, { fs: 40, h: 70 })].join(''),
  // 2 dusk clearing, smoky fire w/ pot, shelter, flag
  dusk: t => [F.forestBackdrop(t, { time: 'dusk', clearing: 0.8 }), F.shelter(500, 930, 0.8, 0.95, { time: 'dusk' }), F.campfire(t, 1180, 930, 1.1, { smoky: true, pot: true, bubbles: 1, time: 'dusk' }), F.flag(t, 1700, 900, 1, {}), hero({ x: 930, y: 960, face: -1 }),
    F.trail(t, { fade: 0.35, time: 'dusk', bend: -60 })].join(''),
  // 3 night: fire, eyes in bush, deer, bear, stream
  night: t => [F.forestBackdrop(t, { time: 'night', pan: 200 }), F.stream(t, { y: 760, h: 130, time: 'night' }), F.eyesInBush(t, 330, 980, 1.2, { seed: 1 }), F.deer(t, 1560, 960, 0.9, { face: -1, time: 'night' }), F.bear(t, 600, 800, 0.6, { time: 'night' }), F.campfire(t, 1080, 1000, 1, { time: 'night' }), hero({ x: 800, y: 1010 }),
    L.darkness(0.0, [])].join(''),
  // 4 rain + poncho + wet
  rain: t => [F.forestBackdrop(t, { time: 'dusk' }), F.stream(t, { y: 880, h: 150, time: 'dusk', slope: 30 }), hero({ x: 700, y: 900, expr: 'scared' }), F.poncho(t, 700, 900, 0.9, {}), hero({ x: 1250, y: 900 }), F.poncho(t, 1250, 900, 0.9, { progress: 0.5 }), F.rain(t, { wet: 1 }),
    F.thermometer(1700, 500, 0.9, 0.12, { label: '2°C' })].join(''),
  // 5 phone + stop tiles
  ui: t => [`<rect width="${W}" height="${H}" fill="#3b4a72"/>`, F.phone(t, 360, 520, 0.95, { battery: 14, airplane: false, bars: 0, noService: true }), F.phone(t, 860, 520, 0.95, { battery: 62, airplane: true, bars: 0 }),
    F.stopTiles(t, 0, 1380, 220, 0.7), F.thermometer(1780, 780, 0.7, 0.8, { label: '39°' }), F.thermometer(1560, 780, 0.7, 0.35), F.thermometer(1360, 780, 0.7, 0.05),
    L.popCard(t, 0, 1050, 880, F.icons.whistle, { r: 70 }), L.popCard(t, 0, 1200, 960, F.icons.skull, { r: 60 }), L.popCard(t, 0, 1560, 1000, F.icons.flag, { r: 50 }), L.popCard(t, 0, 1680, 1000, F.icons.shelter, { r: 50 })].join(''),
  // 6 sky: SOS, helicopters, mirror, whistle
  sky: t => [F.forestBackdrop(t, { time: 'day', clearing: 1 }), F.sosRocks(960, 1040, 1100, 0.7), F.helicopter(t, 1300, 260, 1, 1), F.helicopterFar(t, 520, 200, 1.1, -1), F.helicopterFar(t, 760, 360, 0.55, 1), hero({ x: 330, y: 900, armR: 120, armL: 20 }), F.signalMirror(t, 460, 560, 1, { target: [1180, 300], flash: 1 }), F.whistle(1700, 700, 1), F.whistleWaves(t, 1700, 700, 1, { t0: 0 })].join(''),
  // 7 map + volunteers
  map: t => [`<rect width="${W}" height="${H}" fill="#2a3556"/>`, F.searchMap(t, 80, 60, 1000, 700, { tin: 0, dur: 6 }), `<rect y="800" width="${W}" height="280" fill="#4a8a3c"/>`, F.volunteers(t, 1200, 1010, 0.8, {}), F.volunteers(t, 1600, 750, 0.45, { face: -1 }), F.helicopterFar(t, 1500, 200, 1.4, 1)].join(''),
};
(async () => {
  const names = Object.keys(frames), tiles = [];
  const times = { day: 1.3, dusk: 2.1, night: 3.2, rain: 1.1, ui: 3, sky: 1.55, map: 3.5 };
  for (const n of names) {
    const buf = await sharp(Buffer.from(wrap(frames[n](times[n])))).png().toBuffer();
    await sharp(buf).toFile(`/tmp/claude-0/-home-claude/4fef88d3-6a03-52cc-bd12-3787654fb2ea/scratchpad/f_${n}.png`);
    tiles.push(await sharp(buf).resize(960, 540).toBuffer());
  }
  // stage strip of shelter progress + fire states + eyes
  const strip = t => [`<rect width="${W}" height="${H}" fill="#6a9a58"/>`, ...[0.15, 0.4, 0.65, 1].map((p, i) => F.shelter(380 + (i % 2) * 900, 450 + Math.floor(i / 2) * 470, 0.8, p)),
    F.campfire(t, 900, 1040, 0.5, { lit: 1 }), F.campfire(t, 1050, 1040, 0.5, { lit: 0 }), F.campfire(t, 1250, 1040, 0.5, { pot: true, bubbles: 0.3 }), F.mushrooms(1600, 1000, 0.8, { kind: 'red' }), F.mushrooms(1750, 1000, 0.7, { kind: 'brown' })].join('');
  const b = await sharp(Buffer.from(wrap(strip(1.7)))).png().toBuffer();
  await sharp(b).toFile('/tmp/claude-0/-home-claude/4fef88d3-6a03-52cc-bd12-3787654fb2ea/scratchpad/f_stages.png');
  tiles.push(await sharp(b).resize(960, 540).toBuffer());
  const cols = 2, rows = Math.ceil(tiles.length / cols);
  await sharp({ create: { width: 960 * cols, height: 540 * rows, channels: 3, background: '#000' } }).composite(tiles.map((input, i) => ({ input, left: (i % cols) * 960, top: Math.floor(i / cols) * 540 }))).png().toFile('/home/claude/forest/assets_sheet.png');
  console.log('sheet saved');
})();
