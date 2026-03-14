/**
 * Schema validation for LLM extraction output.
 * Rejects bad data before it can corrupt payloads.
 */

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

const VALID_STATUSES = ["stable", "experimental"];
const REQUIRED_FEATURE_FIELDS = ["id", "name", "since"];
const REQUIRED_COMMAND_FIELDS = ["name", "description", "since"];
const REQUIRED_FLAG_FIELDS = ["flag", "description", "since"];
const REQUIRED_BREAKING_FIELDS = ["id", "version", "title", "description"];

function checkRequired(obj: Record<string, unknown>, fields: string[], context: string): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const field of fields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === "") {
      errors.push({ field: `${context}.${field}`, message: "required field missing", value: obj[field] });
    }
  }
  return errors;
}

function isValidId(id: string): boolean {
  return /^[a-z][a-z0-9-]*$/.test(id);
}

export function validateExtraction(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== "object") {
    return [{ field: "root", message: "extraction must be an object" }];
  }

  const d = data as Record<string, unknown>;

  // Validate array fields exist
  const arrayFields = ["new_features", "updated_features", "new_commands", "new_flags", "deprecated_flags", "deprecated_commands", "breaking_changes", "new_env_vars"];
  for (const field of arrayFields) {
    if (d[field] !== undefined && !Array.isArray(d[field])) {
      errors.push({ field, message: "must be an array", value: typeof d[field] });
    }
  }

  // Validate new_features
  if (Array.isArray(d.new_features)) {
    for (let i = 0; i < d.new_features.length; i++) {
      const f = d.new_features[i];
      if (typeof f !== "object" || f === null) {
        errors.push({ field: `new_features[${i}]`, message: "must be an object" });
        continue;
      }
      const feat = f as Record<string, unknown>;
      errors.push(...checkRequired(feat, REQUIRED_FEATURE_FIELDS, `new_features[${i}]`));
      if (feat.id && typeof feat.id === "string" && !isValidId(feat.id)) {
        errors.push({ field: `new_features[${i}].id`, message: "must be kebab-case", value: feat.id });
      }
      if (feat.status && !VALID_STATUSES.includes(feat.status as string)) {
        errors.push({ field: `new_features[${i}].status`, message: `must be one of: ${VALID_STATUSES.join(", ")}`, value: feat.status });
      }
    }
  }

  // Validate new_commands
  if (Array.isArray(d.new_commands)) {
    for (let i = 0; i < d.new_commands.length; i++) {
      const c = d.new_commands[i];
      if (typeof c !== "object" || c === null) {
        errors.push({ field: `new_commands[${i}]`, message: "must be an object" });
        continue;
      }
      errors.push(...checkRequired(c as Record<string, unknown>, REQUIRED_COMMAND_FIELDS, `new_commands[${i}]`));
    }
  }

  // Validate new_flags
  if (Array.isArray(d.new_flags)) {
    for (let i = 0; i < d.new_flags.length; i++) {
      const fl = d.new_flags[i];
      if (typeof fl !== "object" || fl === null) {
        errors.push({ field: `new_flags[${i}]`, message: "must be an object" });
        continue;
      }
      errors.push(...checkRequired(fl as Record<string, unknown>, REQUIRED_FLAG_FIELDS, `new_flags[${i}]`));
    }
  }

  // Validate breaking_changes
  if (Array.isArray(d.breaking_changes)) {
    for (let i = 0; i < d.breaking_changes.length; i++) {
      const bc = d.breaking_changes[i];
      if (typeof bc !== "object" || bc === null) {
        errors.push({ field: `breaking_changes[${i}]`, message: "must be an object" });
        continue;
      }
      errors.push(...checkRequired(bc as Record<string, unknown>, REQUIRED_BREAKING_FIELDS, `breaking_changes[${i}]`));
    }
  }

  // Validate meta_updates if present
  if (d.meta_updates !== undefined) {
    if (typeof d.meta_updates !== "object" || d.meta_updates === null) {
      errors.push({ field: "meta_updates", message: "must be an object" });
    }
  }

  return errors;
}

/**
 * Quick check: does this extraction have any actual changes?
 */
export function hasChanges(data: Record<string, unknown>): boolean {
  const arrayFields = ["new_features", "updated_features", "new_commands", "new_flags", "deprecated_flags", "deprecated_commands", "breaking_changes", "new_env_vars"];
  return arrayFields.some(f => Array.isArray(data[f]) && (data[f] as unknown[]).length > 0);
}
