import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatDate } from '../src/utils/date.ts';
import { calculateReadingTime } from '../src/utils/reading-time.ts';

test('date format handles padding, leap days and timezone offsets', () => {
  assert.equal(formatDate(new Date('2026-10-03')), '2026.10.03');
  assert.equal(formatDate(new Date('2024-02-29')), '2024.02.29');
  assert.equal(formatDate(new Date('2026-01-01T00:30:00+08:00')), '2025.12.31');
  assert.throws(() => formatDate(new Date('invalid')), RangeError);
});

test('reading estimate supports Chinese, English and mixed content', () => {
  assert.equal(calculateReadingTime(''), 0);
  assert.equal(calculateReadingTime('  # --- **  '), 0);
  assert.equal(calculateReadingTime('你好，Astro!'), 1);
  assert.equal(calculateReadingTime('文'.repeat(300)), 1);
  assert.equal(calculateReadingTime('文'.repeat(301)), 2);
  assert.equal(calculateReadingTime('word '.repeat(200)), 1);
  assert.equal(calculateReadingTime('word '.repeat(201)), 2);
  assert.equal(calculateReadingTime('文'.repeat(300) + 'word '.repeat(200)), 2);
});

test('metadata and markup destinations do not inflate reading time', () => {
  const metadata = `---\ntitle: ${'word '.repeat(500)}\n---\n`;
  assert.equal(calculateReadingTime(`${metadata}[Read](https://example.com/path) <span>你好</span>`), 1);
  assert.equal(calculateReadingTime('![image](https://example.com/image.webp)'), 0);
});
