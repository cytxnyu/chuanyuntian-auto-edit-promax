import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {bundle} from '@remotion/bundler';
const root=resolve(import.meta.dirname,'..'),command=process.argv[2]??'index';
const invoke=(args)=>{const r=spawnSync(process.execPath,args,{cwd:root,stdio:'inherit',windowsHide:true});if(r.status!==0)throw new Error(`Failed: node ${args.join(' ')}; exit ${r.status}`);};
if(command==='sync')for(const file of ['remocn-bulk.mjs','remotionui-bulk.mjs','shotcraft-bulk-build.mjs'])invoke(['--import','tsx',`scripts/sources/${file}`]);
const catalogs=['remocn','remotionui','video-shotcraft'].map(provider=>JSON.parse(readFileSync(resolve(root,`references/sources/${provider}.json`),'utf8')));
const entries=catalogs.flatMap(c=>c.entries.map(e=>{
 const required=e.requiredProps??e.requiredNativeProps??[];
 const sourceProps=Array.isArray(e.sourceProps)?e.sourceProps:e.nativeProps?Object.entries(e.nativeProps).map(([name,value])=>({name,type:value.type,required:required.includes(name)})):Array.isArray(e.editableProps)?e.editableProps.filter(f=>typeof f==='object'&&f.key).map(f=>({name:f.key,type:f.type==='slider'?'number':'string',required:required.includes(f.key)})):[];
 return {...e,provider:c.provider,revision:e.revision??c.revision,sourceProps,requiredProps:required,durationMetadataSource:e.durationMetadataSource??e.durationBasis??e.metadataSource};
}));
if(command==='check'){
 invoke(['node_modules/typescript/bin/tsc','--noEmit']);
 await bundle({entryPoint:resolve(root,'packages/remotion-renderer/src/index.ts'),rootDir:root,outDir:resolve(root,'evidence/static-bundle'),onProgress:()=>{}});
 for(const catalog of catalogs){
  for(const entry of catalog.entries)if(entry.status==='installed'&&entry.kind!=='dependency'){
   entry.validationTier='compile';entry.integrationStatus='compile-ready';
   if(entry.renderVerified)entry.historicalRenderVerified=true;entry.renderVerified=false;
  }
  writeFileSync(resolve(root,`references/sources/${catalog.provider}.json`),JSON.stringify(catalog,null,2)+'\n');
 }
 for(const entry of entries)if(entry.status==='installed'&&entry.kind!=='dependency'){entry.validationTier='compile';entry.integrationStatus='compile-ready';entry.renderVerified=false;}
}
const cards=entries.map(e=>({id:e.id,provider:e.provider,kind:e.kind,title:e.title,status:e.status,integrationStatus:e.integrationStatus,validationTier:e.validationTier??'imported',
 roleTags:e.roleTags??e.tags??[],contentBindingMode:e.contentBindingMode??(e.tags?.includes('requires-source-copy-adaptation')?'source-edit-required':'explicit-props'),sourceProps:e.sourceProps??e.editableProps,requiredProps:e.requiredProps??[],
 native:{width:e.width,height:e.height,fps:e.fps,durationInFrames:e.durationInFrames},durationMetadataSource:e.durationMetadataSource??e.metadataSource,nativeDurationDeclared:e.nativeDurationDeclared,durationType:e.durationType,durationResolver:e.durationResolver,sourceScheduleLastEndFrame:e.sourceScheduleLastEndFrame,
 runtime:e.entry,runtimeFile:e.entry?.split('#')[0],exportSymbol:e.componentExport??e.sourceExport??e.entry?.split('#')[1],sourceUrl:e.sourceUrl,revision:e.revision,assets:e.assets??[],networkDependencies:e.networkDependencies??e.runtimeExternalResources??[],
 inspect:`npm run sources:show -- --id ${e.id}`,call:e.kind==='dependency'?null:`npm run sources:plan -- --id ${e.id} --props PROPS.json --out PLAN.json`}));
const summary={version:'0.7.0',mode:'source-only',catalogEntries:entries.length,visualCallable:entries.filter(e=>e.status==='installed'&&e.kind!=='dependency').length,
 dependencyModules:entries.filter(e=>e.kind==='dependency').length,providers:catalogs.map(c=>({provider:c.provider,revision:c.revision,total:c.entries.length,callable:c.entries.filter(e=>e.status==='installed'&&e.kind!=='dependency').length,dependency:c.entries.filter(e=>e.kind==='dependency').length})),
 kindCounts:Object.fromEntries(['template','scene','component','dependency'].map(k=>[k,entries.filter(e=>e.kind===k).length])),
 checks:{missingRuntime:entries.filter(e=>e.status==='installed'&&(!e.entry||!existsSync(resolve(root,e.entry.split('#')[0])))).map(e=>e.id),missingDeps:entries.filter(e=>e.missingDependencies?.length).map(e=>e.id)},
 validation:'Original imports and static compilation. Not a claim of full per-item renders.',
 index:cards.map(({id,provider,kind,title,status,roleTags,requiredProps,native,validationTier,contentBindingMode})=>({id,provider,kind,title,status,roleTags,requiredProps,native,validationTier,contentBindingMode}))};
writeFileSync(resolve(root,'references/sources/model-index.json'),JSON.stringify(summary,null,2)+'\n');
writeFileSync(resolve(root,'references/sources/model-cards.jsonl'),cards.map(c=>JSON.stringify(c)).join('\n')+'\n');
console.log(JSON.stringify({...summary,index:undefined},null,2));
if(summary.checks.missingRuntime.length||summary.checks.missingDeps.length)process.exitCode=1;
