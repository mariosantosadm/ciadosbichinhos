// Feeds RSS para o "publicar automaticamente" do Pinterest: um feed por pasta.
// Cada item traz a imagem do pin (gerada no prebuild em public/pins/<slug>.png) como
// <enclosure> e <media:content>, e o Pinterest cria o pin sozinho quando o post aparece.
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { PINTEREST_BOARDS, PINTEREST_FEED_DESDE, pinterestBoardOf, type PinterestBoard } from '../../lib/pinterest';

export function getStaticPaths() {
  return Object.keys(PINTEREST_BOARDS).map((pasta) => ({ params: { pasta } }));
}

export async function GET(context: APIContext) {
  const pasta = context.params.pasta as PinterestBoard;
  const site = (context.site ?? new URL('https://ciadosbichinhos.com.br')).toString().replace(/\/$/, '');
  const posts = (await getCollection('blog'))
    .filter((p) => p.data.pubDate >= PINTEREST_FEED_DESDE && pinterestBoardOf(p) === pasta)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const items = posts.flatMap((post) => {
    const file = path.join(process.cwd(), 'public', 'pins', `${post.slug}.png`);
    if (!existsSync(file)) return [];
    const imageUrl = `${site}/pins/${post.slug}.png`;
    return [
      {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/blog/${post.slug}/`,
        enclosure: { url: imageUrl, length: statSync(file).size, type: 'image/png' },
        customData: `<media:content url="${imageUrl}" medium="image" type="image/png" width="1000" height="1500" />`,
      },
    ];
  });

  return rss({
    title: `Cia dos Bichinhos — ${PINTEREST_BOARDS[pasta]}`,
    description: `Posts da Cia dos Bichinhos para a pasta ${PINTEREST_BOARDS[pasta]} do Pinterest.`,
    site,
    xmlns: { media: 'http://search.yahoo.com/mrss/' },
    items,
    customData: `<language>pt-br</language>`,
  });
}
