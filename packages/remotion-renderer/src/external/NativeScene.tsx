import {useContext, type ReactNode} from 'react';
import {Internals, useCurrentFrame, useVideoConfig} from 'remotion';
import {nativeSourceFrame, type SourceScene} from '../../../core/src/source-scenes';
import {requireInstalledSource} from '../../../core/src/source-catalog';

// Deliberately isolated compatibility seam, pinned to Remotion 4.0.507.
// Unlike a CSS scale or a plain Sequence, this retains upstream fps and nested
// sequence timing. Regression renders compare native and embedded frames.
export const NativeClock = ({frame, fps, width, height, durationInFrames, children}: {
  frame: number; fps: number; width: number; height: number; durationInFrames: number; children: ReactNode;
}) => {
  const config = useVideoConfig();
  const manager = useContext(Internals.CompositionManager);
  const timeline = useContext(Internals.TimelineContext);
  if (!timeline) throw new Error('Native scene requires a Remotion timeline');
  return <Internals.CompositionManager.Provider value={{...manager,
    currentCompositionMetadata: {...config,
      fps, width, height, durationInFrames}}}>
    <Internals.TimelineContext.Provider value={{...timeline, frame: {[config.id]: frame}}}>
      <Internals.SequenceContext.Provider value={null}>{children}</Internals.SequenceContext.Provider>
    </Internals.TimelineContext.Provider>
  </Internals.CompositionManager.Provider>;
};

export const NativeScene = ({scene, children}: {scene: SourceScene; children: ReactNode}) => {
  const frame = useCurrentFrame();
  const host = useVideoConfig();
  const entry = requireInstalledSource(scene.sourceId, scene.revision);
  const {width, height, fps} = entry as Required<Pick<typeof entry, 'width'|'height'|'fps'>>;
  // A host preview window is not a verified fixed native timeline. Let native
  // timing continue for the chosen interval; fit uses the inspected window.
  const durationInFrames = scene.nativeDurationInFrames ?? (entry.nativeDurationDeclared === false && scene.timing === 'native'
    ? Math.max(entry.durationInFrames!,scene.sourceStartFrame+Math.ceil((scene.end-scene.start)*fps)) : entry.durationInFrames!);
  const scale = scene.fit === 'cover' ? Math.max(host.width / width, host.height / height) : Math.min(host.width / width, host.height / height);
  const nativeFrame = nativeSourceFrame(scene, frame, host.fps, fps, durationInFrames);
  const seconds = frame / host.fps, remaining = scene.end - scene.start - seconds;
  const opacity = Math.min(scene.transitionIn ? seconds / scene.transitionIn : 1, scene.transitionOut ? remaining / scene.transitionOut : 1, 1);
  return <div data-source-id={scene.sourceId} data-source-revision={scene.revision} data-native-frame={nativeFrame}
    style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity: Math.max(0, opacity)}}>
    <div style={{position: 'absolute', width, height, left: (host.width - width * scale) / 2,
      top: (host.height - height * scale) / 2, transform: `scale(${scale})`, transformOrigin: 'top left'}}>
      <NativeClock frame={nativeFrame} fps={fps} width={width} height={height} durationInFrames={durationInFrames}>{children}</NativeClock>
    </div>
  </div>;
};
