/** Basic estimate in minutes: 300 Chinese characters or 200 Latin words per minute. */
export function calculateReadingTime(content: string): number {
  const text = content
    .replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, '');
  const chineseCharacters = text.match(/\p{Script=Han}/gu)?.length ?? 0;
  const words = text.replace(/\p{Script=Han}/gu, ' ').match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length ?? 0;
  const minutes = chineseCharacters / 300 + words / 200;
  return minutes === 0 ? 0 : Math.max(1, Math.ceil(minutes));
}
