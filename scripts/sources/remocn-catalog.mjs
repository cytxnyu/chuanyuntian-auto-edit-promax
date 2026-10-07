import {readFile, writeFile, mkdir, readdir, copyFile} from 'node:fs/promises';
import {resolve, relative, join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

export const remocnRevision = '8ae853e4c08108105684d4b8cac7f22400840d2a';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const vendor = join(root, 'vendor/remocn');
const upstreamRelative = `vendor/remocn/upstream/remocn-${remocnRevision}`;
const upstream = join(root, upstreamRelative);
const repository = 'https://github.com/Remocn/remocn';
const slash = (path) => path.replaceAll('\\', '/');
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const installed = new Map([
  ['release-teaser', {
    width: 1920, height: 1080, fps: 60000 / 1001, durationInFrames: 960,
    defaultProps: {text: '绑定本次真实输入。保留原文完整含义。使用原生动态文字。遵循任务字体设置。保留完整场景节奏。', title: '内容预览', volume: 0},
    editableProps: ['text', 'title', 'brandName', 'release', 'tagline', 'statements', 'fontFamily', 'accentColor', 'theme', 'lightIntensity', 'reducedMotion', 'logoSrc', 'audioSrc', 'volume'],
    tags: ['complete-template', 'cinematic', 'kinetic-typography', 'procedural-mark', 'edge-light', 'source-text-binding'],
    sourceTextBinding: 'bindRemocnText(id,text,title); automatic via adapter text/title props',
    nativeComponent: 'ReleaseTeaser', requiresNativeContent: false,
    adaptations: ['Unmodified original component imported directly from fixed revision.', 'Separate bridge adds fontFamily override without changing native default typography.', 'Separate bridge waits for the bundled native font weights.', 'Relative optional logo/audio URLs resolve via staticFile.', 'Audio defaults to volume=0; no demo audio.', 'text/title bind all five statements and closing lockup solely from source copy; release suffix is hidden.', 'Native frame/fps/sequence context is delegated to the shared external adapter.'],
  }],
  ['fomo-limit-orders', {
    width: 1920, height: 1080, fps: 60, durationInFrames: 1108,
    defaultProps: {brandName: 'Order Flow', volume: 0},
    editableProps: ['brandName', 'content', 'theme', 'fontFamily', 'accentColor', 'audioSrc', 'volume'],
    tags: ['complete-template', 'product-ui', 'phone-zoom', 'slider', 'typed-price', 'confirmation', 'native-content-required'],
    sourceTextBinding: 'native-content-only', nativeComponent: 'FomoLimitOrders', requiresNativeContent: true,
    contentFields: ['intro', 'feature', 'audience', 'ticker', 'assetName', 'leverage', 'position', 'positionValue', 'positionProfit', 'positionSize', 'positionQuantity', 'positionReturn', 'entryPrice', 'liquidationPrice', 'marketPrice', 'change', 'openInterest', 'limitPrice', 'margin', 'orderSize', 'action', 'closing'],
    limitations: ['Native UI has fixed domain labels and synthetic numeric demo content. Choose only for compatible product-interface scenes; provide complete native content, never treat original demo numbers as source facts.'],
    adaptations: ['Unmodified original component imported directly from fixed revision.', 'Separate bridge adds fontFamily override and bundled-font loading gate.', 'Relative optional audio URLs resolve via staticFile.', 'Audio defaults to volume=0; no demo audio.', 'Native frame/fps/sequence context is delegated to the shared external adapter.'],
  }],
]);

await mkdir(join(vendor, 'cache'), {recursive: true});
await copyFile(join(upstream, 'LICENSE'), join(vendor, 'LICENSE'));
await copyFile(join(upstream, 'registry.json'), join(vendor, 'cache/registry.root.json'));
const entries = [];
const registries = ['remocn', 'remocn-ui', 'remocn-icons', 'remocn-templates'];
for (const namespace of registries) {
  const path = join(upstream, 'registry', namespace, 'registry.json');
  const raw = await readFile(path);
  await writeFile(join(vendor, `cache/registry.${namespace}.json`), raw);
  const manifest = JSON.parse(raw.toString('utf8'));
  for (const item of manifest.items) {
    const integration = installed.get(item.name);
    const sourceFiles = (item.files ?? []).map((file) => ({path: `${upstreamRelative}/registry/${namespace}/${file.path}`, target: file.target, type: file.type}));
    entries.push({
      id: `remocn/${item.name}`, provider: 'remocn', title: item.title || item.name,
      description: item.description || '',
      kind: namespace === 'remocn-templates' ? 'template' : 'component',
      entry: integration ? 'packages/remotion-renderer/src/external/providers/remocn.tsx' : null,
      revision: remocnRevision,
      sourceUrl: item.files?.[0]?.path?.match(/\/(?:index|content)\.tsx?$/)
        ? `${repository}/tree/${remocnRevision}/registry/${namespace}/${item.files[0].path.replace(/\/(?:index|content)\.tsx?$/, '')}`
        : `${repository}/blob/${remocnRevision}/registry/${namespace}/${item.files?.[0]?.path ?? item.name}`,
      license: 'MIT', licenseFile: 'vendor/remocn/LICENSE',
      status: integration ? 'installed' : 'indexed',
      registryNamespace: namespace, upstreamType: item.type,
      registrySource: `vendor/remocn/cache/registry.${namespace}.json`,
      upstreamArtifact: `${upstreamRelative}/registry-artifacts/${item.name}.json`,
      sourceFiles,
      sourceCached: true, callable: Boolean(integration),
      dependencies: item.dependencies ?? [], registryDependencies: item.registryDependencies ?? [],
      assets: [],
      tags: integration?.tags ?? [namespace === 'remocn-templates' ? 'complete-template' : namespace.replace(/^remocn-?/, '') || 'motion-effect'],
      adaptations: [],
      installedNote: integration ? 'Callable pinned upstream template. status installed is not a promise of visual verification.' : 'Source and original registry are cached, but this entry has no callable adapter yet. It must be installed and adapted before selection.',
      docsUrl: `https://remocn.dev/docs/${namespace === 'remocn-templates' ? 'templates' : namespace === 'remocn-icons' ? 'icons' : namespace === 'remocn-ui' ? 'ui' : 'components'}/${item.name}`,
      ...(integration ?? {}),
      ...(integration ? {defaultPropsAreSynthetic: true, verificationStatus: 'integration-check-pending'} : {}),
    });
  }
}
const duplicateIds = entries.filter((entry, i) => entries.findIndex((other) => other.id === entry.id) !== i);
if (duplicateIds.length) throw new Error(`Duplicate registry IDs: ${duplicateIds.map((entry) => entry.id).join(', ')}`);
const output = {
  provider: 'remocn', repository, revision: remocnRevision, license: 'MIT',
  archiveUrl: `https://codeload.github.com/Remocn/remocn/zip/${remocnRevision}`,
  originalArchive: `vendor/remocn/${remocnRevision}.zip`,
  originalSourceRoot: upstreamRelative,
  registrySources: ['vendor/remocn/cache/registry.root.json', ...registries.map((namespace) => `vendor/remocn/cache/registry.${namespace}.json`)],
  fontPackages: [
    {name: '@fontsource/inter', version: '5.3.0', source: 'vendor/remocn/fonts/inter/package', archive: 'vendor/remocn/fonts/inter/inter-5.3.0.tgz', license: 'OFL-1.1', licenseFile: 'vendor/remocn/fonts/inter/package/LICENSE', usage: 'Native fontsource CSS bundles pinned local font files; no remote font endpoint.'},
    {name: '@fontsource/manrope', version: '5.2.8', source: 'vendor/remocn/fonts/manrope/package', archive: 'vendor/remocn/fonts/manrope/manrope-5.2.8.tgz', license: 'OFL-1.1', licenseFile: 'vendor/remocn/fonts/manrope/package/LICENSE', usage: 'Native fontsource CSS bundles pinned local font files; no remote font endpoint.'},
  ],
  entries,
};
const catalog = join(root, 'references/sources/remocn.json');
await mkdir(dirname(catalog), {recursive: true});
await writeFile(catalog, JSON.stringify(output, null, 2) + '\n');

const files = [];
const walk = async (directory) => {
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path); else if (entry.isFile()) files.push(path);
  }
};
await walk(upstream);
await walk(join(vendor, 'fonts'));
files.push(join(vendor, `${remocnRevision}.zip`));
const hashes = [];
for (const file of files.sort()) hashes.push(`${createHash('sha256').update(await readFile(file)).digest('hex')}  ${slash(relative(vendor, file))}`);
await writeFile(join(vendor, 'SHA256SUMS.upstream.txt'), hashes.join('\n') + '\n');
console.log(JSON.stringify({revision: remocnRevision, entries: entries.length, installed: entries.filter((entry) => entry.status === 'installed').map((entry) => entry.id), indexed: entries.filter((entry) => entry.status === 'indexed').length, preservedFiles: files.length}));
