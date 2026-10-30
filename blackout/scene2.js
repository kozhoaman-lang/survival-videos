// Scene 2 — Hour 1: inventory + unplug + leave one lamp on (30 s)
const L = require('./lib');
const { W, H, C, keys, clamp, easeOut, spring, pulse, mix } = L;
const DUR = 30;

// ---------- room ----------
function room(t) {
  const s = [];
  s.push(`<rect width="${W}" height="${H}" fill="${C.wall}"/>`);
  s.push(`<rect y="812" width="${W}" height="${H - 812}" fill="${C.floor}"/><rect y="806" width="${W}" height="10" fill="${C.trim}"/>`);
  for (let x = 0; x < W; x += 160) s.push(`<rect x="${x}" y="816" width="4" height="${H}" fill="#2f2632"/>`);
  // window with night city
  s.push(`<rect x="100" y="160" width="380" height="380" rx="8" fill="${C.trim}"/>`);
  s.push(`<rect x="116" y="176" width="348" height="348" fill="#121a31"/>`);
  s.push(`<circle cx="390" cy="240" r="26" fill="#efe6cf"/>`);
  [[116, 380, 70], [190, 330, 60], [255, 400, 55], [312, 350, 70], [385, 420, 79]].forEach(([x, y, w]) => {
    s.push(`<rect x="${x}" y="${y}" width="${w}" height="${524 - y}" fill="#1f2846"/>`);
    for (let wy = y + 14; wy < 510; wy += 26) for (let wx = x + 10; wx < x + w - 12; wx += 20) s.push(`<rect x="${wx}" y="${wy}" width="9" height="12" fill="#18203a"/>`);
  });
  s.push(`<rect x="286" y="176" width="8" height="348" fill="${C.trim}"/><rect x="116" y="346" width="348" height="8" fill="${C.trim}"/>`);
  s.push(`<rect x="88" y="536" width="404" height="18" rx="4" fill="#3a3550"/>`);
  // TV stand + TV + laptop
  s.push(`<rect x="520" y="700" width="460" height="112" rx="6" fill="${C.woodDark}"/><rect x="520" y="700" width="460" height="16" fill="${C.wood}"/>`);
  s.push(`<rect x="548" y="736" width="190" height="56" rx="4" fill="#5a3a28"/><rect x="760" y="736" width="190" height="56" rx="4" fill="#5a3a28"/>`);
  s.push(`<rect x="540" y="452" width="300" height="190" rx="8" fill="#0d0f15"/><rect x="552" y="464" width="276" height="166" fill="#161a24"/>`);
  s.push(`<rect x="676" y="642" width="28" height="44" fill="#0d0f15"/><rect x="630" y="682" width="120" height="14" rx="5" fill="#0d0f15"/>`);
  s.push(`<path d="M860 698 L878 640 L966 640 L948 698 Z" fill="#c7ccd6"/><rect x="852" y="694" width="122" height="8" rx="3" fill="#9aa3b2"/>`);
  return s.join('');
}
// counter with drawer (opens at 7.4)
function counter(t) {
  const o = easeOut(pulse(t, 7.4, 7.9)) * (1 - easeOut(pulse(t, 12.6, 13.0)));
  return `<rect x="1180" y="590" width="420" height="222" fill="#5d6680"/><rect x="1168" y="574" width="444" height="22" rx="4" fill="#c9cfdb"/>
    <rect x="1200" y="${612 + o * 6}" width="380" height="${8 + o * 26}" fill="#262b3a" opacity="${o.toFixed(2)}"/>
    <rect x="1200" y="${614 + o * 30}" width="380" height="70" rx="6" fill="#6f7894"/><rect x="1360" y="${642 + o * 30}" width="60" height="10" rx="5" fill="#c9cfdb"/>
    <rect x="1200" y="702" width="380" height="94" rx="6" fill="#6f7894"/><rect x="1360" y="742" width="60" height="10" rx="5" fill="#c9cfdb"/>`;
}
// wall socket with two plugs; cords to TV and laptop
function socket(t) {
  const p1 = easeOut(pulse(t, 15.0, 15.4)), p2 = easeOut(pulse(t, 16.8, 17.2));
  const plug = (x0, y0, p, toX) => {
    const px = x0 - p * 70, py = y0 + p * 46;
    return `<path d="M${px - 14} ${py + 8} C${px - 60} ${py + 40} ${toX + 40} 760 ${toX} 712" stroke="#22252e" stroke-width="7" fill="none"/>
      <rect x="${px - 16}" y="${py - 10}" width="30" height="24" rx="5" fill="#e3e3e3" stroke="#555" stroke-width="2"/>`;
  };
  // sparks when the surge hits an empty socket
  const sp = t > 19.4 && t < 21.2 && Math.sin(t * 60) > 0 ? `<g stroke="#ffd23f" stroke-width="5" stroke-linecap="round"><line x1="1018" y1="740" x2="1050" y2="716"/><line x1="1020" y1="772" x2="1056" y2="782"/><line x1="1004" y1="734" x2="1000" y2="702"/></g>` : '';
  return `<rect x="986" y="728" width="40" height="66" rx="6" fill="#d9dde6"/><rect x="996" y="740" width="20" height="14" rx="3" fill="#555"/><rect x="996" y="766" width="20" height="14" rx="3" fill="#555"/>
    ${plug(1006, 747, p1, 700)}${plug(1006, 773, p2, 910)}${sp}`;
}
// floor lamp with switch (switched to ON at 27.0)
function lamp(t) {
  const on = t > 27.0;
  return `<ellipse cx="1760" cy="808" rx="70" ry="12" fill="#1c1f29"/><rect x="1754" y="470" width="12" height="338" fill="#1c1f29"/>
    <path d="M1686 520 L1714 420 L1806 420 L1834 520 Z" fill="#e8d8b0"/><path d="M1686 520 L1714 420 L1806 420 L1834 520 Z" fill="#000" opacity="0.35"/>
    <rect x="1742" y="660" width="36" height="52" rx="8" fill="#2a2e3a"/><rect x="1752" y="${on ? 668 : 690}" width="16" height="16" rx="3" fill="${on ? C.green : '#777'}"/>`;
}

// ---------- character track ----------
function hero(t) {
  const x = keys(t, [[0, 330], [3.6, 330], [7.0, 1150], [23.6, 1150], [26.6, 1380]]);
  const walking = (t > 3.6 && t < 7.0) || (t > 23.6 && t < 26.6);
  const face = t < 13.2 ? 1 : t < 23.5 ? -1 : 1;
  const hold = t < 10.4 ? 'phone' : 'flashlight';
  let expr = 'worried';
  if (t > 3.2) expr = 'focused';
  if (t > 10.4 && t < 13) expr = 'happy';
  if (t > 18.5 && t < 21.5) expr = 'scared';
  if (t > 27.2) expr = 'happy';
  const armR = t < 10.4 ? 40 : keys(t, [[10.4, 40], [11.0, 78]]);
  const armL = t > 26.6 && t < 27.3 ? 60 : 8;
  return { x, y: 900, s: 0.92, face, hold, expr, armR, armL, walk: walking ? t * 9 : 0, bob: walking ? -Math.abs(Math.sin(t * 9)) * 8 : 0, blink: L.blinkAt(t) };
}

function frame(t) {
  const s = [];
  s.push(room(t), counter(t), socket(t), lamp(t));
  const h = hero(t);
  s.push(L.character(h));

  // lights
  const hand = L.handR(h, 230);
  let lights = [{ type: 'circle', x: 290, y: 360, r: 330, a: 0.55, core: 0.2 }];
  lights.push({ type: 'circle', x: h.x, y: h.y - 260, r: 340, a: 0.55, core: 0.25 });
  if (h.hold === 'phone') {
    const tgt = t < 4 ? { x: 900, y: 600 } : { x: 1390, y: 640 };
    const dir = Math.atan2(tgt.y - hand.y, tgt.x - hand.x) * 180 / Math.PI;
    lights.push({ type: 'cone', x: hand.x, y: hand.y, dir, len: 520, spread: 20 });
  } else {
    // aim the flashlight at the current point of interest
    const tgt = t < 13.2 ? { x: 1390, y: 660 } : t < 23.5 ? { x: keys(t, [[13.2, 700], [16.0, 700], [16.6, 910]]), y: 640 } : { x: 1760, y: 520 };
    const dir = Math.atan2(tgt.y - hand.y, tgt.x - hand.x) * 180 / Math.PI;
    lights.push({ type: 'cone', x: hand.x, y: hand.y, dir, len: 1100, spread: 24 });
    lights.push({ type: 'circle', x: tgt.x, y: tgt.y, r: 260, a: 0.8, core: 0.3 });
  }
  s.push(L.darkness(0.62, lights));
  s.push(L.glow(hand.x, hand.y, h.hold === 'phone' ? 60 : 90, '#dfe9ff', 0.6));

  // callouts
  s.push(L.popCard(t, 8.0, 1180, 330, L.icon.flashlight, { out: 12.4 }));
  s.push(L.popCard(t, 8.6, 1390, 330, L.icon.battery, { out: 12.4 }));
  s.push(L.popCard(t, 9.2, 1600, 330, L.icon.powerbank, { out: 12.4 }));
  s.push(L.popCard(t, 15.3, 690, 380, L.stampCheck(0.55), { r: 54, out: 18.3 }));
  s.push(L.popCard(t, 17.1, 912, 560, L.stampCheck(0.55), { r: 54, out: 18.3 }));
  s.push(L.popCard(t, 18.6, 1006, 420, L.icon.bolt, { r: 90, out: 22.8, fill: '#fff4d6' }));
  s.push(L.pill(t, 1700, 'LEAVE ON', 27.2, { y: 300, fs: 40, h: 70 }));

  // UI
  s.push(L.bottomShade());
  s.push(L.pill(t, 'left', 'HOUR 1', 0.3), L.pill(t, 'right', 'STAY CALM', 0.45));
  s.push(L.captions(t, [
    [2.5, 2.95, 12.6, 'INVENTORY — ', 'FIRST.'],
    [14.2, 14.65, 23.2, 'UNPLUG — ', 'EVERYTHING.'],
    [24.3, 24.75, null, 'ONE LAMP — ', 'STAYS ON.'],
  ]));
  return s.join('\n');
}

L.render(frame, DUR, 'scene2.mp4');
