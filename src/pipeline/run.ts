import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getAllToolSlugs, getSourcesForTool } from "./sources.js";
import { fetchSource } from "./fetcher.js";
import { storeEvidence, loadLatestEvidence } from "./evidence.js";
import { computeDiff, type DiffResult } from "./diff.js";
import { queueTier2Refresh } from "./refresh.js";

const REFS_DIR = join(process.cwd(), "public", "api", "refs");

function loadPayload(toolSlug: string): Record<string, unknown> {
  const path = join(REFS_DIR, `${toolSlug}.json`);
  return JSON.parse(readFileSync(path, "utf-8"));
}

function applyPatches(payload: Record<string, unknown>, patches: DiffResult["directPatches"]): void {
  for (const patch of patches) {
    const parts = patch.path.split(".");
    let target: Record<string, unknown> = payload;
    for (let i = 0; i < parts.length - 1; i++) {
      target = target[parts[i]] as Record<string, unknown>;
    }
    target[parts[parts.length - 1]] = patch.value;
  }
}

function updateManifest(toolSlug: string, version: string, generatedAt: string): void {
  const manifestPath = join(REFS_DIR, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

  if (manifest.tools?.[toolSlug]) {
    manifest.tools[toolSlug].version = version;
    manifest.tools[toolSlug].generated_at = generatedAt;

    const staleDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    manifest.tools[toolSlug].stale_after = staleDate;
  }

  manifest.generated_at = generatedAt;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}

interface RunResult {
  tool: string;
  previousVersion: string | null;
  newVersion: string | null;
  scope: string;
  patchesApplied: number;
  tier2Queued: boolean;
  error?: string;
}

async function runTool(toolSlug: string): Promise<RunResult> {
  const result: RunResult = {
    tool: toolSlug,
    previousVersion: null,
    newVersion: null,
    scope: "none",
    patchesApplied: 0,
    tier2Queued: false,
  };

  try {
    // Get primary source (highest priority github_releases)
    const sources = getSourcesForTool(toolSlug);
    const primarySource = sources.find((s) => s.role === "github_releases");
    if (!primarySource) {
      result.error = "no github_releases source";
      return result;
    }

    // Load previous evidence before fetching
    const previousEvidence = loadLatestEvidence(toolSlug, "github_releases");

    // Fetch
    console.log(`\n📡 Fetching ${toolSlug} from ${primarySource.url}`);
    const fetchResult = await fetchSource(primarySource);

    if (fetchResult.error) {
      result.error = fetchResult.error;
      return result;
    }

    if (fetchResult.statusCode !== 200) {
      result.error = `HTTP ${fetchResult.statusCode}`;
      return result;
    }

    // Store evidence
    const evidencePath = storeEvidence(fetchResult);
    console.log(`  💾 Evidence stored: ${evidencePath}`);

    // Load payload and compute diff
    const payload = loadPayload(toolSlug);
    const diff = computeDiff(
      { toolSlug, sourceRole: "github_releases", sourceUrl: primarySource.url, fetchedAt: fetchResult.fetchedAt, contentHash: fetchResult.contentHash, content: fetchResult.content },
      previousEvidence,
      payload
    );

    result.previousVersion = diff.previousVersion;
    result.newVersion = diff.detectedVersion;
    result.scope = diff.scope;

    // Apply patches if any
    if (diff.directPatches.length > 0) {
      applyPatches(payload, diff.directPatches);
      const payloadPath = join(REFS_DIR, `${toolSlug}.json`);
      writeFileSync(payloadPath, JSON.stringify(payload, null, 2) + "\n");
      result.patchesApplied = diff.directPatches.length;
      console.log(`  ✏️  Applied ${diff.directPatches.length} patches to payload`);
    }

    // Update manifest if version changed
    if (diff.versionChanged && diff.detectedVersion) {
      updateManifest(toolSlug, diff.detectedVersion, new Date().toISOString());
      console.log(`  📋 Manifest updated`);
    }

    // Queue tier 2 if needed
    if (diff.tier2Required) {
      await queueTier2Refresh(diff);
      result.tier2Queued = true;
    }

    if (!diff.changeDetected) {
      console.log(`  ✅ No changes detected`);
    }
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
  }

  return result;
}

async function main() {
  const args = process.argv.slice(2);
  let toolFilter: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--tool" && args[i + 1]) {
      toolFilter = args[i + 1];
      i++;
    }
  }

  const slugs = toolFilter ? [toolFilter] : getAllToolSlugs();
  console.log(`🚀 Pipeline running for: ${slugs.join(", ")}`);

  const results: RunResult[] = [];
  for (const slug of slugs) {
    results.push(await runTool(slug));
  }

  // Summary table
  console.log("\n" + "═".repeat(90));
  console.log(
    "Tool".padEnd(15) +
    "Previous".padEnd(14) +
    "New".padEnd(14) +
    "Scope".padEnd(10) +
    "Patches".padEnd(10) +
    "Tier2".padEnd(8) +
    "Error"
  );
  console.log("─".repeat(90));

  for (const r of results) {
    console.log(
      r.tool.padEnd(15) +
      (r.previousVersion ?? "—").padEnd(14) +
      (r.newVersion ?? "—").padEnd(14) +
      r.scope.padEnd(10) +
      String(r.patchesApplied).padEnd(10) +
      (r.tier2Queued ? "yes" : "no").padEnd(8) +
      (r.error ?? "")
    );
  }
  console.log("═".repeat(90));
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
