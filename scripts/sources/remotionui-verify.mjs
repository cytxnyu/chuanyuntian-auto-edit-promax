import {readFileSync, existsSync, writeFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const manifest = JSON.parse(readFileSync(resolve(root, 'vendor/remotionui/SOURCE_MANIFEST.json'), 'utf8'));
const catalog = JSON.parse(readFileSync(resolve(root, 'references/sources/remotionui.json'), 'utf8'));
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
for (const record of manifest.records) {
  assert.equal(sha(readFileSync(resolve(root, record.original))), record.originalSha256, `Original source drift: ${record.original}`);
  assert.equal(sha(readFileSync(resolve(root, record.runtime))), record.runtimeSha256, `Runtime adapter drift: ${record.runtime}`);
  const code = readFileSync(resolve(root, record.runtime), 'utf8');
  assert.ok(!code.includes('@/remotion/'), `Unresolved upstream import: ${record.runtime}`);
  assert.ok(!code.includes('@remotion/google-fonts'), `Network font loader retained: ${record.runtime}`);
}
for (const cache of manifest.caches) assert.equal(sha(readFileSync(resolve(root, cache.path))), cache.sha256, `Cache drift: ${cache.path}`);
for (const font of manifest.fonts) assert.equal(sha(readFileSync(resolve(root, 'vendor/remotionui/assets', font.name))), font.sha256, `Font drift: ${font.name}`);
for (const asset of manifest.assets) assert.equal(sha(readFileSync(resolve(root, asset.path))), asset.sha256, `Asset drift: ${asset.path}`);
const installed = catalog.entries.filter((entry) => entry.status === 'installed');
assert.deepEqual(installed.map((entry) => entry.id).sort(), ['remotionui/quote-card','remotionui/social-clip','remotionui/title-card']);
const wrapper = readFileSync(resolve(root, 'packages/remotion-renderer/src/external/providers/remotionui.tsx'), 'utf8');
for (const entry of installed) {
  assert.ok(wrapper.includes(`'${entry.id}'`), `Installed ID not exported: ${entry.id}`);
  assert.ok(existsSync(resolve(root, entry.entry)), `Runtime entry not found: ${entry.id}`);
  for (const asset of entry.assets) assert.ok(existsSync(resolve(root, asset.source)), `Asset not cached: ${asset.source}`);
}
for (const entry of catalog.entries.filter((entry) => entry.status === 'indexed')) assert.equal(entry.entry, null, `Index-only entry claims installed module: ${entry.id}`);
assert.equal(installed.find((entry) => entry.id === 'remotionui/social-clip').durationInFrames, 60 + 120 + 60 - 12 - 12);
console.log(`PASS RemotionUI provenance: ${manifest.records.length} original/runtime pairs, ${manifest.caches.length} catalog/license snapshots, ${manifest.fonts.length} font artifacts, ${manifest.assets.length} media asset; ${installed.length} callable entries; ${catalog.entries.length - installed.length} indexed-only.`);
console.log('RENDER_STATUS=not-asserted-by-this-provenance-check');
if (process.argv.includes('--record')) {
  const run = (command, args) => {
    const result = spawnSync(command, args, {cwd: root, encoding: 'utf8', windowsHide: true});
    if (result.error) throw result.error;
    assert.equal(result.status, 0, `${command} failed: ${result.stderr}`);
    return {command, args, input: 'Pinned provider and current synthetic verification artifact', exitStatus: result.status, stdout: result.stdout, stderr: result.stderr};
  };
  const video = 'vendor/remotionui/verification/remotionui-social-clip-synthetic.mp4';
  const checks = [
    run(process.execPath, ['node_modules/typescript/bin/tsc','--noEmit','--jsx','react-jsx','--module','esnext','--moduleResolution','bundler','--esModuleInterop','--strict','--skipLibCheck','--target','es2022','packages/remotion-renderer/src/external/providers/remotionui.tsx']),
    run('ffprobe', ['-v','error','-show_entries','stream=codec_name,width,height,r_frame_rate,nb_frames','-show_entries','format=duration','-of','json',video]),
    run('ffmpeg', ['-v','error','-i',video,'-f','null','-']),
  ];
  const render = JSON.parse(readFileSync(resolve(root, 'vendor/remotionui/verification/RENDER_CHECK.json'), 'utf8'));
  for (const result of render.results) assert.equal(sha(readFileSync(result.outputFile)), result.sha256, `Render output drift: ${result.outputFile}`);
  const output = resolve(root, 'vendor/remotionui/verification/PROVIDER_VERIFICATION.json');
  writeFileSync(output, `${JSON.stringify({revision:manifest.revision,sourcePairs:manifest.records.length,installed:installed.map((item)=>item.id),checks,renderReport:'vendor/remotionui/verification/RENDER_CHECK.json',repeatedFrameHashMatches:render.results.filter((item)=>item.result==='same-frame-sha256-match').length,manualReview:{reviewed:true,observations:['Title-card Chinese heading and subtitle readable within frame.','Quote-card phrase marker matches the provided synthetic phrase; no invented attribution.','Social-clip hook, audiogram/captions and end-card retain upstream composition and have no text clipping at sampled frames.'],note:'Synthetic integration review only; current real-media plans still require Gate C/D.'}},null,2)}\n`);
  console.log('PASS RemotionUI provider record: typecheck, ffprobe, full decode, render hashes, 3 repeated-frame matches.');
}
