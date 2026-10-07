import {useEffect, useState, type ComponentType, type CSSProperties, type ReactNode} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import {ReleaseTeaser, type ReleaseTeaserProps} from '../../../../../vendor/remocn/upstream/remocn-8ae853e4c08108105684d4b8cac7f22400840d2a/registry/remocn-templates/release-teaser';
import {FomoLimitOrders, type FomoLimitOrdersProps} from '../../../../../vendor/remocn/upstream/remocn-8ae853e4c08108105684d4b8cac7f22400840d2a/registry/remocn-templates/fomo-limit-orders';
import {bindRemocnText} from '../../../../../scripts/sources/remocn-text';

export {bindRemocnText} from '../../../../../scripts/sources/remocn-text';

// These imports execute the unmodified, revision-pinned upstream templates.
// Upstream @fontsource CSS self-hosts its fonts in the bundle; wait for the
// weights in use before releasing the render. No public or remote demo media.
const readyFonts = new Map<string, Promise<void>>();
const loadNativeFonts = (family: 'Inter' | 'Manrope') => {
  let ready = readyFonts.get(family);
  if (!ready) {
    const weights = family === 'Inter' ? [500, 600] : [400, 500, 600, 800];
    ready = Promise.all(weights.map((weight) => document.fonts.load(`${weight} 16px "${family}"`)))
      .then(async () => {await document.fonts.ready;});
    readyFonts.set(family, ready);
  }
  return ready;
};

const FontHost = ({family, fontFamily, children}: {family: 'Inter' | 'Manrope'; fontFamily?: string; children: ReactNode}) => {
  const [handle] = useState(() => delayRender(`Load pinned local Remocn ${family} font`));
  useEffect(() => {
    loadNativeFonts(family).then(() => continueRender(handle)).catch((error) => cancelRender(error));
  }, [family, handle]);
  return <div data-remocn-font={fontFamily ? 'override' : undefined} style={{width: '100%', height: '100%', position: 'relative', '--remocn-font-family': fontFamily} as CSSProperties}>
    {fontFamily ? <style>{'[data-remocn-font="override"] > div { font-family: var(--remocn-font-family) !important; }'}</style> : null}
    {children}
  </div>;
};

const assetUrl = (value: string | undefined): string | undefined => value && !/^(?:https?:|data:|blob:|\/)/i.test(value) ? staticFile(value) : value;
type SourceTextProps = {text?: string; title?: string; fontFamily?: string};

const ReleaseTeaserAdapter = ({text, title, fontFamily, audioSrc, volume, logoSrc, ...props}: ReleaseTeaserProps & SourceTextProps) => {
  const bound = text?.trim() ? bindRemocnText('remocn/release-teaser', text, title) : {};
  return <FontHost family="Inter" fontFamily={fontFamily}><ReleaseTeaser {...props} {...bound} logoSrc={assetUrl(logoSrc)} audioSrc={assetUrl(audioSrc)} volume={volume ?? 0}/></FontHost>;
};

const OrderFlowAdapter = ({fontFamily, audioSrc, volume, ...props}: FomoLimitOrdersProps & {fontFamily?: string}) =>
  <FontHost family="Manrope" fontFamily={fontFamily}><FomoLimitOrders {...props} audioSrc={assetUrl(audioSrc)} volume={volume ?? 0}/></FontHost>;

// Indexed source code is not callable merely because it exists in the cache.
export const remocnComponents: Record<string, ComponentType<any>> = {
  'remocn/release-teaser': ReleaseTeaserAdapter,
  'remocn/fomo-limit-orders': OrderFlowAdapter,
};
