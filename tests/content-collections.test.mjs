import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const token = `collection-check-${randomUUID()}`;
const file = (path) => new URL(path, root);
const build = () => spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', '--force'], {
  cwd: root, encoding: 'utf8', timeout: 60000,
});
const output = (result) => `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
const remove = (path) => { if (existsSync(file(path))) unlinkSync(file(path)); };

test('collections load, render, default fields and reject invalid Frontmatter during build', () => {
  const endpoint = `src/pages/${token}.json.ts`;
  const page = `src/pages/${token}.astro`;
  const photo = `src/content/photography/${token}.md`;
  const badBlog = `src/content/blog/java/${token}.md`;
  const badProject = `src/content/projects/${token}.md`;
  const temporary = [endpoint, page, photo, badBlog, badProject];
  try {
    writeFileSync(file(endpoint), `import { getCollection } from 'astro:content';
export const prerender = true;
export async function GET() {
  const collections = await Promise.all(['blog', 'projects', 'photography'].map(async name =>
    [name, (await getCollection(name)).map(entry => ({ id: entry.id, data: entry.data }))]));
  return new Response(JSON.stringify(Object.fromEntries(collections)));
}
`);
    writeFileSync(file(page), `---
import { getCollection, render } from 'astro:content';
const entries = [...await getCollection('blog'), ...await getCollection('projects')];
const contents = await Promise.all(entries.map(async entry => (await render(entry)).Content));
---
<html><body>{contents.map(Content => <Content />)}</body></html>
`);
    writeFileSync(file(photo), '---\ntitle: "Reserved photography test"\npublishedAt: 2026-10-03\ncover: "/test.webp"\n---\n');
    const valid = build();
    assert.equal(valid.status, 0, output(valid));
    const data = JSON.parse(readFileSync(file(`dist/${token}.json`), 'utf8'));
    const blog = data.blog.find(entry => entry.id === 'java/content-schema-example');
    assert.ok(blog, 'nested content ID must be preserved');
    assert.deepEqual(blog.data.tags, []);
    assert.equal(blog.data.featured, false);
    assert.equal(blog.data.draft, true);
    assert.match(blog.data.publishedAt, /^2026-10-03T/);
    const project = data.projects.find(entry => entry.id === 'content-schema-example');
    assert.equal(project.data.order, 0);
    assert.equal(project.data.featured, false);
    assert.equal(project.data.status, 'exploring');
    assert.equal(data.photography[0].data.draft, false);
    assert.deepEqual(data.photography[0].data.photos, []);
    const html = readFileSync(file(`dist/${token}/index.html`), 'utf8');
    assert.ok(html.includes('Markdown 内容验证'));
    assert.ok(html.includes('MDX 内容验证'));
    assert.ok(html.includes('<span>ZHU.</span>'), 'MDX import/expression must render');
    remove(photo);

    const baseBlog = 'title: "Invalid test"\ndescription: "Test"\npublishedAt: 2026-10-03\ncategory: "Java"\n';
    for (const [path, frontmatter, field] of [
      [badBlog, baseBlog.replace('title: "Invalid test"\n', ''), 'title'],
      [badBlog, baseBlog.replace('2026-10-03', 'not-a-date'), 'publishedAt'],
      [badBlog, `${baseBlog}draft: "true"\n`, 'draft'],
      [badProject, 'title: "Invalid test"\nsummary: "Test"\nstartedAt: 2026-10-03\nstatus: unknown\n', 'status'],
      [photo, 'title: "Invalid photo"\npublishedAt: 2026-10-03\ncover: "/test.webp"\nphotos:\n  - src: "/test.webp"\n', 'alt'],
    ]) {
      writeFileSync(file(path), `---\n${frontmatter}---\n`);
      const invalid = build();
      assert.equal(invalid.status, 1, `Expected ${field} validation failure:\n${output(invalid)}`);
      assert.ok(output(invalid).includes(field), output(invalid));
      remove(path);
    }
  } finally {
    for (const path of temporary) remove(path);
    // Restore a clean production build even when a validation assertion fails.
    const clean = build();
    assert.equal(clean.status, 0, output(clean));
    assert.equal(existsSync(file(`dist/${token}.json`)), false);
    assert.equal(existsSync(file(`dist/${token}/index.html`)), false);
  }
});
