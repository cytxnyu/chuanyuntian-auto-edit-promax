import type {ReactElement} from 'react';
import {Video} from '@remotion/media';
import {AbsoluteFill,Sequence,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import type {Storyboard} from '../../core/src/schema';
import type {SrtCue} from '../../core/src/types';
import {SourceSceneView} from './external';
export type VideoPackagingProps={storyboard:Storyboard;overlayOnly?:boolean;cues?:SrtCue[]};
const GeneratedCaptions=({cues}:{cues:SrtCue[]})=>{
  const frame=useCurrentFrame(),{fps}=useVideoConfig();const cue=cues.find(c=>c.start<=frame/fps&&c.end>frame/fps);
  return <AbsoluteFill style={{justifyContent:'flex-end',alignItems:'center',paddingBottom:52}}>
    {cue?<div style={{maxWidth:'85%',padding:'12px 22px',color:'#fff',background:'rgba(2,8,23,.78)',font:'800 38px/1.25 system-ui',textAlign:'center'}}>{cue.text}</div>:null}
  </AbsoluteFill>;
};
export const VideoPackaging=({storyboard,overlayOnly=false,cues=[]}:VideoPackagingProps):ReactElement=>{
  if(storyboard.sourceMode!=='source-only'||storyboard.beats.length||!storyboard.sourceScenes.length)throw new Error('ProMax requires original source scenes only');
  return <AbsoluteFill data-presentation="original-sources" style={{background:overlayOnly?'transparent':storyboard.theme.background}}>
    {!overlayOnly?<Video src={staticFile(storyboard.source.video)} style={{width:'100%',height:'100%'}} objectFit="cover" disallowFallbackToOffthreadVideo/>:null}
    {storyboard.sourceScenes.map(scene=><Sequence key={scene.id} from={Math.round(scene.start*storyboard.fps)} durationInFrames={Math.max(1,Math.round((scene.end-scene.start)*storyboard.fps))}>
      <SourceSceneView scene={scene}/>
    </Sequence>)}
    {storyboard.captionsMode==='generated'?<GeneratedCaptions cues={cues}/>:null}
  </AbsoluteFill>;
};
