import {readFile, access} from 'node:fs/promises';
import {resolve, dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const vendor = join(root, 'vendor/remocn');
const catalog = JSON.parse(await readFile(join(root, 'references/sources/remocn.json'), 'utf8'));
const hashes = (await readFile(join(vendor, 'SHA256SUMS.upstream.txt'), 'utf8')).trim().split('\n');
for (const line of hashes) {
  const [, expected, path] = line.match(/^([a-f0-9]{64})  (.+)$/);
  const actual = createHash('sha256').update(await readFile(join(vendor, path))).digest('hex');
  assert.equal(actual, expected, `Original source hash mismatch: ${path}`);
}
assert.equal(catalog.entries.length, 332);
assert.equal(catalog.entries.filter((entry) => entry.status === 'installed').length, 2);
assert.equal(catalog.entries.filter((entry) => entry.status === 'indexed').length, 330);
assert.equal(new Set(catalog.entries.map((entry) => entry.id)).size, 332);
for (const entry of catalog.entries) {
  assert.equal(entry.license, 'MIT');
  for (const source of entry.sourceFiles) await access(join(root, source.path));
  if (entry.status === 'installed') {
    await access(join(root, entry.entry));
    assert(entry.width > 0 && entry.height > 0 && entry.fps > 0 && entry.durationInFrames > 0);
    assert.equal(entry.defaultProps.volume, 0);
  } else {
    assert.equal(entry.entry, null);
    assert.equal(entry.callable, false);
  }
}
for (const font of catalog.fontPackages) {
  const original = JSON.parse(await readFile(join(root, font.source, 'package.json'), 'utf8'));
  const installed = JSON.parse(await readFile(join(root, 'node_modules', font.name, 'package.json'), 'utf8'));
  assert.equal(original.name, font.name);
  assert.equal(original.version, font.version);
  assert.equal(installed.version, font.version);
  assert.equal(original.license, 'OFL-1.1');
  await access(join(root, font.licenseFile));
}
console.log(`PASS remocn provenance: ${hashes.length} preserved-file SHA256 matches; 332 source entries exist; installed=2 indexed=330; fonts pinned and licensed; default audio silent.`);
