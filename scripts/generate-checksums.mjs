import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync, writeFileSync, readdirSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
// A staged skill is also a valid local distribution, without a parent .git.
const walk = (dir = '', names = []) => {
  for (const entry of readdirSync(resolve(root, dir), {withFileTypes: true})) {
    if (entry.isSymbolicLink() || ['.git', 'node_modules', '.npm-cache', 'examples','evidence','verification'].includes(entry.name)) continue;
    const name = join(dir, entry.name);
    if (entry.isDirectory()) walk(name, names);
    else if (entry.isFile()) names.push(name);
  }
  return names;
};
const output = existsSync(resolve(root, '.git')) ? execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
  cwd: root, encoding: 'utf8', windowsHide: true,
}) : walk().join('\n');

const files = output
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((path) => path !== 'SHA256SUMS.txt')
  .filter((path) => existsSync(resolve(root, path)))
  .sort((a, b) => a.localeCompare(b, 'en'));

const lines = files.map((path) => {
  const hash = createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex').toUpperCase();
  return `${hash}  ${path.replaceAll('\\', '/')}`;
});

writeFileSync(resolve(root, 'SHA256SUMS.txt'), `${lines.join('\n')}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({files: files.length})}\n`);
