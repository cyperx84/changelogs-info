import { z, defineCollection } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.string(),
    excerpt: z.string(),
    tags: z.array(z.string()),
    readTime: z.string(),
    category: z.string(),
    author: z.string().default("changelogs.info"),
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog };
