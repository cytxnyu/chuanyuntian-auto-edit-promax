/** Verify only Shotcraft bulk-owned files; no renderer or other provider tests. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const W=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const V=join(W,'vendor/video-shotcraft'),B=join(V,'bulk-runtime');
const json=path=>JSON.parse(readFileSync(path,'utf8'));
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const catalog=json(join(W,'references/sources/video-shotcraft.json'));
const baseline=json(join(B,'catalog-baseline.json'));
const report=json(join(B,'bulk-report.json'));
const code=readFileSync(join(W,'packages/remotion-renderer/src/external/providers/shotcraft-bulk.tsx'),'utf8');
const sf=ts.createSourceFile('shotcraft-bulk.tsx',code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const mapping=sf.statements.filter(ts.isVariableStatement).flatMap(s=>[...s.declarationList.declarations])
  .find(n=>n.name.getText(sf)==='shotcraftBulkComponents')?.initializer;
assert(mapping && ts.isObjectLiteralExpression(mapping),'Real generated mapping exists');
const ids=new Set(mapping.properties.map(p=>p.name.text));
assert.equal(ids.size,mapping.properties.length,'No duplicate mapped ID');
const preservedIds=['video-shotcraft/basic-3d-scene','video-shotcraft/terminal-3d','video-shotcraft/ink-press','video-shotcraft/ink-press-outro'];
for(const id of preservedIds){
  assert.deepEqual(catalog.entries.find(e=>e.id===id),baseline.entries.find(e=>e.id===id),'Preserved original entry '+id);
  assert(!ids.has(id),'Existing provider must keep original ID '+id);
}
const bulk=catalog.entries.filter(e=>e.id.includes('/bulk/'));
assert.equal(new Set(catalog.entries.map(e=>e.id)).size,catalog.entries.length,'No duplicate catalog ID');
let mapped=0,ready=0,helpers=0,assetMappings=0,sourceFingerprints=0;
for(const entry of bulk){
  assert.equal(entry.revision,catalog.revision);
  assert.equal(entry.renderVerified,false,'Do not imply render verification');
  if(entry.kind==='dependency'){helpers++;assert(!ids.has(entry.id),'Dependency is not a scene mapping');}
  if(entry.status==='installed'){
    ready++;assert(ids.has(entry.id),'Installed export must be wired: '+entry.id);
    assert.equal(entry.validationTier,'compile');assert.equal(entry.integrationStatus,'compile-ready');
    assert(entry.durationInFrames>0 && entry.width===1920 && entry.height===1080 && entry.fps===30);
    assert(entry.durationBasis,'Duration basis is explicit');
  }
  if(ids.has(entry.id))mapped++;
  for(const asset of entry.assets??[]){
    assert(existsSync(join(W,asset.source)),'Paired source asset exists: '+asset.source);
    assert(asset.target.startsWith('sources/video-shotcraft/bulk/'),'Isolated public asset namespace');assetMappings++;
  }
  for(const file of entry.sourceFiles??[]){assert.equal(hash(join(W,file.path)),file.sha256,'Original dependency closure fingerprint '+file.path);sourceFingerprints++;}
}
assert.equal(mapped,ids.size,'Every callable export has a catalog entry');
assert.equal(ready,report.compileReadyNewEntries);
assert.equal(mapped,report.registeredBulkExports);
assert.equal(helpers,report.helpersNotCountedAsScenes);
assert.equal(report.compileErrors.length,0,'Bulk compile must pass');
assert.equal(report.fullRenderCount,0,'This verifier does not render video');
const originalManifest=json(join(V,'SOURCE_HASHES.json'));
for(const original of originalManifest.originals){
  assert.equal(hash(join(V,'upstream',original.path)),original.checkoutSha256,'Pinned upstream checkout unchanged: '+original.path);
}
const runtimeManifest=json(join(B,'source-hashes.json'));
for(const file of runtimeManifest.bulkFiles)assert.equal(hash(join(W,file.path)),file.sha256,'Bulk runtime recorded byte hash '+file.path);
const result={command:'node scripts/sources/shotcraft-bulk-verify.mjs',exitStatus:0,
  preservedOriginalEntries:preservedIds.length,mappedExports:mapped,compileReadyNewEntries:ready,
  helpersNotCountedAsScenes:helpers,assetMappings,dependencyClosureFingerprints:sourceFingerprints,
  originalCheckoutFilesUnchanged:originalManifest.originals.length,bulkRuntimeFiles:runtimeManifest.bulkFiles.length,
  renderVerified:false,fullRenderCount:0,result:'PASS: original bytes, preserved entries, callable catalog parity, assets, hashes, compile tier'};
writeFileSync(join(B,'verification.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
