import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const token = `projects-check-${randomUUID()}`;
const file = (path) => new URL(path, root);
const temporary = [];
function project(suffix, order, date, status, draft = false, extra = '') {
  const path = `src/content/projects/${token}/${suffix}.md`;
  writeFileSync(file(path), `---\ntitle: "${token}-${suffix}"\nsummary: "项目实践 & 探索"\nstartedAt: "${date}"\nstatus: ${status}\norder: ${order}\ndraft: ${draft}\n${extra}---\n`);
  temporary.push(path);
}
function build() {
  const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', '--force'], {
    cwd: root, encoding: 'utf8', timeout: 60000,
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  return readFileSync(file('dist/projects/index.html'), 'utf8');
}
const fixtureLinks = (html) => Array.from(html.matchAll(/href="([^"]+)"/g), match => match[1])
  .filter(href => href.startsWith(`/projects/${token}/`));
const links = (...suffixes) => suffixes.map(suffix => `/projects/${token}/${suffix}`);

test('Projects lists every visible project with stable order, metadata and nested links', () => {
  mkdirSync(file(`src/content/projects/${token}`));
  try {
    project('a', 1, '2099-01-01', 'active', false, 'techStack: [Java, Spring Boot]\n');
    project('b', 1, '2099-01-01', 'paused');
    project('older', 1, '2098-01-01', 'completed', false, 'endedAt: 2099-01-02\n');
    project('first', -1, '2090-01-01', 'exploring');
    project('last', 2, '2100-01-01', 'archived');
    project('draft', -2, '2101-01-01', 'active', true);
    const initial = build();
    assert.deepEqual(fixtureLinks(initial), links('first', 'a', 'b', 'older', 'last'));
    assert.ok(!initial.includes(`${token}-draft`));
    for (const status of ['探索中', '进行中', '已暂停', '已完成', '已归档']) assert.ok(initial.includes(status));
    assert.ok(initial.includes('Java / Spring Boot'));
    assert.ok(initial.includes('项目实践 &amp; 探索'));
    assert.ok(initial.includes('2099.01.02'));
    assert.ok(initial.includes('datetime="2099-01-02T00:00:00.000Z"'));
    assert.match(initial, /href="\/projects"[^>]*aria-current="page"/);
    assert.equal((initial.match(/<h1\b/g) ?? []).length, 1);
    assert.ok(initial.includes('<title>Projects - ZHU.</title>'));
    assert.ok(!initial.includes('<script'));
    project('new', -3, '2102-01-01', 'active');
    assert.deepEqual(fixtureLinks(build()), links('new', 'first', 'a', 'b', 'older', 'last'));
    unlinkSync(file(`src/content/projects/${token}/b.md`));
    assert.deepEqual(fixtureLinks(build()), links('new', 'first', 'a', 'older', 'last'));
    assert.equal(existsSync(file(`dist/projects/${token}/b/index.html`)), false);
    project('a', 1, '2099-01-01', 'active', true);
    assert.deepEqual(fixtureLinks(build()), links('new', 'first', 'older', 'last'));
    assert.equal(existsSync(file(`dist/projects/${token}/a/index.html`)), false);
  } finally {
    for (const path of temporary) if (existsSync(file(path))) unlinkSync(file(path));
    rmdirSync(file(`src/content/projects/${token}`));
    assert.ok(!build().includes(token));
  }
});
