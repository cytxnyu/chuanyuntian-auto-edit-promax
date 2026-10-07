import {lazy, Suspense, useLayoutEffect, type ComponentType} from 'react';
import {delayRender, continueRender} from 'remotion';
import type {SourceScene} from '../../../core/src/source-scenes';
import {requireInstalledSource, installedSources} from '../../../core/src/source-catalog';
import {NativeScene} from './NativeScene';

// Import real upstream modules lazily; only selected source code runs.
const loaders = {
  remocn: async () => ({...(await import('./providers/remocn')).remocnComponents,...(await import('./providers/remocn-bulk')).remocnBulkComponents}),
  remotionui: async () => ({...(await import('./providers/remotionui')).remotionuiComponents,...(await import('./providers/remotionui-bulk')).remotionuiBulkComponents}),
  'video-shotcraft': async () => ({...(await import('./providers/video-shotcraft')).shotcraftComponents,...(await import('./providers/shotcraft-bulk')).shotcraftBulkComponents}),
};
export const sourceComponents: Record<string, ComponentType<any>> = Object.fromEntries(installedSources().map((entry) => [entry.id,
  lazy(async () => {const components = await loaders[entry.provider]();
    if (!components[entry.id]) throw new Error(`Source adapter is missing: ${entry.id}`);
    const Component=components[entry.id];
    // React.lazy resolves to a function, never another LazyExoticComponent.
    // Provider-level lazy imports remain behind this same Suspense boundary.
    return {default: (props:Record<string,unknown>) => <Component {...props}/>};}),
]));
const SourceLoading = () => {
  useLayoutEffect(() => {
    const handle = delayRender('Load pinned upstream scene module');
    return () => continueRender(handle);
  }, []);
  return null;
};
export const SourceContent = ({sourceId, props = {}}: {sourceId: string; props?: Record<string, unknown>}) => {
  const entry = requireInstalledSource(sourceId);
  const Component = sourceComponents[sourceId];
  if (!Component) throw new Error(`Source adapter is missing: ${sourceId}`);
  return <Suspense fallback={<SourceLoading/>}><Component {...entry.defaultProps} {...props}/></Suspense>;
};
export const SourceSceneView = ({scene}: {scene: SourceScene}) => <NativeScene scene={scene}>
  <SourceContent sourceId={scene.sourceId} props={scene.props}/>
</NativeScene>;
