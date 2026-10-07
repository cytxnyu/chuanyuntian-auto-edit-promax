import {mkdirSync, writeFileSync, readFileSync, copyFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {bundle} from '@remotion/bundler';
import {getCompositions, renderStill, renderMedia} from '@remotion/renderer';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const output = resolve(root, 'vendor/remotionui/verification');
const publicDir = resolve(output, 'public');
const catalog = JSON.parse(readFileSync(resolve(root, 'references/sources/remotionui.json'), 'utf8'));
const installed = catalog.entries.filter((item) => item.status === 'installed');
mkdirSync(publicDir, {recursive: true});
for (const item of installed) for (const asset of item.assets) {
  const target = resolve(publicDir, asset.target);
  mkdirSync(dirname(target), {recursive: true});
  copyFileSync(resolve(root, asset.source), target);
}
const entryPoint = resolve(output, 'entry.tsx');
writeFileSync(entryPoint, `import {Composition, registerRoot} from 'remotion';\nimport {remotionuiComponents} from '../../../packages/remotion-renderer/src/external/providers/remotionui';\nconst entries = ${JSON.stringify(installed.map(({id,width,height,fps,durationInFrames,defaultProps}) => ({id,width,height,fps,durationInFrames,defaultProps})))};\nregisterRoot(() => <>{entries.map(entry => <Composition key={entry.id} id={entry.id.replaceAll('/', '-')} component={remotionuiComponents[entry.id]} width={entry.width} height={entry.height} fps={entry.fps} durationInFrames={entry.durationInFrames} defaultProps={entry.defaultProps}/>)}</>);\n`);
const serveUrl = await bundle({entryPoint, publicDir, outDir: resolve(output, 'bundle'), onProgress: () => {}});
const compositions = await getCompositions(serveUrl, {logLevel: 'error'});
const results = [];
const hash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
for (const composition of compositions) {
  const frames = composition.id.endsWith('social-clip') ? [15, 105, 204] : [Math.floor(composition.durationInFrames * 0.2), Math.floor(composition.durationInFrames * 0.66)];
  for (const frame of frames) {
    const outputFile = resolve(output, `${composition.id}-${frame}.png`);
    await renderStill({serveUrl, composition, frame, output: outputFile, logLevel: 'error'});
    results.push({id: composition.id, frame, outputFile, sha256: hash(outputFile), result: 'rendered'});
    console.log(`RENDERED ${composition.id} frame ${frame}`);
  }
  const repeatFrame = frames[frames.length - 1];
  const repeatFile = resolve(output, `${composition.id}-${repeatFrame}-repeat.png`);
  await renderStill({serveUrl, composition, frame: repeatFrame, output: repeatFile, logLevel: 'error'});
  assert.equal(hash(repeatFile), results.find((item) => item.id === composition.id && item.frame === repeatFrame)?.sha256, `Same-frame output changed: ${composition.id}`);
  results.push({id: composition.id, frame: repeatFrame, outputFile: repeatFile, sha256: hash(repeatFile), result: 'same-frame-sha256-match'});
  if (process.argv.includes('--video') && composition.id.endsWith('social-clip')) {
    const outputLocation = resolve(output, `${composition.id}-synthetic.mp4`);
    await renderMedia({serveUrl, composition, codec: 'h264', outputLocation, scale: 0.5, concurrency: 2, muted: true, logLevel: 'error'});
    results.push({id: composition.id, outputFile: outputLocation, sha256: hash(outputLocation), result: 'rendered-synthetic-video', durationInFrames: composition.durationInFrames, fps: composition.fps, scale: 0.5});
    console.log(`RENDERED ${composition.id} full ${composition.durationInFrames}-frame synthetic MP4`);
  }
}
writeFileSync(resolve(output, 'RENDER_CHECK.json'), `${JSON.stringify({purpose:'Implementation QA only; synthetic defaults, not a real-video Gate approval or final deliverable.',results},null,2)}\n`);
console.log(`PASS RemotionUI renderer: ${compositions.length} compositions; ${results.length} outputs.`);
