import { AiflMain, type AiflMainProps } from '../aifl/Main';
import { resolveTheme, VisualThemeProvider } from './visual-theme';

export type ThemedFilmProps = AiflMainProps & {theme?: string; colors?: Record<string,string>; assetBase?: string};
export const ThemedFilm: React.FC<ThemedFilmProps> = ({theme, colors, assetBase = 'sources/video-shotcraft/bulk/template', ...film}) => {
  const selected = resolveTheme(theme);
  return <VisualThemeProvider theme={selected.id} colors={colors} assetBase={assetBase}><AiflMain {...film} /></VisualThemeProvider>;
};
