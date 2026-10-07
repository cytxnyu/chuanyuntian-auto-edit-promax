import {selectComposition,renderStill} from '@remotion/renderer';
import {mkdirSync,writeFileSync,readFileSync,cpSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {withSourcePlan} from '../packages/core/src/source-planner';
import {requireInstalledSource} from '../packages/core/src/source-catalog';
import {prepareSourceAssets,validateSourceInputs} from './lib/source-inputs';
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'../evidence/smoke'),publicDir=join(out,'public');
mkdirSync(publicDir,{recursive:true});
const ids=['remocn/soft-blur-in','remotionui/intro','video-shotcraft/bulk/template/title-card'];
const sourceProps=[{text:'原版特效',fontSize:90},{title:'三库源码接入',subtitle:'自动剪辑promax',eyebrow:'原版完整场景',topics:['真实源码','AI编排','薄适配']},{text:'原版标题',sub:'真实组件调用'}];
const base:any={version:'3.0',sourceMode:'source-only',presentation:'original-sources',id:'smoke',title:'ProMax smoke',duration:9,width:1280,height:720,fps:30,captionsMode:'none',source:{video:'input.mp4'},theme:{background:'#000',foreground:'#fff',accent:'#fff'},beats:[],sourceScenes:[]};
const board=withSourcePlan(base,ids.map((id,i)=>({id:`source-${i+1}`,sourceId:id,start:i*3,end:(i+1)*3,props:sourceProps[i],timing:'fit',fit:'contain',reason:'Small integration smoke preview'})));
validateSourceInputs(board);prepareSourceAssets(board,root,publicDir);
const inputProps={storyboard:board,overlayOnly:true,cues:[]};writeFileSync(join(out,'props.json'),JSON.stringify(inputProps,null,2));
const serveUrl=resolve(root,'evidence/static-bundle');
// The bundle's /public endpoint serves local test assets; renderer options do
// not accept a publicDir. Production CLI passes --public-dir when bundling.
cpSync(publicDir,join(serveUrl,'public'),{recursive:true});
const composition=await selectComposition({serveUrl,id:'VideoPackaging',inputProps});
const frames=[];
for(let i=0;i<ids.length;i++){
 const frame=i*90+45,file=join(out,`source-${i+1}.png`);
 await renderStill({serveUrl,composition,inputProps,output:file,frame,imageFormat:'png',timeoutInMilliseconds:60000});
 frames.push({sourceId:ids[i],revision:requireInstalledSource(ids[i]).revision,frame,file,sha256:createHash('sha256').update(readFileSync(file)).digest('hex')});
}
const report={status:'SMOKE_PASS',frames:frames.length,sourceOnly:true,localBeats:0,composition:composition.id,renderedFullVideos:0,results:frames};
writeFileSync(join(out,'smoke-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
