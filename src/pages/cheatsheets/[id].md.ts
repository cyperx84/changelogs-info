import type { APIRoute, GetStaticPaths } from "astro";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "src/content/cheatsheets");

export const getStaticPaths: GetStaticPaths = () => {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ params: { id: f.replace(".md", "") } }));
};

export const GET: APIRoute = ({ params }) => {
  const raw = readFileSync(join(dir, `${params.id}.md`), "utf-8");
  const content = raw.replace(/^---[\s\S]*?---\n*/, "");
  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${params.id}-cheatsheet.md"`,
    },
  });
};
