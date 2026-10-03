import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const token = `home-check-${randomUUID()}`;
const temporary = [];
const file = (path) => new URL(path, root);
function create(path, text) {
  temporary.push(path);
  writeFileSync(file(path), text);
}
function build() {
  const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', '--force'], {
    cwd: root, encoding: 'utf8', timeout: 60000,
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  return readFileSync(file('dist/index.html'), 'utf8');
}
const links = (html, section) => Array.from(html.matchAll(/href="([^"]+)"/g), match => match[1])
  .filter(href => href.startsWith(`/${section}/`) && href.includes(token));
const postLink = (suffix) => `/writing/ai/${token}-${suffix}`;
const projectLink = (suffix) => `/projects/${token}-${suffix}`;
function post(suffix, date, draft = false) {
  create(`src/content/blog/ai/${token}-${suffix}.md`, `---\ntitle: "${token}-${suffix}"\ndescription: "Homepage article fixture"\npublishedAt: ${date}\ncategory: "AI"\ndraft: ${draft}\n---\n`);
}

test('homepage automatically updates latest writing, sorts featured projects and excludes drafts', () => {
  try {
    for (const [suffix, date, draft] of [
      ['one', '2099-01-01', false],
      ['two', '2099-01-02', false],
      ['three', '2099-01-03', false],
      ['four', '2099-01-04', false],
      ['draft', '2100-01-01', true],
    ]) post(suffix, date, draft);
    for (const [suffix, order, featured, draft] of [
      ['one', 2, true, false],
      ['two', 1, true, false],
      ['ordinary', 0, false, false],
      ['draft', -1, true, true],
    ]) {
      create(`src/content/projects/${token}-${suffix}.md`, `---\ntitle: "${token}-${suffix}"\nsummary: "Homepage project fixture"\nstartedAt: 2099-01-01\nstatus: active\norder: ${order}\nfeatured: ${featured}\ndraft: ${draft}\n---\n`);
    }
    const initial = build();
    assert.deepEqual(links(initial, 'writing'), ['four', 'three', 'two'].map(postLink));
    assert.deepEqual(links(initial, 'projects'), ['two', 'one'].map(projectLink));
    assert.ok(initial.includes('2099.01.04'));
    assert.ok(!initial.includes(`${token}-draft`));
    assert.ok(!initial.includes(`${token}-ordinary`));
    assert.equal((initial.match(/<h1\b/g) ?? []).length, 1);
    for (const heading of ['Currently Exploring', 'Selected Projects', 'Latest Writing']) {
      assert.ok(initial.includes(heading));
    }
    assert.ok(!initial.includes('<script'));
    post('new', '2099-12-31');
    const updated = build();
    assert.deepEqual(links(updated, 'writing'), ['new', 'four', 'three'].map(postLink));
    assert.deepEqual(links(updated, 'projects'), ['two', 'one'].map(projectLink));
    assert.ok(updated.includes('2099.12.31'));
    assert.ok(!updated.includes(`${token}-draft`));
  } finally {
    for (const path of temporary) if (existsSync(file(path))) unlinkSync(file(path));
    const clean = build();
    assert.ok(!clean.includes(token));
  }
});
