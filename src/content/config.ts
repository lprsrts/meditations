import { defineCollection, z } from 'astro:content';

// Define the article collection schema
const articlesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    slug: z.string().optional(),
  }),
});

// Export the collections
export const collections = {
  'articles': articlesCollection,
};