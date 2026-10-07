/** Rebuild all pinned Shotcraft demo exports without replacing upstream code.
 * Run: node --import tsx scripts/sources/shotcraft-bulk-build.mjs
 * Pure bulk compile is the validation tier, never a render-verification claim.
 */
import ts from 'typescript';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {dirname, extname, join, relative, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const W = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const V = join(W, 'vendor/video-shotcraft');
const U = join(V, 'upstream'), B = join(V, 'bulk-runtime');
const CAT = join(W, 'references/sources/video-shotcraft.json');
const PROVIDER = join(W, 'packages/remotion-renderer/src/external/providers/shotcraft-bulk.tsx');
const REV = '5ddbf521038b0a7accfb6dc1e0a9eb29c67277ab';
const REPO = 'https://github.com/Vincentwei1021/video-shotcraft';
const PUBLIC = 'sources/video-shotcraft/bulk';
const oldIds = new Set(['video-shotcraft/basic-3d-scene','video-shotcraft/terminal-3d','video-shotcraft/ink-press','video-shotcraft/ink-press-outro']);
const posix = path => path.replaceAll('\\', '/');
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const json = (path, data) => writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
const walk = root => readdirSync(root, {withFileTypes:true}).flatMap(item => item.isDirectory()
  ? (item.name === '.git' ? [] : walk(join(root,item.name))) : [join(root,item.name)]).sort();
const source = path => ts.createSourceFile(path, readFileSync(path,'utf8'), ts.ScriptTarget.Latest, true,
  path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
const exported = node => node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
const collect = (node, predicate) => {const all=[]; const visit=n=>{if(predicate(n))all.push(n);ts.forEachChild(n,visit);};visit(node);return all;};
const declarations = sf => new Map(collect(sf, n => ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer).map(n=>[n.name.text,n.initializer]));
const evaluate = (node, vars, stack=new Set()) => {
  if (!node) return undefined;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (node.kind===ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind===ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind===ts.SyntaxKind.NullKeyword) return null;
  if (ts.isParenthesizedExpression(node)||ts.isAsExpression(node)||ts.isSatisfiesExpression(node)) return evaluate(node.expression,vars,stack);
  if (ts.isIdentifier(node)) {if(stack.has(node.text))return undefined;const next=new Set(stack);next.add(node.text);return evaluate(vars.get(node.text),vars,next);}
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(n=>evaluate(n,vars,stack));
  if (ts.isObjectLiteralExpression(node)) {
    const value={}; for(const p of node.properties){
      if(ts.isPropertyAssignment(p)){const val=evaluate(p.initializer,vars,stack);if(val!==undefined)value[p.name.getText().replace(/^['"]|['"]$/g,'')]=val;}
      if(ts.isShorthandPropertyAssignment(p)){const val=evaluate(p.name,vars,stack);if(val!==undefined)value[p.name.text]=val;}
      if(ts.isSpreadAssignment(p)){const val=evaluate(p.expression,vars,stack);if(val&&typeof val==='object')Object.assign(value,val);}
    } return value;
  }
  if (ts.isPropertyAccessExpression(node)){const obj=evaluate(node.expression,vars,stack);return obj?.[node.name.text];}
  if (ts.isElementAccessExpression(node)){const obj=evaluate(node.expression,vars,stack);return obj?.[evaluate(node.argumentExpression,vars,stack)];}
  if (ts.isPrefixUnaryExpression(node)){const val=evaluate(node.operand,vars,stack);return typeof val==='number'?(node.operator===ts.SyntaxKind.MinusToken?-val:val):undefined;}
  if (ts.isBinaryExpression(node)) {
    const a=evaluate(node.left,vars,stack),b=evaluate(node.right,vars,stack);if(a===undefined||b===undefined)return undefined;
    const ops={ [ts.SyntaxKind.PlusToken]:()=>a+b,[ts.SyntaxKind.MinusToken]:()=>a-b,[ts.SyntaxKind.AsteriskToken]:()=>a*b,[ts.SyntaxKind.SlashToken]:()=>a/b,[ts.SyntaxKind.AsteriskAsteriskToken]:()=>a**b };
    return ops[node.operatorToken.kind]?.();
  }
  if (ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)&&node.expression.expression.getText()==='Math'){
    const values=node.arguments.map(n=>evaluate(n,vars,stack));
    if(values.every(v=>typeof v==='number')&&['round','floor','ceil','min','max','abs'].includes(node.expression.name.text))return Math[node.expression.name.text](...values);
  }
  return undefined;
};
const packageName = spec => spec.startsWith('@') ? spec.split('/').slice(0,2).join('/') : spec.split('/')[0];
const resolver = createRequire(join(W,'package.json'));
const parsed = ts.parseJsonConfigFileContent(ts.readConfigFile(join(W,'tsconfig.json'),ts.sys.readFile).config,ts.sys,W);
const options = {...parsed.options,allowJs:false,noEmit:true};
const resolveLocal = (spec,path) => {
  const base=resolve(dirname(path),spec);
  return [base,base+'.tsx',base+'.ts',base+'.json',join(base,'index.tsx'),join(base,'index.ts')].find(p=>existsSync(p)&&extname(p));
};

mkdirSync(B,{recursive:true});
const baseline=readFileSync(CAT,'utf8');
if(!existsSync(join(B,'catalog-baseline.json')))writeFileSync(join(B,'catalog-baseline.json'),baseline);
cpSync(join(U,'demos'),join(B,'demos'),{recursive:true});
cpSync(join(U,'assets/lib'),join(B,'assets/lib'),{recursive:true});
// Reuse the original 0.6 parameter/mute bridge, preserving its 10-shot template.
cpSync(join(V,'runtime/template'),join(B,'template'),{recursive:true});
const changed=[];
for(const path of walk(B).filter(p=>/\.(ts|tsx)$/.test(p))){
  let text=readFileSync(path,'utf8');const before=text;
  if(posix(relative(B,path)).startsWith('template/')){
    text=text.replaceAll('sources/video-shotcraft/ink-press',PUBLIC+'/template');
  } else {
    // Rename only the local imported staticFile symbol. Keep the original file,
    // JSX, transforms and frame math, adding a single public namespace bridge.
    const sf=source(path), edits=[], bridges=[];
    for(const node of sf.statements){
      if(!ts.isImportDeclaration(node)||node.moduleSpecifier.text!=='remotion')continue;
      const named=node.importClause?.namedBindings;if(!named||!ts.isNamedImports(named))continue;
      for(const member of named.elements){
        if((member.propertyName??member.name).text!=='staticFile')continue;
        const local=member.name.text, imported='__shotcraftStaticFile_'+local;
        edits.push({start:member.getStart(sf),end:member.end,text:'staticFile as '+imported});
        bridges.push(`function ${local}(src: string): string { return /^(?:https?:|data:|blob:|\\/)/i.test(src) ? src : ${imported}(src.startsWith('sources/') ? src : '${PUBLIC}/demos/' + src); }`);
      }
    }
    for(const edit of edits.sort((a,b)=>b.start-a.start))text=text.slice(0,edit.start)+edit.text+text.slice(edit.end);
    if(bridges.length)text += '\n// Bulk-only public asset namespace; upstream animation is unchanged.\n'+bridges.join('\n')+'\n';
  }
  if(text!==before){writeFileSync(path,text);changed.push({path:posix(relative(B,path)),beforeSha256:createHash('sha256').update(before).digest('hex'),afterSha256:sha(path),change:'public asset namespace only (existing template props/mute adaptations retained)'});}
}

const codeFiles=walk(B).filter(p=>/\.(ts|tsx)$/.test(p));
const program=ts.createProgram(codeFiles,options), checker=program.getTypeChecker();
const cache=new Map();
const info = path => {
  if(cache.has(path))return cache.get(path);
  const sf=program.getSourceFile(path)??source(path),text=sf.text;
  const imports=collect(sf,n=>ts.isImportDeclaration(n)&&ts.isStringLiteral(n.moduleSpecifier)).map(n=>n.moduleSpecifier.text);
  const value={path,sf,text,imports,vars:declarations(sf)};cache.set(path,value);return value;
};
const dependencyClosure = path => {
  const files=new Set(),external=new Set(),missing=[];
  const visit=file=>{if(files.has(file))return;files.add(file);if(!/\.(ts|tsx)$/.test(file))return;
    for(const spec of info(file).imports){
      if(spec.startsWith('.')){const resolved=resolveLocal(spec,file);if(resolved)visit(resolved);else missing.push({importer:posix(relative(B,file)),specifier:spec});}
      else if(!spec.startsWith('node:'))external.add(packageName(spec));
    }
  };visit(path);
  const missingNpm=[...external].filter(name=>{try{resolver.resolve(name);return false;}catch{return true;}});
  return {files:[...files].sort(),external:[...external].sort(),missing,missingNpm};
};
const propsOf = (node,sf) => {
  const signature=checker.getTypeAtLocation(node.name).getCallSignatures()[0];
  const parameter=signature?.getParameters()[0];
  const props={};
  if(parameter){const type=checker.getTypeOfSymbolAtLocation(parameter,node);
    for(const property of type.getProperties())props[property.name]={type:checker.typeToString(checker.getTypeOfSymbolAtLocation(property,node)),required:!(property.flags&ts.SymbolFlags.Optional)};
  }
  const defaults={};
  const fn=node.initializer;
  if(fn&&(ts.isArrowFunction(fn)||ts.isFunctionExpression(fn))){
    const parameter=fn.parameters[0];
    if(parameter&&ts.isObjectBindingPattern(parameter.name))for(const element of parameter.name.elements){
      if(!ts.isIdentifier(element.name)||!element.initializer)continue;
      const val=evaluate(element.initializer,info(sf.fileName).vars);if(val!==undefined)defaults[(element.propertyName??element.name).getText(sf)]=val;
    }
  }
  return {props,defaults,required:Object.entries(props).filter(([key,value])=>value.required&&!(key in defaults)).map(([key])=>key)};
};
const components = path => {
  const {sf}=info(path),result=[];
  for(const statement of sf.statements){if(!ts.isVariableStatement(statement)||!exported(statement))continue;
    for(const node of statement.declarationList.declarations){if(!ts.isIdentifier(node.name)||!node.initializer)continue;
      const typed=/\b(?:React\.)?(?:FC|FunctionComponent)(?:\b|<)/.test(node.type?.getText(sf)??'');
      const jsx=collect(node.initializer,n=>ts.isJsxElement(n)||ts.isJsxSelfClosingElement(n)||ts.isJsxFragment(n)).length>0;
      if(!typed&&!jsx)continue;
      if(!/^[A-Z]/.test(node.name.text))continue;
      result.push({name:node.name.text,node,...propsOf(node,sf)});
    }
  }return result;
};
const recipes=walk(join(U,'references/shots')).filter(p=>p.endsWith('.md')).map(path=>{
  const text=readFileSync(path,'utf8');return {path,text,name:relative(join(U,'references/shots'),path).replace(/\.md$/,'')};
});
const recipeFor = path => {
  const rel=posix(relative(B,path)),dir=posix(dirname(rel));
  return recipes.find(card=>card.text.includes(rel)||card.text.includes(dir+'/'));
};
const durationOf = (path,name,recipe) => {
  const {vars,text}=info(path),normalize=s=>s.replace(/[^a-z0-9]/gi,'').toLowerCase();
  const exportedDur=collect(info(path).sf,n=>ts.isVariableStatement(n)&&exported(n)).flatMap(statement=>[...statement.declarationList.declarations])
    .filter(n=>ts.isIdentifier(n.name)&&/_(DURATION|DUR)$/.test(n.name.text)).map(n=>({name:n.name.text,value:evaluate(n.initializer,vars)}));
  const exact=exportedDur.find(d=>normalize(d.name.replace(/_(DURATION|DUR)$/,''))===normalize(name))??(exportedDur.length===1?exportedDur[0]:undefined);
  if(exact&&Number.isFinite(exact.value)&&exact.value>0)return {frames:Math.round(exact.value),basis:'upstream-export:'+exact.name,declared:true};
  for(const [key,node] of vars)if(/^(?:TOTAL|DUR|DURATION|TOTAL_FRAMES|DURATION_IN_FRAMES|[A-Z_]+_TOTAL)$/.test(key)){
    const value=evaluate(node,vars);if(Number.isFinite(value)&&value>0&&value<3000)return {frames:Math.round(value),basis:'upstream-timeline-constant:'+key,declared:true};
  }
  for(const key of ['T','TIMING','TIMELINE']){const object=evaluate(vars.get(key),vars);const value=object?.total??object?.duration;
    if(Number.isFinite(value)&&value>0)return {frames:Math.round(value),basis:'upstream-timeline:'+key+'.total',declared:true};}
  const comment=text.match(/(?:总时长|总共|共|总帧数|total\s*[:=])\s*(\d+)\s*(?:f|帧)/i);
  if(comment)return {frames:Number(comment[1]),basis:'explicit-source-comment:'+comment[0],declared:true};
  const time=recipe?.text.match(/^时长:\s*(.+)$/m)?.[1];
  if(time){const secs=[...time.matchAll(/(\d+(?:\.\d+)?)\s*(?:[–~～-]\s*)?(\d+(?:\.\d+)?)?\s*s/g)].flatMap(m=>[Number(m[1]),...(m[2]?[Number(m[2])]:[])]).filter(n=>n>0&&n<60);
    if(secs.length)return {frames:Math.round(Math.max(...secs)*30),basis:'recipe-recommended-window:'+time,declared:false};}
  return {frames:180,basis:'explicit-host-default-window:6s@30fps (no fixed original duration found)',declared:false};
};
const textureFiles=walk(join(U,'demos/_textures'));
const demoAssets = closure => {
  const text=closure.files.filter(p=>/\.(tsx?|json)$/.test(p)).map(p=>readFileSync(p,'utf8')).join('\n');
  const hasTextures=/textures\/|PageCam2D|staticFile\(`textures/.test(text);
  const flat=/textures\/\$\{file\}/.test(text);
  const mappings=[];
  if(hasTextures)for(const path of textureFiles){const file=posix(relative(join(U,'demos/_textures'),path));
    if(flat)mappings.push({source:posix(relative(W,path)),target:PUBLIC+'/demos/textures/'+file});
    if(!flat||/textures\/live\//.test(text)||/PageCam2D/.test(text))mappings.push({source:posix(relative(W,path)),target:PUBLIC+'/demos/textures/live/'+file});
  }
  const missing=[...new Set([...text.matchAll(/['"](clips\/[^'"\n]+\.(?:mp4|mov|webm))['"]/g)].map(m=>m[1]))]
    .map(path=>({target:PUBLIC+'/demos/'+path,reason:'Original demo requires user-supplied footage; no paired video in the upstream cache'}));
  return {mappings,missing};
};
const originalEntries=JSON.parse(baseline).entries.filter(entry=>oldIds.has(entry.id));
if(originalEntries.length!==4)throw new Error('Expected all four preserved original Shotcraft entries');
const entries=[...originalEntries], candidates=[], helpers=[];
const entryBase=(id,title,path,kind='scene')=>({id,provider:'video-shotcraft',title,kind,revision:REV,
  sourceUrl:REPO+'/blob/'+REV+'/'+posix(relative(B,path)),entry:posix(relative(W,path)),
  width:1920,height:1080,fps:30,license:'Apache-2.0',defaultProps:{},editableProps:{},assets:[],tags:[],adaptations:[],
  status:'imported',validationTier:'import',integrationStatus:'imported',renderVerified:false});
for(const path of walk(join(B,'demos')).filter(p=>p.endsWith('.tsx')&&!posix(relative(join(B,'demos'),p)).split('/').some(s=>s.startsWith('_')))){
  for(const component of components(path)){
    if(['Basic3DScene','Terminal3D'].includes(component.name))continue;
    const rel=posix(relative(join(B,'demos'),path)),slug=rel.replace(/\.tsx$/,'').toLowerCase()+'/'+component.name.toLowerCase();
    const recipe=recipeFor(path),duration=durationOf(path,component.name,recipe),closure=dependencyClosure(path),assets=demoAssets(closure);
    const isHelper=component.required.length>0||/^(?:SeamTest|VerticalTicker)$/.test(component.name);
    const entry=entryBase('video-shotcraft/bulk/'+slug,component.name,path,isHelper?'dependency':'scene');
    Object.assign(entry,{entry:entry.entry+'#'+component.name,componentExport:component.name,
      durationInFrames:isHelper?null:duration.frames,durationBasis:duration.basis,nativeDurationDeclared:duration.declared,
      defaultProps:component.defaults,editableProps:component.props,requiredProps:component.required,
      assets:assets.mappings,requiredAssets:assets.missing,
      npmDependencies:closure.external,missingDependencies:closure.missingNpm,missingLocalImports:closure.missing,
      sourceFiles:closure.files.map(p=>({path:posix(relative(W,p)),sha256:sha(p)})),
      recipe:recipe?{path:posix(relative(W,recipe.path)),summary:recipe.text.match(/^一句话:\s*(.+)$/m)?.[1],suitableFor:recipe.text.match(/^适用:\s*(.+)$/m)?.[1],duration:recipe.text.match(/^时长:\s*(.+)$/m)?.[1]}:null,
      tags:[rel.split('/')[0],'original-source',...(recipe?['recipe-linked']:[]),...(assets.mappings.length?['paired-page-textures','requires-real-product-replacement']:['code-generated-scene']),...(!Object.keys(component.props).length?['requires-source-copy-adaptation']:[]),...(isHelper?['dependency-not-a-shot']:[])],
      adaptations:[...(assets.mappings.length?['Only staticFile namespace changed; original transforms/easing/JSX/timeline retained']:[]),...(!duration.declared?['No original fixed frame count: catalog reports an explicitly documented recommended composition window; adjust it with the source recipe before real use']:[])]});
    if(closure.missingNpm.length||closure.missing.length){entry.status='missing-deps';entry.integrationStatus='missing-deps';}
    else if(assets.missing.length){entry.integrationStatus='missing-assets';}
    if(isHelper){helpers.push(entry);entries.push(entry);continue;}
    candidates.push({entry,path,exportName:component.name,theme:false});entries.push(entry);
  }
}

const workbenchModule=await import(pathToFileURL(join(B,'template/src/workbench.ts')).href);
const workbench=workbenchModule.WORKBENCH;
const templateAssets=walk(join(U,'template/public')).map(path=>({source:posix(relative(W,path)),target:PUBLIC+'/template/'+posix(relative(join(U,'template/public'),path))}));
const addTemplateUnit=(component,path,key,props,duration,schema,kind='scene')=>{
  const entry=entryBase('video-shotcraft/bulk/template/'+key,component,path,kind),closure=dependencyClosure(path);
  Object.assign(entry,{entry:entry.entry+'#'+component,componentExport:component,durationInFrames:duration,
    durationBasis:'upstream-WORKBENCH / AIFL_SHOTS',nativeDurationDeclared:true,defaultProps:props,
    editableProps:schema??{},requiredProps:[],assets:templateAssets,npmDependencies:closure.external,
    missingDependencies:closure.missingNpm,missingLocalImports:closure.missing,
    sourceFiles:closure.files.map(p=>({path:posix(relative(W,p)),sha256:sha(p)})),
    tags:['original-template-unit','product-screenshot-dependent','requires-real-product-replacement',key],
    adaptations:['Original scene executed inside original VisualThemeProvider; asset namespace is isolated; original choreography retained']});
  if(closure.missingNpm.length||closure.missing.length){entry.status='missing-deps';entry.integrationStatus='missing-deps';}
  candidates.push({entry,path,exportName:component,theme:true});entries.push(entry);
};
const liveUnits=[['morning','SceneOpen'],['table','SceneFlyIn'],['macro','SceneDetail'],['chart','ScenePapers'],['wbr','SceneWbr']];
for(const [key,name] of liveUnits){const unit=workbench.shots.find(u=>u.id===key);addTemplateUnit(name,join(B,'template/src/aifl/live',name+'.tsx'),key,unit.props,unit.duration,unit.schema);}
for(const [key,name] of [['morning','SceneMorning'],['table','SceneTable'],['macro','SceneMacro'],['chart','SceneChart'],['outro','SceneOutro']]){
  const path=join(B,'template/src/aifl',name+'.tsx');if(!existsSync(path))continue;
  const component=components(path).find(c=>c.name===name);if(!component)continue;
  const unit=workbench.shots.find(u=>u.id===key);addTemplateUnit(name,path,'legacy-'+key,component.defaults,unit.duration,component.props);
  entries.at(-1).tags.push('upstream-legacy-implementation');entries.at(-1).durationBasis='current workbench matching shot role; earlier original implementation variant';
}
for(const [key,name,example] of [['title-card','TitleCardUnit',workbench.shots.find(u=>u.id==='card1')],['caption','CaptionUnit',workbench.captions[0]],['flash-cut','FlashUnit',workbench.transitions[0]]]){
  addTemplateUnit(name,join(B,'template/src/workbench.ts'),key,example.props??{},example.duration,example.schema,'component');
}
for(const theme of workbench.themes){if(theme.id==='ink-press')continue;
  addTemplateUnit('ThemedFilm',join(B,'template/src/themes/ThemedFilm.tsx'),'film-'+theme.id,
    {theme:theme.id,muted:true,assetBase:PUBLIC+'/template'},workbench.total,{theme:'string',colors:'Record<string,string>',muted:'boolean',titleCards:'Record<string,{text,sub?,subDigits?}>',captions:'string[]',sceneProps:'Record<string,object>'},'template');
  entries.at(-1).tags.push('full-10-shot-film',theme.id);entries.at(-1).title=theme.label+' · original complete film';
}

const generatedHeader="import React, {type ComponentType} from 'react';\nimport {VisualThemeProvider} from '../../../../../vendor/video-shotcraft/bulk-runtime/template/src/themes/visual-theme';\n";
const generateProvider = () => {
  let code=generatedHeader;const mapping=[];
  candidates.forEach((candidate,index)=>{
    if(candidate.entry.status==='missing-deps'||candidate.entry.integrationStatus==='compile-error')return;
    const symbol='ShotcraftBulk'+index,importPath=posix(relative(dirname(PROVIDER),candidate.path)).replace(/\.(tsx?|jsx?)$/,'');
    code+=`import {${candidate.exportName} as ${symbol}} from '${importPath.startsWith('.')?importPath:'./'+importPath}';\n`;
    const bridge=candidate.theme?`(({theme = 'ink-press', colors, assetBase = '${PUBLIC}/template', ...props}) => <VisualThemeProvider theme={theme} colors={colors} assetBase={assetBase}><${symbol} {...props}${candidate.exportName === 'ThemedFilm' ? ' theme={theme} colors={colors} assetBase={assetBase}' : ''}/></VisualThemeProvider>) as ComponentType<any>`:`${symbol} as ComponentType<any>`;
    mapping.push(`  ${JSON.stringify(candidate.entry.id)}: ${bridge},`);
  });
  code+='\n// Generated from actual exports. No dependency fixtures/diagnostic views are counted as complete shots.\n';
  code+='export const shotcraftBulkComponents: Record<string, ComponentType<any>> = {\n'+mapping.join('\n')+'\n};\n';
  writeFileSync(PROVIDER,code);
};
generateProvider();
const configPath=join(W,'scripts/sources/shotcraft-bulk-typecheck.json');
json(configPath,{extends:'../../tsconfig.json',include:['../../packages/remotion-renderer/src/external/providers/shotcraft-bulk.tsx'],exclude:['../../vendor/video-shotcraft/upstream']});
const checkedConfig=ts.parseJsonConfigFileContent(ts.readConfigFile(configPath,ts.sys.readFile).config,ts.sys,dirname(configPath));
const checked=ts.createProgram(checkedConfig.fileNames,checkedConfig.options);
const diagnostics=ts.getPreEmitDiagnostics(checked);
const errors=diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).map(d=>({
  file:d.file?posix(relative(W,d.file.fileName)):null,line:d.file&&d.start!==undefined?d.file.getLineAndCharacterOfPosition(d.start).line+1:null,
  code:d.code,message:ts.flattenDiagnosticMessageText(d.messageText,' ')}));
for(const candidate of candidates){
  if(candidate.entry.status==='missing-deps')continue;
  const closure=new Set(candidate.entry.sourceFiles.map(file=>file.path));
  const relevant=errors.filter(error=>error.file&&closure.has(error.file));
  if(relevant.length){candidate.entry.integrationStatus='compile-error';candidate.entry.validationTier='compile-error';candidate.entry.compileErrors=relevant;continue;}
  candidate.entry.validationTier='compile';
  if(candidate.entry.integrationStatus==='missing-assets'){candidate.entry.status='imported';candidate.entry.callableWithSuppliedAssets=true;}
  else {candidate.entry.status='installed';candidate.entry.integrationStatus='compile-ready';}
}
generateProvider();
const npmDependencies=[...new Set(candidates.flatMap(c=>c.entry.npmDependencies))].sort();
const newNpmDependencies=[...new Set(candidates.flatMap(c=>c.entry.missingDependencies))].sort();
const lockPackage=JSON.parse(readFileSync(join(W,'package.json'),'utf8'));
const depsReport={provider:'video-shotcraft',npmDependencies,newNpmDependencies,
  versions:Object.fromEntries(npmDependencies.map(name=>[name,lockPackage.dependencies?.[name]??lockPackage.devDependencies?.[name]??null])),
  resolvedDependencies:npmDependencies.filter(name=>!newNpmDependencies.includes(name)),installationPerformed:false};
json(join(B,'npm-dependencies.json'),depsReport);
const previous=JSON.parse(baseline);
const catalog={...previous,entries,bulk:{revision:REV,generatedBy:'scripts/sources/shotcraft-bulk-build.mjs',
  provider:'packages/remotion-renderer/src/external/providers/shotcraft-bulk.tsx',validationTier:'compile',renderVerified:false,
  sceneCounting:'Actual named component exports only; dependencies and diagnostic exports are separate',
  durationPolicy:'Explicit upstream frame counts first, then recommended recipe windows, else explicitly labeled configurable six-second host window; do not call inferred windows original fixed durations'}};
json(CAT,catalog);
const sourceHashes=walk(B).filter(p=>/\.(?:ts|tsx|json|png|mp3)$/.test(p)&&!p.endsWith('catalog-baseline.json')&&!p.endsWith('bulk-report.json')&&!p.endsWith('source-hashes.json')&&!p.endsWith('npm-dependencies.json')&&!p.endsWith('verification.json'))
  .map(path=>({path:posix(relative(W,path)),sha256:sha(path)}));
json(join(B,'source-hashes.json'),{revision:REV,originalSourceRoot:'vendor/video-shotcraft/upstream',bulkFiles:sourceHashes,namespaceChanges:changed});
const report={provider:'video-shotcraft',revision:REV,scope:'Only bulk-runtime, own provider, own scripts and own catalog changed',
  preservedOriginalEntries:originalEntries.length,scannedDemoExports:entries.filter(e=>e.id.includes('/bulk/')&&!e.id.includes('/template/')).length,
  registeredBulkExports:candidates.filter(c=>c.entry.status!=='missing-deps'&&c.entry.integrationStatus!=='compile-error').length,
  compileReadyNewEntries:candidates.filter(c=>c.entry.status==='installed').length,
  compileReadyKinds:Object.fromEntries(['template','scene','component'].map(kind=>[kind,candidates.filter(c=>c.entry.status==='installed'&&c.entry.kind===kind).length])),
  helpersNotCountedAsScenes:helpers.length,missingDependencies:newNpmDependencies,
  missingAssetEntries:candidates.filter(c=>c.entry.integrationStatus==='missing-assets').map(c=>({id:c.entry.id,requiredAssets:c.entry.requiredAssets})),
  fixedOriginalDurationEntries:candidates.filter(c=>c.entry.nativeDurationDeclared).length,
  recommendedWindowEntries:candidates.filter(c=>!c.entry.nativeDurationDeclared).length,
  compileErrors:errors,compileErrorEntries:candidates.filter(c=>c.entry.integrationStatus==='compile-error').map(c=>c.entry.id),
  checks:[{command:'node --import tsx scripts/sources/shotcraft-bulk-build.mjs',input:'Pinned original demo/template exports; isolated shotcraft-bulk-typecheck.json',tier:'bulk-static',exitStatus:errors.length?1:0,result:errors.length?'Diagnostics recorded; excluded failed exports':'All generated exports typecheck without diagnostics'}],
  renderVerified:false,fullRenderCount:0,namespaceChangedFiles:changed.length,sourceFiles:sourceHashes.length};
json(join(B,'bulk-report.json'),report);
console.log(JSON.stringify({preserved:report.preservedOriginalEntries,registered:report.registeredBulkExports,
  compileReady:report.compileReadyNewEntries,kinds:report.compileReadyKinds,helpers:helpers.length,
  missingAssets:report.missingAssetEntries.length,missingNpm:newNpmDependencies,compileErrors:errors.length}));
