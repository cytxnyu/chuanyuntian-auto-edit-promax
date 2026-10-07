import {readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, copyFileSync} from 'node:fs';
import {resolve, dirname, relative, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import ts from 'typescript';

// Import pinned files, never execute upstream installers or component code.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const upstream = resolve(root, 'vendor/remotionui/upstream/apps/web/registry/bases/default');
const runtime = resolve(root, 'vendor/remotionui/bulk-runtime');
const catalogPath = resolve(root, 'references/sources/remotionui.json');
const propsOnly = process.argv.includes('--props-only');
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const registry = JSON.parse(readFileSync(resolve(root, 'vendor/remotionui/cache/registry.pinned.json'), 'utf8'));
const packageJson = JSON.parse(readFileSync(resolve(root, 'vendor/remotionui/upstream/apps/web/package.json'), 'utf8'));
const require = createRequire(resolve(root, 'package.json'));
const installedModule = (name) => {
  try {require.resolve(name); return true;} catch {}
  // Some Remotion packages deliberately expose import/module, not require.
  try {return existsSync(fileURLToPath(import.meta.resolve(name)));} catch {return false;}
};
const keep = new Set(['social-clip', 'title-card', 'quote-card']);
const posix = (path) => path.split(sep).join('/');
const sha = (value) => createHash('sha256').update(value).digest('hex');
const put = (path, value) => {
  if (propsOnly && resolve(path) !== catalogPath) return;
  mkdirSync(dirname(path), {recursive: true}); writeFileSync(path, value);
};
const json = (path, value) => put(path, `${JSON.stringify(value, null, 2)}\n`);
const files = [];
const walk = (dir) => {for (const item of readdirSync(dir, {withFileTypes: true})) {
  if (item.isSymbolicLink() || ['.git', 'node_modules'].includes(item.name)) continue;
  const path = resolve(dir, item.name);
  if (item.isDirectory()) walk(path); else files.push(path);
}};
walk(upstream);

const sourceFiles = new Map();
const manifest = [];
for (const original of files) {
  const rel = posix(relative(upstream, original));
  const dest = resolve(runtime, rel);
  const bytes = readFileSync(original);
  let output = bytes;
  const adaptations = [];
  if (/\.[jt]sx?$/.test(original)) {
    let code = bytes.toString('utf8');
    code = code.replace(/(["'])@\/remotion\/([^"']+)\1/g, (_all, quote, requested) => {
      let target = posix(relative(dirname(dest), resolve(runtime, requested)));
      if (!target.startsWith('.')) target = `./${target}`;
      return `${quote}${target}${quote}`;
    });
    if (code !== bytes.toString('utf8')) adaptations.push('Registry alias resolved to a relative copied-source import.');
    if (code.includes('@remotion/google-fonts/Inter')) {
      const old = code;
      code = code.replace(/import\s*\{\s*loadFont\s*\}\s*from\s*["']@remotion\/google-fonts\/Inter["'];?\r?\n/, '');
      code = code.replace(/const\s*\{\s*fontFamily\s*\}\s*=\s*loadFont\("normal",\s*\{[\s\S]*?\}\);/,
        `const fontFamily = 'var(--remotionui-font-family, "RemotionUI Inter", "RemotionUI Noto Sans SC", sans-serif)';`);
      if (old !== code) adaptations.push('Inter network loader replaced by the existing pinned local font host; scene design is unchanged.');
      if (/\bloadFont\(/.test(code) && !code.includes('@remotion/google-fonts')) throw new Error(`Unreplaced Inter loader: ${rel}`);
    }
    if (rel === 'lib/sample-media.ts' && code.includes('https://remotionui.com/media/demo-loop.wav')) {
      code = `import {staticFile} from 'remotion';\n${code.replace('"https://remotionui.com/media/demo-loop.wav"', 'staticFile("sources/remotionui/demo-loop.wav")')}`;
      adaptations.push('Upstream demo waveform URL resolves to the identical pinned local media file.');
    }
    output = Buffer.from(code);
    sourceFiles.set(dest, ts.createSourceFile(dest, code, ts.ScriptTarget.Latest, true, extname(dest) === '.tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS));
  }
  put(dest, output);
  manifest.push({source: posix(relative(root, original)), sourceSha256: sha(bytes), runtime: posix(relative(root, dest)), runtimeSha256: sha(output), adaptations});
}

// Restricted literal evaluator: metadata is parsed, not eval()ed. JSX/calls and
// nonliteral runtime expressions stay omitted and are exposed as required props.
const literalScope = (sf, {strict = false} = {}) => {
  const vars = new Map();
  for (const statement of sf.statements) if (ts.isVariableStatement(statement)) {
    for (const declaration of statement.declarationList.declarations) if (ts.isIdentifier(declaration.name)) vars.set(declaration.name.text, declaration.initializer);
  }
  const evaluate = (node, stack = new Set()) => {
    if (!node) return undefined;
    if (ts.isAsExpression(node) || ts.isParenthesizedExpression(node) || ts.isSatisfiesExpression(node)) return evaluate(node.expression, stack);
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (node.kind === ts.SyntaxKind.NullKeyword) return null;
    if (ts.isIdentifier(node)) {
      if (stack.has(node.text)) return undefined;
      return evaluate(vars.get(node.text), new Set([...stack, node.text]));
    }
    if (ts.isPrefixUnaryExpression(node)) {const value = evaluate(node.operand, stack); return typeof value === 'number' ? (node.operator === ts.SyntaxKind.MinusToken ? -value : value) : undefined;}
    if (ts.isPropertyAccessExpression(node)) return evaluate(node.expression, stack)?.[node.name.text];
    if (ts.isArrayLiteralExpression(node)) {
      const values = node.elements.map((element) => evaluate(element, stack));
      return values.some((value) => value === undefined) ? undefined : values;
    }
    if (ts.isObjectLiteralExpression(node)) {
      const value = {};
      for (const item of node.properties) {
        if (ts.isSpreadAssignment(item)) {
          const spread = evaluate(item.expression, stack);
          if (strict && spread === undefined) return undefined;
          Object.assign(value, spread);
        }
        else if (ts.isPropertyAssignment(item)) {
          const key = item.name.text ?? item.name.getText(sf);
          const itemValue = evaluate(item.initializer, stack);
          if (strict && itemValue === undefined) return undefined;
          if (itemValue !== undefined) value[key] = itemValue;
        }
      }
      return value;
    }
    return undefined;
  };
  return {vars, evaluate};
};
const metadata = (path, name) => {
  const sf = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
  const {vars, evaluate} = literalScope(sf);
  return evaluate(vars.get(name)) ?? {};
};
const previewPath = resolve(root, 'vendor/remotionui/cache/preview-config.ts');
const previews = metadata(previewPath, 'PREVIEW_META');
const previewDefaults = metadata(previewPath, 'PREVIEW_DEFAULTS');
const references = metadata(resolve(root, 'vendor/remotionui/cache/component-reference.ts'), 'componentReference');

const publicAssetsByFile = new Map();
for (const [path, sf] of sourceFiles) {
  const {evaluate} = literalScope(sf);
  const edits = [], assets = [];
  const visit = (node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'staticFile' && node.arguments[0]) {
      const name = evaluate(node.arguments[0]);
      if (typeof name === 'string' && !name.startsWith('sources/remotionui/')) {
        const original = resolve(root, 'vendor/remotionui/upstream/apps/web/public', name);
        const target = `sources/remotionui/upstream/${name}`;
        assets.push({source: posix(relative(root, original)), target, cached: existsSync(original)});
        edits.push({start: node.arguments[0].getStart(sf), end: node.arguments[0].end, value: JSON.stringify(target)});
        const license = original.replace(/\.[^.]+$/, '.LICENSE.txt');
        if (existsSync(license)) assets.push({source: posix(relative(root, license)), target: target.replace(/\.[^.]+$/, '.LICENSE.txt'), cached: true});
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  publicAssetsByFile.set(posix(relative(root, path)), assets);
  if (edits.length) {
    let code = sf.text;
    for (const edit of edits.sort((a,b) => b.start-a.start)) code = code.slice(0,edit.start)+edit.value+code.slice(edit.end);
    put(path, code);
    sourceFiles.set(path, ts.createSourceFile(path, code, ts.ScriptTarget.Latest, true, extname(path) === '.tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS));
    const record = manifest.find((item) => item.runtime === posix(relative(root, path)));
    record.runtimeSha256 = sha(code);
    record.adaptations.push('Namespaced pinned static public assets to avoid collisions with other providers.');
  }
}

const modulePath = (from, request) => {
  const path = resolve(dirname(from), request);
  return [path, `${path}.ts`, `${path}.tsx`, `${path}.js`, resolve(path, 'index.ts'), resolve(path, 'index.tsx')].find((candidate) => existsSync(candidate) && files.some((original) => resolve(runtime, relative(upstream, original)) === candidate));
};
const packageName = (request) => request.startsWith('@') ? request.split('/').slice(0, 2).join('/') : request.split('/')[0];
const graph = new Map();
for (const [path, sf] of sourceFiles) {
  const local = new Set(), npm = new Set(), typeOnly = new Set(), unresolved = new Set();
  const add = (request, isType = false) => {
    if (request.startsWith('.')) {const target = modulePath(path, request); target ? local.add(target) : unresolved.add(request);}
    else (isType ? typeOnly : npm).add(request);
  };
  const visit = (node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const names = node.importClause?.namedBindings;
      const pureTypes = node.isTypeOnly || node.importClause?.isTypeOnly || (names && ts.isNamedImports(names) && names.elements.length > 0 && names.elements.every((element) => element.isTypeOnly));
      add(node.moduleSpecifier.text, Boolean(pureTypes));
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteral(node.arguments[0])) add(node.arguments[0].text);
    ts.forEachChild(node, visit);
  };
  visit(sf);
  graph.set(path, {local, npm, typeOnly, unresolved});
}
const dependencies = (start) => {
  const seen = new Set(), npm = new Set(), typeOnly = new Set(), unresolved = [];
  const visit = (file) => {
    if (seen.has(file)) return; seen.add(file);
    const node = graph.get(file); if (!node) return;
    node.npm.forEach((name) => npm.add(name)); node.typeOnly.forEach((name) => typeOnly.add(name));
    node.unresolved.forEach((name) => unresolved.push(`${posix(relative(runtime, file))}: ${name}`));
    node.local.forEach(visit);
  };
  visit(start);
  const missing = [...npm].filter((name) => !installedModule(name));
  return {files: [...seen].map((file) => posix(relative(root, file))).sort(), npm: [...npm].sort(), typeOnly: [...typeOnly].sort(), missing: [...new Set(missing.map(packageName))].sort(), unresolved};
};
const primaryExport = (sf, item) => {
  const exported = [];
  for (const statement of sf.statements) {
    if (!statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
    if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) {
      const initializer = declaration.initializer;
      if (/^[A-Z]/.test(declaration.name.getText(sf)) && initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer) || ts.isCallExpression(initializer))) exported.push({name: declaration.name.getText(sf), node: declaration, callable: initializer});
    }
    if (ts.isFunctionDeclaration(statement) && /^[A-Z]/.test(statement.name?.text ?? '')) exported.push({name: statement.name.text, node: statement, callable: statement});
  }
  const preferred = item.composition?.component ?? item.name.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('');
  return exported.find((entry) => entry.name === preferred) ?? (exported.length === 1 ? exported[0] : undefined);
};
// One shared TypeScript program resolves imported aliases, intersections,
// interface inheritance, mapped types and React.FC/forwardRef signatures.
// Merely scanning a file's local Props alias misses e.g. FadeIn's children.
const propsProgram = ts.createProgram({
  rootNames: [...sourceFiles.keys()].filter((file) => !/\.(test|spec)\.[jt]sx?$/.test(file)),
  options: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX,
    strict: true, skipLibCheck: true, esModuleInterop: true, noEmit: true},
});
const propsChecker = propsProgram.getTypeChecker();
const checkedProps = (sf, selected) => {
  const source = propsProgram.getSourceFile(sf.fileName);
  const module = source && propsChecker.getSymbolAtLocation(source);
  const exported = module && propsChecker.getExportsOfModule(module).find((symbol) => symbol.name === selected.name);
  if (!source || !exported) throw new Error(`Cannot resolve actual component export: ${sf.fileName}#${selected.name}`);
  const component = propsChecker.getTypeOfSymbolAtLocation(exported, exported.valueDeclaration ?? source);
  const signature = propsChecker.getSignaturesOfType(component, ts.SignatureKind.Call)[0];
  if (!signature) throw new Error(`Component has no callable type: ${sf.fileName}#${selected.name}`);
  const parameter = signature.parameters[0];
  if (!parameter) return [];
  const propsType = propsChecker.getTypeOfSymbolAtLocation(parameter, parameter.valueDeclaration ?? source);
  return propsChecker.getPropertiesOfType(propsType).map((property) => {
    const declaration = property.valueDeclaration ?? property.declarations?.[0] ?? source;
    const type = propsChecker.getTypeOfSymbolAtLocation(property, declaration);
    return {name: property.name,
      type: propsChecker.typeToString(type, declaration, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope),
      required: !(property.flags & ts.SymbolFlags.Optional),
      description: ts.displayPartsToString(property.getDocumentationComment(propsChecker)),
      declaredIn: posix(relative(root, declaration.getSourceFile().fileName)),
      provenance: 'TypeScript checker: actual exported component props; imported/intersection/inherited fields resolved'};
  });
};
const propsFor = (sf, item, selected) => {
  // Do not pass a partially parsed object over an upstream complete default:
  // imported image constants or JSX must leave the source initializer intact.
  const {evaluate} = literalScope(sf, {strict: true});
  const docs = references[item.name]?.props ?? [];
  const props = new Map(docs.map((prop) => [prop.name, {...prop, provenance: 'pinned upstream component-reference'}]));
  const types = new Map(sf.statements.filter((node) => ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)).map((node) => [node.name.text, node]));
  const typeName = `${selected?.name ?? ''}Props`;
  const declaration = types.get(typeName);
  const typeNode = declaration && (ts.isTypeAliasDeclaration(declaration) ? declaration.type : declaration);
  const addType = (node, visited = new Set()) => {
    if (!node) return;
    if (ts.isIntersectionTypeNode(node)) return node.types.forEach((part) => addType(part, visited));
    if (ts.isTypeReferenceNode(node)) {
      const name = node.typeName.getText(sf); if (visited.has(name)) return;
      const found = types.get(name); if (found) addType(ts.isTypeAliasDeclaration(found) ? found.type : found, new Set([...visited, name]));
      return;
    }
    for (const prop of node.members ?? []) if (ts.isPropertySignature(prop) && prop.name) {
      const name = prop.name.text ?? prop.name.getText(sf), old = props.get(name) ?? {};
      props.set(name, {...old, name, type: prop.type?.getText(sf) ?? old.type ?? 'unknown', required: !prop.questionToken,
        description: old.description ?? prop.jsDoc?.map((doc) => typeof doc.comment === 'string' ? doc.comment : '').join(' ') ?? '', provenance: 'pinned source Props declaration'});
    }
  };
  addType(typeNode);
  if (selected && !['registry:lib', 'registry:hook'].includes(item.type)) {
    // Only actual signature properties enter the contract. Upstream prose can
    // enrich them but must not introduce fields the component never accepts.
    const real = checkedProps(sf, selected);
    const previous = new Map(props);
    props.clear();
    for (const field of real) {
      const documented = previous.get(field.name) ?? {};
      props.set(field.name, {...documented, ...field, description: field.description || documented.description || ''});
    }
  }
  const defaults = {};
  let callable = selected?.callable;
  while (callable && ts.isCallExpression(callable)) {
    callable = callable.arguments.find((arg) => ts.isArrowFunction(arg) || ts.isFunctionExpression(arg) || ts.isCallExpression(arg));
  }
  const parameter = callable?.parameters?.[0];
  if (parameter && ts.isObjectBindingPattern(parameter.name)) for (const element of parameter.name.elements) {
    const name = element.propertyName?.text ?? element.name.text;
    if (!name || !element.initializer) continue;
    const value = evaluate(element.initializer);
    if (value !== undefined) defaults[name] = value;
    props.set(name, {...(props.get(name) ?? {name}), required: false, defaultExpression: element.initializer.getText(sf), ...(value === undefined ? {} : {defaultValue: value})});
  }
  return {definitions: [...props.values()], defaults};
};
const roles = (item, definitions) => {
  const text = `${item.name} ${item.description}`.toLowerCase();
  const result = new Set([references[item.name]?.category ?? 'visual']);
  const groups = {
    opening: /\bintro|opening|headline|title-card/, ending: /outro|end-card|cta|call.to.action/,
    'data-display': /chart|graph|stat|metric|counter|table|score|progress/,
    'text-animation': /text|typewriter|tracking|caption|quote|headline|typograph/,
    'product-demo': /browser|device|app|dashboard|terminal|code|mockup|screenshot/,
    'explanation-steps': /step|timeline|list|workflow|feature|diagram/,
    'media-dependent': /video|audio|waveform|image|photo|footage|map|globe|gltf/,
    'shader-gpu': /shader|glsl|gpu|glow|particle|noise|aurora/,
    'three-dimensional': /\b3d|three|orbit|perspective|camera/,
    transition: /transition|wipe|reveal|fade|slide/,
  };
  for (const [tag, pattern] of Object.entries(groups)) if (pattern.test(text)) result.add(tag);
  if (definitions.some((prop) => prop.required && /ReactNode|ReactElement/.test(prop.type ?? ''))) result.add('requires-react-content');
  return [...result];
};

const oldEntries = new Map(catalog.entries.map((entry) => [entry.id, entry]));
const callable = [];
const dependencyItems = [];
const requiredPackages = new Map();
const entries = registry.items.map((item) => {
  const id = `remotionui/${item.name}`, old = oldEntries.get(id) ?? {};
  const first = item.files?.[0]?.path?.replace(/^registry\/bases\/default\//, '');
  const path = first ? resolve(runtime, first) : undefined;
  const sf = sourceFiles.get(path);
  const selected = sf ? primaryExport(sf, item) : undefined;
  const dep = path ? dependencies(path) : {files: [], npm: [], typeOnly: [], missing: [], unresolved: []};
  const helper = ['registry:lib', 'registry:hook'].includes(item.type) || !selected;
  if (helper) dependencyItems.push({id, category: item.type, source: path ? posix(relative(root, path)) : null, exports: sf?.statements.filter((statement) => statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)).map((statement) => statement.name?.text ?? (ts.isVariableStatement(statement) ? statement.declarationList.declarations.map((declaration) => declaration.name.getText(sf)).join(',') : null)).filter(Boolean) ?? []});
  for (const name of [...dep.npm, ...dep.typeOnly]) {
    let npmName = packageName(name); if (npmName === 'geojson') npmName = '@types/geojson';
    if (!requiredPackages.has(npmName)) requiredPackages.set(npmName, {name: npmName, upstreamRange: packageJson.dependencies?.[npmName] ?? packageJson.devDependencies?.[npmName] ?? null, usedBy: []});
    requiredPackages.get(npmName).usedBy.push(id);
  }
  const props = sf ? propsFor(sf, item, selected) : {definitions: [], defaults: {}};
  const ready = !helper && dep.missing.length === 0 && dep.unresolved.length === 0;
  const native = {...previewDefaults, ...previews[item.name], ...item.composition};
  const fontAssets = ['Inter-Variable.ttf', 'Inter-OFL.txt', 'NotoSansSC-Variable.ttf', 'NotoSansSC-OFL.txt'].map((name) => ({source: `vendor/remotionui/assets/${name}`, target: `sources/remotionui/${name}`}));
  const publicAssets = dep.files.flatMap((file) => publicAssetsByFile.get(file) ?? []);
  const assets = [...fontAssets, ...publicAssets.filter((asset) => asset.cached).map(({source,target})=>({source,target})), ...(dep.files.some((file) => file.endsWith('/lib/sample-media.ts')) ? [{source: 'vendor/remotionui/assets/demo-loop.wav', target: 'sources/remotionui/demo-loop.wav'}] : [])];
  if (ready && !keep.has(item.name)) callable.push({id, name: selected.name, file: path});
  const bulk = {
    bulkSource: path ? posix(relative(root, path)) : null,
    sourceExport: selected?.name ?? null,
    sourceProps: props.definitions,
    requiredProps: props.definitions.filter((prop) => prop.required).map((prop) => prop.name),
    contentBindingMode: helper ? 'dependency' : props.definitions.length ? 'source-props' : 'source-edit-required',
    roleTags: roles(item, props.definitions),
    npmDependencies: [...new Set(dep.npm.map(packageName))], typeDependencies: [...new Set(dep.typeOnly.map(packageName))],
    sourceDependencyFiles: dep.files,
    missingDependencies: dep.missing, unresolvedImports: dep.unresolved,
    networkDependencies: dep.npm.filter((name) => name.startsWith('@remotion/google-fonts/')),
    missingPublicAssets: publicAssets.filter((asset) => !asset.cached),
    renderVerified: keep.has(item.name) ? old.renderVerified ?? false : false,
    ...(keep.has(item.name) ? {} : {validationTier: ready ? 'compile' : 'none', integrationStatus: helper ? 'dependency' : ready ? 'compile-ready' : dep.missing.length ? 'missing-deps' : 'imported'}),
  };
  if (keep.has(item.name)) return {...old, ...bulk};
  return {...old, ...bulk, id, provider: 'remotionui', title: old.title ?? item.name, description: item.description,
    kind: helper ? 'dependency' : item.composition ? 'template' : first?.startsWith('scenes/') ? 'scene' : 'component',
    entry: helper ? null : posix(relative(root, path)), status: ready ? 'installed' : 'indexed',
    defaultProps: helper ? {} : props.defaults, defaultPropsAreSynthetic: !helper,
    editableProps: props.definitions.map((prop) => prop.name),
    width: helper ? null : native.width, height: helper ? null : native.height, fps: helper ? null : native.fps,
    durationInFrames: helper ? null : native.durationInFrames, assets: helper ? [] : assets,
    tags: [...new Set([...(old.tags ?? []), ...roles(item, props.definitions)])],
    adaptations: helper ? [] : ['Pinned upstream implementation copied without layout or choreography rewrites.', 'Registry aliases resolved; Inter uses pinned local font host; other declared font families retain upstream loader.', 'Default props are extracted source examples, not user facts; required props and media must be bound before rendering.'],
    installedNote: helper ? 'Dependency module or TransitionSeries presentation factory, not a standalone visual scene.' : ready ? 'Real source export registered; static compilation only, not per-item rendered acceptance.' : 'Source copied with extracted props; unresolved imports or NPM dependencies prevent registration.',
  };
});

const provider = resolve(root, 'packages/remotion-renderer/src/external/providers/remotionui-bulk.tsx');
const generated = `// Generated by scripts/sources/remotionui-bulk.mjs. Do not hand-recreate source components.\nimport {lazy, useLayoutEffect, type ComponentType, type CSSProperties, type ReactNode} from 'react';\nimport {cancelRender, continueRender, delayRender, staticFile} from 'remotion';\nlet fontsReady: Promise<void> | undefined;\nconst ensureFonts = () => fontsReady ??= Promise.all([['RemotionUI Inter','Inter-Variable.ttf'],['RemotionUI Noto Sans SC','NotoSansSC-Variable.ttf']].map(([family,file]) => new FontFace(family, \`url("\${staticFile(\`sources/remotionui/\${file}\`)}")\`, {weight:'100 900',style:'normal'}).load().then(font => {document.fonts.add(font);}))).then(() => undefined);\nconst FontHost = ({children}: {children: ReactNode}) => {\n  useLayoutEffect(() => {const handle=delayRender('Load pinned RemotionUI bulk fonts'); let active=true,released=false; const release=()=>{if(!released){released=true;continueRender(handle);}}; Promise.resolve().then(ensureFonts).then(release,error=>{release();if(active)cancelRender(error);}); return()=>{active=false;release();};},[]);\n  return <div style={{width:'100%',height:'100%',position:'relative','--remotionui-font-family':'"RemotionUI Inter", "RemotionUI Noto Sans SC", sans-serif'} as CSSProperties}>{children}</div>;\n};\nconst adapted = (Component: ComponentType<any>): ComponentType<any> => (props) => <FontHost><Component {...props}/></FontHost>;\nexport const remotionuiBulkComponents: Record<string, ComponentType<any>> = {\n${callable.map((item) => {
  let imported = posix(relative(dirname(provider), item.file)).replace(/\.tsx?$/, ''); if (!imported.startsWith('.')) imported = `./${imported}`;
  return `  '${item.id}': lazy(() => import('${imported}').then(module => ({default: adapted(module.${item.name})}))),`;
}).join('\n')}\n};\n`;
put(provider, generated);
const packages = [...requiredPackages.values()].map((pkg) => {
  const installed = installedModule(pkg.name === '@types/geojson' ? '@types/geojson/package.json' : pkg.name);
  return {...pkg, installed, usedBy: [...new Set(pkg.usedBy)].sort()};
});
catalog.entries = entries;
catalog.bulkIntegration = {script: 'scripts/sources/remotionui-bulk.mjs', report: 'vendor/remotionui/bulk-runtime/bulk-report.json', provider: posix(relative(root, provider)), semantics: 'installed means real callable export; validationTier compile is not render verification'};
json(catalogPath, catalog);
json(resolve(runtime, 'source-manifest.json'), {repository: catalog.repository, revision: catalog.revision, license: catalog.license, files: manifest});
json(resolve(runtime, 'bulk-report.json'), {provider: 'remotionui', revision: catalog.revision, registryEntries: registry.items.length,
  copiedFiles: manifest.length, originalPreservedAt: 'vendor/remotionui/upstream', originalGitDirectoryExcluded: !existsSync(resolve(root, 'vendor/remotionui/upstream/.git')),
  existingCallablePreserved: [...keep].map((name) => `remotionui/${name}`), addedCallableExports: callable.length,
  totalCallableExports: callable.length + keep.size, dependencyItems, missingEntries: entries.filter((entry) => entry.integrationStatus === 'missing-deps').map(({id, missingDependencies}) => ({id, missingDependencies})),
  importedUnresolved: entries.filter((entry) => entry.integrationStatus === 'imported').map(({id, unresolvedImports}) => ({id, unresolvedImports})),
  packages, npmInstallNeeded: packages.filter((pkg) => !pkg.installed),
  verification: {stage: 'source-import-and-dependency-resolution', renderedItemsClaimed: 0, note: 'Run remotionui-bulk-check.mjs for a complete generated-provider static bundle; no scene is marked renderVerified by this importer.'},
});
console.log(JSON.stringify({registryEntries: registry.items.length, copiedFiles: manifest.length, addedCallableExports: callable.length,
  totalCallableExports: callable.length + keep.size, dependencyItems: dependencyItems.length,
  missingDeps: entries.filter((entry) => entry.integrationStatus === 'missing-deps').length,
  unresolved: entries.filter((entry) => entry.integrationStatus === 'imported').length,
  install: packages.filter((pkg) => !pkg.installed).map((pkg) => pkg.name)}, null, 2));
