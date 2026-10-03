import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dev, preview } from 'astro';

const root = new URL('../', import.meta.url);
const token = `route-check-${randomUUID()}`;
const file = (path) => new URL(path, root);
function build() {
  const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', '--force'], {
    cwd: root, encoding: 'utf8', timeout: 60000,
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}

test('real article routes preserve content IDs, render MD/MDX and isolate drafts', async () => {
  const fixtures = [
    { id: `spring/${token}-markdown`, ext: 'md', draft: false },
    { id: `ai/${token}-mdx`, ext: 'mdx', draft: false },
    { id: `${token}-root`, ext: 'md', draft: false },
    { id: `spring/${token}-draft`, ext: 'md', draft: true },
    { id: `ai/${token}-draft-mdx`, ext: 'mdx', draft: true },
  ];
  const created = [];
  let server;
  const previousNodeEnv = process.env.NODE_ENV;
  try {
    for (const entry of fixtures) {
      const path = `src/content/blog/${entry.id}.${entry.ext}`;
      const body = entry.ext === 'mdx'
        ? "import { SITE } from '../../../config/site';\n\n## Route body\n\n<span>{SITE.name}</span>\n\n```java\n// MDX comment\nclass Example {}\n```\n\n| Key | Value |\n| --- | --- |\n| mode | active |\n"
        : [
          '## Route body', '**Markdown rendered**',
          '### 中文长文章', '系统设计与技术实践。'.repeat(150),
          '[参考链接](https://example.com) 与 `inlineCode`',
          '- 第一项\n  - 嵌套项\n- 第二项', '1. 有序列表\n2. 后续步骤',
          '> 引用内容\n>\n> 引用的第二段',
          '```java\npublic class Example { String value = "' + 'long-code-'.repeat(30) + '"; }\n```',
          '```shell\necho "build complete"\n```',
          '```json\n{"status": "active", "items": [1, 2, 3]}\n```',
          '![架构图示例](/favicon.svg)',
          '| 模块 | 职责 | 输入 | 输出 | 状态 | 负责人 | 备注 |\n| --- | --- | --- | --- | --- | --- | --- |\n| Gateway | 转发 | 请求 | 响应 | active | Zhu | ' + 'long-table-value-'.repeat(20) + ' |',
          '---',
        ].join('\n\n');
      writeFileSync(file(path), `---\ntitle: "${entry.id}"\ndescription: "Route fixture"\npublishedAt: 2099-01-01\ncategory: "Routes"\ndraft: ${entry.draft}\n---\n\n${body}`);
      created.push(path);
    }
    build();
    const listing = readFileSync(file('dist/writing/index.html'), 'utf8');
    for (const entry of fixtures) {
      const output = file(`dist/writing/${entry.id}/index.html`);
      assert.equal(existsSync(output), !entry.draft, entry.id);
      assert.equal(listing.includes(`href="/writing/${entry.id}"`), !entry.draft);
      if (!entry.draft) {
        const html = readFileSync(output, 'utf8');
        assert.ok(html.includes('Route body'));
        assert.ok(html.includes(entry.ext === 'mdx' ? '<span>ZHU.</span>' : '<strong>Markdown rendered</strong>'));
        assert.ok(html.includes('aria-current="location"'));
        assert.match(html, /<pre[^>]*tabindex="0"/);
        assert.match(html, /<table[^>]*tabindex="0"/);
        assert.ok(html.includes('aria-label="代码块"'));
        assert.ok(html.includes('aria-label="数据表格"'));
        assert.ok(html.includes('github-dark-high-contrast'));
        assert.ok(html.includes('class="skip-link"'));
        assert.match(html, /<main[^>]*tabindex="-1"/);
        if (entry.ext === 'md') {
          for (const element of ['<h2', '<h3', '<p', '<ul', '<ol', '<blockquote', '<code', '<pre', '<img', '<table', '<hr']) {
            assert.ok(html.includes(element), `Missing rendered ${element}`);
          }
          for (const language of ['java', 'shell', 'json']) assert.ok(html.includes(`data-language="${language}"`));
          assert.ok(html.includes('alt="架构图示例"'));
          assert.ok(html.includes('href="https://example.com"'));
        }
        for (const draft of fixtures.filter((item) => item.draft)) assert.ok(!html.includes(draft.id));
      }
    }
    server = await preview({ root: fileURLToPath(root), server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
    for (const entry of fixtures) {
      const response = await fetch(`http://127.0.0.1:${server.port}/writing/${entry.id}`, { signal: AbortSignal.timeout(10000) });
      assert.equal(response.status, entry.draft ? 404 : 200, entry.id);
    }
    await server.stop();
    server = undefined;
    process.env.NODE_ENV = 'development';
    server = await dev({ root: fileURLToPath(root), server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
    for (const entry of fixtures) {
      const response = await fetch(`http://127.0.0.1:${server.address.port}/writing/${entry.id}`, { signal: AbortSignal.timeout(10000) });
      assert.equal(response.status, 200, entry.id);
      assert.ok((await response.text()).includes('Route body'));
    }
    const missing = await fetch(`http://127.0.0.1:${server.address.port}/writing/${token}-missing`, { signal: AbortSignal.timeout(10000) });
    assert.equal(missing.status, 404);
  } finally {
    if (server) await server.stop();
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
    for (const path of created) if (existsSync(file(path))) unlinkSync(file(path));
    build();
    for (const entry of fixtures) assert.equal(existsSync(file(`dist/writing/${entry.id}/index.html`)), false);
  }
});
