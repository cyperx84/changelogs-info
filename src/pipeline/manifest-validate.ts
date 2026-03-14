/**
 * Validate the manifest.json schema.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REFS_DIR = join(process.cwd(), "public", "api", "refs");

interface ValidationError {
  file: string;
  field: string;
  message: string;
}

const REQUIRED_PAYLOAD_FIELDS = ["schema", "id", "version", "generated_at", "meta", "payload"];
const REQUIRED_META_FIELDS = ["name", "latest_stable", "latest_release_date"];
const REQUIRED_PAYLOAD_SECTIONS = ["features", "commands", "flags", "env_vars", "deprecations", "breaking_changes"];

export function validatePayload(toolSlug: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const filePath = join(REFS_DIR, `${toolSlug}.json`);

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(readFileSync(filePath, "utf-8"));
  } catch (e) {
    return [{ file: toolSlug, field: "root", message: `invalid JSON: ${(e as Error).message}` }];
  }

  // Check required top-level fields
  for (const field of REQUIRED_PAYLOAD_FIELDS) {
    if (!(field in data)) {
      errors.push({ file: toolSlug, field, message: "required field missing" });
    }
  }

  // Check schema version
  if (data.schema !== "clwatch.payload.v1") {
    errors.push({ file: toolSlug, field: "schema", message: `unexpected schema: ${data.schema}` });
  }

  // Check meta
  if (typeof data.meta === "object" && data.meta !== null) {
    const meta = data.meta as Record<string, unknown>;
    for (const field of REQUIRED_META_FIELDS) {
      if (!(field in meta)) {
        errors.push({ file: toolSlug, field: `meta.${field}`, message: "required field missing" });
      }
    }
  }

  // Check payload structure
  if (typeof data.payload === "object" && data.payload !== null) {
    const payload = data.payload as Record<string, unknown>;
    for (const section of REQUIRED_PAYLOAD_SECTIONS) {
      if (!(section in payload)) {
        errors.push({ file: toolSlug, field: `payload.${section}`, message: "required section missing" });
      } else if (section === "deprecations") {
        // deprecations should be an object with commands and flags arrays
        const dep = payload[section] as Record<string, unknown>;
        if (typeof dep !== "object" || dep === null) {
          errors.push({ file: toolSlug, field: `payload.${section}`, message: "must be an object" });
        }
      } else if (!Array.isArray(payload[section])) {
        errors.push({ file: toolSlug, field: `payload.${section}`, message: "must be an array" });
      }
    }
  }

  return errors;
}

export function validateAllPayloads(): { tool: string; errors: ValidationError[] }[] {
  const { readdirSync } = require("node:fs");
  const results: { tool: string; errors: ValidationError[] }[] = [];

  const files = readdirSync(REFS_DIR).filter((f: string) =>
    f.endsWith(".json") && !["manifest.json", "status.json"].includes(f)
  );

  for (const file of files) {
    const tool = file.replace(".json", "");
    results.push({ tool, errors: validatePayload(tool) });
  }

  return results;
}
