---
title: ClawForge Swarm — Parallel Multi-Agent Orchestration
category: orchestration
tools: [claude-code, codex-cli]
difficulty: advanced
lastUpdated: "2026-03-14"
source: https://github.com/cyperx84/clawforge
---

# ClawForge Swarm — Parallel Multi-Agent Orchestration

Decomposes large tasks and spawns multiple agents in parallel. Each agent works on an isolated subtask in its own worktree.

## When to Use

- Large migrations (jest → vitest, JS → TS)
- Multi-file refactors
- Adding features across many modules
- Batch updates (i18n, lint rules, API versions)

## Basic Usage

```bash
# Single repo
clawforge swarm "Migrate all tests from jest to vitest"

# Multi-repo
clawforge swarm --repos ~/api,~/web,~/shared "Upgrade auth v2 to v3"

# With agent limit
clawforge swarm "Add i18n to all user-facing strings" --max-agents 4
```

## Key Flags

| Flag | Description |
|------|-------------|
| `--max-agents <N>` | Cap parallel agents (default: 3) |
| `--agent <name>` | Force agent for all subtasks |
| `--repos <paths>` | Multi-repo (comma-separated) |
| `--repos-file <file>` | Multi-repo from file |
| `--routing <auto\|cheap\|quality>` | Model routing |
| `--auto-merge` | Merge each PR after CI |
| `--template <name>` | Workflow template |
| `--dry-run` | Show decomposition plan |

## The Flow

```
1. Scope (decompose)  → Break task into subtasks
2. Spawn (N agents)   → Create worktrees, start agents
3. Watch              → Monitor all agents
4. Review (each)      → Quality gate per PR
5. Merge              → Merge each when ready
6. Clean              → Remove worktrees
7. Learn              → Aggregate patterns
```

## Short IDs

Swarm tasks use hierarchical IDs:
- Parent: `#3`
- Sub-agents: `#3.1`, `#3.2`, `#3.3`

```bash
clawforge attach 3      # Shows picker for sub-agents
clawforge attach 3.2    # Direct to specific agent
clawforge steer 3.1 "Skip legacy files"
```

## Conflict Detection

Swarm tracks files modified by each agent. Dashboard warns when agents touch overlapping files.

```bash
clawforge conflicts     # Show potential conflicts
clawforge dashboard     # Conflict warnings in UI
```

## Examples

### Test migration

```bash
clawforge swarm "Migrate all tests from jest to vitest" \
  --max-agents 4 \
  --auto-merge \
  --notify
```

### Multi-repo upgrade

```bash
# repos.txt contains: ~/api, ~/web, ~/shared
clawforge swarm --repos-file repos.txt "Upgrade to React 19"
```

### With templates

```bash
clawforge swarm "Add error handling to all API endpoints" \
  --template migration \
  --routing quality
```

## Monitoring Swarm

```bash
# All agents at once
clawforge status

# Dashboard with swarm view
clawforge dashboard

# Watch daemon
clawforge watch --daemon
```

## RAM Considerations

Each agent consumes RAM. ClawForge warns when spawning >3 agents:
- 3 agents: ~6-9GB
- 5 agents: ~10-15GB
- 10 agents: ~20-30GB

Use `--max-agents` to limit parallelism on constrained machines.

## Tips

- Start with `--dry-run` to see decomposition
- 3 agents is the sweet spot for most machines
- Use templates for repeatable patterns
- Monitor conflicts when agents touch related files
- Consider `--auto-merge` for low-risk migrations
