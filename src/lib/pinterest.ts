import type { CollectionEntry } from 'astro:content';

// Pastas que existem na conta do Pinterest (conferidas em 23/11/2026).
export const PINTEREST_BOARDS = {
  alimentacao: 'Alimentação',
  comportamento: 'Comportamento',
  'cuidados-e-higiene': 'Cuidados e Higiene',
  'saude-e-seguranca': 'Saúde e Segurança',
} as const;

export type PinterestBoard = keyof typeof PINTEREST_BOARDS;

// Só entram nos feeds posts publicados a partir desta data. Os anteriores já foram
// pinados à mão; incluí-los faria o Pinterest criar pins duplicados.
export const PINTEREST_FEED_DESDE = new Date('2026-11-23T00:00:00Z');

// Pasta do post: a do frontmatter (pinBoard) ou, se não houver, uma padrão pela categoria.
export function pinterestBoardOf(post: CollectionEntry<'blog'>): PinterestBoard {
  if (post.data.pinBoard) return post.data.pinBoard;
  switch (post.data.category) {
    case 'alimentacao':
      return 'alimentacao';
    case 'comportamento':
      return 'comportamento';
    case 'cuidados':
      return 'cuidados-e-higiene';
    default:
      return 'saude-e-seguranca';
  }
}
