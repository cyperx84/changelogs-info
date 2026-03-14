import { defineCollection, z } from "astro:content";

const workflows = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    category: z.enum(["development", "review", "orchestration", "maintenance", "general"]).optional(),
    tools: z.array(z.string()).optional(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    lastUpdated: z.string().optional(),
    source: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = {
  workflows,
};
