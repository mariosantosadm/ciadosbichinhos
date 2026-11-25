// CSV para "Criar Pins em massa" / "Importar conteúdo > Carregar arquivo .csv" do Pinterest.
// Uma linha por post publicado a partir de PINTEREST_FEED_DESDE que tenha pin gerado.
// Colunas no formato do modelo do Pinterest: Title, Media URL, Pinterest board, Thumbnail,
// Description, Link, Publish date, Keywords.
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { PINTEREST_BOARDS, PINTEREST_FEED_DESDE, pinterestBoardOf } from '../../lib/pinterest';

function csv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET(context: APIContext) {
  const site = (context.site ?? new URL('https://ciadosbichinhos.com.br')).toString().replace(/\/$/, '');
  const posts = (await getCollection('blog'))
    .filter((p) => p.data.pubDate >= PINTEREST_FEED_DESDE)
    .filter((p) => existsSync(path.join(process.cwd(), 'public', 'pins', `${p.slug}.png`)))
    .sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());

  const header = ['Title', 'Media URL', 'Pinterest board', 'Thumbnail', 'Description', 'Link', 'Publish date', 'Keywords'];
  const rows = posts.map((p) =>
    [
      p.data.pinterestTitle ?? p.data.title,
      `${site}/pins/${p.slug}.png`,
      PINTEREST_BOARDS[pinterestBoardOf(p)],
      '',
      p.data.pinterestDescription ?? p.data.description,
      `${site}/blog/${p.slug}/`,
      '',
      p.data.tags.slice(0, 3).join(', '),
    ]
      .map(csv)
      .join(','),
  );

  return new Response([header.map(csv).join(','), ...rows].join('\n') + '\n', {
    headers: { 'Content-Type': 'text/csv; charset=utf-8' },
  });
}
