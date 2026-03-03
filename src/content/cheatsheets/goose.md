---
tool: goose
title: Goose Cheat Sheet
---

# Goose Cheat Sheet

## Installation

| Method | Command |
|--------|---------|
| macOS (Homebrew) | brew install block/tap/goose |
| From source | cargo install --git https://github.com/block/goose |

## CLI Commands

| Command | Description |
|---------|-------------|
| goose | Start interactive session |
| goose run "task" | Run a one-shot task |
| goose session list | List saved sessions |
| goose session resume id | Resume a session |
| goose configure | Interactive configuration |
| goose info | Show current config and version |
| goose update | Update to latest version |

## Built-in Extensions

| Extension | Purpose |
|-----------|---------|
| developer | File editing, shell commands, git |
| memory | Persistent memory across sessions |
| computeruse | Screen interaction |
| google_drive | Google Drive access |

## Session Commands (in-session)

| Command | Description |
|---------|-------------|
| /undo | Undo last action |
| /clear | Clear context |
| /extensions | List active extensions |
| /mode name | Switch interaction mode |
| /plan | Enter planning mode |
| /exit | End session |

## Environment Variables
| Variable | Purpose |
|----------|---------|
| ANTHROPIC_API_KEY | Anthropic API key |
| OPENAI_API_KEY | OpenAI API key |
| GOOSE_PROVIDER | Override default provider |
| GOOSE_MODEL | Override default model |

## Tips

- Use goose run for CI/CD automation
- Extensions are MCP-compatible so add any MCP server
- Memory extension persists context across sessions
- Configure multiple providers and switch with env vars
- goose configure walks you through setup interactively
