import {copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname, isAbsolute, relative, resolve, join} from 'node:path';
import {requireInstalledSource, sourceRenderVerified} from '../../packages/core/src/source-catalog';
import type {Storyboard} from '../../packages/core/src/schema';
import type {SourceEntry} from '../../packages/core/src/source-scenes';

const inside = (root: string, path: string): string => {
  const target = resolve(root, path), rel = relative(resolve(root), target);
  if (isAbsolute(path) || rel.startsWith('..') || isAbsolute(rel)) throw new Error(`Source asset escapes its root: ${path}`);
  return target;
};
const hash = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');

export const validateSourceInputs = (storyboard: Storyboard): void => {
  for (const scene of storyboard.sourceScenes ?? []) {
    const entry = requireInstalledSource(scene.sourceId, scene.revision);
    const runtime=resolve(import.meta.dirname,'../..',String(entry.entry?.split('#')[0]));
    if(!entry.entry||!existsSync(runtime))throw new Error(`Source runtime missing: ${scene.sourceId}`);
    // Bulk readiness admits original imports. Selected sources are reviewed at C,
    // then decoded/inspected after D. No catalogue-wide full render requirement.
    const fields=(entry.sourceProps??[]) as Array<{name:string;required?:boolean}>;
    for(const field of fields)if(field.required&&scene.props[field.name]===undefined&&entry.defaultProps?.[field.name]===undefined)
      throw new Error(`Required native prop missing: ${scene.sourceId}.${field.name}; inspect sources:show`);
    const duration=scene.nativeDurationInFrames??(entry.nativeDurationDeclared===false&&scene.timing==='native'?Math.max(entry.durationInFrames!,scene.sourceStartFrame+Math.ceil((scene.end-scene.start)*entry.fps!)):entry.durationInFrames!);
    if (scene.sourceStartFrame >= duration) throw new Error(`Source start frame is beyond the selected source window: ${scene.id}`);
    for (const asset of scene.assets) {
      inside('public', asset.target);
      if (!existsSync(asset.file) || !statSync(asset.file).isFile()) throw new Error(`Missing supplied scene asset: ${asset.file}`);
    }
  }
};

// Public distribution omits stock SFX whose license excludes tool/source redistribution.
// This narrow filter is for the original Shotcraft template audio folder only;
// supplied assets and every required visual/audio-analysis asset remain strict.
export const unusedShotcraftTemplateAudio = (entry: SourceEntry, props: Record<string, unknown>, source: string): boolean => {
  if (entry.provider !== 'video-shotcraft' || !/^vendor\/video-shotcraft\/upstream\/template\/public\/audio\/[^/]+\.mp3$/.test(source.replaceAll('\\', '/'))) return false;
  // Visual sub-scenes share the template asset list but never mount its SFX.
  if (entry.entry?.split('#')[1] !== 'ThemedFilm') return true;
  const merged = {...entry.defaultProps, ...props};
  return merged.muted === true;
};

export const prepareSourceAssets = (storyboard: Storyboard, repo: string, publicDir: string): void => {
  const manifest: unknown[] = [];
  const copied = new Map<string, string>();
  const overrides = new Map<string, string>();
  const copy = (source: string, target: string, override: boolean) => {
    if (!existsSync(source) || !statSync(source).isFile()) throw new Error(`Source asset missing: ${source}`);
    const destination = inside(publicDir, target), sha256 = hash(source);
    if (override && overrides.has(target) && overrides.get(target) !== sha256) throw new Error(`Conflicting scene overrides: ${target}; use distinct public targets and native asset props`);
    if (override) overrides.set(target, sha256);
    if (copied.get(target) === sha256) return;
    if (copied.has(target) && copied.get(target) !== sha256 && !override) throw new Error(`Conflicting source assets: ${target}`);
    mkdirSync(dirname(destination), {recursive: true});
    copyFileSync(source, destination); copied.set(target, sha256);
    manifest.push({target, sha256, override});
  };
  for (const scene of storyboard.sourceScenes ?? []) {
    const entry = requireInstalledSource(scene.sourceId, scene.revision);
    for (const asset of entry.assets ?? []) {
      if (unusedShotcraftTemplateAudio(entry, scene.props, asset.source)) {
        manifest.push({target: asset.target, source: asset.source, skipped: true, reason: 'Template SFX unused by selected muted film or visual-only sub-scene; stock audio omitted from public distribution'});
        continue;
      }
      copy(inside(repo, asset.source), asset.target, false);
    }
  }
  // Defaults are global to this render. Apply replacements only after every
  // default has been collected, so later scenes cannot reset earlier overrides.
  for (const scene of storyboard.sourceScenes ?? []) {
    for (const asset of scene.assets) copy(resolve(asset.file), asset.target, true);
  }
  writeFileSync(join(publicDir, 'source-assets-manifest.json'), JSON.stringify(manifest, null, 2));
};

export const sourceUsageManifest = (storyboard: Storyboard) => ({
  mode: storyboard.sourceMode,
  scenes: (storyboard.sourceScenes ?? []).map((scene) => {
    const entry = requireInstalledSource(scene.sourceId, scene.revision);
    return {id: scene.id, sourceId: scene.sourceId, revision: scene.revision, sourceUrl: entry.sourceUrl,
      license: entry.license, validationTier: entry.validationTier ?? 'historical-render', historicalRenderVerified: sourceRenderVerified(entry), start: scene.start, end: scene.end, native: {width: entry.width, height: entry.height, fps: entry.fps, durationInFrames: entry.durationInFrames},
      timing: scene.timing, fit: scene.fit, nativeDurationInFrames:scene.nativeDurationInFrames,durationMetadataSource:entry.durationMetadataSource,nativeDurationDeclared:entry.nativeDurationDeclared,props: scene.props, adaptations: [...(entry.adaptations ?? []), ...scene.adaptations]};
  }), localBeatCount: 0,
});
