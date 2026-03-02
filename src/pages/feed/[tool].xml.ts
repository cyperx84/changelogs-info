import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getTools, getToolReleases } from "../../lib/releases";

export function getStaticPaths() {
  return getTools().map((t) => ({ params: { tool: t.id } }));
}

export async function GET(context: APIContext) {
  const toolId = context.params.tool!;
  const tools = getTools();
  const tool = tools.find((t) => t.id === toolId)!;
  const data = await getToolReleases(toolId);

  const items = (data?.releases ?? []).map((r) => ({
    title: `${tool.name} ${r.version}`,
    pubDate: new Date(r.date),
    description: r.body.slice(0, 500),
    link: `/tools/${toolId}`,
  }));

  return rss({
    title: `${tool.name} Releases — changelogs.info`,
    description: `Release feed for ${tool.name}`,
    site: context.site!,
    items,
  });
}
