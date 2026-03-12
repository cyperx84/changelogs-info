# changelogs.info

> **Every release. One place.** Track changelogs, models, and configs for AI coding agent harnesses.

[![Live Site](https://img.shields.io/badge/live-changelogs.info-00ff41?style=flat-square)](https://changelogs.info)
[![Tools](https://img.shields.io/badge/harnesses_tracked-5-6366f1?style=flat-square)](https://changelogs.info)
[![Pipeline](https://img.shields.io/badge/pipeline-every_hour-ffb800?style=flat-square)](.github/workflows/pipeline.yml)

## What is this?

changelogs.info is a **static site + data pipeline** that tracks releases of AI coding tools. It provides:

- **Real-time changelog tracking** — Claude Code, Codex CLI, Gemini CLI, OpenCode, OpenClaw
- **Structured JSON payloads** — machine-readable release data for every tracked tool
- **Status dashboard** — pipeline health, verification status, staleness detection
- **Cheatsheets, configs, migration guides, model references** — curated for each tool
- **CLI tool (`clwatch`)** — install locally to diff, watch, and merge updates into your agent configs

### How it works

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions (hourly cron)                               │
│                                                             │
│  1. Fetch release data from GitHub APIs (ETag-cached)       │
│  2. Diff against local payloads — detect version changes    │
│  3. If version changed → Tier 2: LLM extraction (OpenRouter)│
│  4. Merge structured data into payload JSON                 │
│  5. Write status.json + commit everything                   │
│  6. Deploy to Cloudflare Pages (auto)                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              static JSON at /api/refs/
              ┌──────────────────────┐
              │  manifest.json       │  ← full tracking manifest
              │  status.json         │  ← pipeline health
              │  claude-code.json    │
              │  codex-cli.json      │
              │  gemini-cli.json     │
              │  opencode.json       │
              │  openclaw.json       │
              └──────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    Website UI       clwatch CLI     Any agent tool
```

## Architecture

### Repos

| Repo | Purpose |
|---|---|
| [`changelogs-info`](.) | Website + data pipeline + payloads |
| [`clwatch`](https://github.com/cyperx84/clwatch) | Go CLI for consuming payloads |
| [`clwatch-skill`](https://github.com/cyperx84/clwatch-skill) | Agent skill (Claude Code, Gemini, OpenClaw) |
| [`homebrew-tap`](https://github.com/cyperx84/homebrew-tap) | Homebrew tap formula |

### Pipeline modules

All in `src/pipeline/`:

| File | Role |
|---|---|
| `run.ts` | Entry point — orchestrates everything, prints summary |
| `sources.ts` | Tool definitions + GitHub repo URLs |
| `fetcher.ts` | GitHub API client with ETag caching + rate limit handling |
| `evidence.ts` | Timestamped raw data storage (audit trail) |
| `diff.ts` | Version comparison + scope detection (small/medium/large) |
| `refresh.ts` | Tier 2 LLM extraction via OpenRouter |
| `merge.ts` | Idempotent merge of extracted data into payloads |

### API endpoints

All static JSON, deployed via Cloudflare Pages:

| Endpoint | Description |
|---|---|
| `/api/refs/manifest.json` | Full tracking manifest with all tool versions |
| `/api/refs/status.json` | Pipeline health + per-tool verification |
| `/api/refs/{tool-slug}.json` | Full payload for a specific tool |
| `/api/sse/changelog.md` | Aggregated changelog markdown |

### Payload schema

Each tool payload follows the `clwatch.payload.v1` schema:

```json
{
  "schema": "clwatch.payload.v1",
  "id": "claude-code",
  "generated_at": "2026-03-12T00:00:00Z",
  "meta": { "latest_stable": "2.1.74", ... },
  "payload": {
    "features": [...],
    "commands": [...],
    "flags": [...],
    "env_vars": [...],
    "deprecations": { "commands": [...], "flags": [...] },
    "breaking_changes": [...]
  }
}
```

## Development

### Prerequisites

- Node.js 22+
- pnpm (`corepack enable pnpm`)

### Setup

```bash
git clone https://github.com/cyperx84/changelogs-info.git
cd changelogs-info
pnpm install
```

### Run the site locally

```bash
pnpm dev          # dev server at http://localhost:4321
pnpm build        # production build
pnpm preview      # preview production build
```

### Run the pipeline locally

```bash
# Tier 1 only (no LLM needed)
npm run pipeline:run

# With Tier 2 LLM extraction (needs OpenRouter key)
LLM_API_KEY="sk-or-..." npm run pipeline:run -- --force-tier2

# Specific tool only
LLM_API_KEY="sk-or-..." npm run pipeline:run -- --tool claude-code

# JSON output mode
npm run pipeline:run -- --json
```

### Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `LLM_API_KEY` | No | — | API key for Tier 2 extraction (OpenRouter, OpenAI, etc.) |
| `LLM_API_URL` | No | `https://openrouter.ai/api/v1` | OpenAI-compatible API base URL |
| `LLM_MODEL` | No | `google/gemini-2.0-flash-001` | Model ID for extraction |
| `GITHUB_TOKEN` | No | — | GitHub PAT for higher API rate limits (60→5000/hr) |

**Legacy support:** `ANTHROPIC_API_KEY` still works — auto-converts to `LLM_API_KEY` with Anthropic API URL.

### Pipeline tiers

**Tier 1 — Diff detection** (runs every run, no API key needed):
- Fetches latest release data from GitHub
- Compares against local payloads
- Detects version changes + scope (small/medium/large)
- Stores evidence for audit trail

**Tier 2 — LLM extraction** (runs when version changes):
- Sends release notes to an LLM
- Extracts structured data: features, commands, flags, breaking changes
- Merges idempotently into existing payload
- Falls back to queue stub if no API key

### Adding a new tool

1. Add to `src/pipeline/sources.ts`:

```typescript
{
  slug: "tool-name",
  repo: "owner/repo",
  sources: [
    { type: "github_releases", ... }
  ]
}
```

2. Run pipeline: `npm run pipeline:run -- --tool tool-name`

3. Add hand-crafted payload: `public/api/refs/tool-name.json`

4. Update manifest: add entry to `public/api/refs/manifest.json`

### Deployment

Automatic via Cloudflare Pages on push to `main`. Pipeline runs hourly via GitHub Actions and commits updated payloads + status.json back to the repo.

### Scheduled pipeline (GitHub Actions)

- **Trigger:** Hourly cron (`0 * * * *`) + manual `workflow_dispatch`
- **Manual:** Can specify `--tool` and `--force-tier2` inputs
- **Auto-commit:** Pipeline commits updated payloads with `[skip ci]` to prevent loops
- **Secrets needed:** `OPENROUTER_API_KEY` (for Tier 2), `GITHUB_TOKEN` (for higher rate limits, provided automatically)

## Related

- **`clwatch` CLI** — [`cyperx84/clwatch`](https://github.com/cyperx84/clwatch) — consume these payloads locally
- **`clwatch` skill** — [`cyperx84/clwatch-skill`](https://github.com/cyperx84/clwatch-skill) — agent integration
- **Cheatsheets** — [changelogs.info/cheatsheets](https://changelogs.info/cheatsheets)

## License

MIT
