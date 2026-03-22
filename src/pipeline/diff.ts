import type { EvidenceRecord } from "./evidence.js";

export interface DiffPatch {
  path: string;
  op: "replace" | "add";
  value: unknown;
}

export interface DiffResult {
  toolSlug: string;
  changeDetected: boolean;
  scope: "none" | "small" | "medium" | "large";
  reasons: string[];
  versionChanged: boolean;
  previousVersion: string | null;
  detectedVersion: string | null;
  tier2Required: boolean;
  directPatches: DiffPatch[];
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  prerelease: boolean;
  draft: boolean;
  published_at: string;
}

function stripTagPrefix(tag: string): string {
  // Handle: v1.0.0, @scope@1.0.0, rust-v0.114.0, prefix-v1.0.0
  return tag.replace(/^@[^@]+@/, "").replace(/^[a-zA-Z]+-v/, "").replace(/^v/, "");
}

function parseReleases(content: string): GitHubRelease[] {
  try {
    return JSON.parse(content) as GitHubRelease[];
  } catch {
    return [];
  }
}

function findLatestStable(releases: GitHubRelease[]): GitHubRelease | null {
  return releases.find((r) => !r.prerelease && !r.draft) ?? null;
}

function detectScope(body: string): "small" | "medium" | "large" {
  const lower = body.toLowerCase();
  if (/breaking.?change|removed|migration.?required/i.test(lower)) return "large";
  if (/deprecated|new.?command|new.?flag|new.?feature/i.test(lower)) return "medium";
  return "small";
}

function scanSignals(body: string): string[] {
  const signals: string[] = [];

  if (/breaking.?change/i.test(body)) signals.push("breaking_change_signal");
  if (/deprecat/i.test(body)) signals.push("deprecated_signal");

  const commands = body.match(/\/[a-z][a-z-]+/g);
  if (commands?.length) signals.push(`new_command_tokens: ${[...new Set(commands)].join(", ")}`);

  const flags = body.match(/--[a-z][a-z-]+/g);
  if (flags?.length) signals.push(`flag_tokens: ${[...new Set(flags)].join(", ")}`);

  return signals;
}

export function computeDiff(
  current: EvidenceRecord,
  previous: EvidenceRecord | null,
  payload: Record<string, unknown>
): DiffResult {
  const toolSlug = current.toolSlug;
  const result: DiffResult = {
    toolSlug,
    changeDetected: false,
    scope: "none",
    reasons: [],
    versionChanged: false,
    previousVersion: null,
    detectedVersion: null,
    tier2Required: false,
    directPatches: [],
  };

  // No change in hash
  if (previous && current.contentHash === previous.contentHash) {
    result.reasons.push("content_hash_unchanged");
    return result;
  }

  const releases = parseReleases(current.content);
  if (!releases.length) {
    result.reasons.push("no_releases_parsed");
    return result;
  }

  const latest = findLatestStable(releases);
  if (!latest) {
    result.reasons.push("no_stable_release_found");
    return result;
  }

  const detectedVersion = stripTagPrefix(latest.tag_name);
  const payloadVersion = (payload as { version?: string }).version ?? null;

  result.detectedVersion = detectedVersion;
  result.previousVersion = payloadVersion;
  result.changeDetected = true;

  if (detectedVersion !== payloadVersion) {
    result.versionChanged = true;
    result.scope = detectScope(latest.body ?? "");
    result.reasons.push(`version_changed: ${payloadVersion} → ${detectedVersion}`);

    const signals = scanSignals(latest.body ?? "");
    result.reasons.push(...signals);

    // If scope is just "small" from body scan but version changed, bump to medium
    if (result.scope === "small") result.scope = "medium";

    result.tier2Required = true;

    const now = new Date().toISOString();
    result.directPatches = [
      { path: "version", op: "replace", value: detectedVersion },
      { path: "payload.meta.latest_stable", op: "replace", value: detectedVersion },
      { path: "payload.meta.latest_release_date", op: "replace", value: latest.published_at?.split("T")[0] ?? now.split("T")[0] },
      { path: "generated_at", op: "replace", value: now },
    ];
  } else {
    // Same version but content changed (e.g. release notes edited after publish)
    result.scope = "small";
    result.reasons.push("content_changed_same_version");
    // Re-run Tier 2 so the TL;DR and extracted fields reflect the edited notes
    result.tier2Required = true;
  }

  return result;
}
