import {useLayoutEffect, type ComponentType, type CSSProperties, type ReactNode} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import {SocialClip, type SocialClipProps} from '../../../../../vendor/remotionui/runtime/compositions/social-clip';
import {TitleCard, type TitleCardProps} from '../../../../../vendor/remotionui/runtime/scenes/title-card';
import {QuoteCard, type QuoteCardProps} from '../../../../../vendor/remotionui/runtime/scenes/quote-card';

// Upstream component code and designs are in vendor/remotionui/runtime; originals
// and their hashes remain separately preserved. This bridge only hosts fonts and props.
const DEFAULT_FONT = '"RemotionUI Inter", "RemotionUI Noto Sans SC", sans-serif';
let interReady: Promise<void> | undefined;
const ensureInter = (): Promise<void> => {
  if (!interReady) {
    interReady = Promise.all([
      ['RemotionUI Inter', 'Inter-Variable.ttf'],
      ['RemotionUI Noto Sans SC', 'NotoSansSC-Variable.ttf'],
    ].map(([family, file]) => new FontFace(family, `url("${staticFile(`sources/remotionui/${file}`)}")`, {weight: '100 900', style: 'normal'})
      .load().then((font) => {document.fonts.add(font);}))).then(() => undefined);
  }
  return interReady;
};

const FontHost = ({children, fontFamily = DEFAULT_FONT}: {children: ReactNode; fontFamily?: string}) => {
  useLayoutEffect(() => {
    // A render can be discarded by an enclosing Suspense boundary. Only acquire
    // a handle after commit, when React guarantees the matching cleanup runs.
    const handle = delayRender('Load pinned local RemotionUI Inter and Chinese fonts');
    let active = true;
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      continueRender(handle);
    };
    Promise.resolve().then(ensureInter).then(release, (error) => {
      release();
      if (active) cancelRender(error);
    });
    return () => {
      active = false;
      release();
    };
  }, []);
  return <div style={{width: '100%', height: '100%', position: 'relative', '--remotionui-font-family': fontFamily} as CSSProperties}>{children}</div>;
};

const assetUrl = (value: string | undefined): string | undefined => value && !/^(?:https?:|data:|blob:|\/)/i.test(value) ? staticFile(value) : value;
type FontProp = {fontFamily?: string};

const SocialClipAdapter = ({fontFamily, audioSrc, logoSrc, ...props}: SocialClipProps & FontProp) => <FontHost fontFamily={fontFamily}>
  <SocialClip {...props} audioSrc={assetUrl(audioSrc) ?? staticFile('sources/remotionui/demo-loop.wav')} logoSrc={assetUrl(logoSrc)}/>
</FontHost>;
const TitleCardAdapter = ({fontFamily, ...props}: TitleCardProps & FontProp) => <FontHost fontFamily={fontFamily}><TitleCard {...props}/></FontHost>;
const QuoteCardAdapter = ({fontFamily, ...props}: QuoteCardProps & FontProp) => <FontHost fontFamily={fontFamily}><QuoteCard {...props}/></FontHost>;

// Catalog membership is distinct from installation: only these three are callable.
export const remotionuiComponents: Record<string, ComponentType<any>> = {
  'remotionui/social-clip': SocialClipAdapter,
  'remotionui/title-card': TitleCardAdapter,
  'remotionui/quote-card': QuoteCardAdapter,
};
