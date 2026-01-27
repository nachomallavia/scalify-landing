import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    tagline: z.string().optional(),
    description: z.string().optional(),
    author: z.string().optional(),
    date: z.coerce.date().optional(),
    published: z.date().optional(),
    tags: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    image: z.string().optional(),
    featured: z.boolean().optional(),
    latest: z.boolean().optional(),
  }),
});

export const collections = { blog };
