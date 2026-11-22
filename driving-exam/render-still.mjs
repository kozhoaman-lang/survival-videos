// usage: node render-still.mjs <CompositionId> <out.png> [scale]
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
const [id, out, scale = '1'] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const opts = { serveUrl, browserExecutable: '/opt/pw-browsers/chromium', chromiumOptions: { gl: 'swangle' } };
for (const one of id.split(',')) {
  const composition = await selectComposition({ ...opts, id: one });
  const o = id.includes(',') ? out.replace('%s', one) : out;
  await renderStill({ ...opts, composition, output: o, scale: Number(scale) });
  console.log('wrote', o);
}
