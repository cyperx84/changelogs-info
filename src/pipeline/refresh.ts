/**
 * Tier 2 LLM-based extraction: takes a GitHub release body + current payload,
 * calls an LLM via OpenRouter (or any OpenAI-compatible API) to extract
 * structured changes, and merges into the payload.
 *
 * Works with ANY provider — just set LLM_API_KEY and optionally:
 *   LLM_API_URL   — base URL (default: https://openrouter.ai/api/v1)
 *   LLM_MODEL     — model ID (default: google/gemini-2.0-flash-001)
 *
 * Falls back to queue stub if no API key is set.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { DiffResult } from "./diff.js";
import { mergeExtraction, type ExtractionResult } from "./merge.js";

const QUEUE_DIR = join(process.cwd(), "data", "refresh-queue");

const DEFAULT_API_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "google/gemini-2.0-flash-001";

// ──────────────────────────────────────────────────────────────────────────────
// Interfaces
// ──────────────────────────────────────────────────────────────────────────────

export interface RefreshInput {
  toolSlug: string;
  releaseVersion: string;
  releaseBody: string;
  releaseDate: string;
  currentPayload: Record<string, unknown>;
  previousVersion: string | null;
}

export interface RefreshOutput {
  success: boolean;
  updatedPayload: Record<string, unknown>;
  changeCount: number;
  extractionNotes: string[];
  error?: string;
}

export interface RefreshRequest {
  toolSlug: string;
  triggeredAt: string;
  previousVersion: string | null;
  detectedVersion: string | null;
  scope: string;
  reasons: string[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Stub fallback (no API key)
// ──────────────────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────────────────
// LLM extraction prompt
// ──────────────────────────────────────────────────────────────────────────────

function buildExtractionPrompt(input: RefreshInput): string {
  const payloadInner = (input.currentPayload as { payload?: Record<string, unknown> }).payload ?? {};
  const existingFeatureIds = Array.isArray(payloadInner.features)
    ? (payloadInner.features as Array<{ id: string }>).map((f) => f.id)
    : [];
  const existingCommandNames = Array.isArray(payloadInner.commands)
    ? (payloadInner.commands as Array<{ name: string }>).map((c) => c.name)
    : [];

  return `You are a structured data extraction assistant for developer tool changelogs.

## Task
Extract ALL changes from the release notes below into the JSON schema provided. Be thorough — capture every feature, command, flag, env var, deprecation, and breaking change mentioned.

## Context
- Tool: ${input.toolSlug}
- Release version: ${input.releaseVersion}
- Previous version: ${input.previousVersion ?? "unknown"}
- Release date: ${input.releaseDate}

## Existing features (do NOT re-extract these):
${existingFeatureIds.join(", ") || "(none)"}

## Existing commands (do NOT re-extract these):
${existingCommandNames.join(", ") || "(none)"}

## Release Notes (markdown):
\`\`\`markdown
${input.releaseBody}
\`\`\`

## Required Output Schema
Return ONLY a valid JSON object (no markdown fences, no explanation) with these fields:

{
  "new_features": [{ "id": "kebab-case-id", "name": "Display Name", "status": "stable|experimental", "since": "${input.releaseVersion}", "description": "...", "key_details": [], "source_url": "" }],
  "updated_features": [{ "id": "existing-feature-id", "changes": "what changed" }],
  "new_commands": [{ "name": "/cmd", "syntax": "/cmd [args]", "description": "...", "since": "${input.releaseVersion}", "status": "stable", "source_url": "" }],
  "new_flags": [{ "flag": "--name", "description": "...", "since": "${input.releaseVersion}", "source_url": "" }],
  "deprecated_flags": [{ "flag": "--old", "replaced_by": "...", "deprecated_since": "${input.releaseVersion}", "removed_in": null, "source_url": "" }],
  "deprecated_commands": [{ "name": "/cmd", "replaced_by": "...", "deprecated_since": "${input.releaseVersion}", "source_url": "" }],
  "breaking_changes": [{ "id": "kebab-case-id", "version": "${input.releaseVersion}", "title": "...", "description": "...", "affected": [], "migration": "...", "source_url": "" }],
  "new_env_vars": [{ "name": "VAR_NAME", "purpose": "...", "status": "stable", "since": "${input.releaseVersion}", "source_url": "" }],
  "meta_updates": { "latest_stable": "${input.releaseVersion}", "latest_release_date": "${input.releaseDate}" }
}

If a category has no items, use an empty array []. Return ONLY the JSON.`;
}

// ──────────────────────────────────────────────────────────────────────────────
// LLM call via OpenAI-compatible API (OpenRouter, OpenAI, etc.)
// ──────────────────────────────────────────────────────────────────────────────

async function callLLM(prompt: string): Promise<ExtractionResult> {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    throw new Error("LLM_API_KEY not set");
  }

  const baseURL = process.env.LLM_API_URL || DEFAULT_API_URL;
  const model = process.env.LLM_MODEL || DEFAULT_MODEL;

  const res = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(baseURL.includes("openrouter.ai")
        ? { "HTTP-Referer": "https://changelogs.info", "X-Title": "changelogs.info" }
        : {}),
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LLM API error ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
    usage?: { prompt_tokens: number; completion_tokens: number };
  };

  const content = data.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No text response from LLM");
  }

  let raw = content.trim();

  // Strip markdown fences if the model wraps them anyway
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  return JSON.parse(raw) as ExtractionResult;
}

// ──────────────────────────────────────────────────────────────────────────────
// Main entry point
// ──────────────────────────────────────────────────────────────────────────────

export async function runTier2Refresh(input: RefreshInput): Promise<RefreshOutput> {
  const notes: string[] = [];

  // Check for API key (supports both LLM_API_KEY and legacy ANTHROPIC_API_KEY)
  const apiKey = process.env.LLM_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("  ⚠️  No API key set — falling back to queue-only stub");
    console.warn("     Set LLM_API_KEY (and optionally LLM_API_URL + LLM_MODEL)");
    return {
      success: false,
      updatedPayload: input.currentPayload,
      changeCount: 0,
      extractionNotes: ["No LLM_API_KEY — skipped LLM extraction"],
      error: "No API key set",
    };
  }

  // If ANTHROPIC_API_KEY was used but no LLM_API_KEY, set the env for callLLM
  if (!process.env.LLM_API_KEY && process.env.ANTHROPIC_API_KEY) {
    process.env.LLM_API_KEY = process.env.ANTHROPIC_API_KEY;
    process.env.LLM_API_URL = process.env.LLM_API_URL || "https://api.anthropic.com/v1";
    process.env.LLM_MODEL = process.env.LLM_MODEL || "claude-3-5-haiku-latest";
    notes.push("Using legacy ANTHROPIC_API_KEY (migrate to LLM_API_KEY)");
  }

  try {
    // 1. Build prompt
    const prompt = buildExtractionPrompt(input);
    notes.push(`Prompt length: ${prompt.length} chars`);

    // 2. Call LLM
    const model = process.env.LLM_MODEL || DEFAULT_MODEL;
    console.log(`  🤖 Calling LLM (${model}) for structured extraction...`);
    const extraction = await callLLM(prompt);

    // 3. Count changes
    const changeCount =
      extraction.new_features.length +
      extraction.updated_features.length +
      extraction.new_commands.length +
      extraction.new_flags.length +
      extraction.deprecated_flags.length +
      extraction.deprecated_commands.length +
      extraction.breaking_changes.length +
      extraction.new_env_vars.length;

    notes.push(`Extracted: ${extraction.new_features.length} features, ${extraction.new_commands.length} commands, ${extraction.new_flags.length} flags, ${extraction.new_env_vars.length} env vars`);
    notes.push(`Deprecated: ${extraction.deprecated_commands.length} commands, ${extraction.deprecated_flags.length} flags`);
    notes.push(`Breaking changes: ${extraction.breaking_changes.length}`);

    // 4. Merge into payload
    const updatedPayload = mergeExtraction(
      input.currentPayload,
      extraction,
      input.releaseVersion,
      input.releaseDate,
    );

    return {
      success: true,
      updatedPayload,
      changeCount,
      extractionNotes: notes,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    notes.push(`Error: ${msg}`);
    console.warn(`  ⚠️  Tier 2 extraction failed: ${msg}`);

    return {
      success: false,
      updatedPayload: input.currentPayload,
      changeCount: 0,
      extractionNotes: notes,
      error: msg,
    };
  }
}
