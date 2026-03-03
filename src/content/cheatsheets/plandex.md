---
tool: plandex
title: Plandex Cheat Sheet
lastUpdated: 2026-03-04
---

# Plandex Cheat Sheet

AI coding engine for complex, multi-file tasks. Plans first, then applies changes with version control.

---

## Installation

```bash
# Homebrew
brew install plandex-ai/plandex/plandex

# From source
git clone https://github.com/plandex-ai/plandex
cd plandex/app/cli && go install
```

---

## Getting Started

```bash
plandex sign-in                       # Auth with Plandex Cloud
plandex new "project name"            # Create new plan
plandex load file.ts lib/             # Load files into context
plandex tell "implement auth system"  # Describe the task
plandex apply                         # Apply proposed changes
```

---

## Core Commands

| Command | Description |
|---------|-------------|
| `plandex new` | Create new plan |
| `plandex tell "..."` | Send prompt / describe task |
| `plandex continue` | Continue generation |
| `plandex apply` | Apply pending changes |
| `plandex reject` | Reject all pending changes |
| `plandex diff` | Show pending changes diff |
| `plandex changes` | List pending file changes |

---

## Context Management

| Command | Description |
|---------|-------------|
| `plandex load <paths>` | Add files/dirs to context |
| `plandex unload <file>` | Remove from context |
| `plandex ls` | List context files |
| `plandex load -r dir/` | Recursive directory load |
| `plandex load --note "..."` | Add text note to context |
| `plandex load -u <url>` | Load URL content |

---

## Plan Management

| Command | Description |
|---------|-------------|
| `plandex plans` | List all plans |
| `plandex cd <plan>` | Switch to plan |
| `plandex current` | Show active plan |
| `plandex rename <name>` | Rename current plan |
| `plandex delete <plan>` | Delete a plan |
| `plandex archive <plan>` | Archive a plan |

---

## Version Control

| Command | Description |
|---------|-------------|
| `plandex log` | Show plan history |
| `plandex rewind <n>` | Rewind n steps |
| `plandex rewind --to <hash>` | Rewind to specific point |
| `plandex branches` | List branches |
| `plandex checkout <branch>` | Switch branch |
| `plandex branch <name>` | Create branch |

---

## Configuration

```bash
plandex set-model planner <model>      # Set planning model
plandex set-model coder <model>        # Set coding model
plandex models                          # List available models
plandex models --custom                 # Add custom model
```

---

## Tips

- Plans are versioned — rewind anytime before applying
- Use branches to explore different approaches
- `tell` multiple times to refine before `apply`
- Load entire directories for broad context
- Runs in sandboxed environment — safe to experiment
