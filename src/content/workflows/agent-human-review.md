---
title: Agent + Human Review Loop
category: development
tools: [claude-code, codex-cli, gemini-cli]
difficulty: intermediate
lastUpdated: 2026-03-14
---

# Agent + Human Review Loop

A pattern where an AI agent implements, human reviews each commit, agent iterates. Best of both worlds.

## The Pattern

```
Agent → Implementation → Human Review → Feedback → Agent Iteration → Merge
```

## When to Use

- Critical features requiring human oversight
- Learning a new codebase (human provides context)
- Security-sensitive changes
- UX/frontend work

## Setup

Any coding CLI + git repo + PR-based workflow.

```bash
# Agent implements
claude --print --permission-mode bypassPermissions "Add feature X"

# Human reviews PR
gh pr review 42

# If changes needed, agent iterates
claude --print --permission-mode bypassPermissions"Address review feedback: [specific comments]"
```

## The Review Checklist

- Correctness: Does it do what's intended?
- Edge cases: Error handling, boundary conditions
- Security: No exposed secrets, SQL injection, etc.
- Performance: No N+1 queries, memory leaks
- Style: Follows project conventions

## Tips
- Keep commits small and focused for easier review
- Write clear PR descriptions explaining the "why"
- Use `clawforge review --pr 42` for multi-model review before human review
- Respond to review feedback promptly with focused commits

## Related Workflows

- [ClawForge Review](/workflows/clawforge-review) — Multi-model PR review
- [ClawForge Sprint](/workflows/clawforge-sprint) — Full dev cycle
