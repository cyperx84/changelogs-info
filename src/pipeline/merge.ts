/**
 * Merge LLM extraction output into an existing clwatch payload.
 */

export interface ExtractionResult {
  new_features: Array<{
    id: string;
    name: string;
    status: string;
    since: string;
    description: string;
    key_details: string[];
    source_url: string;
  }>;
  updated_features: Array<{ id: string; changes: string }>;
  new_commands: Array<{
    name: string;
    syntax: string;
    description: string;
    since: string;
    status: string;
    source_url: string;
  }>;
  new_flags: Array<{
    flag: string;
    description: string;
    since: string;
    source_url: string;
  }>;
  deprecated_flags: Array<{
    flag: string;
    replaced_by: string | null;
    deprecated_since: string;
    removed_in: string | null;
    source_url: string;
  }>;
  deprecated_commands: Array<{
    name: string;
    replaced_by: string | null;
    deprecated_since: string;
    source_url: string;
  }>;
  breaking_changes: Array<{
    id: string;
    version: string;
    title: string;
    description: string;
    affected: string[];
    migration: string;
    source_url: string;
  }>;
  new_env_vars: Array<{
    name: string;
    purpose: string;
    status: string;
    since: string;
    source_url: string;
  }>;
  meta_updates: {
    latest_stable: string;
    latest_release_date: string;
  };
}

// Helper to safely get an array from a nested path
function getArray(obj: Record<string, unknown>, ...keys: string[]): unknown[] {
  let cur: unknown = obj;
  for (const k of keys) {
    if (cur && typeof cur === "object" && k in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[k];
    } else {
      return [];
    }
  }
  return Array.isArray(cur) ? cur : [];
}

function setNested(obj: Record<string, unknown>, path: string[], value: unknown): void {
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < path.length - 1; i++) {
    if (!(path[i] in cur) || typeof cur[path[i]] !== "object") {
      cur[path[i]] = {};
    }
    cur = cur[path[i]] as Record<string, unknown>;
  }
  cur[path[path.length - 1]] = value;
}

export function mergeExtraction(
  currentPayload: Record<string, unknown>,
  extraction: ExtractionResult,
  releaseVersion: string,
  releaseDate: string,
): Record<string, unknown> {
  const payload = JSON.parse(JSON.stringify(currentPayload)) as Record<string, unknown>;

  // --- Append new_features (skip if id already exists) ---
  const existingFeatures = getArray(payload, "payload", "features") as Array<{ id: string }>;
  const existingFeatureIds = new Set(existingFeatures.map((f) => f.id));
  for (const feat of extraction.new_features) {
    if (!existingFeatureIds.has(feat.id)) {
      existingFeatures.push(feat as unknown as { id: string });
    }
  }
  setNested(payload, ["payload", "features"], existingFeatures);

  // --- Append new_commands (skip if name already exists) ---
  const existingCommands = getArray(payload, "payload", "commands") as Array<{ name: string }>;
  const existingCommandNames = new Set(existingCommands.map((c) => c.name));
  for (const cmd of extraction.new_commands) {
    if (!existingCommandNames.has(cmd.name)) {
      existingCommands.push(cmd as unknown as { name: string });
    }
  }
  setNested(payload, ["payload", "commands"], existingCommands);

  // --- Append new_flags to payload.flags.current (skip if flag already exists) ---
  const existingFlags = getArray(payload, "payload", "flags", "current") as Array<{ flag: string }>;
  const existingFlagNames = new Set(existingFlags.map((f) => f.flag));
  for (const flag of extraction.new_flags) {
    if (!existingFlagNames.has(flag.flag)) {
      existingFlags.push(flag as unknown as { flag: string });
    }
  }
  setNested(payload, ["payload", "flags", "current"], existingFlags);

  // --- Update new_since_previous ---
  setNested(
    payload,
    ["payload", "flags", "new_since_previous"],
    extraction.new_flags.map((f) => f.flag),
  );

  // --- Append deprecated_flags ---
  const existingDeprecatedFlags = getArray(payload, "payload", "flags", "deprecated") as unknown[];
  for (const df of extraction.deprecated_flags) {
    existingDeprecatedFlags.push(df);
  }
  setNested(payload, ["payload", "flags", "deprecated"], existingDeprecatedFlags);

  // --- Append breaking_changes ---
  const existingBreaking = getArray(payload, "payload", "breaking_changes") as Array<{ id: string }>;
  const existingBreakingIds = new Set(existingBreaking.map((b) => b.id));
  for (const bc of extraction.breaking_changes) {
    if (!existingBreakingIds.has(bc.id)) {
      existingBreaking.push(bc as unknown as { id: string });
    }
  }
  setNested(payload, ["payload", "breaking_changes"], existingBreaking);

  // --- Append new_env_vars ---
  const existingEnvVars = getArray(payload, "payload", "env_vars") as Array<{ name: string }>;
  const existingEnvNames = new Set(existingEnvVars.map((e) => e.name));
  for (const ev of extraction.new_env_vars) {
    if (!existingEnvNames.has(ev.name)) {
      existingEnvVars.push(ev as unknown as { name: string });
    }
  }
  setNested(payload, ["payload", "env_vars"], existingEnvVars);

  // --- Update meta ---
  if (extraction.meta_updates.latest_stable) {
    setNested(payload, ["payload", "meta", "latest_stable"], extraction.meta_updates.latest_stable);
  }
  if (extraction.meta_updates.latest_release_date) {
    setNested(payload, ["payload", "meta", "latest_release_date"], extraction.meta_updates.latest_release_date);
  }

  // --- Update envelope ---
  const now = new Date().toISOString();
  payload.version = releaseVersion;
  payload.generated_at = now;
  setNested(payload, ["verification", "status"], "verified");

  // --- Update delta block ---
  const previousVersion = (currentPayload as { version?: string }).version ?? null;
  payload.delta = {
    from_version: previousVersion,
    to_version: releaseVersion,
    new_features: extraction.new_features.map((f) => f.id),
    new_commands: extraction.new_commands.map((c) => c.name),
    new_flags: extraction.new_flags.map((f) => f.flag),
    new_env_vars: extraction.new_env_vars.map((e) => e.name),
    deprecated_commands: extraction.deprecated_commands.map((c) => c.name),
    deprecated_flags: extraction.deprecated_flags.map((f) => f.flag),
    breaking_changes: extraction.breaking_changes.map((b) => b.id),
  };

  // --- Append deprecated_commands to payload.deprecations ---
  const existingDeprecations = getArray(payload, "payload", "deprecations") as Array<{ name?: string }>;
  for (const dc of extraction.deprecated_commands) {
    existingDeprecations.push(dc as unknown as { name?: string });
  }
  setNested(payload, ["payload", "deprecations"], existingDeprecations);

  return payload;
}
