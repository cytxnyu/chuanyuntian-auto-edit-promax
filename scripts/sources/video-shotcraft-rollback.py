"""Restore source bytes only into an explicitly named second runtime copy.

The installed MODIFIED runtime is intentionally excluded. This helper is for
testing/removing Shotcraft parameterization in a separate copied tree.
"""
from pathlib import Path
import argparse
import json
import shutil

W = Path(__file__).resolve().parents[2]
V = W / 'vendor/video-shotcraft'
U = V / 'upstream'
R = V / 'runtime'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('target', type=Path)
    args = parser.parse_args()
    target = args.target.resolve()
    assert target != R.resolve() and R.resolve() not in target.parents, 'Use a second runtime copy, not the installed runtime'
    assert target != U.resolve() and U.resolve() not in target.parents, 'Upstream stays immutable'
    assert target.is_dir(), 'The second runtime copy must already exist'
    manifest = json.loads((V / 'ADAPTATIONS.json').read_text(encoding='utf-8'))
    for item in manifest['changedFiles']:
        destination = (target / item['path']).resolve()
        assert target in destination.parents and destination.is_file(), item['path']
        shutil.copyfile(U / item['path'], destination)
        assert destination.read_bytes() == (U / item['path']).read_bytes(), item['path']
    print(json.dumps({'restoredFiles': len(manifest['changedFiles']), 'restoredOriginalBytes': True,
                      'installedRuntimeStillChanged': all((R / item['path']).read_bytes() != (U / item['path']).read_bytes()
                                                        for item in manifest['changedFiles'])}))


if __name__ == '__main__':
    main()
