# API Schema Reference

changelogs.info provides static JSON APIs at `https://changelogs.info/api/refs/`.

## Manifest (`/api/refs/manifest.json`)

The tracking manifest — a single request tells you every tool's current version and staleness.

```json
{
  "schema": "clwatch.manifest.v1",
  "generated": "2026-03-12T00:00:00Z",
  "tools": [
    {
      "id": "claude-code",
      "name": "Claude Code",
      "repo": "anthropics/claude-code",
      "version": "2.1.74",
      "stale_after": "2026-03-19T00:00:00Z",
      "last_updated": "2026-03-12T00:00:00Z",
      "delta": { ... }
    }
  ]
}
```

## Status (`/api/refs/status.json`)

Pipeline health + per-tool verification.

```json
{
  "schema": "clwatch.status.v1",
  "generated_at": "2026-03-12T00:00:00Z",
  "pipeline": {
    "last_run_at": "2026-03-12T00:00:00Z",
    "status": "ok",
    "tools_checked": 5,
    "tools_updated": 0,
    "tools_errored": 0
  },
  "tools": {
    "claude-code": {
      "version": "2.1.74",
      "verification_status": "verified",
      "last_checked_at": "2026-03-12T00:00:00Z",
      "stale": false
    }
  }
}
```

### Pipeline status values

| Value | Meaning |
|---|---|
| `ok` | All tools fetched and verified |
| `error` | Pipeline failed (check logs) |
| `partial` | Some tools succeeded, some failed |

### Verification status values

| Value | Meaning |
|---|---|
| `verified` | Payload matches latest release data |
| `stale` | Payload older than `stale_after` in manifest |
| `unverified` | Payload exists but not cross-checked |

## Tool Payload (`/api/refs/{tool-slug}.json`)

Full structured payload for a single tool. Available slugs: `claude-code`, `codex-cli`, `gemini-cli`, `opencode`, `openclaw`.

```json
{
  "schema": "clwatch.payload.v1",
  "id": "claude-code",
  "version": "1.0.0",
  "generated_at": "2026-03-12T00:00:00Z",
  "meta": {
    "name": "Claude Code",
    "description": "Anthropic's coding agent CLI",
    "repo": "anthropics/claude-code",
    "docs_url": "https://docs.anthropic.com/claude-code",
    "latest_stable": "2.1.74",
    "latest_release_date": "2026-03-12",
    "verification_status": "verified"
  },
  "payload": {
    "meta": {
      "latest_stable": "2.1.74",
      "latest_release_date": "2026-03-12",
      "tldr": "LLM-written summary of the latest release — see below"
    },
    "features": [...],
    "commands": [...],
    "flags": [...],
    "env_vars": [...],
    "deprecations": { "commands": [...], "flags": [...] },
    "breaking_changes": [...],
    "delta": { "from_version": "2.1.71", "to_version": "2.1.74", ... }
  }
}
```

### TL;DR summary (`payload.meta.tldr`)

An LLM-written plain-English summary of the most important changes in the latest release. Present after the first Tier 2 extraction run for supported tools (`claude-code`, `codex-cli`, `openclaw`). May be `null` or absent for tools without Tier 2 coverage.

```json
{
  "payload": {
    "meta": {
      "tldr": "This release adds a new /memory command for persistent context, fixes a crash when CLAUDE_MODEL is unset, and deprecates the --no-cache flag in favor of --cache-control=none. No breaking changes."
    }
  }
}
```

The summary is generated from the canonical changelog section when available, otherwise from the GitHub release body. It is refreshed on every version bump and on same-version release note edits.

### Features

```json
{
  "id": "auto-memory-directory",
  "name": "Auto Memory Directory",
  "status": "stable",
  "since": "2.1.74",
  "description": "Automatically manages memory files in .claude/memory/",
  "key_details": [
    "Supports per-directory memory files",
    "Inherited from parent directories"
  ],
  "source_url": "https://github.com/anthropics/claude-code/releases/tag/2.1.74"
}
```

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique kebab-case identifier |
| `name` | string | Human-readable display name |
| `status` | `"stable"` \| `"experimental"` | Maturity level |
| `since` | string | Version introduced |
| `description` | string | What it does |
| `key_details` | string[] | Bullet points |
| `source_url` | string | Link to release notes |

### Commands

```json
{
  "name": "/context",
  "syntax": "/context [subcommand]",
  "description": "Manage conversation context",
  "since": "2.1.74",
  "status": "stable",
  "source_url": "https://..."
}
```

### Flags

```json
{
  "flag": "--verbose",
  "description": "Enable verbose output",
  "since": "2.1.0",
  "source_url": "https://..."
}
```

### Env vars

```json
{
  "name": "CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS",
  "purpose": "Timeout for session-end hooks in milliseconds",
  "status": "stable",
  "since": "2.1.74",
  "source_url": "https://..."
}
```

### Deprecations

```json
{
  "deprecations": {
    "commands": [
      {
        "name": "/output-style",
        "replaced_by": "/style",
        "deprecated_since": "2.1.74",
        "source_url": "https://..."
      }
    ],
    "flags": []
  }
}
```

### Breaking changes

```json
{
  "breaking_changes": [
    {
      "id": "config-format-v2",
      "version": "2.2.0",
      "title": "Config format migrated to YAML",
      "description": "The .claude/config.json format is replaced by config.yaml",
      "affected": [".claude/config.json", "setup scripts"],
      "migration": "Run `claude migrate config` or manually convert JSON to YAML",
      "source_url": "https://..."
    }
  ]
}
```

### Delta block

The `delta` field shows what changed between two versions:

```json
{
  "from_version": "2.1.71",
  "to_version": "2.1.74",
  "new_features": ["autoMemoryDirectory", "modelOverrides"],
  "new_commands": ["/context"],
  "new_flags": [],
  "new_env_vars": ["CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS"],
  "deprecated_commands": ["/output-style"],
  "deprecated_flags": [],
  "breaking_changes": []
}
```

## Usage examples

### Check for updates (bash)

```bash
# Fetch manifest and check versions
curl -s https://changelogs.info/api/refs/manifest.json | \
  jq -r '.tools[] | "\(.id): \(.version)"'

# Compare against local known versions
LOCAL_VER="2.1.71"
CURRENT_VER=$(curl -s https://changelogs.info/api/refs/claude-code.json | \
  jq -r '.meta.latest_stable')
if [ "$LOCAL_VER" != "$CURRENT_VER" ]; then
  echo "claude-code: $LOCAL_VER → $CURRENT_VER"
fi
```

### Status check (JavaScript)

```javascript
const res = await fetch("https://changelogs.info/api/refs/status.json");
const status = await res.json();
console.log(`Pipeline: ${status.pipeline.status}`);
console.log(`Last run: ${status.pipeline.last_run_at}`);

for (const [tool, info] of Object.entries(status.tools)) {
  console.log(`${tool}: ${info.version} (${info.verification_status})`);
}
```

### Get delta for a tool

```bash
curl -s https://changelogs.info/api/refs/claude-code.json | jq '.payload.delta'
```
