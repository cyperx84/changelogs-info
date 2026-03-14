---
title: ClawForge Sprint — Single-Agent Dev Cycle
category: development
tools: [claude-code, codex-cli]
difficulty: beginner
lastUpdated: 2026-03-14
source: https://github.com/cyperx84/clawforge
---

# ClawForge Sprint — Single-Agent Dev Cycle

The workhorse mode. One agent, full development cycle: scope → spawn → watch → review → PR → merge → clean.

## When to Use

- New features
- Bug fixes
- Refactoring
- Most coding tasks

## Basic Usage

```bash
# In a git repo
clawforge sprint "Add rate limiting to the API"

# Specific repo
clawforge sprint ~/github/api "Fix null pointer in UserService"

# Quick patch (auto-merge, skip review)
clawforge sprint "Fix typo" --quick
```

## Key Flags

| Flag | Description |
|------|-------------|
| `--quick` | Auto-branch, auto-merge, skip review |
| `--branch <name>` | Override auto-generated branch name |
| `--agent <claude\|codex>` | Force specific agent |
| `--model <model>` | Override model |
| `--routing <auto\|cheap\|quality>` | Phase-based model routing |
| `--template <name>` | Use workflow template |
| `--budget <dollars>` | Cost limit |
| `--timeout <min>` | Kill after N minutes |
| `--auto-clean` | Remove worktree when done |
| `--dry-run` | Preview without spawning |

## The Flow

```
1. Scope     → Analyze task, generate plan
2. Spawn     → Create worktree, start agent in tmux
3. Watch     → Monitor progress, CI feedback loop
4. Review    → Quality gate (optional with --quick)
5. PR        → Create pull request
6. Merge     → Merge when CI passes
7. Clean     → Remove worktree
8. Learn     → Update memory with patterns
```

## Examples

### Feature with model routing

```bash
clawforge sprint "Add GraphQL subscriptions" \
  --routing auto \
  --budget 5.00 \
  --template feature
```

### Bug fix with quick mode

```bash
clawforge sprint "Fix off-by-one in pagination" --quick
```

### With CI loop

```bash
clawforge sprint "Refactor auth service" \
  --ci-loop \
  --max-ci-retries 3
```

## Monitoring During Sprint

```bash
# Check status
clawforge status

# Attach to see live work
clawforge attach 1

# Stream logs without attaching
clawforge logs 1 --follow

# Course correct
clawforge steer 1 "Actually, use bcrypt not argon2"
```

## After Completion

```bash
# See what changed
clawforge diff 1

# Create PR manually
clawforge pr 1

# Get AI summary
clawforge summary 1
```

## Escalation

If sprint detects a complex task, it suggests:
- "Multiple file domains detected — try swarm?"
- "This looks like a large refactor — consider swarm mode"

## Tips

- Use `--dry-run` first on unfamiliar repos
- `--quick` for patches under 10 lines
- `--routing auto` switches models mid-task (cheap for exploration, quality for final code)
- Set `--budget` to avoid surprise costs
