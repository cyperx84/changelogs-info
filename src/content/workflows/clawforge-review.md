---
title: ClawForge Review — Multi-Model PR Quality Gate
category: review
tools: [claude-code, codex-cli, gemini-cli]
difficulty: beginner
lastUpdated: 2026-03-14
source: https://github.com/cyperx84/clawforge
---

# ClawForge Review — Multi-Model PR Quality Gate

Analyzes an existing PR with multiple AI models. No agent spawned — pure analysis. Optionally spawns an agent to fix issues found.

## When to Use

- Pre-merge quality checks
- catching bugs before review
- Security audits
- Performance reviews

## Basic Usage

```bash
# Review PR #42
clawforge review --pr 42

# Review and auto-fix
clawforge review --pr 42 --fix

# Specific reviewers
clawforge review --pr 42 --reviewers claude,gemini
```

## Key Flags

| Flag | Description |
|------|-------------|
| `--pr <num>` | PR number (required) |
| `--fix` | Spawn agent to fix issues |
| `--reviewers <list>` | Override reviewers |
| `--dry-run` | Show review without posting |

## The Flow

```
1. Fetch PR diff
2. Multi-model review (claude + gemini by default)
3. Aggregate findings
4. Post review comments
5. Notify
```

## Multi-Model Review

Default reviewers are Claude and Gemini. Each model provides independent analysis:

- **Claude**: Code quality, edge cases, architecture
- **Gemini**: Security, performance, best practices

```bash
# Use all three
clawforge review --pr 42 --reviewers claude,gemini,codex
```

## Fix Mode

When `--fix` is passed, ClawForge spawns an agent on the PR branch to address issues:

```bash
clawforge review --pr 42 --fix
```

The agent:
1. Reads review comments
2. Pushes fixes to the PR branch
3. CI re-runs automatically

## Examples

### Quick check

```bash
clawforge review --pr 123
```

### Thorough review with fix

```bash
clawforge review --pr 123 --reviewers claude,gemini,codex --fix
```

### Preview without posting

```bash
clawforge review --pr 123 --dry-run
```

## Output

Review posts comments directly on the PR:
- Line-level issues
- Summary comment with verdict
- Suggestions for fixes

## Tips

- Use `--dry-run` to preview before posting
- `--fix` is aggressive — use for your own PRs
- Add codex for a third opinion on critical PRs
- Review runs fast (1-2 min) since no code is written
