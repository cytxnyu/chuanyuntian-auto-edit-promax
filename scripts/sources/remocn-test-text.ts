import assert from 'node:assert/strict';
import {bindRemocnText, splitRemocnText} from './remocn-text';

const examples = [
  '这是第一句。保留第二句的完整意思。第三句使用中文标点！第四句中间含有空格和English words。最后一句必须原样出现。',
  'A complete source sentence without fictional release claims. Every word must remain present, in order, across all five native statements.',
  '短',
  '新的发布',
  '第一段\n第二段\n第三段\n第四段\n第五段',
];
for (const text of examples) {
  const chunks = splitRemocnText(text);
  assert.equal(chunks.length, 5);
  assert(chunks.every((chunk) => chunk.trim().length > 0));
  if ([...text].length >= 5) assert.equal(chunks.join(''), text.trim());
  const bound = bindRemocnText('remocn/release-teaser', text, '测试标题');
  assert.equal(bound.brandName, '测试标题');
  assert.equal(bound.release, '');
  assert.equal(bound.volume, 0);
  assert.equal(bound.audioSrc, undefined);
  assert(Array.isArray(bound.statements));
  assert(!JSON.stringify(bound).includes('Orvio'));
  assert(!JSON.stringify(bound).includes('Your next chapter'));
}
assert.throws(() => splitRemocnText(' \n '), /nonempty/);
assert.throws(() => bindRemocnText('remocn/fomo-limit-orders', 'test'), /native content/);
console.log('PASS remocn source-text binding: 5 inputs; five nonempty statements; lossless full-copy order; no native marketing fallback; silent audio.');
