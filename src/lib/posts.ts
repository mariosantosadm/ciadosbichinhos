import type { CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'blog'>;

const byDateDesc = (a: Post, b: Post) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

// Bloco "Posts recentes" da sidebar. Se um dia virar "Mais lidos", precisa de pageviews reais.
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

// Hash estável (FNV-1a): o mesmo par de posts sempre gera o mesmo número, então a escolha
// não muda entre builds, mas se espalha entre todos os candidatos.
function pairHash(a: string, b: string): number {
  let h = 0x811c9dc5;
  for (const ch of `${a}|${b}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/**
 * Posts relacionados: mesma categoria ou mesma espécie, ordenados por relevância.
 * O desempate não favorece os mais recentes (eles já recebem links da sidebar em todas as
 * páginas); usa um hash estável do par, para os posts antigos também receberem links internos.
 * Evita repetir o que já aparece na sidebar, a não ser que faltem candidatos.
 */
export function getRelatedPosts(post: Post, posts: Post[], limit = 3): Post[] {
  const sidebarSlugs = new Set(getMaisLidos(posts).map((p) => p.slug));
  const candidates = posts
    .filter((p) => p.slug !== post.slug)
    .filter((p) => p.data.category === post.data.category || sameSpecies(p, post))
    .sort(
      (a, b) =>
        relevance(b, post) - relevance(a, post) || pairHash(post.slug, a.slug) - pairHash(post.slug, b.slug)
    );

  const fresh = candidates.filter((p) => !sidebarSlugs.has(p.slug));
  const fallback = candidates.filter((p) => sidebarSlugs.has(p.slug));
  return [...fresh, ...fallback].slice(0, limit);
}
