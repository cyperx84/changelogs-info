---
title: Multi-Agent Orchestration — Claude Code + Codex
category: orchestration
tools: [claude-code, codex-cli]
difficulty: advanced
lastUpdated: 2026-03-14
---

# Multi-Agent Orchestration — Claude Code + Codex

Combine Claude Code's reasoning with Codex's speed for a powerful multi-agent workflow. Claude plans, Codex executes.

## The Pattern

```
Claude Code (Opus/Sonnet) → Plan → Decompose → Codex (parallel execution)
```

## When to Use

- Large codebases needing exploration + parallel execution
- Tasks where planning quality matters more than execution speed
- Multi-file refactors with complex dependencies

## Setup

Both CLIs installed and git repo initialized.

```bash
# Install both
brew install claude codex

# Verify
claude --version
codex --version
```

## Workflow 1: Plan with Claude, Execute with Codex

```bash
# Step 1: Claude plans
claude --print "Analyze the codebase and create a plan to [TASK]. 
Break down into 3-5 parallel subtasks. 
Output a JSON with: subtask_name, files_affected, implementation_notes."

# Step 2: Extract plan
# (Save Claude's output to plan.json)

# Step 3: Spawn Codex for each subtask
for task in $(jq -r '.subtasks[] | .name' plan.json); do
  files=$(jq -r --arg t "$task" '.subtasks[] | select(.name == $t) | .files | .[]' plan.json)
  codex exec --full-auto "$task: $files. Implementation notes: $(jq -r --arg t "$task" '.subtasks[] | select(.name == $t) | .notes' plan.json)"
done
```

## Workflow 2: Claude Reviews, Codex Fixes

```bash
# Claude reviews a PR
claude --print "Review PR #42. List all issues found with severity (critical/major/minor)."

# For each critical issue, spawn Codex to fix
codex exec --full-auto "Fix the critical issue from PR #42 review: [specific issue]"
```

## Workflow 3: Iterative Refinement

```bash
# Claude designs architecture
claude --print "Design the architecture for [FEATURE]. Output module structure, interfaces, and key implementation details."

# Codex implements skeleton
codex exec --full-auto "Create the skeleton implementation based on the architecture design"

# Claude reviews and refines
claude --print "Review the implementation. Suggest improvements and edge cases to handle."

# Codex applies refinements
codex exec --full-auto "Apply the suggested improvements from the review"
```

## Using ClawForge

ClawForge automates this pattern:

```bash
# Swarm handles the parallelization
clawforge swarm "[TASK]" --max-agents 4

# Sprint for single-agent tasks
clawforge sprint "[TASK]" --routing auto
```

## Tips

- Use Claude for planning, architecture, and review (needs reasoning)
- Use Codex for parallel execution, quick fixes, and batch operations
- ClawForge's swarm mode manages worktree isolation and conflict detection
- Set `--routing auto` to let ClawForge choose the right agent for each phase

## Related Workflows

- [ClawForge Sprint](/workflows/clawforge-sprint) — Single agent dev cycle
- [ClawForge Swarm](/workflows/clawforge-swarm) — Parallel multi-agent
