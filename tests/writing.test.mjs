import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const token = `writing-check-${randomUUID()}`;
const temporary = [];
const file = (path) => new URL(path, root);
function post(suffix, date, draft = false, tags = []) {
  const path = `src/content/blog/architecture/${token}-${suffix}.md`;
  temporary.push(path);
  writeFileSync(file(path), `---\ntitle: "${token}-${suffix}"\ndescription: "验证摘要 & 长标题展示"\npublishedAt: "${date}"\ncategory: "验证分类"\ntags: ${JSON.stringify(tags)}\ndraft: ${draft}\n---\n`);
}
function build() {
  const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', '--force'], {
    cwd: root, encoding: 'utf8', timeout: 60000,
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  return readFileSync(file('dist/writing/index.html'), 'utf8');
}
const link = (suffix) => `/writing/architecture/${token}-${suffix}`;
const fixtureLinks = (html) => Array.from(html.matchAll(/href="([^"]+)"/g), match => match[1])
  .filter(href => href.startsWith('/writing/architecture/') && href.includes(token));

test('Writing groups all posts by UTC year, preserves query order and updates on new Markdown', () => {
  try {
    post('a', '2099-10-03', false, ['Java', 'Spring Cloud']);
    post('b', '2099-10-03');
    post('boundary', '2099-01-01T00:30:00+08:00');
    post('old', '2097-01-02');
    post('draft', '2100-01-01', true, ['Hidden']);
    const initial = build();
    assert.deepEqual(fixtureLinks(initial), ['a', 'b', 'boundary', 'old'].map(link));
    const years = ['2099', '2098', '2097'].map(year => initial.indexOf(`id="writing-year-${year}"`));
    assert.ok(years[0] >= 0 && years[0] < years[1] && years[1] < years[2]);
    assert.ok(initial.includes('2098.12.31'));
    assert.ok(initial.includes('datetime="2098-12-31T16:30:00.000Z"'));
    assert.ok(initial.includes('验证摘要 &amp; 长标题展示'));
    assert.ok(initial.includes('验证分类'));
    assert.ok(initial.includes('#Java') && initial.includes('#Spring Cloud'));
    assert.ok(!initial.includes(`${token}-draft`));
    assert.match(initial, /href="\/writing"[^>]*aria-current="page"/);
    assert.equal((initial.match(/<h1\b/g) ?? []).length, 1);
    assert.ok(initial.includes('<title>Writing - ZHU.</title>'));
    assert.ok(!initial.includes('<script'));
    post('new', '2101-01-01');
    const updated = build();
    assert.deepEqual(fixtureLinks(updated), ['new', 'a', 'b', 'boundary', 'old'].map(link));
    assert.ok(updated.indexOf('id="writing-year-2101"') < updated.indexOf('id="writing-year-2099"'));
  } finally {
    for (const path of temporary) if (existsSync(file(path))) unlinkSync(file(path));
    assert.ok(!build().includes(token));
  }
});
