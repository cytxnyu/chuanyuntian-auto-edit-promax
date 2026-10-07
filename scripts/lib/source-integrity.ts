import {createHash} from 'node:crypto';
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {join, relative} from 'node:path';
import type {SourceEntry} from '../../packages/core/src/source-scenes';

// Fingerprint the adapter, native-clock bridge, source snapshot, copied assets
// and pinned dependencies, not the output report itself (which would recurse).
export const sourceFingerprint = (repo: string, entry: SourceEntry): string => {
  const paths = new Set<string>();
  const addTree = (path: string) => {
    if (!existsSync(path)) return;
    for (const item of readdirSync(path, {withFileTypes: true})) {
      if (item.isSymbolicLink() || ['.git', 'node_modules', 'cache', 'verification'].includes(item.name)) continue;
      const child = join(path, item.name);
      if (item.isDirectory()) addTree(child);
      else if (item.isFile()) paths.add(child);
    }
  };
  addTree(join(repo, 'packages/remotion-renderer/src'));
  addTree(join(repo, 'vendor', entry.provider, entry.provider === 'remocn' ? 'upstream' : 'runtime'));
  for (const file of ['package-lock.json', 'packages/core/src/source-scenes.ts', 'packages/core/src/schema.ts',
    `references/sources/${entry.provider}.json`, 'scripts/sources/remocn-text.ts']) paths.add(join(repo, file));
  for (const asset of entry.assets ?? []) paths.add(join(repo, asset.source));
  const hash = createHash('sha256');
  for (const file of [...paths].sort()) {
    hash.update(relative(repo, file).replaceAll('\\', '/')).update('\0');
    hash.update(createHash('sha256').update(readFileSync(file)).digest()).update('\0');
  }
  return hash.digest('hex');
};
