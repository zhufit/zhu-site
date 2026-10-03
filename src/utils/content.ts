import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;
export type Project = CollectionEntry<'projects'>;

function compareId(a: { id: string }, b: { id: string }): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

// Development previews drafts. All production queries use the same visibility rule.
function isVisible(entry: { data: { draft: boolean } }): boolean {
  return import.meta.env.DEV || !entry.data.draft;
}

export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', isVisible);
  return posts.sort((a, b) =>
    b.data.publishedAt.getTime() - a.data.publishedAt.getTime() || compareId(a, b));
}

export async function getLatestPosts(limit: number): Promise<Post[]> {
  if (!Number.isInteger(limit) || limit < 0) {
    throw new RangeError('Post limit must be a non-negative integer.');
  }
  return (await getPublishedPosts()).slice(0, limit);
}

export async function getFeaturedPosts(): Promise<Post[]> {
  return (await getPublishedPosts()).filter((post) => post.data.featured);
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  return (await getPublishedPosts()).filter((post) => post.data.category === category);
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  return (await getPublishedPosts()).filter((post) => post.data.tags.includes(tag));
}

export async function getPublishedProjects(): Promise<Project[]> {
  const projects = await getCollection('projects', isVisible);
  return projects.sort((a, b) =>
    a.data.order - b.data.order ||
    b.data.startedAt.getTime() - a.data.startedAt.getTime() || compareId(a, b));
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getPublishedProjects()).filter((project) => project.data.featured);
}

// Hidden drafts and unknown IDs both return undefined in production.
export async function getProjectById(id: string): Promise<Project | undefined> {
  return (await getPublishedProjects()).find((project) => project.id === id);
}

/** Resolve related IDs in editorial order, omitting duplicates and invisible/missing posts. */
export async function getRelatedPosts(ids: readonly string[]): Promise<Post[]> {
  if (ids.length === 0) return [];
  const posts = new Map((await getPublishedPosts()).map((post) => [post.id, post]));
  return [...new Set(ids)].flatMap((id) => {
    const post = posts.get(id);
    return post ? [post] : [];
  });
}

/** Previous means older; next means newer in the visible, date-descending sequence. */
export async function getPostNavigation(id: string): Promise<{ previous?: Post; next?: Post }> {
  const posts = await getPublishedPosts();
  const index = posts.findIndex((post) => post.id === id);
  if (index < 0) return {};
  return { previous: posts[index + 1], next: index > 0 ? posts[index - 1] : undefined };
}
