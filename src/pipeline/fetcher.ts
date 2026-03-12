import { createHash } from "node:crypto";
import type { Source } from "./sources.js";

export interface FetchResult {
  source: Source;
  content: string;
  contentHash: string;
  fetchedAt: string;
  statusCode: number;
  error?: string;
}

export async function fetchSource(source: Source): Promise<FetchResult> {
  const fetchedAt = new Date().toISOString();
  const headers: Record<string, string> = {
    "User-Agent": "changelogs-info-pipeline/1.0",
  };

  if (source.format === "json" && source.url.includes("api.github.com")) {
    headers["Accept"] = "application/vnd.github+json";
  }

  const ghToken = process.env.GITHUB_TOKEN;
  if (ghToken && source.url.includes("github.com")) {
    headers["Authorization"] = `Bearer ${ghToken}`;
  }

  try {
    const res = await fetch(source.url, { headers });
    const content = await res.text();

    let cleaned = content;
    if (source.noisePatterns) {
      for (const pat of source.noisePatterns) {
        cleaned = cleaned.replace(new RegExp(pat, "g"), "");
      }
    }

    const hash = createHash("sha256").update(cleaned).digest("hex");

    return {
      source,
      content: cleaned,
      contentHash: `sha256:${hash}`,
      fetchedAt,
      statusCode: res.status,
    };
  } catch (err) {
    return {
      source,
      content: "",
      contentHash: "sha256:error",
      fetchedAt,
      statusCode: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
