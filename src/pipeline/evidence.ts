import { mkdirSync, writeFileSync, readFileSync, existsSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import type { FetchResult } from "./fetcher.js";

export interface EvidenceRecord {
  toolSlug: string;
  sourceRole: string;
  sourceUrl: string;
  fetchedAt: string;
  contentHash: string;
  content: string;
}

const DATA_DIR = join(process.cwd(), "data", "evidence");

function toolDir(toolSlug: string): string {
  const dir = join(DATA_DIR, toolSlug);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function storeEvidence(result: FetchResult): string {
  const record: EvidenceRecord = {
    toolSlug: result.source.toolSlug,
    sourceRole: result.source.role,
    sourceUrl: result.source.url,
    fetchedAt: result.fetchedAt,
    contentHash: result.contentHash,
    content: result.content,
  };

  const dir = toolDir(result.source.toolSlug);
  const ts = result.fetchedAt.replace(/[:.]/g, "-");
  const filename = `${ts}-${result.source.role}.json`;
  const filepath = join(dir, filename);

  writeFileSync(filepath, JSON.stringify(record, null, 2));

  // Write latest copy
  const latestPath = join(dir, `latest-${result.source.role}.json`);
  copyFileSync(filepath, latestPath);

  return filepath;
}

export function loadLatestEvidence(toolSlug: string, sourceRole: string): EvidenceRecord | null {
  const path = join(toolDir(toolSlug), `latest-${sourceRole}.json`);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

export function loadEvidence(filepath: string): EvidenceRecord {
  return JSON.parse(readFileSync(filepath, "utf-8"));
}
