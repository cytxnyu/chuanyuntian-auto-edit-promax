import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {SOURCE_CATALOG,requireInstalledSource,sourceRenderVerified} from '../packages/core/src/source-catalog';
import {SourceSceneSchema} from '../packages/core/src/source-scenes';
import {bindSourceText} from '../packages/core/src/source-planner';
const argv=process.argv.slice(2),command=argv.shift()??'list';
const opt=(key:string)=>{const i=argv.indexOf(`--${key}`);return i<0?undefined:argv[i+1];};
const synonymGroups=[
 ['标题','开场','intro','hero','title','opening','hook'],['结尾','end','outro','cta','closing'],
 ['对比','comparison','compare','versus','split'],['步骤','流程','step','timeline','process'],
 ['数据','图表','统计','数字','chart','stat','metric','counter','graph'],['字幕','文字','text','caption','typewriter','typography'],
 ['科技','产品','界面','电脑','tech','product','device','dashboard','terminal','code'],
 ['粒子','光效','高级','particle','shader','glow','gradient','cinematic'],['三维','运镜','3d','camera','orbit','perspective'],
 ['转场','transition','wipe','reveal'],['清单','要点','feature','list','bullet'],['引用','观点','quote','testimonial'],
 ['地图','map','route','globe'],['背景','background','texture','mesh'],
];
const query=(opt('query')??'').toLowerCase(),terms=new Set(query.split(/[\s,，/]+/).filter(Boolean));
for(const group of synonymGroups)if(group.some(t=>query.includes(t)))group.forEach(t=>terms.add(t));
const compact=(entry:typeof SOURCE_CATALOG[number])=>({id:entry.id,title:entry.title,provider:entry.provider,kind:entry.kind,status:entry.status,
 integrationStatus:entry.integrationStatus,validationTier:entry.validationTier??(sourceRenderVerified(entry)?'historical-render':'imported'),
 revision:entry.revision,entry:entry.entry,sourceUrl:entry.sourceUrl,roleTags:entry.roleTags,tags:entry.tags,
 native:{width:entry.width,height:entry.height,fps:entry.fps,durationInFrames:entry.durationInFrames},durationMetadataSource:entry.durationMetadataSource??entry.metadataSource,nativeDurationDeclared:entry.nativeDurationDeclared,durationType:entry.durationType,durationResolver:entry.durationResolver,
 sourceProps:entry.sourceProps,requiredProps:entry.requiredProps,editableProps:entry.editableProps,contentBindingMode:entry.contentBindingMode,
 assets:entry.assets,missingDependencies:entry.missingDependencies,missingPublicAssets:entry.missingPublicAssets,networkDependencies:entry.networkDependencies});
if(['list','search','recommend'].includes(command)){
 let entries=SOURCE_CATALOG.filter(e=>(!opt('provider')||e.provider===opt('provider'))&&(!opt('kind')||e.kind===opt('kind'))
  &&(!argv.includes('--installed')||e.status==='installed')&&(!opt('role')||JSON.stringify(e.roleTags).includes(opt('role')!))
  &&(!opt('tier')||e.validationTier===opt('tier'))&&(!argv.includes('--text-editable')||JSON.stringify(e.sourceProps??e.editableProps).match(/text|title|children|subtitle|quote/i)));
 const score=(e:typeof SOURCE_CATALOG[number])=>{
  const hay=JSON.stringify([e.id,e.title,e.description,e.tags,e.roleTags]).toLowerCase();
  let n=0;terms.forEach(t=>{if(hay.includes(t))n+=e.id.includes(t)?4:2;});return n;
 };
 if(query)entries=entries.filter(e=>score(e)>0);
 if(command==='recommend')entries=entries.filter(e=>e.status==='installed'&&e.kind!=='dependency').sort((a,b)=>{
  const rank=(e:typeof a)=>score(e)+(e.kind==='template'?8:e.kind==='scene'?6:0)-(e.contentBindingMode==='source-edit-required'?3:0)-(Array.isArray(e.requiredProps)?e.requiredProps.length*.2:0);
  return rank(b)-rank(a)||a.id.localeCompare(b.id);
 });
 const matched=entries.length,limit=Number(opt('limit')??(command==='recommend'?8:50));
 if(!Number.isInteger(limit)||limit<1||limit>1000)throw new Error('--limit requires 1..1000');
 console.log(JSON.stringify({total:SOURCE_CATALOG.length,matched,returned:Math.min(limit,matched),entries:entries.slice(0,limit).map(compact)},null,2));
}else if(command==='show'){
 const entry=SOURCE_CATALOG.find(e=>e.id===opt('id'));if(!entry)throw new Error('Unknown --id');
 console.log(JSON.stringify({...entry,historicalRenderVerified:sourceRenderVerified(entry)},null,2));
}else if(command==='plan'){
 const entry=requireInstalledSource(opt('id')??''),propsFile=opt('props'),text=(opt('text')??'').split('|').filter(Boolean);
 const props=propsFile?JSON.parse(readFileSync(resolve(propsFile),'utf8')):text.length?bindSourceText(entry.id,text,opt('title')??''):(()=>{throw new Error('Provide --props JSON or --text. Inspect exact native props with sources:show.');})();
 const start=Number(opt('start')??0),duration=Number(opt('duration')??entry.durationInFrames!/entry.fps!);
 const scene=SourceSceneSchema.parse({id:'source-1',sourceId:entry.id,revision:entry.revision,start,end:start+duration,props,fit:opt('fit')??'contain',timing:opt('timing')??'native',nativeDurationInFrames:opt('native-duration-frames')?Number(opt('native-duration-frames')):undefined,reason:'Original upstream source selected by ID',text:text.join(' ')});
 const result={scenes:[scene]},out=opt('out');if(out){const f=resolve(out);if(existsSync(f))throw new Error('Plan exists; choose a new output');mkdirSync(dirname(f),{recursive:true});writeFileSync(f,JSON.stringify(result,null,2));}
 console.log(JSON.stringify(result,null,2));
}else throw new Error('Expected list, search, recommend, show or plan');
