import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = resolve(root, 'dist');
for (const path of ['index.html', 'writing/index.html', 'projects/index.html', 'about/index.html', '404.html']) {
  assert.ok(existsSync(resolve(dist, path)), `Missing required page: ${path}`);
}
assert.ok(existsSync(resolve(dist, '_astro')) && readdirSync(resolve(dist, '_astro')).length > 0, 'Missing bundled assets');

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}
function localTarget(url) {
  const path = resolve(dist, `.${decodeURIComponent(url.pathname)}`);
  assert.ok(path === dist || path.startsWith(dist + sep), `Reference escapes dist: ${url.pathname}`);
  return [path, resolve(path, 'index.html'), `${path}.html`].find(candidate => existsSync(candidate) && statSync(candidate).isFile());
}
let references = 0;
const pages = files(dist).filter(path => path.endsWith('.html'));
for (const path of pages) {
  const html = readFileSync(path, 'utf8');
  const label = relative(dist, path);
  assert.equal((html.match(/<main\b/g) ?? []).length, 1, `${label}: main count`);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${label}: h1 count`);
  assert.ok(!/qa-result|qa-responsive/.test(html), `${label}: leaked QA content`);
  const base = new URL(label.replace(/index\.html$/, ''), 'https://build-check.invalid/');
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = new URL(match[1].replaceAll('&amp;', '&'), base);
    if (url.origin !== base.origin) continue;
    const target = localTarget(url);
    assert.ok(target, `${label}: missing local target ${url.pathname}`);
    if (url.hash && target.endsWith('.html')) {
      const fragment = decodeURIComponent(url.hash.slice(1));
      const content = readFileSync(target, 'utf8');
      assert.ok(content.includes(`id="${fragment}"`), `${label}: missing anchor ${url.hash}`);
    }
    references++;
  }
}
console.log(`Build artifacts verified: ${pages.length} HTML pages, ${references} local references, bundled assets present.`);
