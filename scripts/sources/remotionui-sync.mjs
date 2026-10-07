import {readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync} from 'node:fs';
import {resolve, dirname, relative, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

// Rebuild only this provider's preserved source, import-compatible runtime and catalog.
// This is not the upstream agent-skill installer and never touches a source project's workflow.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const vendor = resolve(root, 'vendor/remotionui');
const checkout = resolve(vendor, 'upstream');
const revision = 'b7e0e6becc3d22b8b03dfef72c064f72ff9fad1f';
const repository = 'https://github.com/riaz37/remotion-ui';
const selected = ['social-clip', 'title-card', 'quote-card'];
const posix = (p) => p.split(sep).join('/');
const sha = (value) => createHash('sha256').update(value).digest('hex');
const put = (path, value) => {mkdirSync(dirname(path), {recursive: true}); writeFileSync(path, value);};
const json = (path, value) => put(path, `${JSON.stringify(value, null, 2)}\n`);
const gitFile = (path) => execFileSync('git', ['-C', checkout, 'show', `${revision}:${path}`], {maxBuffer: 64 * 1024 * 1024});
const registryBytes = gitFile('apps/web/registry.json');
const registry = JSON.parse(registryBytes);
const index = new Map(registry.items.map((item) => [item.name, item]));
const closure = new Set();
const visit = (name) => {
  if (closure.has(name)) return;
  const item = index.get(name);
  if (!item) throw new Error(`Unresolved upstream registry dependency: ${name}`);
  closure.add(name);
  (item.registryDependencies ?? []).forEach(visit);
};
selected.forEach(visit);
put(resolve(vendor, 'cache/registry.pinned.json'), registryBytes);
put(resolve(vendor, 'LICENSE'), gitFile('LICENSE'));
for (const path of ['apps/web/lib/preview-config.ts', 'apps/web/lib/component-reference.ts']) {
  put(resolve(vendor, 'cache', path.split('/').at(-1)), gitFile(path));
}
const prefix = 'registry/bases/default/';
const records = [];
for (const name of [...closure].sort()) {
  const item = index.get(name);
  for (const file of item.files ?? []) {
    if (!file.path.startsWith(prefix)) throw new Error(`Unexpected registry source ${file.path}`);
    const relativeSource = file.path.slice(prefix.length);
    const upstreamPath = `apps/web/${file.path}`;
    const original = gitFile(upstreamPath);
    const originalFile = resolve(vendor, 'original', relativeSource);
    const runtimeFile = resolve(vendor, 'runtime', relativeSource);
    put(originalFile, original);
    let code = original.toString('utf8');
    const adaptations = [];
    code = code.replace(/(["'])@\/remotion\/([^"']+)\1/g, (_all, quote, requested) => {
      let target = posix(relative(dirname(runtimeFile), resolve(vendor, 'runtime', requested)));
      if (!target.startsWith('.')) target = `./${target}`;
      return `${quote}${target}${quote}`;
    });
    if (code !== original.toString('utf8')) adaptations.push('Resolved upstream @/remotion aliases to relative imports; implementation retained.');
    if (code.includes('@remotion/google-fonts/Inter')) {
      code = code.replace(/import \{ loadFont \} from "@remotion\/google-fonts\/Inter";\r?\n/, '');
      code = code.replace(/const \{ fontFamily \} = loadFont\("normal", \{[\s\S]*?\}\);/, `const fontFamily = 'var(--remotionui-font-family, "RemotionUI Inter", "Microsoft YaHei", sans-serif)';`);
      adaptations.push('Replaced network Inter loader with a scoped font-family variable; wrapper waits for pinned local Inter and Noto Sans SC fonts.');
    }
    put(runtimeFile, code);
    records.push({registryId: name, upstreamPath, upstreamUrl: `${repository}/blob/${revision}/${upstreamPath}`, original: posix(relative(root, originalFile)), originalSha256: sha(original), runtime: posix(relative(root, runtimeFile)), runtimeSha256: sha(code), adaptations});
  }
}
// The waveform analyzes this bundled upstream demo file but does not play it.
const media = 'apps/web/public/media/demo-loop.wav';
put(resolve(vendor, 'assets/demo-loop.wav'), gitFile(media));
const fonts = [
  {name: 'Inter-Variable.ttf', sourceUrl: 'https://raw.githubusercontent.com/google/fonts/24ecb0bbdc3a52d6fddef160b769c61463f455d9/ofl/inter/Inter%5Bopsz,wght%5D.ttf', license: 'OFL-1.1'},
  {name: 'Inter-OFL.txt', sourceUrl: 'https://raw.githubusercontent.com/google/fonts/24ecb0bbdc3a52d6fddef160b769c61463f455d9/ofl/inter/OFL.txt', license: 'OFL-1.1'},
  {name: 'NotoSansSC-Variable.ttf', sourceUrl: 'https://raw.githubusercontent.com/google/fonts/24ecb0bbdc3a52d6fddef160b769c61463f455d9/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf', license: 'OFL-1.1'},
  {name: 'NotoSansSC-OFL.txt', sourceUrl: 'https://raw.githubusercontent.com/google/fonts/24ecb0bbdc3a52d6fddef160b769c61463f455d9/ofl/notosanssc/OFL.txt', license: 'OFL-1.1'},
];
for (const font of fonts) {
  const file = resolve(vendor, 'assets', font.name);
  if (!existsSync(file)) throw new Error(`Pinned font asset not cached: ${file}`);
  font.sha256 = sha(readFileSync(file));
}
const asset = (name) => ({source: `vendor/remotionui/assets/${name}`, target: `sources/remotionui/${name}`});
const fontAssets = fonts.map((font) => asset(font.name));
const specifications = {
  'social-clip': {
    kind: 'template', width: 1080, height: 1920, fps: 30, durationInFrames: 216,
    defaultProps: {hookTitle: '原版场景', hookSubtitle: '开场、正文与结尾', podcastTitle: '原版组件演示', ctaTitle: '回到内容本身', ctaLabel: '继续观看', ctaUrl: '', captions: [{text: '保留', startMs: 0, endMs: 650, timestampMs: 0, confidence: 1}, {text: '原版设计', startMs: 650, endMs: 1500, timestampMs: 650, confidence: 1}, {text: '替换文字', startMs: 1500, endMs: 2600, timestampMs: 1500, confidence: 1}, {text: '编排镜头', startMs: 2600, endMs: 3900, timestampMs: 2600, confidence: 1}]},
    editableProps: ['hookTitle','hookSubtitle','podcastTitle','ctaTitle','ctaLabel','ctaUrl','captions','audioSrc','logoSrc','fontFamily'],
    assets: [...fontAssets, asset('demo-loop.wav')], tags: ['complete-composition','social','portrait','hook','captions','waveform','end-card'],
    adaptations: ['Thin props-only wrapper; upstream hook/body/end sequence, transitions, layouts and colors retained.','Frame duration is 60 + 120 + 60 - 12 - 12 = 216; README example at this revision says 228, registry and source agree on 216.','Default audio URL overridden with pinned local demo-loop.wav for synthetic review. Real-media plans must provide their source audio WAV; original source audio remains the only playback track.'],
  },
  'title-card': {
    kind: 'scene', width: 960, height: 540, fps: 30, durationInFrames: 90,
    defaultProps: {title: '原版标题\n逐帧呈现', subtitle: '保留构图与动势，只替换内容', eyebrow: '组件演示', meta: '', holdSeconds: 2.38},
    editableProps: ['title','subtitle','eyebrow','meta','charsPerLine','backgroundColor','accentColor','theme','holdSeconds','speed','fontFamily'],
    assets: fontAssets, tags: ['full-scene','title','headline','opening','text-only'],
    adaptations: ['Thin props-only wrapper; explicit newlines can divide Chinese headlines using the upstream native newline option.','Native preview duration and holdSeconds are retained from pinned preview metadata.'],
  },
  'quote-card': {
    kind: 'scene', width: 960, height: 540, fps: 30, durationInFrames: 113,
    defaultProps: {quote: '让 重要内容 留在 画面中心', emphasis: '重要内容', author: '', role: '', initials: '', charsPerLine: 16, holdSeconds: 3.07},
    editableProps: ['quote','emphasis','author','role','initials','charsPerLine','backgroundColor','accentColor','theme','holdSeconds','speed','fontFamily'],
    assets: fontAssets, tags: ['full-scene','quote','thesis','emphasis','text-only'],
    adaptations: ['Thin props-only wrapper; upstream quote draw, masked rise, phrase marker and attribution order retained.','Chinese phrases may be separated by spaces for upstream whitespace-based line and emphasis matching; no attribution is invented.'],
  },
};
const aiPath = resolve(vendor, 'cache/ai-components.live.json');
const ai = existsSync(aiPath) ? JSON.parse(readFileSync(aiPath, 'utf8')) : {components: []};
const aiIndex = new Map(ai.components.map((item) => [item.name, item]));
const entries = registry.items.map((item) => {
  const spec = specifications[item.name];
  const upstreamEntry = item.files?.[0]?.path ? `apps/web/${item.files[0].path}` : null;
  const metadata = item.composition ?? {};
  return {
    id: `remotionui/${item.name}`, provider: 'remotionui', title: item.name, description: item.description,
    kind: spec?.kind ?? (metadata.component ? 'template' : upstreamEntry?.includes('/scenes/') ? 'scene' : 'component'),
    entry: spec ? `vendor/remotionui/runtime/${item.files[0].path.slice(prefix.length)}` : null,
    revision, sourceUrl: upstreamEntry ? `${repository}/blob/${revision}/${upstreamEntry}` : repository,
    upstreamPath: upstreamEntry,
    cachedSourcePath: upstreamEntry ? `vendor/remotionui/upstream/${upstreamEntry}` : null,
    upstreamFiles: (item.files ?? []).map((file) => ({upstreamPath: `apps/web/${file.path}`, cachedSourcePath: `vendor/remotionui/upstream/apps/web/${file.path}`, sourceUrl: `${repository}/blob/${revision}/apps/web/${file.path}`})),
    width: spec?.width ?? metadata.width ?? null, height: spec?.height ?? metadata.height ?? null,
    fps: spec?.fps ?? metadata.fps ?? null, durationInFrames: spec?.durationInFrames ?? metadata.durationInFrames ?? null,
    defaultProps: spec?.defaultProps ?? {}, editableProps: spec?.editableProps ?? [], assets: spec?.assets ?? [],
    license: 'MIT', licenseFile: 'vendor/remotionui/LICENSE', tags: spec?.tags ?? aiIndex.get(item.name)?.tasks ?? [],
    adaptations: spec ? [...spec.adaptations, 'Pinned original source is kept separately; import aliases and offline font loader are the only runtime source edits.'] : [],
    status: spec ? 'installed' : 'indexed', dependencySourceCached: closure.has(item.name),
    dependencies: item.dependencies ?? [], registryDependencies: item.registryDependencies ?? [],
    docsUrl: aiIndex.get(item.name)?.docsUrl ?? null,
    installedNote: spec ? 'Imported and adapted; not marked verified until host render/visual QA completes.' : 'Source cached in pinned checkout, but not registered as a callable scene. Dependency resolution, adapter registration and render validation are required before use.',
    defaultPropsAreSynthetic: Boolean(spec),
  };
});
json(resolve(root, 'references/sources/remotionui.json'), {provider: 'remotionui', repository, revision, license: 'MIT', registrySource: 'vendor/remotionui/cache/registry.pinned.json', aiIndexSource: 'vendor/remotionui/cache/ai-components.live.json', entries});
const cached = ['cache/registry.pinned.json','cache/ai-components.live.json','cache/llms.live.txt','cache/preview-config.ts','cache/component-reference.ts','LICENSE'];
json(resolve(vendor, 'SOURCE_MANIFEST.json'), {provider: 'remotionui', repository, revision, installed: selected, dependencyClosure: [...closure].sort(), runtimeDependencies: ['remotion','@remotion/transitions','@remotion/captions','@remotion/media-utils'], fontSourceRevision: '24ecb0bbdc3a52d6fddef160b769c61463f455d9', records, fonts, assets: [{path: 'vendor/remotionui/assets/demo-loop.wav', upstreamPath: media, sourceUrl: `${repository}/blob/${revision}/${media}`, sha256: sha(readFileSync(resolve(vendor, 'assets/demo-loop.wav'))), usage: 'Upstream synthetic demo waveform only; replace for real source media.'}], caches: cached.map((path) => ({path: `vendor/remotionui/${path}`, sha256: sha(readFileSync(resolve(vendor, path))), provenance: path.includes('.live.') ? 'Live published informational catalog snapshot; source authority remains pinned registry.' : `Pinned revision ${revision}`}))});
console.log(`RemotionUI: ${selected.length} installed entries; ${entries.length - selected.length} indexed; ${records.length} preserved source files; revision ${revision}`);
