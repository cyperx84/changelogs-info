# changelogs.info TODO

## Current priorities

- [ ] Standardize full release-body presentation across all tool landing pages and changelog pages so mixed source formats feel consistent.
- [ ] Review the new grouped-section renderer on OpenClaw, Claude Code, and Codex CLI in production and tune category heuristics where needed.
- [ ] Harden the GitHub Actions pipeline against push races when multiple manual dispatches run close together.

## Strategy / product decisions

- [ ] Evaluate multilingual support strategy before building it. Decide between:
  - English-first only
  - Hand-curated translations for top landing pages only
  - Fully localized product with translated tool pages, feeds, and metadata
- [ ] Write a recommendation doc for multilingual support covering SEO upside, maintenance cost, translation freshness, and pipeline complexity.
- [ ] Decide whether multilingual should be limited to high-level marketing/navigation pages first instead of changelog bodies.

## Newsletter workflow

- [ ] Design an actual newsletter workflow end-to-end.
- [ ] Choose newsletter stack (Buttondown vs Resend vs other).
- [ ] Define audience segments: weekly digest, breaking changes only, per-tool updates, all-tools digest.
- [ ] Define source of truth for newsletter content (pipeline payloads, curated notes, manual editor review).
- [ ] Design weekly digest generation flow from payloads + summaries + links.
- [ ] Add editorial review/approval step before send.
- [ ] Define signup UX on-site, subscriber storage, confirmation flow, and unsubscribe handling.
- [ ] Decide whether newsletter content should also publish to a web archive page on changelogs.info.
- [ ] Define analytics: open rate, click rate, subscriber growth, and which tools/content convert best.

## Content / site polish

- [ ] Make homepage summaries more useful by surfacing structured highlights when available, not just a single paragraph summary.
- [ ] Audit contrast/accessibility issues on Claude Code and Codex pages.
- [ ] Revisit claude-code render-blocking CSS/performance work after content formatting stabilizes.
- [ ] Add a visible explanation on-site for how release data is gathered, normalized, and refreshed.
