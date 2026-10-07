import React, {type ComponentType} from 'react';
import {Basic3DScene} from '../../../../../vendor/video-shotcraft/runtime/demos/camera/basic-3d-scene/Basic3DScene';
import {Terminal3D} from '../../../../../vendor/video-shotcraft/runtime/demos/camera/terminal-3d/Terminal3D';
import {ThemedFilm} from '../../../../../vendor/video-shotcraft/runtime/template/src/themes/ThemedFilm';
import {VisualThemeProvider} from '../../../../../vendor/video-shotcraft/runtime/template/src/themes/visual-theme';
import {SceneOutroLive} from '../../../../../vendor/video-shotcraft/runtime/template/src/aifl/live/SceneOutroLive';

// The host owns native frame/fps/size/duration context. These wrappers do not
// retime, reconstruct or redraw any upstream choreography.
const InkPress: ComponentType<any> = ({muted = true, ...props}) => <ThemedFilm {...props} muted={muted} />;
const InkPressOutro: ComponentType<any> = ({theme = 'ink-press', colors, assetBase = 'sources/video-shotcraft/ink-press', ...props}) => (
  <VisualThemeProvider theme={theme} colors={colors} assetBase={assetBase}>
    <SceneOutroLive {...props} />
  </VisualThemeProvider>
);

export const shotcraftComponents: Record<string, ComponentType<any>> = {
  'video-shotcraft/basic-3d-scene': Basic3DScene,
  'video-shotcraft/terminal-3d': Terminal3D,
  'video-shotcraft/ink-press': InkPress,
  'video-shotcraft/ink-press-outro': InkPressOutro,
};
