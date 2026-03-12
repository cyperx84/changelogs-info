```
 ██████╗██╗  ██╗ █████╗ ███╗   ██╗ ██████╗ ███████╗██╗      ██████╗  ██████╗ ███████╗
██╔════╝██║  ██║██╔══██╗████╗  ██║██╔════╝ ██╔════╝██║     ██╔═══██╗██╔════╝ ██╔════╝
██║     ███████║███████║██╔██╗ ██║██║  ███╗█████╗  ██║     ██║   ██║██║  ███╗███████╗
██║     ██╔══██║██╔══██║██║╚═██║██║    ██║██╔══╝  ██║     ██║   ██║██║   ██║╚════██║
╚██████╗██║  ██║██║  ██║██║ ╚████║╚██████╔╝███████╗███████╗╚██████╔╝╚██████╔╝███████║
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝╚══════╝╚══════╝ ╚═════╝  ╚═════╝╚══════╝
                            ╔═╗╔╗╔╔═╗╔═╗
                            ║ ║║║║╠╣ ║ ║
                            ╚═╝╝╚╝╚  ╚═╝
```

# changelogs.info

> **Every release. One place.** Track changelogs, models, and configs for AI coding agent harnesses.

[![Live Site](https://img.shields.io/badge/live-changelogs.info-00ff41?style=flat-square)](https://changelogs.info)
[![Tools](https://img.shields.io/badge/harnesses_tracked-22-6366f1?style=flat-square)](https://changelogs.info)
[![Cheatsheets](https://img.shields.io/badge/cheatsheets-10-00d4ff?style=flat-square)](https://changelogs.info/cheatsheets)
[![Pages](https://img.shields.io/badge/pages-516-ffb800?style=flat-square)](https://changelogs.info)

---

## What is this?

The definitive hub for AI coding agent harness releases. One site that aggregates changelogs, cheatsheets, model compatibility, and starter configs for every major AI coding tool — so you never miss a feature, fix, or breaking change.

```
┌─────────────────────────────────────────────────────────┐
│  changelogs.info                                        │
│                                                         │
│  /tools        22 agent harnesses tracked               │
│  /models       6 model providers, 20+ models            │
│  /cheatsheets  10 comprehensive CLI references          │
│  /configs      9 harnesses with copy-paste configs      │
│                                                         │
│  Updated daily via GitHub Actions                       │
└─────────────────────────────────────────────────────────┘
```

## Tracked Harnesses

### CLI Harnesses
| Harness | Repo |
|---------|------|
| **Claude Code** | `anthropics/claude-code` |
| **Codex CLI** | `openai/codex` |
| **Gemini CLI** | `google-gemini/gemini-cli` |
| **Aider** | `Aider-AI/aider` |
| **OpenClaw** | `openclaw/openclaw` |
| **OpenCode** | `opencode-ai/opencode` |
| **Goose** | `block/goose` |
| **Plandex** | `plandex-ai/plandex` |
| **Amp** | `AmpAI/amp-cli` |

### IDE Harnesses
| Harness | Repo |
|---------|------|
| **Cursor** | `getcursor/cursor` |
| **Windsurf** | `codeiumdev/windsurf` |
| **Void** | `voideditor/void` |

### IDE Extensions
| Harness | Repo |
|---------|------|
| **Cline** | `cline/cline` |
| **Continue** | `continuedev/continue` |
| **Copilot CLI** | `github/copilot-cli` |
| **Roo Code** | `RooVetGit/Roo-Code` |
| **Avante.nvim** | `yetone/avante.nvim` |

### Agent Platforms
| Harness | Repo |
|---------|------|
| **OpenHands** | `All-Hands-AI/OpenHands` |
| **Open WebUI** | `open-webui/open-webui` |
| **Tabby** | `TabbyML/tabby` |
| **Khoj** | `khoj-ai/khoj` |
| **GPTMe** | `ErikBjare/gptme` |

## Features

### 📋 Release Tracking
Every GitHub release for all 22 harnesses, synced daily. Version history, changelogs, and release notes in one place.

### 📖 Cheatsheets
Comprehensive quick-reference guides for 10 harnesses — commands, flags, config options, workflows, and tips. The Claude Code cheatsheet alone is 500+ lines.

### 🧠 Model Directory
Track which AI models power these harnesses. Anthropic, OpenAI, Google, Meta, Mistral, and Qwen — with release dates, context windows, and type classifications.

### ⚙️ Starter Configs
Real, production-quality configs you can copy-paste. CLAUDE.md templates, .cursorrules, aider configs, OpenClaw gateway setups, and more. Not toy examples — configs people actually use.

### 🔄 Auto-Updating Cheatsheets
Weekly automation pulls from official docs and opens PRs when CLI commands or features change. Never stale.

## Extraction Pipeline

An automated pipeline fetches GitHub releases for tracked tools, detects version changes, and updates payload files.

### How it works

1. GitHub Actions runs `npm run pipeline:run` every 6 hours (or on manual trigger)
2. For each tool, the pipeline fetches the latest GitHub releases API data
3. ETag-based conditional requests skip processing when nothing changed (304)
4. Tier 1 diff detects version changes and applies patches to `public/api/refs/*.json`
5. Tier 2 refresh is queued when deeper changelog analysis is needed
6. Updated payloads are committed and pushed automatically

### Running locally

```bash
# Run for all tools
npm run pipeline:run

# Run for a specific tool
npm run pipeline:run -- --tool claude-code

# Force Tier 2 extraction
npm run pipeline:run -- --force-tier2

# JSON output (machine-readable summary)
npm run pipeline:run -- --json
```

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | Recommended | GitHub token for 5000 req/hr (vs 60 unauthenticated) |
| `ANTHROPIC_API_KEY` | For Tier 2 | Required for LLM-based changelog extraction |

### Adding a new tool

1. Add source entries to `src/pipeline/sources.ts` (at minimum a `github_releases` source)
2. Create the tool's payload file in `public/api/refs/<slug>.json`
3. Add the tool to `public/api/refs/manifest.json`
4. Run `npm run pipeline:run -- --tool <slug>` to verify

## Tech Stack

```
Framework    Astro 5
Styling      Tailwind CSS v4
Fonts        JetBrains Mono + Inter
Search       Pagefind
Deploy       Push to main → live
Data         GitHub Actions (daily release sync)
Automation   Weekly cheatsheet refresh → auto PR
```

## Development

```bash
# Install
pnpm install

# Dev server
pnpm dev

# Build (generates 516 static pages)
pnpm build

# Preview build
pnpm preview

# Sync release data
pnpm scrape

# Update cheatsheets from docs
pnpm update-cheatsheets
```

## Project Structure

```
src/
├── content/
│   ├── cheatsheets/     # 10 comprehensive .md cheatsheets
│   ├── configs/         # Config templates per harness (.json)
│   ├── models/          # AI model data per provider (.json)
│   └── releases/        # Release data per harness (.json)
├── components/
│   ├── ToolCard.astro   # Terminal-style harness card
│   ├── ReleaseEntry.astro
│   └── Search.astro     # Pagefind search
├── layouts/
│   └── BaseLayout.astro # Terminal nav, theme toggle, CRT effects
├── pages/
│   ├── index.astro      # Homepage with harness grid + release feed
│   ├── models.astro     # AI model directory
│   ├── cheatsheets.astro
│   ├── configs.astro    # Filterable config templates
│   └── tools/[id]/      # Per-harness pages + cheatsheet routes
├── lib/
│   └── releases.ts      # Data loading utilities
└── styles/
    └── global.css       # Terminal aesthetic + dark/light themes
```

## Design

Terminal/hacker aesthetic with a phosphor green palette, CRT scanline effects, JetBrains Mono typography, and a dark/light theme toggle. Cards styled as terminal panes. Nav links are paths. The whole site feels like browsing a beautifully designed terminal.

## Contributing

Found a missing harness? Want to improve a cheatsheet? PRs welcome.

```bash
# Add a new harness
# 1. Add entry to scrapers/tools.json
# 2. Run pnpm scrape to fetch releases
# 3. Optionally add cheatsheet in src/content/cheatsheets/
# 4. Optionally add configs in src/content/configs/
```

## License

MIT

---

<p align="center">
  <code>> crafted by <a href="https://github.com/cyperx84">cyperx</a> | powered by astro + tailwind</code>
</p>
