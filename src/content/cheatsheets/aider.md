---
tool: aider
title: Aider Cheat Sheet
lastUpdated: 2026-03-02
---

# Aider Cheat Sheet

## Core Commands
| Command | What it does |
|---|---|
| `aider` | Launch in current repo |
| `aider file1.ts file2.ts` | Start with target files |
| `aider --model sonnet` | Choose model |

## Slash Commands
| Command | Purpose |
|---|---|
| `/add <file>` | Add file to context |
| `/drop <file>` | Remove file from context |
| `/commit` | Commit current changes |
| `/run <cmd>` | Execute command |

## Config
Use `.aider.conf.yml` for defaults (model, auto-commit, etc).
