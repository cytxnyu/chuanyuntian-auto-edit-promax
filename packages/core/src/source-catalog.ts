import remocn from '../../../references/sources/remocn.json';
import remotionui from '../../../references/sources/remotionui.json';
import shotcraft from '../../../references/sources/video-shotcraft.json';
import validation from '../../../references/sources/render-validation.json';
import type {SourceEntry} from './source-scenes';

const catalogs = [remocn, remotionui, shotcraft] as unknown as Array<{
  provider: string; revision: string; repository: string; license: string; entries: SourceEntry[];
}>;
export const normalizeSourceEntry = (entry: SourceEntry): SourceEntry => {
  const required = (entry.requiredProps ?? entry.requiredNativeProps ?? []) as string[];
  const sourceProps = Array.isArray(entry.sourceProps) ? entry.sourceProps
    : entry.nativeProps ? Object.entries(entry.nativeProps as Record<string, {type?: string; optional?: boolean}>).map(([name, value]) => ({name, type:value.type, required:required.includes(name)}))
    : Array.isArray(entry.editableProps) ? entry.editableProps.filter((f:any)=>typeof f==='object'&&f.key).map((f:any)=>({name:f.key,type:f.type==='slider'?'number':'string',required:required.includes(f.key)}))
    : [];
  return {...entry,sourceProps,requiredProps:required,roleTags:entry.roleTags??entry.tags??[],networkDependencies:entry.networkDependencies??entry.runtimeExternalResources??[],contentBindingMode:entry.contentBindingMode??(entry.tags?.includes('requires-source-copy-adaptation')?'source-edit-required':'explicit-props'),
    runtimeFile:entry.entry?.split('#')[0],exportSymbol:entry.componentExport??entry.sourceExport??entry.entry?.split('#')[1],
    durationMetadataSource:entry.durationMetadataSource??entry.durationBasis??entry.metadataSource};
};
export const SOURCE_CATALOG: SourceEntry[] = catalogs.flatMap((catalog) => catalog.entries.map((entry) => ({
  ...entry, provider: catalog.provider as SourceEntry['provider'],
  revision: entry.revision || catalog.revision, license: entry.license || catalog.license,
}))).map(normalizeSourceEntry);
export const installedSources = (): SourceEntry[] => SOURCE_CATALOG.filter((entry) => entry.status === 'installed' && entry.kind !== 'dependency');
export const sourceRenderVerified = (entry: SourceEntry): boolean => validation.results.some((record) => record.id === entry.id
  && record.revision === entry.revision && record.nativeEmbeddedParity && record.mainPipelineParity
  && record.repeatSeek && record.renderedFullTimeline && record.fullDecodeExit === 0);
export const sourceVerifiedFingerprint = (entry: SourceEntry): string | undefined =>
  (validation.results.find(record => record.id === entry.id && record.revision === entry.revision) as {sourceFingerprint?: string} | undefined)?.sourceFingerprint;
export const getSourceEntry = (id: string): SourceEntry => {
  const entry = SOURCE_CATALOG.find((item) => item.id === id);
  if (!entry) throw new Error(`Unknown source ID: ${id}. Run npm run sources:list.`);
  return entry;
};
export const requireInstalledSource = (id: string, revision?: string): SourceEntry => {
  const entry = getSourceEntry(id);
  if (entry.status !== 'installed' || entry.kind === 'dependency') throw new Error(`Source is indexed, not installed: ${id}. Inspect its source mapping and missingDependencies before use.`);
  if (revision && revision !== entry.revision) throw new Error(`Pinned source revision mismatch: ${id}`);
  if (![entry.width, entry.height, entry.fps, entry.durationInFrames].every((n) => typeof n === 'number' && Number.isFinite(n) && n > 0)) throw new Error(`Missing native composition metadata: ${id}`);
  return entry;
};
