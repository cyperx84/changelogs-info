import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getAllToolSlugs, getSourcesForTool } from "./sources.js";
import { fetchSource } from "./fetcher.js";
import { storeEvidence, loadLatestEvidence } from "./evidence.js";
import { computeDiff, type DiffResult } from "./diff.js";
import { queueTier2Refresh, runTier2Refresh, type RefreshInput } from "./refresh.js";

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
  tier2Extracted: number;
  skipped: boolean;
  error?: string;
}

// Extract the release body for the detected version from GitHub releases JSON
function getReleaseBody(evidenceContent: string, version: string): { body: string; date: string } | null {
  try {
    const releases = JSON.parse(evidenceContent) as Array<{
      tag_name: string;
      body: string;
      published_at: string;
    }>;
    const stripTag = (t: string) => t.replace(/^@[^@]+@/, "").replace(/^[a-zA-Z]+-v/, "").replace(/^v/, "");
    const release = releases.find((r) => stripTag(r.tag_name) === version);
    if (release) {
      return {
        body: release.body ?? "",
        date: release.published_at?.split("T")[0] ?? new Date().toISOString().split("T")[0],
      };
    }
  } catch { /* ignore */ }
  return null;
}

async function runTool(toolSlug: string, forceTier2: boolean): Promise<RunResult> {
  const result: RunResult = {
    tool: toolSlug,
    previousVersion: null,
    newVersion: null,
    scope: "none",
    patchesApplied: 0,
    tier2Queued: false,
    tier2Extracted: 0,
    skipped: false,
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

    // Handle skipped fetches (304 Not Modified or rate limited)
    if (fetchResult.skipped) {
      result.skipped = true;
      console.log(`  ✅ Skipped (${fetchResult.statusCode})`);

      // If force-tier2 requested and we have previous evidence, queue tier2 anyway
      if (forceTier2 && previousEvidence) {
        const payload = loadPayload(toolSlug);
        const version = (payload as Record<string, Record<string, unknown>>).meta?.latest_stable as string ?? null;
        await queueTier2Refresh({
          toolSlug,
          changeDetected: false,
          scope: "none",
          reasons: ["force-tier2 flag"],
          versionChanged: false,
          previousVersion: version,
          detectedVersion: version,
          tier2Required: true,
          directPatches: [],
        });
        result.tier2Queued = true;
      }
      return result;
    }

    if (fetchResult.statusCode !== 200) {
      result.error = `HTTP ${fetchResult.statusCode}`;
      return result;
    }

    // Store evidence
    const evidencePath = storeEvidence(fetchResult);
    if (evidencePath) {
      console.log(`  💾 Evidence stored: ${evidencePath}`);
    }

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

    // Tier 2: LLM extraction
    const shouldRunTier2 = forceTier2 || diff.tier2Required;
    if (shouldRunTier2 && diff.detectedVersion) {
      const releaseInfo = getReleaseBody(fetchResult.content, diff.detectedVersion);
      if (releaseInfo && releaseInfo.body) {
        const refreshInput: RefreshInput = {
          toolSlug,
          releaseVersion: diff.detectedVersion,
          releaseBody: releaseInfo.body,
          releaseDate: releaseInfo.date,
          currentPayload: payload,
          previousVersion: diff.previousVersion,
        };

        const refreshOutput = await runTier2Refresh(refreshInput);

        if (refreshOutput.success) {
          // Write the LLM-updated payload
          const payloadPath = join(REFS_DIR, `${toolSlug}.json`);
          writeFileSync(payloadPath, JSON.stringify(refreshOutput.updatedPayload, null, 2) + "\n");
          result.tier2Extracted = refreshOutput.changeCount;
          console.log(`  ✨ Tier 2 refresh: extracted ${refreshOutput.changeCount} changes`);
          for (const note of refreshOutput.extractionNotes) {
            console.log(`     ${note}`);
          }
        } else {
          // Fall back to queue
          console.log(`  ⚠️  Tier 2 extraction failed: ${refreshOutput.error}`);
          await queueTier2Refresh(diff);
          result.tier2Queued = true;
        }
      } else {
        console.log(`  ⚠️  No release body found for ${diff.detectedVersion}`);
        await queueTier2Refresh(diff);
        result.tier2Queued = true;
      }
    } else if (diff.tier2Required) {
      await queueTier2Refresh(diff);
      result.tier2Queued = true;
    }

    if (!diff.changeDetected && !forceTier2) {
      console.log(`  ✅ No changes detected`);
    }
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
  }

  return result;
}

interface PipelineSummary {
  ran_at: string;
  tools_checked: number;
  updates_found: number;
  tier2_ran: number;
  errors: number;
  results: RunResult[];
}

function parseArgs(argv: string[]): { toolFilter: string | null; forceTier2: boolean; jsonOutput: boolean } {
  let toolFilter: string | null = null;
  let forceTier2 = false;
  let jsonOutput = false;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--tool" && argv[i + 1]) {
      toolFilter = argv[i + 1];
      i++;
    } else if (argv[i] === "--force-tier2") {
      forceTier2 = true;
    } else if (argv[i] === "--json") {
      jsonOutput = true;
    }
  }

  return { toolFilter, forceTier2, jsonOutput };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const slugs = args.toolFilter ? [args.toolFilter] : getAllToolSlugs();

  if (!args.jsonOutput) {
    console.log(`🚀 Pipeline running for: ${slugs.join(", ")}`);
  }

  const results: RunResult[] = [];
  for (const slug of slugs) {
    results.push(await runTool(slug, args.forceTier2));
  }

  const summary: PipelineSummary = {
    ran_at: new Date().toISOString(),
    tools_checked: results.length,
    updates_found: results.filter((r) => r.patchesApplied > 0).length,
    tier2_ran: results.filter((r) => r.tier2Queued || r.tier2Extracted > 0).length,
    errors: results.filter((r) => r.error).length,
    results,
  };

  if (args.jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    // Summary table
    console.log("\n" + "═".repeat(105));
    console.log(
      "Tool".padEnd(15) +
      "Previous".padEnd(14) +
      "New".padEnd(14) +
      "Scope".padEnd(10) +
      "Patches".padEnd(10) +
      "Tier2".padEnd(10) +
      "Extracted".padEnd(12) +
      "Skip".padEnd(7) +
      "Error"
    );
    console.log("─".repeat(105));

    for (const r of results) {
      const tier2Status = r.tier2Extracted > 0 ? "done" : r.tier2Queued ? "queued" : "no";
      console.log(
        r.tool.padEnd(15) +
        (r.previousVersion ?? "—").padEnd(14) +
        (r.newVersion ?? "—").padEnd(14) +
        r.scope.padEnd(10) +
        String(r.patchesApplied).padEnd(10) +
        tier2Status.padEnd(10) +
        String(r.tier2Extracted).padEnd(12) +
        (r.skipped ? "yes" : "no").padEnd(7) +
        (r.error ?? "")
      );
    }
    console.log("═".repeat(105));
  }

  // Exit with code 1 if any tool had errors
  if (summary.errors > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
