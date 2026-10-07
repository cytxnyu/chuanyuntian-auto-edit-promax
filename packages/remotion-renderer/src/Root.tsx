import {Composition} from 'remotion';
import {VideoPackaging,type VideoPackagingProps} from './VideoPackaging';
import {SourceContent,SourceSceneView} from './external';
import {requireInstalledSource} from '../../core/src/source-catalog';
import {SourceSceneSchema} from '../../core/src/source-scenes';
type SourcePreviewProps={sourceId:string;sceneProps:Record<string,unknown>};
const sourceDefaults:SourcePreviewProps={sourceId:'remotionui/title-card',sceneProps:{title:'原版场景',subtitle:'源码接入'}};
const OriginalSourcePreview=({sourceId,sceneProps}:SourcePreviewProps)=><SourceContent sourceId={sourceId} props={sceneProps}/>;
const EmbeddedSourcePreview=({sourceId,sceneProps}:SourcePreviewProps)=>{
  const entry=requireInstalledSource(sourceId);
  const scene=SourceSceneSchema.parse({id:'embedded',sourceId,revision:entry.revision,start:0,end:entry.durationInFrames!/entry.fps!,props:sceneProps,reason:'Source-native preview'});
  return <SourceSceneView scene={scene}/>;
};
const native=requireInstalledSource(sourceDefaults.sourceId);
const defaultProps:VideoPackagingProps={overlayOnly:true,cues:[],storyboard:{
  version:'3.0',sourceMode:'source-only',presentation:'original-sources',id:'promax',title:'Original scenes',duration:3,width:960,height:540,fps:30,captionsMode:'none',source:{video:'input.mp4'},
  theme:{background:'#000',foreground:'#fff',accent:'#fff'},beats:[],
  sourceScenes:[SourceSceneSchema.parse({id:'source-1',sourceId:native.id,revision:native.revision,start:0,end:3,props:sourceDefaults.sceneProps,reason:'Original scene'})],
}};
const metadata=({props}:{props:SourcePreviewProps})=>{const e=requireInstalledSource(props.sourceId);return{width:e.width!,height:e.height!,fps:e.fps!,durationInFrames:e.durationInFrames!,props};};
export const RemotionRoot=()=> <>
  <Composition id="OriginalSourcePreview" component={OriginalSourcePreview} defaultProps={sourceDefaults} calculateMetadata={metadata}/>
  <Composition id="EmbeddedSourcePreview" component={EmbeddedSourcePreview} defaultProps={sourceDefaults} calculateMetadata={metadata}/>
  <Composition id="VideoPackaging" component={VideoPackaging} defaultProps={defaultProps} calculateMetadata={({props})=>({durationInFrames:Math.ceil(props.storyboard.duration*props.storyboard.fps),fps:props.storyboard.fps,width:props.storyboard.width,height:props.storyboard.height,props})}/>
</>;
