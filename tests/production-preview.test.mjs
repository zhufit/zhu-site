import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { preview } from 'astro';

const root = new URL('../', import.meta.url);
const file = path => new URL(path, root);
const token = `preview-check-${randomUUID()}`;
const created = [];
function create(path, content) { writeFileSync(file(path), content); created.push(path); }
function build() {
  const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', '--force'], { cwd: root, encoding: 'utf8', timeout: 60000 });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}
async function request(origin, path) {
  return fetch(new URL(path, origin), { signal: AbortSignal.timeout(10000) });
}
async function crawl(origin, paths) {
  const queue = [...paths];
  const seen = new Set();
  while (queue.length) {
    const path = queue.shift();
    if (seen.has(path)) continue;
    seen.add(path);
    const response = await request(origin, path);
    assert.equal(response.status, 200, path);
    const contentType = response.headers.get('content-type') ?? '';
    if (path.endsWith('.css')) assert.ok(contentType.includes('text/css'), path);
    if (path.endsWith('.svg')) assert.ok(contentType.includes('image/svg+xml'), path);
    const body = await response.text();
    if (!contentType.includes('text/html')) continue;
    assert.ok(body.includes('site-header') && body.includes('site-footer'), path);
    assert.equal((body.match(/<main\b/g) ?? []).length, 1, path);
    assert.ok(!body.includes(`${token}-draft`), path);
    for (const match of body.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const url = new URL(match[1].replaceAll('&amp;', '&'), response.url);
      if (url.origin === origin) queue.push(url.pathname + url.search);
    }
  }
  return seen;
}

test('production preview serves complete static pages/assets and excludes draft routes/links', async () => {
  let server;
  try {
    for (const [suffix, extension, draft] of [['markdown', 'md', false], ['mdx', 'mdx', false], ['draft', 'md', true]]) {
      const body = extension === 'mdx'
        ? "import { SITE } from '../../../config/site';\n\n## Production body\n\n<span>{SITE.name}</span>\n"
        : '## Production body\n\n**Published content**\n\n```java\n// preview code\nclass Example {}\n```\n\n| Key | Value |\n| --- | --- |\n| mode | production |\n\n![Preview image](/favicon.svg)\n';
      create(`src/content/blog/java/${token}-${suffix}.${extension}`, `---\ntitle: "${token}-${suffix}"\ndescription: "Production article"\npublishedAt: 2099-01-01\ncategory: Java\ndraft: ${draft}\n---\n\n${body}`);
      const projectBody = extension === 'mdx' ? body.replace('../../../config/site', '../../config/site') : body;
      create(`src/content/projects/${token}-${suffix}.${extension}`, `---\ntitle: "${token}-${suffix}"\nsummary: "Production project"\nstartedAt: 2099-01-01\nstatus: active\nfeatured: true\ncover: /favicon.svg\ndraft: ${draft}\nrelatedPosts: ["java/${token}-markdown", "java/${token}-mdx", "java/${token}-draft"]\n---\n\n${projectBody}`);
    }
    build();
    server = await preview({ root: fileURLToPath(root), server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
    let origin = `http://127.0.0.1:${server.port}`;
    const seen = await crawl(origin, ['/', '/writing/', '/projects/', '/about/', '/404.html']);
    for (const prefix of ['/writing/java/', '/projects/']) {
      for (const suffix of ['markdown', 'mdx']) {
        const path = `${prefix}${token}-${suffix}`;
        assert.ok(seen.has(path), `Detail not linked: ${path}`);
        const body = await (await request(origin, path)).text();
        assert.ok(body.includes('Production body'));
        assert.ok(body.includes(suffix === 'mdx' ? '<span>ZHU.</span>' : '<strong>Published content</strong>'));
      }
    }
    for (const path of [`/writing/java/${token}-draft`, `/projects/${token}-draft`, `/missing-${token}`]) {
      const response = await request(origin, path);
      assert.equal(response.status, 404, path);
      assert.ok((await response.text()).includes('页面未找到'));
    }
    console.log(`Preview crawl: ${seen.size} pages/assets served successfully, Markdown/MDX details and draft 404 verified.`);
    await server.stop(); server = undefined;
    for (const path of created) unlinkSync(file(path));
    build();
    server = await preview({ root: fileURLToPath(root), server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
    origin = `http://127.0.0.1:${server.port}`;
    await crawl(origin, ['/', '/writing/', '/projects/', '/about/', '/404.html']);
    for (const path of ['/', '/writing/', '/projects/']) {
      assert.ok(!(await (await request(origin, path)).text()).includes(token));
    }
    for (const prefix of ['/writing/java/', '/projects/']) {
      assert.equal((await request(origin, `${prefix}${token}-markdown`)).status, 404);
    }
    assert.ok(readFileSync(file('dist/writing/index.html'), 'utf8').includes('文章正在整理中'));
    assert.ok(readFileSync(file('dist/projects/index.html'), 'utf8').includes('项目记录正在整理中'));
  } finally {
    if (server) await server.stop();
    for (const path of created) if (existsSync(file(path))) unlinkSync(file(path));
    build();
  }
});
