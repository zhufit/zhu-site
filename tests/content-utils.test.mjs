import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { dev } from 'astro';

const root = new URL('../', import.meta.url);
const token = `utils-check-${randomUUID()}`;
const file = (path) => new URL(path, root);
const temporary = [];
function create(path, text) {
  temporary.push(path);
  writeFileSync(file(path), text);
}
function build() {
  const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', '--force'], {
    cwd: root, encoding: 'utf8', timeout: 60000,
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}

test('production hides drafts across queries while development previews them', async () => {
  let server;
  const postId = (suffix) => `java/${token}-${suffix}`;
  const projectId = (suffix) => `${token}-${suffix}`;
  try {
    for (const [suffix, publishedAt, featured, draft, tagged] of [
      ['a', '2099-01-01', true, false, true],
      ['b', '2099-01-01', false, false, false],
      ['c', '2100-01-01', true, true, true],
    ]) {
      create(`src/content/blog/java/${token}-${suffix}.md`, `---\ntitle: "${suffix}"\ndescription: "Query fixture"\npublishedAt: ${publishedAt}\ncategory: "${token}"\ntags: ${tagged ? `["${token}"]` : '[]'}\nfeatured: ${featured}\ndraft: ${draft}\n---\n`);
    }
    for (const [suffix, order, startedAt, draft, featured] of [
      ['a', 1, '2099-01-01', false, true],
      ['b', 1, '2098-01-01', false, false],
      ['c', 0, '2097-01-01', false, true],
      ['d', 0, '2100-01-01', true, true],
    ]) {
      create(`src/content/projects/${token}-${suffix}.md`, `---\ntitle: "${suffix}"\nsummary: "Query fixture"\nstartedAt: ${startedAt}\nstatus: active\norder: ${order}\ndraft: ${draft}\nfeatured: ${featured}\n---\n`);
    }
    create(`src/pages/${token}.json.ts`, `import * as content from '../utils/content';
export const prerender = true;
const ids = entries => entries.filter(entry => entry.id.includes('${token}')).map(entry => entry.id);
export async function GET() {
  const invalidLimits = await Promise.all([-1, 1.5, Infinity, NaN].map(async limit => {
    try { await content.getLatestPosts(limit); return false; }
    catch (error) { return error instanceof RangeError; }
  }));
  return new Response(JSON.stringify({
    posts: ids(await content.getPublishedPosts()),
    latest: ids(await content.getLatestPosts(2)),
    emptyLatest: (await content.getLatestPosts(0)).length,
    featuredPosts: ids(await content.getFeaturedPosts()),
    category: ids(await content.getPostsByCategory('${token}')),
    tag: ids(await content.getPostsByTag('${token}')),
    missingCategory: (await content.getPostsByCategory('${token}-unknown')).length,
    missingTag: (await content.getPostsByTag('${token}-unknown')).length,
    projects: ids(await content.getPublishedProjects()),
    featuredProjects: ids(await content.getFeaturedProjects()),
    project: (await content.getProjectById('${projectId('a')}'))?.id ?? null,
    draftProject: (await content.getProjectById('${projectId('d')}'))?.id ?? null,
    unknownProject: (await content.getProjectById('${token}-unknown'))?.id ?? null,
    invalidLimits,
  }));
}
`);
    function verify(data, development) {
      const posts = development ? ['c', 'a', 'b'] : ['a', 'b'];
      assert.deepEqual(data.posts, posts.map(postId));
      assert.deepEqual(data.latest, posts.slice(0, 2).map(postId));
      assert.equal(data.emptyLatest, 0);
      assert.deepEqual(data.featuredPosts, (development ? ['c', 'a'] : ['a']).map(postId));
      assert.deepEqual(data.category, posts.map(postId));
      assert.deepEqual(data.tag, (development ? ['c', 'a'] : ['a']).map(postId));
      assert.equal(data.missingCategory, 0);
      assert.equal(data.missingTag, 0);
      assert.deepEqual(data.projects, (development ? ['d', 'c', 'a', 'b'] : ['c', 'a', 'b']).map(projectId));
      assert.deepEqual(data.featuredProjects, (development ? ['d', 'c', 'a'] : ['c', 'a']).map(projectId));
      assert.equal(data.project, projectId('a'));
      assert.equal(data.draftProject, development ? projectId('d') : null);
      assert.equal(data.unknownProject, null);
      assert.deepEqual(data.invalidLimits, [true, true, true, true]);
    }
    build();
    verify(JSON.parse(readFileSync(file(`dist/${token}.json`), 'utf8')), false);
    server = await dev({ root, server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
    const response = await fetch(`http://127.0.0.1:${server.address.port}/${token}.json`);
    assert.equal(response.status, 200);
    verify(await response.json(), true);
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    if (server) await server.stop();
    for (const path of temporary) if (existsSync(file(path))) unlinkSync(file(path));
    build();
    assert.equal(existsSync(file(`dist/${token}.json`)), false);
  }
});
