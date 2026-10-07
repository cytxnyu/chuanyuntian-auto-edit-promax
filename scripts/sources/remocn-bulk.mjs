import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(path.join(root, 'package.json'));
const revision = '8ae853e4c08108105684d4b8cac7f22400840d2a';
const upstream = path.join(root, `vendor/remocn/upstream/remocn-${revision}`);
const runtime = path.join(root, 'vendor/remocn/bulk-runtime');
const evidence = path.join(root, 'vendor/remocn/bulk-runtime-evidence');
const provider = path.join(root, 'packages/remotion-renderer/src/external/providers/remocn-bulk.tsx');
const catalogPath = path.join(root, 'references/sources/remocn.json');
const metadataOnly = process.argv.includes('--metadata-only');
const slash = (s) => s.replaceAll('\\', '/');
const sha = (content) => createHash('sha256').update(content).digest('hex');
const read = (file) => fs.readFileSync(file, 'utf8');
const write = (file, data) => {fs.mkdirSync(path.dirname(file), {recursive: true}); fs.writeFileSync(file, data);};
const parse = (file, source = read(file)) => ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
const known = {FPS: 30, W: 1280, H: 720, RELEASE_TEASER_FPS: 60000 / 1001, RELEASE_TEASER_FRAMES: 960, RELEASE_TEASER_WIDTH: 1920, RELEASE_TEASER_HEIGHT: 1080, FOMO_FPS: 60, FOMO_FRAMES: 1108, FOMO_WIDTH: 1920, FOMO_HEIGHT: 1080};
const key = (node) => ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node) ? node.text : undefined;
const literal = (node) => {
  if (!node) return undefined;
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isIdentifier(node)) return known[node.text];
  if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node)) return literal(node.expression);
  if (ts.isPrefixUnaryExpression(node)) {const value = literal(node.operand); return typeof value === 'number' ? node.operator === ts.SyntaxKind.MinusToken ? -value : value : undefined;}
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isObjectLiteralExpression(node)) {
    const output = {};
    for (const property of node.properties) if (ts.isPropertyAssignment(property)) {const name = key(property.name), value = literal(property.initializer); if (name !== undefined && value !== undefined) output[name] = value;}
    return output;
  }
  return undefined;
};
const variable = (ast, name) => {
  for (const statement of ast.statements) if (ts.isVariableStatement(statement)) for (const item of statement.declarationList.declarations) if (ts.isIdentifier(item.name) && item.name.text === name) return item.initializer;
  return undefined;
};
const manifest = literal(variable(parse(path.join(upstream, 'registry/__manifest__.ts')), 'previewManifest')) ?? {};
const namespaces = ['remocn', 'remocn-ui', 'remocn-icons', 'remocn-templates'];
const items = namespaces.flatMap((namespace) => JSON.parse(read(path.join(upstream, `registry/${namespace}/registry.json`))).items.map((item) => ({...item, namespace})));
const itemByName = new Map(items.map((item) => [item.name, item]));
const sourceToRuntime = new Map(), targetToSource = new Map();
for (const item of items) for (const file of item.files ?? []) {
  const original = path.resolve(upstream, 'registry', item.namespace, file.path);
  const target = path.resolve(runtime, file.target);
  if (targetToSource.has(target) && targetToSource.get(target) !== original) throw new Error(`Conflicting original registry targets: ${file.target}`);
  sourceToRuntime.set(original, target); targetToSource.set(target, original);
}
const resolveSource = (base) => [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.json`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')].find((file) => fs.existsSync(file) && fs.statSync(file).isFile());
const resolveTarget = (base) => [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')].find((file) => targetToSource.has(file));
const extraRuntime = (source) => {
  let target = sourceToRuntime.get(source);
  if (!target) {target = path.join(runtime, 'upstream-extra', path.relative(upstream, source)); sourceToRuntime.set(source, target); targetToSource.set(target, source);}
  return target;
};
const packageName = (specifier) => specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
const graph = new Map();
const assetMap = new Map();
const moduleSpecifiers = (ast) => {
  const found = [];
  const visit = (node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) found.push(node.moduleSpecifier);
    else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || ts.isIdentifier(node.expression) && node.expression.text === 'require') && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) found.push(node.arguments[0]);
    else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) found.push(node.argument.literal);
    ts.forEachChild(node, visit);
  };
  visit(ast); return found;
};
const makeCopy = (source) => {
  const target = extraRuntime(source);
  if (graph.has(source)) return target;
  const original = read(source), ast = parse(source, original);
  const record = {source, target, local: [], packages: new Set(), importedModules: [], unresolved: [], rewrites: [], assets: []};
  graph.set(source, record);
  for (const module of moduleSpecifiers(ast)) {
    const specifier = module.text;
    if (specifier.startsWith('@/') || specifier.startsWith('.')) {
      let actual;
      if (specifier.startsWith('@/')) actual = targetToSource.get(resolveTarget(path.resolve(runtime, specifier.slice(2)))) ?? resolveSource(path.resolve(upstream, specifier.slice(2)));
      else actual = resolveSource(path.resolve(path.dirname(source), specifier));
      if (!actual) {record.unresolved.push(specifier); continue;}
      const destination = makeCopy(actual);
      let replacement = slash(path.relative(path.dirname(target), destination)).replace(/\.(?:tsx?|jsx?)$/, '');
      if (!replacement.startsWith('.')) replacement = `./${replacement}`;
      record.local.push(actual);
      record.rewrites.push({start: module.getStart(ast), end: module.getEnd(), from: specifier, to: replacement});
    } else if (!specifier.startsWith('node:')) {
      record.packages.add(packageName(specifier)); record.importedModules.push(specifier);
    }
  }
  // Preserve original public-asset URLs by staging them to the same public path;
  // never fabricate placeholder artwork or media.
  const visitAssets = (node) => {
    if (ts.isStringLiteral(node) && (node.text.startsWith('/') && !node.text.startsWith('//') || ts.isCallExpression(node.parent) && ts.isIdentifier(node.parent.expression) && node.parent.expression.text === 'staticFile')) {
      const assetPath = node.text.replace(/^\//, '');
      const publicSource = path.join(upstream, 'public', assetPath);
      if (fs.existsSync(publicSource) && fs.statSync(publicSource).isFile()) {
        const targetPath = `sources/remocn/bulk/${assetPath}`;
        const asset = {source: slash(path.relative(root, publicSource)), target: targetPath};
        assetMap.set(node.text, asset); record.assets.push(asset);
        record.rewrites.push({start: node.getStart(ast), end: node.getEnd(), from: node.text, to: node.text.startsWith('/') ? `/${targetPath}` : targetPath});
      }
    }
    ts.forEachChild(node, visitAssets);
  };
  visitAssets(ast);
  let transformed = original;
  for (const edit of [...record.rewrites].sort((a, b) => b.start - a.start)) transformed = transformed.slice(0, edit.start) + JSON.stringify(edit.to) + transformed.slice(edit.end);
  if (metadataOnly) {
    if (!fs.existsSync(target) || read(target) !== transformed) throw new Error(`Metadata-only run would change runtime source: ${target}`);
  } else write(target, transformed);
  record.originalSha256 = sha(original); record.runtimeSha256 = sha(transformed);
  return target;
};
for (const source of [...sourceToRuntime.keys()]) makeCopy(source);

const closure = (start) => {
  const files = new Set(), packages = new Set(), modules = new Set(), unresolved = [];
  const walk = (source) => {
    if (files.has(source)) return; files.add(source);
    const record = graph.get(source); if (!record) return;
    for (const item of record.packages) packages.add(item);
    for (const item of record.importedModules) modules.add(item);
    for (const item of record.unresolved) unresolved.push({source: slash(path.relative(root, source)), specifier: item});
    for (const dependency of record.local) walk(dependency);
  };
  walk(start); return {files, packages, modules, unresolved};
};
const hasJSX = (node) => {let yes = false; const visit = (child) => {if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child) || ts.isJsxFragment(child)) yes = true; ts.forEachChild(child, visit);}; visit(node); return yes;};
const exported = (node) => node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
const componentInfo = (item, source) => {
  const ast = parse(source), candidates = new Map(), interfaces = new Map();
  for (const node of ast.statements) {
    if (ts.isInterfaceDeclaration(node)) interfaces.set(node.name.text, node);
    if (exported(node) && ts.isFunctionDeclaration(node) && node.name && /^[A-Z]/.test(node.name.text) && hasJSX(node)) candidates.set(node.name.text, node);
    if (exported(node) && ts.isVariableStatement(node)) for (const decl of node.declarationList.declarations) if (ts.isIdentifier(decl.name) && /^[A-Z]/.test(decl.name.text) && decl.initializer && hasJSX(decl.initializer)) candidates.set(decl.name.text, decl.initializer);
  }
  for (const node of ast.statements) if (exported(node) && ts.isVariableStatement(node)) for (const decl of node.declarationList.declarations) if (ts.isIdentifier(decl.name) && /^[A-Z]/.test(decl.name.text) && decl.initializer && ts.isIdentifier(decl.initializer) && candidates.has(decl.initializer.text)) candidates.set(decl.name.text, candidates.get(decl.initializer.text));
  let preferred, config;
  const readConfig = (tree) => {for (const node of tree.statements) if (ts.isVariableStatement(node)) for (const decl of node.declarationList.declarations) {const value = literal(decl.initializer); if (value?.componentName) {preferred = value.componentName; config = value;}}};
  readConfig(ast);
  const configFile = path.join(path.dirname(source), 'config.ts');
  if (!preferred && fs.existsSync(configFile)) readConfig(parse(configFile));
  let symbol = candidates.has(preferred) ? preferred : [...candidates.keys()][0];
  const node = candidates.get(symbol), parameter = node?.parameters?.[0];
  let requiredProps = [];
  if (parameter?.type && ts.isTypeReferenceNode(parameter.type) && ts.isIdentifier(parameter.type.typeName)) {
    const shape = interfaces.get(parameter.type.typeName.text);
    if (shape) requiredProps = shape.members.filter((member) => ts.isPropertySignature(member) && !member.questionToken).map((member) => key(member.name));
  }
  if (parameter && ts.isObjectBindingPattern(parameter.name)) {
    const defaulted = new Set(parameter.name.elements.filter((element) => element.initializer).map((element) => key(element.propertyName ?? element.name)));
    requiredProps = requiredProps.filter((name) => !defaulted.has(name));
  }
  return {symbol, exportedComponents: [...candidates.keys()], requiredProps, config};
};

const scalar = (node, constants) => {
  if (!node) return undefined;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isIdentifier(node)) return constants[node.text];
  if (ts.isParenthesizedExpression(node)) return scalar(node.expression, constants);
  if (ts.isPrefixUnaryExpression(node)) {const n = scalar(node.operand, constants); return n === undefined ? undefined : node.operator === ts.SyntaxKind.MinusToken ? -n : n;}
  if (ts.isBinaryExpression(node)) {
    const a = scalar(node.left, constants), b = scalar(node.right, constants);
    if (a === undefined || b === undefined) return undefined;
    if (node.operatorToken.kind === ts.SyntaxKind.PlusToken) return a + b;
    if (node.operatorToken.kind === ts.SyntaxKind.MinusToken) return a - b;
    if (node.operatorToken.kind === ts.SyntaxKind.AsteriskToken) return a * b;
    if (node.operatorToken.kind === ts.SyntaxKind.SlashToken) return a / b;
  }
  return undefined;
};
const previewDurationMetadata = (item, source, info, metadata) => {
  if (manifest[item.name]) return {durationMetadataSource: 'upstream-preview-manifest', metadataSource: `${catalog.originalSourceRoot}/registry/__manifest__.ts#${item.name}`, nativeDurationDeclared: true};
  if (typeof info.config?.durationInFrames === 'number') return {durationMetadataSource: 'upstream-config', metadataSource: `${catalog.originalSourceRoot}/registry/${item.namespace}/${item.name}`, nativeDurationDeclared: true};
  const ast = parse(source), constants = {};
  const collectConstants = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {const value = scalar(node.initializer, constants); if (value !== undefined) constants[node.name.text] = value;}
    ts.forEachChild(node, collectConstants);
  };
  collectConstants(ast);
  let lastScheduledEndFrame = 0;
  const collectScheduledEndpoints = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const fields = Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).map((property) => [key(property.name), property.initializer]));
      const at = scalar(fields.at, constants), duration = scalar(fields.duration, constants);
      if (at !== undefined) lastScheduledEndFrame = Math.max(lastScheduledEndFrame, at + (duration ?? 0));
    }
    ts.forEachChild(node, collectScheduledEndpoints);
  };
  collectScheduledEndpoints(ast);
  const durationFunctions = ast.statements.filter((node) => ts.isFunctionDeclaration(node) && exported(node) && /FlowDuration$/.test(node.name?.text ?? ''));
  const resolver = durationFunctions[0];
  let defaultDuration, durationResolver;
  if (resolver) {
    const scheduleName = resolver.name.text.replace(/Duration$/, 'Schedule');
    const pureParts = ast.statements.filter((node) => ts.isVariableStatement(node) && node.declarationList.declarations.every((decl) => literal(decl.initializer) !== undefined)
      || ts.isFunctionDeclaration(node) && ['clamp', scheduleName, resolver.name.text].includes(node.name?.text));
    const extractedOriginal = pureParts.map((node) => node.getText(ast)).join('\n');
    const javascript = ts.transpileModule(extractedOriginal, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
    defaultDuration = vm.runInNewContext(`${javascript}\nexports.${resolver.name.text}();`, {exports: {}}, {timeout: 1000});
    if (!Number.isInteger(defaultDuration) || defaultDuration <= 0) throw new Error(`Invalid original duration helper result: ${item.name}`);
    durationResolver = {module: slash(path.relative(root, sourceToRuntime.get(source))), export: resolver.name.text, props: ['messages', 'speed'],
      rule: 'Math.ceil(originalSchedule(messages).duration / (speed <= 0 ? 1 : speed))', defaultPropsDurationInFrames: defaultDuration};
  }
  const fixedSchedule = !resolver && lastScheduledEndFrame > 0;
  const previewFrames = defaultDuration ?? (fixedSchedule ? Math.ceil(lastScheduledEndFrame) + 1 : 120);
  return {durationInFrames: previewFrames, durationMetadataSource: 'adapter-preview-window', nativeDurationDeclared: false,
    durationType: resolver ? 'props-dependent' : fixedSchedule ? 'source-schedule-preview' : 'caller-window',
    dynamicDuration: Boolean(resolver), ...(durationResolver ? {durationResolver} : {}),
    ...(fixedSchedule ? {sourceScheduleLastEndFrame: lastScheduledEndFrame, sourceScheduleWindowRule: 'Maximum literal source transition at+duration, plus one frame to include its final state; this is not an upstream declared composition length.'} : {}),
    recommendationConstraints: [resolver ? 'Recompute the original duration export from actual messages/speed; the default-message value is not valid for arbitrary copy.'
      : fixedSchedule ? 'Use the complete scheduled window or explicitly choose a partial excerpt; do not treat the adapter window as an upstream declaration.'
      : 'Primitive has no declared canonical composition duration; choose its containing scene window.'],
    recommendationTags: [resolver ? 'props-dependent-duration' : fixedSchedule ? 'complete-source-schedule' : 'caller-selected-duration', 'no-upstream-duration-declaration'],
  };
};

fs.mkdirSync(evidence, {recursive: true});
const baselineCatalog = path.join(evidence, 'catalog.baseline.json');
if (!fs.existsSync(baselineCatalog)) fs.copyFileSync(catalogPath, baselineCatalog);
const catalog = JSON.parse(read(catalogPath));
const previousReportPath = path.join(evidence, 'bulk-report.json');
const previousReport = metadataOnly && fs.existsSync(previousReportPath) ? JSON.parse(read(previousReportPath)) : undefined;
const existing = new Set(['release-teaser', 'fomo-limit-orders']);
const ready = [], dependencyLoaders = [], rows = [], missingPackages = new Set();
for (const item of items) {
  const entry = catalog.entries.find((entry) => entry.id === `remocn/${item.name}`);
  const mainFile = item.files.find((file) => /(?:^|\/)index\.tsx$/.test(file.path)) ?? item.files[0];
  const source = path.resolve(upstream, 'registry', item.namespace, mainFile.path);
  const info = componentInfo(item, source), tree = closure(source);
  const missingModules = [...tree.modules].filter((module) => {try {require.resolve(module); return false;} catch {return true;}});
  const missingDeps = [...new Set(missingModules.map(packageName))];
  for (const dependency of missingDeps) missingPackages.add(dependency);
  const isDependency = item.type !== 'registry:component' || !info.symbol;
  const preserved = existing.has(item.name);
  const moduleReady = !missingModules.length && !tree.unresolved.length;
  const usable = !isDependency && moduleReady;
  const metadata = manifest[item.name] ?? info.config ?? {};
  const durationMetadata = isDependency ? {} : previewDurationMetadata(item, source, info, metadata);
  const defaults = {...(metadata.defaults ?? Object.fromEntries(Object.entries(metadata.controls ?? {}).filter(([, value]) => value.default !== undefined).map(([name, value]) => [name, value.default]))), volume: 0};
  const composition = {width: metadata.compositionWidth ?? 1280, height: metadata.compositionHeight ?? 720, fps: metadata.fps ?? 30, durationInFrames: metadata.durationInFrames ?? 120};
  const integrationStatus = preserved ? 'existing' : isDependency ? 'dependency-imported' : tree.unresolved.length ? 'unresolved-import' : missingModules.length ? 'missing-deps' : 'compile-ready';
  const row = {id: `remocn/${item.name}`, symbol: info.symbol ?? null, kind: isDependency ? 'dependency' : item.namespace === 'remocn-templates' ? 'template' : /(?:-flow|-run|-console)$/.test(item.name) ? 'scene' : 'component', integrationStatus,
    runtimeSource: slash(path.relative(root, sourceToRuntime.get(source))), missingDeps, missingModules, unresolvedImports: tree.unresolved,
    requiredProps: info.requiredProps, exportedComponents: info.exportedComponents, moduleCount: tree.files.size, dependencyImportReady: isDependency && moduleReady};
  rows.push(row);
  if (preserved) continue;
  Object.assign(entry, {kind: row.kind, status: usable ? 'installed' : 'imported', callable: usable,
    validationTier: metadataOnly && entry.validationTier === 'compile' ? 'compile' : 'imported', integrationStatus, runtimeSource: row.runtimeSource,
    entry: usable ? slash(path.relative(root, provider)) : null, nativeComponent: info.symbol ?? null,
    missingDependencies: missingDeps, unresolvedImports: tree.unresolved, dependencyImportReady: row.dependencyImportReady,
    requiredNativeProps: info.requiredProps, validationNote: 'Actual original-source import wiring; not render-verified. Runtime media/font/network and caller-supplied prop behavior must be checked when selected.',
    ...(isDependency ? {} : {...composition, ...durationMetadata, defaultProps: defaults, editableProps: metadataOnly && entry.editableProps ? entry.editableProps : [...new Set([...Object.keys(defaults), ...info.requiredProps, 'fontFamily'])], previewBackdrop: metadata.previewBackdrop, defaultPropsAreSynthetic: true}),
    assets: [...new Map([...tree.files].flatMap((file) => graph.get(file)?.assets ?? []).map((asset) => [asset.target, asset])).values()],
    runtimeExternalResources: [...tree.packages].includes('@remotion/google-fonts') ? ['Upstream loadFont may request Google font media at render time; compilation is not an offline-render check.'] : [],
    networkDependencies: [...tree.packages].includes('@remotion/google-fonts') ? ['Upstream loadFont may request Google font media at render time; compilation is not an offline-render check.'] : [],
    adaptations: ['Original-source copy; module paths rewritten to the generated registry target graph. Original source is retained and hashed.', 'Native preview defaults and composition metadata are read from the pinned upstream manifest/config, not a reimplemented demo.', 'Separate wrapper only adds requested font override, original preview backdrop and source props; no timing rewrite.', 'Audio volume defaults to zero; no synthetic replacement media.', 'Real upstream public-asset URLs are namespaced; corresponding files are listed for staging.'],
  });
  if (usable) ready.push({item, entry, row, source: sourceToRuntime.get(source)});
  if (isDependency && moduleReady) dependencyLoaders.push({item, entry, row, source: sourceToRuntime.get(source)});
}

const registrations = ready.map(({item, entry, row, source}) => {
  let importPath = slash(path.relative(path.dirname(provider), source)).replace(/\.(?:tsx?|jsx?)$/, '');
  if (!importPath.startsWith('.')) importPath = `./${importPath}`;
  return `  ${JSON.stringify(entry.id)}: lazy(async () => { const upstream = await import(${JSON.stringify(importPath)}); const Native = upstream.${row.symbol} as ComponentType<any>; return {default: (props: Record<string, any>) => <BulkHost id=${JSON.stringify(entry.id)} props={props}><Native {...props} volume={props.volume ?? 0}${row.requiredProps.includes('children') ? ' children={props.children ?? props.text ?? ""}' : ''}/></BulkHost>}; }),`;
});
const hostMetadata = Object.fromEntries(ready.map(({entry}) => [entry.id, {previewBackdrop: entry.previewBackdrop}]));
const dependencyRegistrations = dependencyLoaders.map(({entry, source}) => `  ${JSON.stringify(entry.id)}: () => import(${JSON.stringify(slash(path.relative(path.dirname(provider), source)).replace(/\.(?:tsx?|jsx?)$/, ''))}),`);
const output = `// GENERATED by scripts/sources/remocn-bulk.mjs from the revision-pinned original registry.\nimport {lazy, type ComponentType, type CSSProperties, type ReactNode} from 'react';\nconst metadata: Record<string, any> = ${JSON.stringify(hostMetadata)};\nconst BulkHost = ({id, props, children}: {id: string; props: Record<string, any>; children: ReactNode}) => {\n  const backdrop = metadata[id]?.previewBackdrop;\n  const background = backdrop?.type === 'color' || backdrop?.type === 'gradient' ? backdrop.value : undefined;\n  return <div data-remocn-bulk-font={props.fontFamily ? 'override' : undefined} style={{width: '100%', height: '100%', position: 'relative', background, '--font-geist-sans': props.fontFamily, '--font-geist-mono': props.fontFamily, '--remocn-bulk-font': props.fontFamily} as CSSProperties}>\n    {props.fontFamily ? <style>{'[data-remocn-bulk-font="override"] [style*="font-family"] {font-family:var(--remocn-bulk-font) !important;}'}</style> : null}\n    {children}\n  </div>;\n};\nexport const remocnBulkComponents: Record<string, ComponentType<any>> = {\n${registrations.join('\n')}\n};\n// Native transition factories/hooks/helpers remain importable dependencies,\n// not fabricated standalone visual scenes.\nexport const remocnBulkDependencyLoaders: Record<string, () => Promise<Record<string, any>>> = {\n${dependencyRegistrations.join('\n')}\n};\n`;
if (metadataOnly) {
  if (read(provider) !== output) throw new Error('Metadata-only run would change the generated provider.');
} else write(provider, output);
const upstreamPackage = JSON.parse(read(path.join(upstream, 'package.json')));
const neededPackages = [...missingPackages].sort().map((name) => ({name, version: name.startsWith('@remotion/') ? '4.0.507' : upstreamPackage.dependencies?.[name] ?? upstreamPackage.devDependencies?.[name] ?? 'see upstream import', requiredBy: rows.filter((row) => row.missingDeps.includes(name)).map((row) => row.id)}));
const counts = {catalog: items.length, existingCallable: 2, bulkCallable: ready.length, callableTotal: ready.length + 2, dependencyEntries: rows.filter((row) => row.kind === 'dependency').length, dependencyLoaders: dependencyLoaders.length, missingDepsEntries: rows.filter((row) => row.integrationStatus === 'missing-deps').length, unresolvedImportEntries: rows.filter((row) => row.integrationStatus === 'unresolved-import').length, originalFilesCopied: graph.size, rewrittenModuleSpecifiers: [...graph.values()].reduce((sum, file) => sum + file.rewrites.length, 0)};
const report = {provider: 'remocn', revision, strategy: 'Original registry target graph + exact original JSX exports; helpers excluded from visual entries.', validationTier: previousReport?.validationTier ?? 'imported', rendered: false, counts,
  generatedProvider: slash(path.relative(root, provider)), missingNpmDependencies: neededPackages, publicAssets: [...assetMap.values()], entries: rows,
  preservedOriginals: [...graph.values()].map((file) => ({source: slash(path.relative(root, file.source)), originalSha256: file.originalSha256, runtime: slash(path.relative(root, file.target)), runtimeSha256: file.runtimeSha256, edits: file.rewrites.map(({from, to}) => ({from, to}))})),
};
if (previousReport) for (const key of ['compileCheck', 'bundleCheck', 'additionalNpmDependencies']) if (previousReport[key]) report[key] = previousReport[key];
report.adapterDurationWindows = catalog.entries.filter((entry) => entry.durationMetadataSource === 'adapter-preview-window').map((entry) => ({id: entry.id, durationInFrames: entry.durationInFrames, nativeDurationDeclared: entry.nativeDurationDeclared, durationType: entry.durationType, durationResolver: entry.durationResolver, sourceScheduleLastEndFrame: entry.sourceScheduleLastEndFrame}));
report.metadataOnly = metadataOnly;
catalog.bulkIntegration = {revision, generatedProvider: report.generatedProvider, report: 'vendor/remocn/bulk-runtime-evidence/bulk-report.json', ...counts, validationTier: report.validationTier, rendered: false};
write(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
write(path.join(evidence, 'bulk-report.json'), JSON.stringify(report, null, 2) + '\n');
write(path.join(evidence, 'npm-dependencies.json'), JSON.stringify(neededPackages, null, 2) + '\n');
write(path.join(evidence, 'original-module-hashes.txt'), [...graph.values()].map((file) => `${file.originalSha256}  ${slash(path.relative(root, file.source))}`).join('\n') + '\n');
console.log(JSON.stringify({revision, ...counts, missingNpmDependencies: neededPackages.map((item) => `${item.name}@${item.version}`)}));
