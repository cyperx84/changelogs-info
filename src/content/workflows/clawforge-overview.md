---
title: ClawForge — Multi-Mode Agent Orchestration
category: orchestration
tools: [claude-code, codex-cli]
difficulty: intermediate
lastUpdated: "2026-03-14"
source: https://github.com/cyperx84/clawforge
---

# ClawForge — Multi-Mode Agent Orchestration

ClawForge is a CLI that orchestrates coding agents (Claude Code, Codex) across four workflow modes. Each mode matches a different task complexity level.

## The Four Modes

| Mode | Use Case | Agents | Typical Duration |
|------|----------|--------|------------------|
| **Quick** | Tiny fixes, typo corrections | 1 | 1-5 min |
| **Sprint** | Features, bugs, refactors | 1 | 10-60 min |
| **Review** | PR quality gates | 1-2 | 5-15 min |
| **Swarm** | Large parallel migrations | 3+ | 30-120 min |

## Core Concepts

### tmux Sessions
Every agent runs in a named tmux session. You can attach anytime to see live output or steer the agent.

```bash
clawforge attach 1     # Attach to task #1
clawforge steer 1 "Use bcrypt"  # Send course correction
```

### Git Worktrees
Each task gets an isolated git worktree. No context switching, no branch conflicts in your main repo.

```bash
# ClawForge creates worktrees automatically
../worktrees/sprint/add-auth-middleware/
```

### CI Feedback Loop
When CI fails, ClawForge automatically steers the agent with the error output (up to 2 retries).

## Quick Start

```bash
# Install
brew install cyperx84/tap/clawforge

# Sprint (the workhorse)
clawforge sprint "Add JWT authentication middleware"

# Quick patch
clawforge sprint "Fix typo in README" --quick

# PR review
clawforge review --pr 42

# Parallel swarm
clawforge swarm "Migrate all tests from jest to vitest"
```

## Monitoring

```bash
clawforge status              # List all tasks
clawforge dashboard           # TUI with live preview
clawforge watch --daemon      # Background monitoring
clawforge logs 1 --follow     # Stream agent output
```

## Changelog Integration (v1.7+)

When clwatch is installed, ClawForge can auto-patch reference files when coding tools release new features:

```bash
clawforge changelog check     # Check for tool updates
clawforge changelog watch     # Daemon mode, auto-patch
```

## Related Workflows

- [ClawForge Sprint](/workflows/clawforge-sprint) — Full dev cycle with one agent
- [ClawForge Review](/workflows/clawforge-review) — Multi-model PR review
- [ClawForge Swarm](/workflows/clawforge-swarm) — Parallel multi-agent orchestration
- [ClawForge Changelog](/workflows/clawforge-changelog) — Auto-updating reference files
