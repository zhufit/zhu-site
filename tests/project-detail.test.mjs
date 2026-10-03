import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dev, preview } from 'astro';

const root = new URL('../', import.meta.url);
const token = `project-detail-${randomUUID()}`;
const file = path => new URL(path, root);
const created = [];
function create(path, content) { writeFileSync(file(path), content); created.push(path); }
function build() {
  const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', '--force'], { cwd: root, encoding: 'utf8', timeout: 60000 });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}
const projectId = suffix => `${token}/${suffix}`;
const postId = suffix => `java/${token}-${suffix}`;
const page = suffix => readFileSync(file(`dist/projects/${projectId(suffix)}/index.html`), 'utf8');

test('project details render MD/MDX, optional facts and ordered visible related posts', async () => {
  let server;
  const previousNodeEnv = process.env.NODE_ENV;
  mkdirSync(file(`src/content/projects/${token}`));
  try {
    for (const [suffix, date, draft] of [['old', '2098-01-01', false], ['new', '2099-01-01', false], ['hidden', '2100-01-01', true]]) {
      create(`src/content/blog/${postId(suffix)}.md`, `---\ntitle: "${postId(suffix)}"\ndescription: "Related article"\npublishedAt: ${date}\ncategory: Java\ndraft: ${draft}\n---\nArticle body\n`);
    }
    for (const suffix of ['markdown', 'mdx', 'draft']) {
      const extra = suffix === 'markdown'
        ? `endedAt: 2099-02-01\ncover: /favicon.svg\ntechStack: [Java, Spring Boot]\nrelatedPosts: ${JSON.stringify(['old', 'new', 'old', 'hidden', 'missing'].map(postId))}\n`
        : `relatedPosts: ${JSON.stringify([postId('hidden'), postId('missing')])}\n`;
      const body = suffix === 'mdx' ? "import { SITE } from '../../../config/site';\n\n## MDX body\n\n<span>{SITE.name}</span>" : '## Markdown body\n\n**Project content**';
      create(`src/content/projects/${projectId(suffix)}.${suffix === 'mdx' ? 'mdx' : 'md'}`, `---\ntitle: "${projectId(suffix)}"\nsummary: "项目说明 & 实践"\nstartedAt: 2099-01-01\nstatus: active\ndraft: ${suffix === 'draft'}\n${extra}---\n\n${body}\n`);
    }
    build();
    const markdown = page('markdown');
    assert.ok(markdown.includes('<strong>Project content</strong>'));
    assert.ok(markdown.includes('项目说明 &amp; 实践'));
    assert.ok(markdown.includes('进行中') && markdown.includes('2099.02.01'));
    assert.ok(markdown.includes('datetime="2099-02-01T00:00:00.000Z"'));
    assert.ok(markdown.includes('Java') && markdown.includes('Spring Boot'));
    assert.ok(markdown.includes(`alt="${projectId('markdown')} 项目封面"`));
    assert.ok(markdown.includes('property="og:image"') === false); // Relative cover needs a configured site URL for OG.
    const relatedLinks = Array.from(markdown.matchAll(/href="([^"]+)"/g), match => match[1]).filter(href => href.startsWith(`/writing/java/${token}`));
    assert.deepEqual(relatedLinks, ['old', 'new'].map(suffix => `/writing/${postId(suffix)}`));
    assert.ok(!markdown.includes(postId('hidden')) && !markdown.includes(postId('missing')));
    const mdx = page('mdx');
    assert.ok(mdx.includes('<span>ZHU.</span>'));
    for (const absent of ['related-writing-title', '<dt>技术栈</dt>', '项目封面', '2099.02.01']) assert.ok(!mdx.includes(absent));
    for (const html of [markdown, mdx]) {
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
      assert.equal((html.match(/<main\b/g) ?? []).length, 1);
      assert.ok(html.includes('aria-current="location"'));
      assert.ok(!html.includes('<script'));
    }
    assert.equal(existsSync(file(`dist/projects/${projectId('draft')}/index.html`)), false);
    server = await preview({ root: fileURLToPath(root), server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
    for (const suffix of ['markdown', 'mdx', 'draft', 'missing']) {
      const response = await fetch(`http://127.0.0.1:${server.port}/projects/${projectId(suffix)}`, { signal: AbortSignal.timeout(10000) });
      assert.equal(response.status, ['draft', 'missing'].includes(suffix) ? 404 : 200);
    }
    await server.stop(); server = undefined;
    process.env.NODE_ENV = 'development';
    server = await dev({ root: fileURLToPath(root), server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
    const response = await fetch(`http://127.0.0.1:${server.address.port}/projects/${projectId('draft')}`, { signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, 200);
    assert.ok((await response.text()).includes(`/writing/${postId('hidden')}`));
  } finally {
    if (server) await server.stop();
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previousNodeEnv;
    for (const path of created) if (existsSync(file(path))) unlinkSync(file(path));
    rmdirSync(file(`src/content/projects/${token}`));
    build();
    assert.equal(existsSync(file(`dist/projects/${token}`)), false);
  }
});
