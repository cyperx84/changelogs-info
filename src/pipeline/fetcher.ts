import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import type { Source } from "./sources.js";

export interface FetchResult {
  source: Source;
  content: string;
  contentHash: string;
  fetchedAt: string;
  statusCode: number;
  etag: string | null;
  skipped: boolean;
  error?: string;
}

const ETAG_DIR = join(process.cwd(), "data", "etags");

function etagPath(source: Source): string {
  mkdirSync(ETAG_DIR, { recursive: true });
  return join(ETAG_DIR, `${source.toolSlug}-${source.role}.etag`);
}

function loadEtag(source: Source): string | null {
  const p = etagPath(source);
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf-8").trim();
}

function saveEtag(source: Source, etag: string): void {
  writeFileSync(etagPath(source), etag);
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

  // Send ETag for conditional request
  const previousEtag = loadEtag(source);
  if (previousEtag) {
    headers["If-None-Match"] = previousEtag;
  }

  try {
    const res = await fetch(source.url, { headers });

    // Handle 304 Not Modified
    if (res.status === 304) {
      console.log(`  ⚡ 304 skipped (no changes) for ${source.toolSlug}/${source.role}`);
      return {
        source,
        content: "",
        contentHash: "",
        fetchedAt,
        statusCode: 304,
        etag: previousEtag,
        skipped: true,
      };
    }

    // Handle rate limiting (429 or 403 with rate limit headers)
    if (res.status === 429 || (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0")) {
      console.warn(`  ⚠️  Rate limited (${res.status}) for ${source.toolSlug}/${source.role}`);
      return {
        source,
        content: "",
        contentHash: "",
        fetchedAt,
        statusCode: res.status,
        etag: previousEtag,
        skipped: true,
      };
    }

    const content = await res.text();

    let cleaned = content;
    if (source.noisePatterns) {
      for (const pat of source.noisePatterns) {
        cleaned = cleaned.replace(new RegExp(pat, "g"), "");
      }
    }

    const hash = createHash("sha256").update(cleaned).digest("hex");

    // Save ETag for next request
    const responseEtag = res.headers.get("etag");
    if (responseEtag) {
      saveEtag(source, responseEtag);
    }

    return {
      source,
      content: cleaned,
      contentHash: `sha256:${hash}`,
      fetchedAt,
      statusCode: res.status,
      etag: responseEtag,
      skipped: false,
    };
  } catch (err) {
    return {
      source,
      content: "",
      contentHash: "sha256:error",
      fetchedAt,
      statusCode: 0,
      etag: null,
      skipped: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
