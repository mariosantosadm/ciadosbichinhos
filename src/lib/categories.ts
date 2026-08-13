export type CategorySlug = 'cachorro' | 'gato' | 'cuidados' | 'alimentacao' | 'comportamento';

export interface CategoryMeta {
  slug: CategorySlug;
  label: string;
  descriptor: string;
  metaDescription: string;
  bg: string;
  text: string;
}

export const categories: Record<CategorySlug, CategoryMeta> = {
  cachorro: {
    slug: 'cachorro',
    label: 'Cachorro',
    descriptor: 'Dicas, cuidados e curiosidades pra quem tem um cão em casa.',
    metaDescription:
      'Tudo sobre cachorros: cuidados, alimentação, comportamento e curiosidades pra tutores de cão no Cia dos Bichinhos.',
    bg: '#DCEFE3',
    text: '#145C3F',
  },
  gato: {
    slug: 'gato',
    label: 'Gato',
    descriptor: 'Dicas, cuidados e curiosidades pra quem tem um gato em casa.',
    metaDescription:
      'Tudo sobre gatos: cuidados, alimentação, comportamento e curiosidades pra tutores de felinos no Cia dos Bichinhos.',
    bg: '#DCEAF6',
    text: '#1B4F78',
  },
  cuidados: {
    slug: 'cuidados',
    label: 'Cuidados',
    descriptor: 'Saúde, sintomas e prevenção pra cachorros e gatos.',
    metaDescription:
      'Saúde e prevenção pet: sintomas, cuidados veterinários e bem-estar pra cães e gatos no Cia dos Bichinhos.',
    bg: '#F7E7C4',
    text: '#7A5008',
  },
  alimentacao: {
    slug: 'alimentacao',
    label: 'Alimentação',
    descriptor: 'Ração, dieta e petiscos pra cachorros e gatos.',
    metaDescription:
      'Guias de alimentação pet: ração, dieta e petiscos pra cães e gatos no Cia dos Bichinhos.',
    bg: '#F7DCCB',
    text: '#8A3F1E',
  },
  comportamento: {
    slug: 'comportamento',
    label: 'Comportamento',
    descriptor: 'Comportamento, adestramento e curiosidades pet.',
    metaDescription:
      'Comportamento e adestramento pet: entenda seu cachorro ou gato no Cia dos Bichinhos.',
    bg: '#E9E1F5',
    text: '#55408A',
  },
};

export const categoryList = Object.values(categories);
