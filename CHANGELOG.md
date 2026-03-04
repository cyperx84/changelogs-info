# Changelog

All notable changes to changelogs.info — the changelog site that tracks its own changes. 🔄

## [Unreleased]

## [0.7.0] — 2026-03-04

### Added
- **Visual polish** — Three.js matrix rain hero (lazy-loaded, mobile/reduced-motion safe), scroll-reveal animations, green divider separators, counter tick-up effects, featured card glow
- **22/22 cheatsheets** — complete coverage across all tracked tools with copy-to-clipboard and .md download buttons
- **15 config templates** — added goose, roo-code, opencode, openhands, open-webui, amp
- **11 migration guides** — added openclaw, roo-code, goose, continue, opencode
- **Expanded resource data** — 12x13 compatibility matrix, 12 deprecations, 16 recommendations (3x previous)
- **Quick-link cards** on tool detail pages — cheatsheet, configs, migrations when available
- **404 page** — terminal-themed error page with navigation links
- **SEO improvements** — twitter cards, theme-color, RSS autodiscovery, og:site_name
- **ScrollReveal component** — IntersectionObserver-based reveal animations site-wide

### Changed
- **Claude Code + OpenClaw prioritized everywhere** — featured badges, sort-first on all pages, /start_here hero section
- **12 tool descriptions enriched** — cursor, windsurf, goose, amp, and 8 others expanded from one-liners to full descriptions
- Removed cyperx@terminal handle from all pages
- Footer updated to subtle "made with ❤️ by CyperX"
- Branded favicon (green terminal prompt on dark background)
- Release data refreshed for all 18 tools with public repos
- Cleaned stale git branches

### Fixed
- gptme repo path corrected (was gptme-org/gptme, now gptme/gptme)
- migrations.astro build error (g.items.map) resolved with flexible JSON parsing

## [0.6.0] — 2026-03-03

### Added
- **Resources hub** — new `/resources` page linking migration guides, compatibility matrix, deprecations, and recommendations
- **Migration guides** — `/migrations` now reads structured JSON migration files with step-by-step before/after snippets
- **Compatibility matrix** — `/compatibility` page mapping harness-to-model support/defaults
- **Deprecation radar** — `/deprecations` with removal countdowns and migration pointers
- **Recommended actions** — `/recommendations` with high/medium/low impact guidance

### Changed
- **Featured priorities** — Claude Code + OpenClaw are now prioritized across homepage, tools, cheatsheets, configs, and resource pages
- Homepage now includes `/start_here` cards for Claude Code + OpenClaw with latest-release quick context
- Added subtle `featured` badges across resource tables/cards where these harnesses appear
- Removed hero prompt handle (`cyperx@terminal`) for a cleaner landing experience
- Footer credit updated to a subtle: `made with ❤️ by CyperX`

## [0.5.0] — 2026-03-03

### Added
- **Model directory** — `/models` page tracking AI models across 6 providers (Anthropic, OpenAI, Google, Meta, Mistral, Qwen) with release dates, context windows, and type classifications
- **Comprehensive configs** — real, copy-paste-ready config templates for 9 agent harnesses with syntax highlighting and copy buttons
- **OpenClaw configs** — 5+ production configs (gateway, multi-channel, agent army, cron jobs, skills, memory)
- **Agent harness terminology** — updated category labels site-wide: "CLI Harness", "IDE Harness", "Agent Platform"
- **README overhaul** — ASCII art header, badge row, full harness table, project structure

### Changed
- Cleaned up "scraping" language from public-facing pages → "updated", "syncs daily"

## [0.4.0] — 2026-03-03

### Changed
- **Streamlined UI** — reduced blinking cursors to brand mark only, removed excessive slash prefixes from footer
- Removed compare page (shelved for now)
- Nav simplified: Tools → Models → Cheatsheets → Configs → RSS

### Fixed
- Cheatsheets index page now uses filesystem reader (was silently empty due to missing content config)
- Cheatsheet links corrected from `/cheatsheets/:id` to `/tools/:id/cheatsheet`

## [0.3.0] — 2026-03-02

### Added
- **Terminal/hacker aesthetic** — complete visual redesign
  - Phosphor green (#00ff41) palette with CRT scanline overlay and vignette
  - JetBrains Mono as primary font everywhere
  - Terminal pane cards with `●●●` title bars
  - Path-style nav: `/tools /cheatsheets /configs`
  - Blinking terminal cursor in brand mark
  - Git-log style release feed
- **Cheatsheet auto-update pipeline** — weekly GitHub Action fetches from official docs, opens PRs when content changes
- `pnpm update-cheatsheets` command with `--dry-run` support

## [0.2.0] — 2026-03-02

### Added
- **10 comprehensive cheatsheets** (3,674 lines total)
  - Claude Code (535 lines) — CLI flags, agent teams, hooks, skills, MCP
  - OpenClaw (423 lines) — skills, cron, memory, plugins
  - Continue (395 lines), Windsurf (375 lines), Aider (370 lines)
  - Copilot CLI (361 lines), Cursor (332 lines), Codex CLI (316 lines)
  - Cline (305 lines), Gemini CLI (262 lines)
- **`/cheatsheets` index page** with categories: CLI Tools, AI IDEs, IDE Extensions, Agent Platforms
- **Dark/light theme toggle** with localStorage persistence and `prefers-color-scheme` default
- **Mobile-first responsive design** — hamburger nav, 44px touch targets, responsive grids

### Changed
- Nav reordered: Tools → Cheatsheets → Configs
- Intelligent compare metrics (velocity, stability, momentum scores, sparklines, sortable columns)

## [0.1.0] — 2026-03-02

### Added
- **changelogs.info MVP** — Astro 5 + Tailwind CSS v4
- 22 agent harnesses tracked with daily GitHub release sync
- Per-tool pages with version history and changelog rendering
- `/compare` page with category filters and sortable columns
- `/configs` page with starter templates
- Pagefind search across all pages
- RSS feeds (per-tool + combined)
- Sitemap generation
- Plausible analytics
- GitHub Actions workflow for daily release data sync
- 516 static pages generated

---

> *A changelog site without its own changelog? That'd be embarrassing.*
