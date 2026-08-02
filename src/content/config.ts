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
    pilar: z.enum(['comer', 'brincar', 'passear', 'dormir', 'vestir', 'educar', 'cuidar']),
    tags: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
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
