import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');

  return rss({
    title: 'Cia dos Bichinhos',
    description: 'Cuidados, alimentação e comportamento pra cachorros e gatos.',
    site: context.site ?? 'https://ciadosbichinhos.com.br',
    items: posts
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/blog/${post.slug}/`,
        categories: [post.data.category],
      })),
    customData: `<language>pt-br</language>`,
  });
}
