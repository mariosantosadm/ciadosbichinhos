import type { CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'blog'>;

const byDateDesc = (a: Post, b: Post) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

// "Mais lidos" — sem analytics ainda, usamos os mais recentes como proxy.
// Trocar por dados reais de pageviews assim que houver integração de analytics.
export function getMaisLidos(posts: Post[], limit = 5): Post[] {
  return [...posts].sort(byDateDesc).slice(0, limit);
}

function sameSpecies(a: Post, b: Post): boolean {
  return a.data.species === b.data.species || a.data.species === 'ambos' || b.data.species === 'ambos';
}

// Mesma categoria pesa mais que mesma espécie; "ambos" entra como candidato, mas sem pontuar pela espécie.
function relevance(a: Post, b: Post): number {
  return (a.data.category === b.data.category ? 2 : 0) + (a.data.species === b.data.species ? 1 : 0);
}

/**
 * Posts relacionados: mesma categoria ou mesma espécie, ordenados por relevância e, no empate, pelos mais recentes.
 * Evita repetir o que já aparece na sidebar ("Mais lidos"), a não ser que faltem candidatos.
 */
export function getRelatedPosts(post: Post, posts: Post[], limit = 3): Post[] {
  const sidebarSlugs = new Set(getMaisLidos(posts).map((p) => p.slug));
  const candidates = posts
    .filter((p) => p.slug !== post.slug)
    .filter((p) => p.data.category === post.data.category || sameSpecies(p, post))
    .sort((a, b) => relevance(b, post) - relevance(a, post) || byDateDesc(a, b));

  const fresh = candidates.filter((p) => !sidebarSlugs.has(p.slug));
  const fallback = candidates.filter((p) => sidebarSlugs.has(p.slug));
  return [...fresh, ...fallback].slice(0, limit);
}
