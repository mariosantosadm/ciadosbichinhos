import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['cachorro', 'gato', 'cuidados', 'alimentacao', 'comportamento']),
    species: z.enum(['cachorro', 'gato', 'ambos']),
    alsoIn: z.array(z.enum(['cachorro', 'gato', 'cuidados', 'alimentacao', 'comportamento'])).default([]),
    pilar: z.enum(['comer', 'brincar', 'passear', 'dormir', 'vestir', 'educar', 'cuidar']),
    tags: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    heroImagePosition: z.string().optional(),
    pinTitle: z.string().optional(),
    pinSubtitle: z.string().optional(),
    // Pasta do Pinterest onde o pin entra pelo feed RSS automático (src/pages/pinterest/[pasta].xml.ts).
    // Título e descrição do pin no Pinterest (variação 1 do social-media). Sem eles, o feed usa title/description.
    pinterestTitle: z.string().max(100).optional(),
    pinterestDescription: z.string().max(500).optional(),
    pinBoard: z.enum(['alimentacao', 'comportamento', 'cuidados-e-higiene', 'saude-e-seguranca']).optional(),
    affiliate: z.boolean().default(false),
    affiliateProduct: z
      .object({
        name: z.string(),
        image: z.string().optional(),
        store: z.string(),
        url: z.string(),
        price: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = { blog };
