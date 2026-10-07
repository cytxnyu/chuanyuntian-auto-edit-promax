import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {bundle} from '@remotion/bundler';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const evidence = path.join(root, 'vendor/remocn/bulk-runtime-evidence');
const reportPath = path.join(evidence, 'bulk-report.json');
const catalogPath = path.join(root, 'references/sources/remocn.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const originalCatalog = JSON.parse(fs.readFileSync(path.join(evidence, 'catalog.baseline.json'), 'utf8'));
const sha = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
for (const file of report.preservedOriginals) {
  assert.equal(sha(path.join(root, file.source)), file.originalSha256, `Original source changed: ${file.source}`);
  assert.equal(sha(path.join(root, file.runtime)), file.runtimeSha256, `Runtime copy differs from generated import rewrite: ${file.runtime}`);
}
for (const id of ['remocn/release-teaser', 'remocn/fomo-limit-orders']) {
  assert.deepEqual(catalog.entries.find((entry) => entry.id === id), originalCatalog.entries.find((entry) => entry.id === id), `Existing source entry was altered: ${id}`);
}
const provider = path.join(root, report.generatedProvider);
const options = {noEmit: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX,
  strict: true, skipLibCheck: true, esModuleInterop: true, types: ['node']};
const program = ts.createProgram([provider], options);
const diagnostics = ts.getPreEmitDiagnostics(program);
const errors = diagnostics.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
const checker = program.getTypeChecker();
// Expose the real upstream input contract (including optional data/images/etc.)
// rather than limiting AI edits to the few controls present in preview defaults.
for (const row of report.entries) {
  const sourceFile = program.getSourceFile(path.join(root, row.runtimeSource));
  const moduleSymbol = sourceFile && checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) continue;
  const exports = checker.getExportsOfModule(moduleSymbol);
  const entry = catalog.entries.find((entry) => entry.id === row.id);
  if (row.kind === 'dependency') {
    const valueExports = exports.filter((symbol) => symbol.valueDeclaration);
    entry.nativeDependencyExports = valueExports.map((symbol) => ({name: symbol.name, type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, sourceFile))}));
    row.nativeDependencyExports = entry.nativeDependencyExports;
    continue;
  }
  if (entry.entry !== report.generatedProvider) continue;
  const symbol = exports.find((symbol) => symbol.name === row.symbol);
  const signature = symbol && checker.getTypeOfSymbolAtLocation(symbol, sourceFile).getCallSignatures()[0];
  const parameter = signature?.getParameters()[0];
  if (!parameter) continue;
  const propsType = checker.getTypeOfSymbolAtLocation(parameter, sourceFile);
  entry.nativeProps = Object.fromEntries(checker.getPropertiesOfType(propsType).map((property) => [property.name,
    {type: checker.typeToString(checker.getTypeOfSymbolAtLocation(property, sourceFile)), optional: Boolean(property.flags & ts.SymbolFlags.Optional)}]));
  entry.editableProps = [...new Set([...entry.editableProps, ...Object.keys(entry.nativeProps)])];
}
const format = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
  getCurrentDirectory: () => root, getCanonicalFileName: (file) => file, getNewLine: () => '\n',
});
fs.writeFileSync(path.join(evidence, 'compile-diagnostics.txt'), format || 'No TypeScript diagnostics.\n');
report.compileCheck = {command: 'node scripts/sources/remocn-bulk-check.mjs', status: errors.length ? 'failed' : 'passed', errors: errors.length, warnings: diagnostics.length - errors.length,
  originalHashesMatched: report.preservedOriginals.length, originalTwoEntriesPreserved: true, rendered: false};
const additionalNames = ['@fontsource/roboto-mono', '@paper-design/shaders-react', 'culori', 'date-fns', 'lucide-react', 'opentype.js'];
const upstreamPackage = JSON.parse(fs.readFileSync(path.join(root, catalog.originalSourceRoot, 'package.json'), 'utf8'));
report.additionalNpmDependencies = additionalNames.map((name) => {
  const file = path.join(root, 'node_modules', name, 'package.json');
  const installed = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : undefined;
  return {name, upstreamVersion: upstreamPackage.dependencies[name], installedVersion: installed?.version ?? null,
    compileApiCompatible: !errors.length && Boolean(installed), renderVerified: false,
    ...(name === '@paper-design/shaders-react' ? {versionAdaptation: 'Shared 0.0.80 instead of upstream 0.0.76; actual original imports pass strict TypeScript API validation. No claim of pixel parity.'} : {})};
});
if (!errors.length) {
  report.validationTier = 'compile';
  for (const entry of catalog.entries) {
    if (entry.entry === report.generatedProvider && entry.status === 'installed') entry.validationTier = 'compile';
    if (entry.kind === 'dependency' && entry.dependencyImportReady) entry.validationTier = 'compile';
  }
  catalog.bulkIntegration.validationTier = 'compile';
} else {
  console.error(format);
  for (const entry of catalog.entries) if (entry.entry === report.generatedProvider && entry.status === 'installed') {
    entry.validationTier = 'imported'; entry.integrationStatus = 'compile-errors';
  }
  catalog.bulkIntegration.validationTier = 'imported';
  report.validationTier = 'imported';
}
if (!errors.length && process.argv.includes('--bundle')) {
  const serveUrl = await bundle({entryPoint: provider, rootDir: root, publicDir: null, ignoreRegisterRootWarning: true, outDir: path.join(evidence, 'bundle-check'), onProgress: () => {}});
  report.bundleCheck = {status: 'passed', entryPoint: report.generatedProvider, output: serveUrl, rendered: false};
}
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
fs.writeFileSync(path.join(evidence, 'npm-dependencies.json'), JSON.stringify(report.additionalNpmDependencies, null, 2) + '\n');
console.log(`REMOCN_BULK_COMPILE_${errors.length ? 'FAIL' : 'PASS'} visual=${report.counts.callableTotal} bulk=${report.counts.bulkCallable} dependencies=${report.counts.dependencyLoaders} preserved=${report.preservedOriginals.length} errors=${errors.length}${report.bundleCheck ? ' bundle=passed' : ''} rendered=0`);
if (errors.length) process.exitCode = 1;
