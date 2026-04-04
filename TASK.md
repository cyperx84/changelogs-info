# Task: Consolidate, Clean Up, Redesign

Repository: `/Users/cyperx/github/changelogs-info`
Build: `npm run build`
Deploy: `wrangler pages deploy dist --project-name changelogs-info`

## Overview

Three major changes to the site. Do them in this order.

---

## Part 1: Remove All Non-Essential Tools

**Keep only these 6 tools:** openclaw, claude-code, codex-cli, gemini-cli, kilocode, hermes-agent

**DELETE everything for these tools:**
- cline
- cursor
- opencode
- windsurf
- roo-code

This means:
1. Delete `src/pages/{cline,cursor,opencode,windsurf,roo-code}/` directories entirely
2. Delete `src/content/cheatsheets-json/{cline,cursor,opencode,windsurf,roo-code}.json`
3. Delete corresponding layouts if they exist (check `src/layouts/`)
4. Remove from `src/data/referrals.json` — delete entries for removed tools
5. Remove from `src/pages/tools/` dynamic routes if they reference removed tools
6. Remove from `src/pages/compare/` if it references removed tools
7. Remove from hub/homepage — `src/pages/index.astro` and any tool cards/lists
8. Remove from SharedNav or any global navigation
9. Remove from `src/lib/sections.ts` if present
10. Clean up any stray references in blog posts or other pages
11. Delete any unused layouts that were only for removed tools

**Verify:** `grep -r "cline\|cursor\|opencode\|windsurf\|roo-code" src/ --include="*.astro" --include="*.ts" --include="*.json" -l` should return nothing relevant after cleanup.

---

## Part 2: Consolidate quickstart + tips + cheatsheet + releases → Single "Guide" Page

For each of the 6 kept tools, merge quickstart.astro, tips.astro, cheatsheet.astro, and releases.astro into a single `guide.astro` page.

**The guide page should read like a flowing guide** — not 4 separate sections bolted together. Think of it as a developer manual / getting started guide that naturally covers:

1. **Getting Started** (from quickstart) — install, first run, key commands
2. **Power Tips** (from tips) — pro tips, hidden features, gotchas  
3. **Command Reference** (from cheatsheet) — keyboard shortcuts, commands, flags in a scannable table/card format
4. **Recent Releases** (from releases) — last 5-10 releases with dates, just headlines not full details

**Design approach:**
- Each section flows into the next with clear visual breaks
- Use the existing design system (timeline for getting started, card grid for tips, table/cards for reference, compact list for releases)
- Keep the tool's primary color (`--tool-primary`)
- The guide page should use the same layout as the other pages (tool layout with SharedNav, SiteAnimations, HeadPerf)
- Add a sticky table of contents sidebar or top anchor nav so users can jump to sections

**After consolidation:**
- Delete the individual quickstart.astro, tips.astro, cheatsheet.astro, releases.astro for each tool
- Delete `src/styles/quickstart-shared.css` and `src/styles/tips-shared.css` (move what's needed into the guide or a new `guide-shared.css`)
- Update ALL 6 tool layouts: remove quickstart/tips/cheatsheet/releases from navLinks, add single "Guide" link pointing to `/{tool}/guide/`
- Update `src/lib/sections.ts` subNav arrays
- Update any SharedNav references

**Guide nav label:** "Guide"

---

## Part 3: Redesign Models Page

Current models page is at `src/pages/models/index.astro` (1028 lines — way too complex).

**Redesign to be simple:**
- Clean table/grid view of all models from providers we track
- Group by provider (Anthropic, OpenAI, Google, DeepSeek, xAI, Moonshot AI, ZAI, Minimax, Meta, Mistral, Qwen)
- Each model shows: name, type (frontier/reasoning/code etc), context window, pricing (input/output per 1M tokens), status (active/deprecated)
- Simple filtering: by provider, by type
- No bloat — think "Google Fonts directory for AI models" — clean, scannable, fast
- Use existing design system colors and typography
- Keep the data loading from `src/lib/models.ts` — just redesign the presentation

---

## Final Checklist

- [ ] Build passes clean (`npm run build`)
- [ ] No broken links (removed tool pages → 404 is fine, but no internal links to them)
- [ ] All 6 tool guides work with proper nav
- [ ] Models page loads and displays all models
- [ ] No references to removed tools anywhere in src/
- [ ] SharedNav only shows the 6 tools
- [ ] Homepage only shows the 6 tools
