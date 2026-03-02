import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getTools, getAllToolReleases } from "../../lib/releases";

export async function GET(context: APIContext) {
  const allReleases = await getAllToolReleases();
  const tools = getTools();
  const toolMap = Object.fromEntries(tools.map((t) => [t.id, t]));

  const items = allReleases
    .flatMap((tr) =>
      tr.releases.map((r) => ({
        title: `${tr.tool.name} ${r.version}`,
        pubDate: new Date(r.date),
        description: r.body.slice(0, 500),
        link: `/tools/${tr.tool.id}`,
        customData: `<author>${tr.tool.name}</author>`,
      }))
    )
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 100);

  return rss({
    title: "changelogs.info — All Releases",
    description: "All AI coding tool releases in one feed",
    site: context.site!,
    items,
  });
}
