# Content Policy

## Core rule

When a tool has a real upstream `CHANGELOG.md` (or equivalent canonical changelog file), changelogs.info should treat that file as the **primary source of truth for the body content shown to users**.

GitHub release posts are a **secondary source** and should be used for:
- release detection
- links and metadata
- fallback body content when no canonical changelog section exists
- supplemental context if the release post contains important extra detail

## Homepage / tool page display order

Preferred order on tool landing pages:

1. TL;DR summary
2. Canonical changelog section for the current version
3. Secondary links:
   - Changelog file
   - GitHub release
   - Compare / commit links when available

Do **not** treat the GitHub release post as the default main reading experience when a canonical changelog exists.

## Source precedence

For each tool version, prefer body content in this order:

1. Matching section extracted from upstream `CHANGELOG.md`
2. Equivalent official changelog page / release notes page
3. GitHub release body
4. Fallback generated summary only if body content is unavailable

## Why

Canonical changelog files are usually:
- more structured
- less noisy
- more stable over time
- closer to the maintainer's actual source of truth

GitHub release posts are often:
- inconsistent
- promo-heavy
- padded with boilerplate
- missing full change detail

## Product implications

- The pipeline should fetch both release metadata and changelog sources when available.
- The UI should label the primary link as `Changelog` when canonical content is being shown.
- Future tools should default to this behavior without one-off page hacks.
- If a changelog file is just a pointer/stub, the runtime may fall back to the GitHub release body.

## Exceptions

Use the GitHub release body as primary only when:
- there is no canonical changelog source
- the changelog file is a thin pointer to releases
- the matching version section cannot be found
- the release post contains materially more useful detail than the changelog file
