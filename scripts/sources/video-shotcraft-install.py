"""Rebuild the pinned Shotcraft runtime; upstream files remain unmodified."""
from pathlib import Path
import hashlib, json, re, shutil, subprocess, sys

W = Path(__file__).resolve().parents[2]
V = W / 'vendor/video-shotcraft'
U = V / 'upstream'
R = V / 'runtime'
REV = '5ddbf521038b0a7accfb6dc1e0a9eb29c67277ab'
REPO = 'https://github.com/Vincentwei1021/video-shotcraft'

def patch(path, old, new):
    p = R / path
    s = p.read_text(encoding='utf-8')
    if old not in s:
        raise RuntimeError(f'Pinned source patch anchor missing: {path}: {old[:80]}')
    p.write_text(s.replace(old, new, 1), encoding='utf-8')

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    if not (U / '.git').exists():
        V.mkdir(parents=True, exist_ok=True)
        subprocess.run(['git', 'clone', '--depth', '1', '--filter=blob:none', '--sparse', '--no-checkout', REPO + '.git', str(U)], check=True)
        subprocess.run(['git', '-C', str(U), 'fetch', '--depth', '1', 'origin', REV], check=True)
        subprocess.run(['git', '-C', str(U), 'sparse-checkout', 'set', 'demos', 'template', 'assets/lib', 'references/shots'], check=True)
        subprocess.run(['git', '-C', str(U), 'checkout', '--detach', REV], check=True)
    actual = subprocess.check_output(['git', '-C', str(U), 'rev-parse', 'HEAD'], text=True).strip()
    assert actual == REV, (actual, REV)
    R.mkdir(parents=True, exist_ok=True)
    # Preserve all template code (including its original workbench manifest).
    shutil.copytree(U / 'template', R / 'template', dirs_exist_ok=True)
    for sub in ['_fixtures', 'camera/basic-3d-scene', 'camera/terminal-3d']:
        shutil.copytree(U / 'demos' / sub, R / 'demos' / sub, dirs_exist_ok=True)
    shutil.copyfile(U / 'LICENSE', V / 'LICENSE')
    for name in ['NOTICE.md', 'README.md']:
        if (U / name).exists():
            shutil.copyfile(U / name, V / ('UPSTREAM_' + name))

    # TEXT ONLY adaptations; all upstream geometry/easing/choreography remain.
    basic = 'demos/camera/basic-3d-scene/Basic3DScene.tsx'
    patch(basic, 'export const Basic3DScene: React.FC = () => {',
          "export type Basic3DSceneProps = { steps?: { title?: string; subtitle?: string }[] };\n"
          "export const Basic3DScene: React.FC<Basic3DSceneProps> = ({ steps }) => {")
    patch(basic, '{p.tt}', '{steps?.[i]?.title ?? p.tt}')
    patch(basic, '{p.sub}', '{steps?.[i]?.subtitle ?? p.sub}')
    terminal = 'demos/camera/terminal-3d/Terminal3D.tsx'
    patch(terminal, 'export const Terminal3D: React.FC = () => {',
          "export type Terminal3DProps = { panels?: { title?: string; command?: string; output?: string[] }[] };\n"
          "export const Terminal3D: React.FC<Terminal3DProps> = ({ panels }) => {\n"
          "  const data = DATA.map((d, i) => ({ ...d, title: panels?.[i]?.title ?? d.title, cmd: panels?.[i]?.command ?? d.cmd, out: panels?.[i]?.output ?? d.out }));")
    patch(terminal, '{DATA.map((d, i) => {', '{data.map((d, i) => {')

    theme = 'template/src/themes/visual-theme.tsx'
    patch(theme, 'export type VisualTheme = typeof THEME;',
          'export type VisualTheme = typeof THEME & { assetBase?: string };')
    patch(theme,
          "export const VisualThemeProvider: FC<{theme?: string; colors?: Record<string,string>; children: ReactNode}> = ({theme, colors, children}) =>\n  <ThemeContext.Provider value={resolveTheme(theme, colors)}>{children}</ThemeContext.Provider>;",
          "export const VisualThemeProvider: FC<{theme?: string; colors?: Record<string,string>; assetBase?: string; children: ReactNode}> = ({theme, colors, assetBase, children}) =>\n  <ThemeContext.Provider value={{...resolveTheme(theme, colors), assetBase}}>{children}</ThemeContext.Provider>;")
    patch(theme, 'return staticFile(src);',
          "return staticFile(`${(theme.assetBase ?? 'sources/video-shotcraft/ink-press').replace(/\\/$/, '')}/${src}`);")

    mainfile = 'template/src/aifl/Main.tsx'
    patch(mainfile, 'export const AiflMain: React.FC = () => {',
          "export type AiflMainProps = { muted?: boolean; titleCards?: Record<string, {text: string; sub?: string; subDigits?: string}>; captions?: string[]; sceneProps?: Record<string, any> };\n"
          "export const AiflMain: React.FC<AiflMainProps> = ({ muted = true, titleCards, captions, sceneProps = {} }) => {\n"
          "  const cards = {...TITLE_CARDS, ...titleCards};")
    patch(mainfile, '<Audio src={asset(`audio/${s.src}`)} volume={s.volume} />',
          '<Audio src={asset(`audio/${s.src}`)} volume={s.volume} muted={muted} />')
    for component, key in [('SceneOpen', 'opening'), ('SceneFlyIn', 'flyIn'), ('SceneDetail', 'detail'), ('ScenePapers', 'papers'), ('SceneWbr', 'weeklyReport'), ('SceneOutroLive', 'outro')]:
        patch(mainfile, f'<{component} />', f'<{component} {{...sceneProps.{key}}} />')
    p = R / mainfile
    s = p.read_text(encoding='utf-8')
    before, body = s.split('export const AiflMain:', 1)
    body = body.replace('TITLE_CARDS.', 'cards.').replace('{CAPTIONS.map((c) => (', '{CAPTIONS.map((c, i) => (').replace('<Caption text={c.text}', '<Caption text={captions?.[i] ?? c.text}')
    p.write_text(before + 'export const AiflMain:' + body, encoding='utf-8')

    themed = R / 'template/src/themes/ThemedFilm.tsx'
    themed.write_text("import { AiflMain, type AiflMainProps } from '../aifl/Main';\n"
        "import { resolveTheme, VisualThemeProvider } from './visual-theme';\n\n"
        "export type ThemedFilmProps = AiflMainProps & {theme?: string; colors?: Record<string,string>; assetBase?: string};\n"
        "export const ThemedFilm: React.FC<ThemedFilmProps> = ({theme, colors, assetBase = 'sources/video-shotcraft/ink-press', ...film}) => {\n"
        "  const selected = resolveTheme(theme);\n"
        "  return <VisualThemeProvider theme={selected.id} colors={colors} assetBase={assetBase}><AiflMain {...film} /></VisualThemeProvider>;\n};\n", encoding='utf-8')

    # Also retain the audio attribution without fetching preview media.
    attr_path = V / 'AUDIO_ATTRIBUTION.md'
    if not attr_path.exists():
        import urllib.request
        with urllib.request.urlopen(f'https://raw.githubusercontent.com/Vincentwei1021/video-shotcraft/{REV}/assets/audio/ATTRIBUTION.md') as response:
            attr_path.write_bytes(response.read())

    assets = [{'source': f'vendor/video-shotcraft/upstream/template/public/{p.relative_to(U / "template/public").as_posix()}',
               'target': f'sources/video-shotcraft/ink-press/{p.relative_to(U / "template/public").as_posix()}'}
              for p in sorted((U / 'template/public').rglob('*')) if p.is_file()]
    neutral_steps = [
        {'title': '提出问题', 'subtitle': '先看清楚要解决什么'},
        {'title': '拆解路径', 'subtitle': '把任务变成清晰步骤'},
        {'title': '执行步骤', 'subtitle': '让每个动作接上结果'},
        {'title': '形成结果', 'subtitle': '用真实证据完成表达'},
    ]
    neutral_panels = [
        {'title': '理解任务', 'command': '输入目标与素材', 'output': ['明确当前问题', '保留原始信息', '整理可验证证据']},
        {'title': '推进步骤', 'command': '按顺序完成动作', 'output': ['选择需要的镜头', '把内容放进原场景', '保持动作与节奏']},
        {'title': '检验结果', 'command': '回看画面与输出', 'output': ['核对信息', '检查可读性', '确认最终状态']},
    ]
    common = dict(provider='video-shotcraft', revision=REV, width=1920, height=1080, fps=30,
                  license='Apache-2.0', status='installed', sourceUrl=REPO + '/tree/' + REV)
    entries = [
        dict(common, id='video-shotcraft/basic-3d-scene', title='Impress 3D Steps 原完整空间镜头', kind='scene',
             entry='vendor/video-shotcraft/runtime/demos/camera/basic-3d-scene/Basic3DScene.tsx#Basic3DScene',
             durationInFrames=180, defaultProps={'steps': neutral_steps},
             editableProps={'steps': {'type': 'array', 'items': {'title': 'string', 'subtitle': 'string'}, 'length': 4}}, assets=[],
             tags=['original-scene', '3d-camera', 'text-only-editable', 'no-demo-metrics'],
             adaptations=['Expose steps[i].title/subtitle only; original geometry, colors, easing and camera are unchanged.', 'Neutral default copy replaces demonstration labels; no claimed business result.']),
        dict(common, id='video-shotcraft/terminal-3d', title='Terminal 3D 原完整命令叙事镜头', kind='scene',
             entry='vendor/video-shotcraft/runtime/demos/camera/terminal-3d/Terminal3D.tsx#Terminal3D',
             durationInFrames=180, defaultProps={'panels': neutral_panels},
             editableProps={'panels': {'type': 'array', 'items': {'title': 'string', 'command': 'string', 'output': 'string[]'}, 'length': 3}}, assets=[],
             tags=['original-scene', '3d-camera', 'text-only-editable', 'no-demo-metrics'],
             adaptations=['Expose panel copy; pose, focus, typewriter timing and original 3D camera remain unchanged.', 'Neutral defaults replace fabricated example logs and addresses.']),
        dict(common, id='video-shotcraft/ink-press', title='Ink Press 原10镜头完整宣传片模板', kind='template',
             entry='vendor/video-shotcraft/runtime/template/src/themes/ThemedFilm.tsx#ThemedFilm', durationInFrames=1085,
             defaultProps={'theme': 'ink-press', 'muted': True, 'assetBase': 'sources/video-shotcraft/ink-press'},
             editableProps={'muted': 'boolean', 'assetBase': 'string', 'theme': 'string', 'colors': 'Record<string,string>', 'titleCards': 'Record<card1|card2|cardWbr|card3,{text,sub?,subDigits?}>', 'captions': 'string[6]', 'sceneProps': 'Record<opening|flyIn|detail|papers|weeklyReport|outro,object>'},
             assets=assets, tags=['original-template', 'native-1085-frames', 'product-screenshot-dependent', 'upstream-demo-assets', 'requires-real-product-asset-replacement'],
             adaptations=['Default mute preserves the talking-head track; original SFX timing and volumes retained when muted=false.', 'Asset resolver adds sources/video-shotcraft/ink-press prefix, overrideable with assetBase.', 'Expose title/caption/scene copy props; original 10-shot timeline, camera keys, palette and timing retained.']),
        dict(common, id='video-shotcraft/ink-press-outro', title='Ink Press 原合影组装收尾镜头', kind='scene',
             entry='vendor/video-shotcraft/runtime/template/src/aifl/live/SceneOutroLive.tsx#SceneOutroLive', durationInFrames=145,
             defaultProps={'theme': 'ink-press', 'assetBase': 'sources/video-shotcraft/ink-press', 'wordmark': '你的主题', 'tagline': '用真实内容完成表达'},
             editableProps={'wordmark': 'string', 'tagline': 'string', 'wordmarkSize': 'number', 'taglineSize': 'number', 'assetBase': 'string', 'theme': 'string'},
             assets=assets, tags=['original-scene', 'group-photo', 'product-screenshot-dependent', 'requires-real-product-asset-replacement'],
             adaptations=['Original SceneOutroLive wrapped in its VisualThemeProvider.', 'Neutral wordmark/tagline; photographic page textures still need target-product replacement.']),
    ]
    installed_sources = {basic, terminal}
    # A complete source index is NOT an installation/render claim.
    for p in sorted((U / 'demos').rglob('*.tsx')):
        rel = p.relative_to(U).as_posix()
        if '/_' in rel or rel in installed_sources:
            continue
        src = p.read_text(encoding='utf-8')
        for component in re.findall(r'export const (\w+)\s*:\s*(?:React\.)?FC(?:<[^\n]+>)?\s*=', src):
            if rel == 'demos/' + basic.removeprefix('demos/') or rel == 'demos/' + terminal.removeprefix('demos/'):
                continue
            dur = re.search(r'export const \w+_(?:DURATION|DUR)\s*=\s*(\d+)', src)
            entries.append(dict(common, id='video-shotcraft/indexed/' + rel.removeprefix('demos/').removesuffix('.tsx').lower() + '/' + component.lower(),
                title=component, kind='scene', entry=f'vendor/video-shotcraft/upstream/{rel}#{component}',
                durationInFrames=int(dur.group(1)) if dur else None, defaultProps={}, editableProps={}, assets=[],
                tags=['source-cached', 'reference-scene'], adaptations=['Cached upstream only; resolve fixtures/assets/duration and integrate before use.'], status='indexed'))
    for entry in entries:
        source = entry['entry'].split('#')[0].replace('vendor/video-shotcraft/runtime/', '').replace('vendor/video-shotcraft/upstream/', '')
        entry['sourceUrl'] = REPO + '/blob/' + REV + '/' + source
    catalog = {'provider': 'video-shotcraft', 'repository': REPO, 'revision': REV, 'license': 'Apache-2.0',
               'licensePath': 'vendor/video-shotcraft/LICENSE', 'audioLicensePath': 'vendor/video-shotcraft/AUDIO_ATTRIBUTION.md',
               'cache': {'demos': 'vendor/video-shotcraft/upstream/demos', 'template': 'vendor/video-shotcraft/upstream/template',
                         'templatePublicBytes': sum(p.stat().st_size for p in (U/'template/public').rglob('*') if p.is_file()),
                         'previewMediaDownloaded': False}, 'entries': entries}
    dest = W / 'references/sources/video-shotcraft.json'
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    changes = []
    for p in sorted(R.rglob('*')):
        if p.is_file() and (U / p.relative_to(R)).exists() and sha(p) != sha(U / p.relative_to(R)):
            changes.append({'path': p.relative_to(R).as_posix(), 'originalSha256': sha(U / p.relative_to(R)), 'runtimeSha256': sha(p)})
    (V / 'ADAPTATIONS.json').write_text(json.dumps({'revision': REV, 'changedFiles': changes}, indent=2) + '\n', encoding='utf-8')
    subprocess.run([sys.executable, str(W / 'scripts/sources/video-shotcraft-verify.py'), '--record'], check=True, stdout=subprocess.DEVNULL)
    print(json.dumps({'revision': REV, 'installed': sum(e['status']=='installed' for e in entries), 'indexed': sum(e['status']=='indexed' for e in entries), 'assets': len(assets), 'changedSourceFiles': len(changes)}, ensure_ascii=False))

if __name__ == '__main__':
    main()
