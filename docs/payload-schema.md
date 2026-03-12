# clwatch.payload.v1 — Schema Spec

*Source of truth for the structured knowledge payload format served at `changelogs.info/api/refs/<tool>.json`.*

---

## Purpose

This schema is the canonical data contract between:
- **changelogs.info** (extracts and publishes)
- **clwatch CLI** (consumes via `clwatch refresh`)
- **Agent skills** (guide the agent's LLM to merge into local reference files)

Every meaningful claim must be **source-grounded** (has a `source_url`).  
Human pages and machine JSON are both rendered from these same payloads.

---

## Envelope

```json
{
  "schema": "clwatch.payload.v1",
  "tool": "<slug>",
  "version": "<version>",
  "generated_at": "<ISO8601>",
  "extracted_from_sources": ["<url>", ...],
  "verification": {
    "status": "verified | provisional | conflicted",
    "confidence": 0.0–1.0,
    "unverified_fields": ["dot.path.to.field", ...]
  },
  "stale_after": "<ISO8601>",
  "delta": { ... },
  "payload": { ... }
}
```

### Envelope fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `schema` | string | ✅ | Always `clwatch.payload.v1` |
| `tool` | string | ✅ | Slug: `claude-code`, `codex-cli`, etc. |
| `version` | string | ✅ | Version this payload was extracted against |
| `generated_at` | ISO8601 | ✅ | When changelogs.info generated this |
| `extracted_from_sources` | string[] | ✅ | Source URLs drawn from |
| `verification.status` | enum | ✅ | `verified` / `provisional` / `conflicted` |
| `verification.confidence` | float 0–1 | ✅ | Overall payload confidence |
| `verification.unverified_fields` | string[] | ✅ | Dot-paths of low-confidence fields. Empty if clean. |
| `stale_after` | ISO8601 | ✅ | Hint: when clwatch should force-refresh even without version change |
| `delta` | object | ✅ | Changes since previous version (see below) |
| `payload` | object | ✅ | The structured knowledge body |

---

## Delta block

Explicit diff summary between previous and current version.  
Lets clwatch skip full payload comparison — just read delta.

```json
"delta": {
  "from_version": "<prev-version>",
  "to_version": "<this-version>",
  "new_features": ["<feature-id>", ...],
  "new_commands": ["<command-name>", ...],
  "new_flags": ["<flag>", ...],
  "new_env_vars": ["<VAR_NAME>", ...],
  "deprecated_commands": ["<command-name>", ...],
  "deprecated_flags": ["<flag>", ...],
  "breaking_changes": ["<bc-id>", ...]
}
```

---

## Payload body

```json
"payload": {
  "meta": { ... },
  "features": [ ... ],
  "commands": [ ... ],
  "flags": {
    "current": [ ... ],
    "deprecated": [ ... ],
    "new_since_previous": ["<flag>", ...]
  },
  "env_vars": [ ... ],
  "models": [ ... ],
  "breaking_changes": [ ... ],
  "deprecations": [ ... ],
  "install": { ... },
  "support_matrix": { ... }
}
```

---

### `meta`

```json
"meta": {
  "display_name": "string",
  "vendor": "string",
  "kind": "tool | framework | sdk | api | model | platform",
  "tags": ["string"],
  "homepage": "url",
  "docs_url": "url",
  "changelog_url": "url",
  "repo_url": "url",
  "license": "string",
  "latest_stable": "version",
  "latest_release_date": "YYYY-MM-DD",
  "status": "active | deprecated | archived",
  "runtime": "node | native | python | ...",
  "written_in": "string"
}
```

---

### `features[]`

```json
{
  "id": "stable-slug",
  "name": "Display Name",
  "status": "stable | experimental | beta | deprecated",
  "since": "version",
  "description": "1–3 sentence factual description",
  "enabled_by": { "env_var": "NAME", "value": "1" },
  "related_commands": ["/command"],
  "key_details": ["discrete facts"],
  "source_url": "url"
}
```

| Field | Required |
|---|---|
| `id` | ✅ |
| `name` | ✅ |
| `status` | ✅ |
| `since` | ✅ |
| `description` | ✅ |
| `source_url` | ✅ |
| `enabled_by` | ❌ only if gated |
| `related_commands` | ❌ |
| `key_details` | ❌ |

---

### `commands[]`

```json
{
  "name": "/command",
  "syntax": "/command [args]",
  "description": "string",
  "since": "version",
  "status": "stable | experimental | beta | deprecated",
  "options": [{ "flag": "--x", "description": "..." }],
  "examples": ["string"],
  "replaced_by": "string",
  "source_url": "url"
}
```

---

### `flags`

```json
"flags": {
  "current": [
    {
      "flag": "--name",
      "values": ["a", "b"],
      "default": "a",
      "description": "string",
      "since": "version",
      "source_url": "url"
    }
  ],
  "deprecated": [
    {
      "flag": "--old",
      "replaced_by": "--new",
      "deprecated_since": "version",
      "removed_in": "version | null",
      "source_url": "url"
    }
  ],
  "new_since_previous": ["--flag"]
}
```

`new_since_previous` — array of flag names added since the prior version.  
Makes skill merge logic trivial — no need to diff full current array.

---

### `env_vars[]`

```json
{
  "name": "VAR_NAME",
  "purpose": "string",
  "values": ["string"],
  "default": "string",
  "status": "stable | experimental",
  "since": "version",
  "source_url": "url"
}
```

---

### `models[]`

```json
{
  "id": "model-id",
  "display_name": "string",
  "aliases": ["string"],
  "context_window": 200000,
  "extended_context": 1000000,
  "status": "stable | deprecated",
  "default": true,
  "recommended_for": ["string"],
  "access": "string",
  "note": "string",
  "source_url": "url"
}
```

---

### `breaking_changes[]`

```json
{
  "id": "bc-slug",
  "version": "version",
  "title": "string",
  "description": "string",
  "affected": ["flag:--name", "command:/cmd", "config:key"],
  "migration": "string",
  "source_url": "url"
}
```

`affected` uses typed prefixes: `flag:`, `command:`, `env:`, `config:`, `feature:`.

---

### `deprecations[]`

```json
{
  "id": "dep-slug",
  "item": "flag:--name | command:/name | feature:id",
  "title": "string",
  "deprecated_since": "version",
  "expected_removal": "version | null",
  "replacement": "string",
  "source_url": "url"
}
```

---

### `install`

```json
"install": {
  "methods": [
    {
      "name": "npm | brew | pip | cargo | winget | binary",
      "command": "string",
      "update_command": "string",
      "platforms": ["macos", "linux", "windows"]
    }
  ],
  "requirements": ["string"],
  "source_url": "url"
}
```

---

### `support_matrix`

```json
"support_matrix": {
  "platforms": ["macos", "linux", "windows"],
  "requires_auth": true,
  "auth_methods": ["api_key", "oauth"],
  "min_node_version": "18",
  "requires_git_repo": false,
  "requires_pty_for_tui": false,
  "source_url": "url"
}
```

---

## Manifest (`manifest.json`)

Single file at `changelogs.info/api/refs/manifest.json`.  
`clwatch diff` checks this first (one request) before fetching individual payloads.

```json
{
  "schema": "clwatch.manifest.v1",
  "generated_at": "<ISO8601>",
  "tools": {
    "<slug>": {
      "version": "version | null",
      "payload_url": "url",
      "generated_at": "ISO8601 | null",
      "verification_status": "verified | provisional | pending",
      "stale_after": "ISO8601 | null"
    }
  }
}
```

---

## Verification states

| Status | Meaning |
|---|---|
| `verified` | High confidence, all major claims source-grounded |
| `provisional` | Recent release, partial extraction, pending review |
| `conflicted` | Sources disagree — human review needed |
| `pending` | Payload not yet generated |

`unverified_fields` lists dot-paths of specific low-confidence fields within an otherwise verified payload.

---

## Design decisions

**Why `delta` is explicit?**  
`clwatch diff` reads only the delta block — no need to fetch and compare two full payloads.

**Why `stale_after`?**  
Some tools ship rolling doc updates without version bumps. `stale_after` lets `clwatch` force-refresh even without detecting a version change.

**Why `source_url` on every item?**  
Grounding is the anti-hallucination mechanism. Provisional items without source URLs should be flagged in `unverified_fields`.

**Why no prose summary at root?**  
Summaries are generated by the consuming agent's LLM from the structured data, tailored to its role. Centrally generated prose is opinionated and inflexible.

**Why split `breaking_changes` and `deprecations`?**  
Breaking changes require action now. Deprecations require a plan. The skill handles them differently — breaking changes always surface, deprecations are informational unless approaching removal.

**Why `new_since_previous` on flags?**  
Agents calling `clwatch refresh` need to know what's new fast, without diffing the entire flag array.

---

## Tool slugs

| Slug | Tool |
|---|---|
| `claude-code` | Claude Code (Anthropic) |
| `codex-cli` | Codex CLI (OpenAI) |
| `gemini-cli` | Gemini CLI (Google) |
| `opencode` | OpenCode (anomalyco) |
| `openclaw` | OpenClaw |

---

## Payload files

| File | Description |
|---|---|
| `public/api/refs/manifest.json` | Version manifest for all tools |
| `public/api/refs/claude-code.json` | Claude Code payload |
| `public/api/refs/codex-cli.json` | Codex CLI payload |
| `public/api/refs/gemini-cli.json` | Gemini CLI payload (pending) |
| `public/api/refs/opencode.json` | OpenCode payload (pending) |
| `public/api/refs/openclaw.json` | OpenClaw payload (pending) |
