import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const token = `article-check-${randomUUID()}`;
const file = (path) => new URL(path, root);
const temporary = [];
const id = (suffix) => `java/${token}-${suffix}`;
function create(path, content) {
  temporary.push(path);
  writeFileSync(file(path), content);
}
function build() {
  const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', '--force'], {
    cwd: root, encoding: 'utf8', timeout: 60000,
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}
const page = (suffix) => readFileSync(file(`dist/${token}/${id(suffix)}/index.html`), 'utf8');

test('ArticleLayout renders Markdown/MDX, metadata, tags and visible chronological neighbours', () => {
  const route = `src/pages/${token}`;
  mkdirSync(file(route));
  try {
    for (const [suffix, date, draft] of [
      ['old', '2099-01-01', false],
      ['middle', '2099-01-02', false],
      ['new', '2099-01-03', false],
      ['draft', '2100-01-01', true],
    ]) {
      const middle = suffix === 'middle';
      const extra = middle ? 'updatedAt: 2099-02-03\ntags: [Java, "Spring Cloud"]\ncover: "https://images.example.com/article.webp"\n' : '';
      const body = middle
        ? "import { SITE } from '../../../config/site';\n\n## 正文验证\n\n这是 MDX 布局验证。\n\n<span>{SITE.name}</span>\n"
        : '## 正文验证\n\n这是 Markdown 布局验证。\n';
      create(`src/content/blog/java/${token}-${suffix}.${middle ? 'mdx' : 'md'}`, `---\ntitle: "${token}-${suffix}"\ndescription: "文章摘要 & 元信息"\npublishedAt: ${date}\ncategory: "Java"\ndraft: ${draft}\n${extra}---\n\n${body}`);
    }
    create(`${route}/[...id].astro`, `---
import { render } from 'astro:content';
import ArticleLayout from '../../layouts/ArticleLayout.astro';
import { getPublishedPosts, getPostNavigation } from '../../utils/content';
export async function getStaticPaths() {
  return (await getPublishedPosts()).filter(post => post.id.includes('${token}')).map(post => ({ params: { id: post.id }, props: { post } }));
}
const { post } = Astro.props;
const { Content } = await render(post);
const unknown = await getPostNavigation('${token}-missing');
const hidden = await getPostNavigation('java/${token}-draft');
if (unknown.previous || unknown.next || hidden.previous || hidden.next) throw new Error('Unknown/hidden posts must not expose navigation');
---
<ArticleLayout post={post}><Content /></ArticleLayout>
`);
    build();
    const middle = page('middle');
    assert.ok(middle.includes(`rel="prev" href="/writing/${id('old')}"`));
    assert.ok(middle.includes(`rel="next" href="/writing/${id('new')}"`));
    assert.ok(middle.includes('2099.01.02') && middle.includes('2099.02.03'));
    assert.ok(middle.includes('datetime="2099-02-03T00:00:00.000Z"'));
    assert.ok(middle.includes('1 min read'));
    assert.ok(middle.includes('文章摘要 &amp; 元信息'));
    assert.ok(middle.includes('#Java') && middle.includes('#Spring Cloud'));
    assert.ok(middle.includes('这是 MDX 布局验证。') && middle.includes('<span>ZHU.</span>'));
    assert.ok(middle.includes('property="og:type" content="article"'));
    assert.ok(middle.includes('property="og:image" content="https://images.example.com/article.webp"'));
    assert.ok(middle.includes(`title>${token}-middle - ZHU.</title>`));
    const newest = page('new');
    assert.ok(newest.includes(`rel="prev" href="/writing/${id('middle')}"`));
    assert.ok(!newest.includes('rel="next"'));
    const oldest = page('old');
    assert.ok(oldest.includes(`rel="next" href="/writing/${id('middle')}"`));
    assert.ok(!oldest.includes('更新于') && !oldest.includes('aria-label="文章标签"'));
    assert.ok(oldest.includes('这是 Markdown 布局验证。'));
    for (const html of [middle, newest, oldest]) {
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
      assert.equal((html.match(/<main\b/g) ?? []).length, 1);
      assert.ok(html.includes('article-width'));
      assert.ok(html.includes('上一篇') || html.includes('下一篇'));
      assert.ok(!html.includes(`${token}-draft`));
      assert.ok(!html.includes('<script'));
    }
    assert.equal(existsSync(file(`dist/${token}/${id('draft')}/index.html`)), false);
  } finally {
    for (const path of temporary) if (existsSync(file(path))) unlinkSync(file(path));
    rmdirSync(file(route));
    build();
    assert.equal(existsSync(file(`dist/${token}`)), false);
  }
});
