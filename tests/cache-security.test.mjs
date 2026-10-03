import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';

// Resolve from Astro to test the actual transitive dependency used by it.
const requireFromAstro = createRequire(import.meta.resolve('astro/package.json'));
const CachePolicy = requireFromAstro('http-cache-semantics');

const request = { url: 'https://example.com/image', method: 'GET', headers: {} };
const staleRequest = {
  ...request,
  headers: { 'cache-control': 'max-stale=999999' },
};

for (const [name, headers] of [
  ['shared cookie', { 'cache-control': 'max-age=600', 'set-cookie': 'session=private' }],
  ['proxy revalidation', { 'cache-control': 'max-age=600, proxy-revalidate' }],
  ['no-cache', { 'cache-control': 'no-cache, max-age=600' }],
  ['no-store', { 'cache-control': 'no-store' }],
  ['private response', { 'cache-control': 'private, max-age=600' }],
  ['vary wildcard', { 'cache-control': 'max-age=600', vary: '*' }],
]) {
  test(`max-stale cannot bypass ${name}`, () => {
    const policy = new CachePolicy(request, { status: 200, headers });
    assert.equal(policy.satisfiesWithoutRevalidation(staleRequest), false);
    const result = policy.evaluateRequest(staleRequest);
    assert.equal(result.response, undefined);
    assert.equal(result.revalidation.synchronous, true);
    assert.equal(policy.satisfiesWithoutRevalidation({ ...request, headers: { 'cache-control': 'max-stale' } }), false);
    const restored = CachePolicy.fromObject(policy.toObject());
    assert.equal(restored.satisfiesWithoutRevalidation(staleRequest), false);
  });
}

test('ordinary expired public content still accepts max-stale', () => {
  const policy = new CachePolicy(request, {
    status: 200,
    headers: { 'cache-control': 'public, max-age=0' },
  });
  assert.equal(policy.satisfiesWithoutRevalidation(staleRequest), true);
});

test('explicit public cookie opt-in is preserved', () => {
  const policy = new CachePolicy(request, {
    status: 200,
    headers: { 'cache-control': 'public, max-age=600', 'set-cookie': 'public=yes' },
  });
  assert.equal(policy.satisfiesWithoutRevalidation(request), true);
});

test('private cache may reuse its own cookie response', () => {
  const policy = new CachePolicy(request, {
    status: 200,
    headers: { 'cache-control': 'max-age=600', 'set-cookie': 'session=private' },
  }, { shared: false });
  assert.equal(policy.satisfiesWithoutRevalidation(request), true);
});
