# changelogs.info — Product Requirements Document

*Created: 2026-03-02*
*Author: Builder 🔧 + CyperX*
*Status: Approved — ready to build*

---

## 1. Vision

**One website that aggregates changelogs, cheat sheets, and workflows for every AI coding CLI and agent harness.**

changelogs.info is the place devs go to:
- See what shipped across all tools
- Look up commands they forgot
- Compare tools before choosing
- Learn multi-tool workflows from real practitioners

It's also backed by a CLI tool and OpenClaw skill that syncs changelog intelligence directly into developer workflows.

---

## 2. Why This Exists

- Nobody aggregates coding CLI changelogs — devs check 10+ sources separately
- High SEO value ("claude code changelog" gets searched constantly)
- Positions CyperX as the authority on AI coding tools
- Low maintenance once scrapers are automated
- Feeds a newsletter, content flywheel, and eventual revenue

---

## 3. Users

### Primary: Working Devs
Use AI coding tools daily. Want to know what's new, what broke, and what they're missing.

### Secondary: Evaluators / Team Leads
Choosing tools for their team. Need comparisons, pricing, security info.

### Tertiary: Beginners
Heard about AI coding tools, don't know where to start. Need a "start here" page.

### Bonus: Tool Makers & Content Creators
Monitor competitor releases. Embed/reference our data.

---

## 4. Tools to Track at Launch

### Category 1: Coding CLIs & IDE Agents
| Tool | Source Type | GitHub Repo |
|:--|:--|:--|
| Claude Code | GitHub releases | anthropics/claude-code |
| Codex CLI | GitHub releases | openai/codex |
| Gemini CLI | GitHub releases | google-gemini/gemini-cli |
| Cursor | Blog/changelog scrape | getcursor.com |
| Windsurf/Cascade | Blog/changelog scrape | codeium.com |
| Aider | GitHub releases | Aider-AI/aider |
| Cline | GitHub releases | cline/cline |
| Continue | GitHub releases | continuedev/continue |
| Copilot CLI | GitHub releases | github/copilot.vim |
| Void | GitHub releases | voideditor/void |
| Avante.nvim | GitHub releases | yetone/avante.nvim |
| Tabby | GitHub releases | TabbyML/tabby |
| Roo Code | GitHub releases | RooVetGit/Roo-Code |
| Amp (Sourcegraph) | GitHub releases | sourcegraph/amp |
| OpenCode | GitHub releases | sst/opencode |

### Category 2: Agent Harnesses & Personal AI
| Tool | Source Type | GitHub Repo |
|:--|:--|:--|
| OpenClaw | GitHub releases | openclaw/openclaw |
| Goose | GitHub releases | block/goose |
| Plandex | GitHub releases | plandex-ai/plandex |
| GPTMe | GitHub releases | gptme-org/gptme |
| OpenHands | GitHub releases | All-Hands-AI/OpenHands |
| Khoj | GitHub releases | khoj-ai/khoj |

### Future Expansion
Letta/MemGPT, Composio, E2B, Open WebUI, more as they emerge.

---

## 5. Site Architecture

### URL Structure
```
changelogs.info
├── /                           ← Homepage: latest releases across all tools
├── /{tool}/                    ← Tool landing page (overview + latest)
├── /{tool}/changelog/          ← Full changelog history
├── /{tool}/changelog/{version} ← Specific version page
├── /{tool}/cheatsheet/         ← Command reference card
├── /compare/                   ← Capability comparison matrix
├── /workflows/                 ← Multi-tool workflow guides
├── /configs/                   ← Starter config templates
├── /tips/                      ← Hidden features, did-you-know
├── /pricing/                   ← Plans & cost comparison
├── /start/                     ← Beginner decision tree
├── /newsletter/                ← Weekly digest signup
├── /status/                    ← Tool health/uptime dashboard
├── /feed/all.xml               ← Combined RSS feed
├── /feed/{tool}.xml            ← Per-tool RSS feed
└── /search/                    ← Global search
```

### Content Types
1. **Changelogs** (automated) — scraped daily, structured markdown with frontmatter
2. **Cheat sheets** (auto-updated) — command reference cards per tool, patch when new features ship
3. **Comparisons** (auto-generated) — capability matrix from structured data
4. **Workflows** (curated) — multi-tool guides, community submitted
5. **Configs** (curated) — starter templates (CLAUDE.md, .cursorrules, etc.)
6. **Tips** (curated) — hidden features, underdocumented capabilities
7. **Pricing** (manual + scraped) — plans, costs, calculator

### Changelog source-of-truth policy
- Prefer the tool's canonical `CHANGELOG.md` (or equivalent official changelog document) as the primary body content shown on tool pages.
- Use GitHub release posts mainly for release detection, metadata, linking, and fallback body content.
- UI order should be: **TL;DR → canonical changelog section → secondary reference links**.
- If the changelog file is missing, stubby, or cannot be matched to the version, fall back to the GitHub release body.

---

## 6. Data Pipeline

### Scraper Architecture
```
GitHub Actions (daily cron)
├── github-releases-scraper.ts   ← For tools with GitHub releases
├── blog-scraper.ts              ← For Cursor, Windsurf (web scrape)
├── changelog-file-scraper.ts    ← For tools with CHANGELOG.md in repo
└── normalize.ts                 ← Normalize all formats to standard schema
    ↓
changelogs/{tool}/{version}.md   ← Structured markdown output
    ↓
Astro build → Static site
```

### Changelog Entry Schema (frontmatter)
```yaml
---
tool: claude-code
version: "1.2.3"
date: 2026-03-01
type: stable | beta | rc | nightly
breaking: false
summary: "One-line summary of this release"
highlights:
  - "Feature: /simplify command for parallel code quality agents"
  - "Feature: HTTP hook handlers"
  - "Fix: Memory leak in large context windows"
tags:
  - agent-teams
  - hooks
  - performance
source: https://github.com/anthropics/claude-code/releases/tag/v1.2.3
---

Full changelog content in markdown...
```

### Cheat Sheet Schema (frontmatter)
```yaml
---
tool: claude-code
lastUpdated: 2026-03-01
autoUpdated: true
sections:
  - commands
  - flags
  - agent-teams
  - hooks
  - keyboard-shortcuts
---
```

### Scraper Health
- Last run timestamp per tool
- Success/fail status
- Items scraped count
- Alert if scraper fails 2x in a row
- Manual override layer for corrections

---

## 7. Tech Stack

| Layer | Choice | Why |
|:--|:--|:--|
| Framework | **Astro** | Chris's preference, excellent static site perf, content collections |
| Hosting | **Cloudflare Pages** | Free, fast, global CDN, easy deploys |
| Scrapers | **GitHub Actions** | Free for public repos, cron support, TypeScript |
| Data format | **Markdown + YAML frontmatter** | Git-native, easy to edit, Astro content collections |
| Search | **Pagefind** | Static site search, zero-config with Astro, runs client-side |
| Analytics | **Plausible** or **Fathom** | Privacy-friendly, no cookie banner needed |
| Newsletter | **Buttondown** or **Resend** | Dev-friendly, markdown-native |
| RSS | **Astro RSS plugin** | Built-in, generates per-tool + combined feeds |
| Styling | **Tailwind CSS** | Fast to build, consistent, Astro integration |

---

## 8. MVP Scope (Phase 1)

**Goal: Ship a useful site with 6 tools in 1-2 weeks.**

### MVP Tools (start with GitHub releases — easiest to scrape)
1. Claude Code
2. Codex CLI
3. Gemini CLI
4. Aider
5. Cline
6. OpenClaw

### MVP Features
- [ ] GitHub releases scraper (TypeScript, runs in GitHub Actions)
- [ ] Normalized markdown output with frontmatter schema
- [ ] Astro site with content collections
- [ ] Homepage: latest releases across all tools (reverse chronological)
- [ ] Per-tool page: changelog history + overview
- [ ] Per-tool cheat sheet (manually seeded, auto-updated later)
- [ ] Global search (Pagefind)
- [ ] RSS feeds (per-tool + combined)
- [ ] Mobile responsive
- [ ] Dark mode
- [ ] "Last checked" timestamp per tool
- [ ] Deploy to Cloudflare Pages
- [ ] Basic SEO (meta tags, OG images, sitemap)

### MVP NOT included (Phase 2+)
- Blog/web scrapers (Cursor, Windsurf)
- Comparison matrix page
- Workflows section
- Configs/templates section
- Newsletter signup
- Pricing page
- Status dashboard
- CLI tool (cliwatch)
- OpenClaw skill
- Community contributions
- Cost calculator
- Admin dashboard

---

## 9. Phase 2 (Weeks 3-4)

- [ ] Blog scrapers for Cursor + Windsurf
- [ ] Add remaining tools (Continue, Copilot, Void, Tabby, Goose, etc.)
- [ ] Comparison matrix page (auto-generated from structured data)
- [ ] Newsletter signup + weekly digest
- [ ] Starter config templates page
- [ ] Auto-generated OG images per release
- [ ] "Breaking changes" prominent flagging
- [ ] Release type filter (stable / beta / nightly)

---

## 10. Phase 3 (Month 2+)

- [ ] Workflows section (curated multi-tool guides)
- [ ] Pricing comparison + calculator
- [ ] Tips / hidden features section
- [ ] CLI tool (`cliwatch`) — query, diff, sync
- [ ] OpenClaw skill — cron-based changelog detection + context patching
- [ ] Status/uptime dashboard
- [ ] Embeddable widgets for other sites
- [ ] PWA with offline cheat sheets
- [ ] Community contribution flow (GitHub PRs)
- [ ] Webhook notifications for new releases
- [ ] Feature request trends (scraped from GitHub issues)
- [ ] "First to ship" badges
- [ ] Release velocity tracker
- [ ] Beginner "start here" decision tree
- [ ] Glossary page

---

## 11. User Experience Details

### Search
- `Cmd+K` keyboard shortcut
- Autocomplete suggestions
- Filter by tool, content type, date
- Powered by Pagefind (static, client-side, fast)

### Changelog Pages
- Breaking changes prominently flagged (red banner)
- "What's new" highlights at top, full changelog below
- Version selector/navigator
- Link to original source
- "Last checked: X hours ago" freshness indicator
- Stable/beta/nightly toggle

### Cheat Sheets
- Printable/downloadable
- Copy button per command
- Auto-updates when scraper detects new features
- Side-by-side view for comparing two tools

### Mobile
- Fast load (static site + CDN)
- Touch-friendly copy buttons
- Collapsible sections
- PWA installable (Phase 3)

---

## 12. SEO Strategy

### High-Value Pages
- `changelogs.info/claude-code/` — "claude code changelog"
- `changelogs.info/claude-code/cheatsheet/` — "claude code commands"
- `changelogs.info/compare/` — "cursor vs claude code"
- `changelogs.info/configs/` — "best claude.md"

### Technical SEO
- Static HTML (Astro) — perfect for crawlers
- Structured data (JSON-LD) for software releases
- Sitemap auto-generated
- Fast load times (Cloudflare CDN)
- Canonical URLs pointing to original sources where appropriate
- Add transformative value (summaries, tags, comparisons) to avoid duplicate content penalties

---

## 13. Revenue (Future)

1. **Newsletter** — weekly digest, grow audience
2. **Sponsorships** — tool makers sponsor their tool's page
3. **Affiliate links** — to paid tool plans
4. **Premium summaries** — AI-generated weekly analysis
5. **Ads** (last resort) — Carbon Ads or similar dev-friendly network

---

## 14. Legal / Attribution

- Always link back to original changelog source
- Respect each tool's license (most changelogs are public/MIT)
- Add transformative value (summaries, tags, cross-tool context)
- Include attribution footer: "Data sourced from official releases"
- "Report error" button per entry for corrections

---

## 15. Success Metrics

### Month 1
- Site live with 6+ tools
- Scrapers running daily without failures
- 10+ indexed pages in Google

### Month 3
- 15+ tools tracked
- 1,000+ monthly visitors
- Newsletter with 100+ subscribers
- Cheat sheets for all major tools

### Month 6
- 20+ tools tracked
- 10,000+ monthly visitors
- CLI tool published
- OpenClaw skill published
- Workflows section with 10+ guides

---

## 16. Repository Structure

```
changelogs.info/
├── .github/
│   └── workflows/
│       └── scrape.yml          ← Daily scraper cron
├── scrapers/
│   ├── github-releases.ts      ← GitHub releases API scraper
│   ├── blog-scraper.ts         ← Web page scraper (Phase 2)
│   ├── normalize.ts            ← Normalize to standard schema
│   └── tools.json              ← Tool registry (name, repo, source type)
├── src/
│   ├── content/
│   │   ├── changelogs/         ← Generated: {tool}/{version}.md
│   │   ├── cheatsheets/        ← {tool}.md
│   │   └── tools/              ← {tool}.md (tool metadata/overview)
│   ├── layouts/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── [tool]/
│   │   │   ├── index.astro
│   │   │   ├── changelog/
│   │   │   │   ├── index.astro
│   │   │   │   └── [version].astro
│   │   │   └── cheatsheet.astro
│   │   ├── compare.astro
│   │   └── search.astro
│   ├── components/
│   └── styles/
├── public/
│   └── icons/                  ← Tool logos/icons
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

---

## 17. Open Questions

1. **Domain purchased?** — Need to confirm changelogs.info is secured
2. **GitHub org name?** — `changelogs-info`? `changelogs-dev`?
3. **Analytics provider?** — Plausible (hosted) vs Fathom vs self-hosted
4. **Newsletter provider?** — Buttondown vs Resend vs ConvertKit
5. **Initial cheat sheet content** — Seed manually from existing knowledge or scrape docs?

---

*Let's build.* 🔧
