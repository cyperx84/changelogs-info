import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface Tool {
  id: string;
  name: string;
  repo: string;
  description: string;
  category: string;
  website: string;
  tags: string[];
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
  prerelease: boolean;
  draft: boolean;
}

interface Release {
  version: string;
  name: string;
  body: string;
  date: string;
  url: string;
  prerelease: boolean;
}

interface ToolReleases {
  tool: Tool;
  releases: Release[];
  lastUpdated: string;
}

const GITHUB_API = "https://api.github.com";
const PER_PAGE = 30;

async function fetchReleases(repo: string): Promise<GitHubRelease[]> {
  const url = `${GITHUB_API}/repos/${repo}/releases?per_page=${PER_PAGE}`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "changelogs-info-scraper",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    console.error(`Failed to fetch ${repo}: ${res.status} ${res.statusText}`);
    return [];
  }

  return res.json();
}

function transformRelease(gh: GitHubRelease): Release {
  return {
    version: gh.tag_name,
    name: gh.name || gh.tag_name,
    body: gh.body || "",
    date: gh.published_at,
    url: gh.html_url,
    prerelease: gh.prerelease,
  };
}

async function scrapeAll() {
  const toolsPath = join(__dirname, "tools.json");
  const tools: Tool[] = JSON.parse(readFileSync(toolsPath, "utf-8"));

  const outputDir = join(__dirname, "..", "src", "content", "releases");
  mkdirSync(outputDir, { recursive: true });

  console.log(`Scraping releases for ${tools.length} tools...\n`);

  for (const tool of tools) {
    console.log(`Fetching releases for ${tool.name} (${tool.repo})...`);

    const ghReleases = await fetchReleases(tool.repo);
    const releases = ghReleases
      .filter((r) => !r.draft)
      .map(transformRelease);

    const data: ToolReleases = {
      tool,
      releases,
      lastUpdated: new Date().toISOString(),
    };

    const outPath = join(outputDir, `${tool.id}.json`);
    writeFileSync(outPath, JSON.stringify(data, null, 2));

    console.log(`  -> ${releases.length} releases saved to ${tool.id}.json`);

    // Rate limit: small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\nDone scraping all releases.");
}

scrapeAll().catch(console.error);
