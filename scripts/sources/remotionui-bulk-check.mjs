import {bundle} from '@remotion/bundler';
import {spawnSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const runtime = resolve(root, 'vendor/remotionui/bulk-runtime');
const reportPath = resolve(runtime, 'bulk-report.json');
const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const entryPoint = resolve(runtime, 'bulk-check.entry.tsx');
writeFileSync(entryPoint, `import {Composition, registerRoot} from 'remotion';\nimport {Suspense} from 'react';\nimport {remotionuiBulkComponents} from '../../../packages/remotion-renderer/src/external/providers/remotionui-bulk';\nconst Scene = ({sourceId}: {sourceId: string}) => {const Component=remotionuiBulkComponents[sourceId];return <Suspense fallback={null}><Component/></Suspense>;};\nregisterRoot(() => <Composition id="RemotionUIBulkStatic" component={Scene} width={960} height={540} fps={30} durationInFrames={120} defaultProps={{sourceId:Object.keys(remotionuiBulkComponents)[0]}}/>);\n`);
const check = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc','--noEmit','--jsx','react-jsx','--module','esnext','--moduleResolution','bundler','--esModuleInterop','--strict','--skipLibCheck','--target','es2022','packages/remotion-renderer/src/external/providers/remotionui-bulk.tsx'], {cwd:root,encoding:'utf8',windowsHide:true});
report.verification = {stage:'static-compilation', typecheckExit: check.status, typecheckStdout: check.stdout, typecheckStderr: check.stderr, renderedItemsClaimed:0};
try {
  await bundle({entryPoint, rootDir:root, outDir:resolve(runtime,'verification/bundle'), onProgress:()=>{}});
  report.verification.bundleExit = 0;
} catch(error) {
  report.verification.bundleExit = 1;
  report.verification.bundleError = String(error?.stack ?? error);
}
const provider = resolve(root,'packages/remotion-renderer/src/external/providers/remotionui-bulk.tsx');
report.verification.providerSha256 = createHash('sha256').update(readFileSync(provider)).digest('hex');
report.verification.status = check.status === 0 && report.verification.bundleExit === 0 ? 'passed' : 'failed';
writeFileSync(reportPath, `${JSON.stringify(report,null,2)}\n`);
console.log(JSON.stringify({newExports:report.addedCallableExports, totalExports:report.totalCallableExports,...report.verification},null,2));
process.exitCode = report.verification.status === 'passed' ? 0 : 1;
