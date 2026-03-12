import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { DiffResult } from "./diff.js";

const QUEUE_DIR = join(process.cwd(), "data", "refresh-queue");

export interface RefreshRequest {
  toolSlug: string;
  triggeredAt: string;
  previousVersion: string | null;
  detectedVersion: string | null;
  scope: string;
  reasons: string[];
}

export async function queueTier2Refresh(diff: DiffResult): Promise<string> {
  mkdirSync(QUEUE_DIR, { recursive: true });

  const request: RefreshRequest = {
    toolSlug: diff.toolSlug,
    triggeredAt: new Date().toISOString(),
    previousVersion: diff.previousVersion,
    detectedVersion: diff.detectedVersion,
    scope: diff.scope,
    reasons: diff.reasons,
  };

  const filepath = join(QUEUE_DIR, `${diff.toolSlug}.json`);
  writeFileSync(filepath, JSON.stringify(request, null, 2));

  console.log(`  ⏳ Tier 2 refresh queued for ${diff.toolSlug}`);
  return filepath;
}
