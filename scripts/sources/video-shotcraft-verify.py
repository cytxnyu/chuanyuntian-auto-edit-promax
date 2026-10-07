"""Verify only the pinned Shotcraft source/provider/catalog owned by this adapter.

--record writes byte hashes and a normalized five-file upstream patch. Verification
does not render, install packages, or change the upstream/runtime trees.
"""
from pathlib import Path
from io import BytesIO
import argparse
import difflib
import hashlib
import json
import re
import shutil
import subprocess

W = Path(__file__).resolve().parents[2]
V = W / 'vendor/video-shotcraft'
U = V / 'upstream'
R = V / 'runtime'
REV = '5ddbf521038b0a7accfb6dc1e0a9eb29c67277ab'
REPO = 'https://github.com/Vincentwei1021/video-shotcraft'
ALLOWED = {
    'demos/camera/basic-3d-scene/Basic3DScene.tsx',
    'demos/camera/terminal-3d/Terminal3D.tsx',
    'template/src/aifl/Main.tsx',
    'template/src/themes/ThemedFilm.tsx',
    'template/src/themes/visual-theme.tsx',
}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def files(root):
    return sorted(p for p in root.rglob('*') if p.is_file() and '.git' not in p.relative_to(root).parts)


def git(*args):
    return subprocess.check_output(['git', '-C', str(U), *args])


def raw_blobs(paths):
    # Batch reads immutable Git blobs; core.autocrlf checkout differences are
    # recorded separately, not mistaken for an upstream source modification.
    stream = BytesIO(subprocess.check_output(
        ['git', '-C', str(U), 'cat-file', '--batch'],
        input=b''.join((REV + ':' + path + '\n').encode() for path in paths)))
    result = {}
    for path in paths:
        header = stream.readline().decode().strip().split()
        assert len(header) == 3 and header[1] == 'blob', (path, header)
        data = stream.read(int(header[2]))
        assert stream.read(1) == b'\n'
        result[path] = (header[0], data)
    return result


def patch_text():
    result = []
    for path in sorted(ALLOWED):
        result.extend(difflib.unified_diff(
            (U / path).read_text(encoding='utf-8').splitlines(keepends=True),
            (R / path).read_text(encoding='utf-8').splitlines(keepends=True),
            fromfile='upstream/' + path, tofile='runtime/' + path))
    return ''.join(result)


def record():
    original_paths = [p.relative_to(U).as_posix() for p in files(U)]
    blobs = raw_blobs(original_paths)
    original = []
    for path in original_paths:
        blob, raw = blobs[path]
        checkout = (U / path).read_bytes()
        original.append(dict(path=path, gitBlobSha1=blob, originalSha256=sha(raw),
                             originalBytes=len(raw), checkoutSha256=sha(checkout), checkoutBytes=len(checkout)))
    runtime = [dict(path=p.relative_to(R).as_posix(), sha256=sha(p.read_bytes()), bytes=p.stat().st_size)
               for p in files(R)]
    (V / 'UPSTREAM_PATCH.diff').write_text(patch_text(), encoding='utf-8', newline='\n')
    evidence = {
        'revision': REV, 'repository': REPO,
        'originalByteDefinition': 'Immutable Git blob bytes at revision; checkout SHA256 also recorded (Windows core.autocrlf may change line endings).',
        'originals': original, 'runtime': runtime,
        'providerSha256': sha((W / 'packages/remotion-renderer/src/external/providers/video-shotcraft.tsx').read_bytes()),
        'catalogSha256': sha((W / 'references/sources/video-shotcraft.json').read_bytes()),
        'licenseSha256': sha((V / 'LICENSE').read_bytes()),
        'audioAttributionSha256': sha((V / 'AUDIO_ATTRIBUTION.md').read_bytes()),
        'patchSha256': sha((V / 'UPSTREAM_PATCH.diff').read_bytes()),
    }
    (V / 'SOURCE_HASHES.json').write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return evidence


def assert_original():
    assert git('rev-parse', 'HEAD').decode().strip() == REV
    assert not git('status', '--porcelain'), 'Upstream checkout was modified'
    manifest = json.loads((V / 'SOURCE_HASHES.json').read_text(encoding='utf-8'))
    assert manifest['revision'] == REV
    assert {p.relative_to(U).as_posix() for p in files(U)} == {p['path'] for p in manifest['originals']}
    blobs = raw_blobs([p['path'] for p in manifest['originals']])
    for item in manifest['originals']:
        blob, raw = blobs[item['path']]
        assert blob == item['gitBlobSha1'] and sha(raw) == item['originalSha256'], item['path']
        assert sha((U / item['path']).read_bytes()) == item['checkoutSha256'], item['path']
    assert sha((V / 'LICENSE').read_bytes()) == manifest['licenseSha256']
    assert sha((V / 'AUDIO_ATTRIBUTION.md').read_bytes()) == manifest['audioAttributionSha256']
    return manifest


def restore_text(path, runtime):
    """Invert only documented parameter/mute/asset changes, never choreography."""
    if path.endswith('/Basic3DScene.tsx'):
        runtime = runtime.replace('export type Basic3DSceneProps = { steps?: { title?: string; subtitle?: string }[] };\n', '')
        runtime = runtime.replace('export const Basic3DScene: React.FC<Basic3DSceneProps> = ({ steps }) => {', 'export const Basic3DScene: React.FC = () => {')
        return runtime.replace('{steps?.[i]?.title ?? p.tt}', '{p.tt}').replace('{steps?.[i]?.subtitle ?? p.sub}', '{p.sub}')
    if path.endswith('/Terminal3D.tsx'):
        runtime = runtime.replace('export type Terminal3DProps = { panels?: { title?: string; command?: string; output?: string[] }[] };\n', '')
        runtime = runtime.replace('export const Terminal3D: React.FC<Terminal3DProps> = ({ panels }) => {\n  const data = DATA.map((d, i) => ({ ...d, title: panels?.[i]?.title ?? d.title, cmd: panels?.[i]?.command ?? d.cmd, out: panels?.[i]?.output ?? d.out }));', 'export const Terminal3D: React.FC = () => {')
        return runtime.replace('{data.map((d, i) => {', '{DATA.map((d, i) => {')
    if path.endswith('/visual-theme.tsx'):
        runtime = runtime.replace('export type VisualTheme = typeof THEME & { assetBase?: string };', 'export type VisualTheme = typeof THEME;')
        runtime = runtime.replace('export const VisualThemeProvider: FC<{theme?: string; colors?: Record<string,string>; assetBase?: string; children: ReactNode}> = ({theme, colors, assetBase, children}) =>\n  <ThemeContext.Provider value={{...resolveTheme(theme, colors), assetBase}}>{children}</ThemeContext.Provider>;', 'export const VisualThemeProvider: FC<{theme?: string; colors?: Record<string,string>; children: ReactNode}> = ({theme, colors, children}) =>\n  <ThemeContext.Provider value={resolveTheme(theme, colors)}>{children}</ThemeContext.Provider>;')
        return runtime.replace("return staticFile(`${(theme.assetBase ?? 'sources/video-shotcraft/ink-press').replace(/\\/$/, '')}/${src}`);", 'return staticFile(src);')
    if path.endswith('/ThemedFilm.tsx'):
        runtime = runtime.replace("import { AiflMain, type AiflMainProps } from '../aifl/Main';", "import { AiflMain } from '../aifl/Main';")
        runtime = runtime.replace("export type ThemedFilmProps = AiflMainProps & {theme?: string; colors?: Record<string,string>; assetBase?: string};\n", '')
        runtime = runtime.replace("export const ThemedFilm: React.FC<ThemedFilmProps> = ({theme, colors, assetBase = 'sources/video-shotcraft/ink-press', ...film}) => {", 'export const ThemedFilm: React.FC<{theme?: string; colors?: Record<string,string>}> = ({theme, colors}) => {')
        return runtime.replace(' colors={colors} assetBase={assetBase}><AiflMain {...film}', ' colors={colors}><AiflMain')
    if path.endswith('/Main.tsx'):
        runtime = runtime.replace('export type AiflMainProps = { muted?: boolean; titleCards?: Record<string, {text: string; sub?: string; subDigits?: string}>; captions?: string[]; sceneProps?: Record<string, any> };\n', '')
        runtime = runtime.replace('export const AiflMain: React.FC<AiflMainProps> = ({ muted = true, titleCards, captions, sceneProps = {} }) => {\n  const cards = {...TITLE_CARDS, ...titleCards};', 'export const AiflMain: React.FC = () => {')
        runtime = runtime.replace(' volume={s.volume} muted={muted}', ' volume={s.volume}')
        for component, key in [('SceneOpen', 'opening'), ('SceneFlyIn', 'flyIn'), ('SceneDetail', 'detail'), ('ScenePapers', 'papers'), ('SceneWbr', 'weeklyReport'), ('SceneOutroLive', 'outro')]:
            runtime = runtime.replace(f'<{component} {{...sceneProps.{key}}} />', f'<{component} />')
        return runtime.replace('cards.', 'TITLE_CARDS.').replace('{CAPTIONS.map((c, i) => (', '{CAPTIONS.map((c) => (').replace('text={captions?.[i] ?? c.text}', 'text={c.text}')
    raise AssertionError(path)


def assert_modified(manifest):
    expected = {item['path']: item for item in manifest['runtime']}
    assert set(expected) == {p.relative_to(R).as_posix() for p in files(R)}
    changes = []
    for path, item in expected.items():
        raw = (R / path).read_bytes()
        assert sha(raw) == item['sha256'], path
        assert (U / path).is_file(), path
        if raw != (U / path).read_bytes():
            changes.append(path)
            original = (U / path).read_text(encoding='utf-8').strip()
            assert restore_text(path, raw.decode().replace('\r\n', '\n')).strip() == original, 'Undocumented semantic change: ' + path
    assert set(changes) == ALLOWED, changes
    cat_path = W / 'references/sources/video-shotcraft.json'
    assert sha(cat_path.read_bytes()) == manifest['catalogSha256']
    catalog = json.loads(cat_path.read_text(encoding='utf-8'))
    entries = catalog['entries']
    assert len({entry['id'] for entry in entries}) == len(entries), 'Duplicate IDs'
    installed = [entry for entry in entries if entry['status'] == 'installed']
    assert len(installed) == 4
    expected_duration = {'video-shotcraft/basic-3d-scene': 180, 'video-shotcraft/terminal-3d': 180,
                         'video-shotcraft/ink-press': 1085, 'video-shotcraft/ink-press-outro': 145}
    assets = set()
    for entry in entries:
        assert entry['revision'] == REV and (W / entry['entry'].split('#')[0]).is_file(), entry['id']
        if entry['status'] == 'installed':
            assert entry['durationInFrames'] == expected_duration[entry['id']]
            assert (entry['width'], entry['height'], entry['fps']) == (1920, 1080, 30)
        for asset in entry['assets']:
            assert (W / asset['source']).is_file(), asset
            assert asset['target'].startswith('sources/video-shotcraft/') and '..' not in Path(asset['target']).parts
            assets.add(asset['source'])
    assert len(assets) == 38
    assert next(e for e in installed if e['id'].endswith('/ink-press'))['defaultProps']['muted'] is True
    provider = W / 'packages/remotion-renderer/src/external/providers/video-shotcraft.tsx'
    assert sha(provider.read_bytes()) == manifest['providerSha256']
    assert sha((V / 'UPSTREAM_PATCH.diff').read_bytes()) == manifest['patchSha256']
    assert (V / 'UPSTREAM_PATCH.diff').read_text(encoding='utf-8') == patch_text()
    return {'installed': len(installed), 'indexed': len(entries) - len(installed),
            'changedFiles': len(changes), 'unchangedRuntimeFiles': len(expected) - len(changes), 'assets': len(assets)}


def test_rollback():
    target = V / 'verification/rollback-copy'
    # The rollback test is a second, five-file copy. The installed runtime stays
    # parameterized. No recursive remove or move is used.
    assert V.resolve() in target.resolve().parents and target.resolve() != R.resolve()
    for path in ALLOWED:
        destination = target / path
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(R / path, destination)
        assert destination.read_bytes() == (R / path).read_bytes()
        shutil.copyfile(U / path, destination)
        assert destination.read_bytes() == (U / path).read_bytes(), path
        assert (R / path).read_bytes() != destination.read_bytes(), path
    return {'restoredFiles': len(ALLOWED), 'restoredOriginalBytes': True, 'installedRuntimeStillChanged': True}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--record', action='store_true')
    parser.add_argument('--mode', choices=['baseline', 'modified', 'rollback'], default='modified')
    args = parser.parse_args()
    if args.record:
        manifest = record()
        print(json.dumps({'recordedOriginals': len(manifest['originals']), 'recordedRuntime': len(manifest['runtime']), 'revision': REV}))
        return
    manifest = assert_original()
    result = {'mode': args.mode, 'revision': REV, 'originalFilesVerified': len(manifest['originals']), 'upstreamGitClean': True}
    if args.mode != 'baseline':
        result.update(assert_modified(manifest))
    if args.mode == 'rollback':
        result.update(test_rollback())
    print(json.dumps(result))


if __name__ == '__main__':
    main()
