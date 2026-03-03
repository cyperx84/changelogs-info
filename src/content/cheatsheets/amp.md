---
tool: amp
title: Amp Cheat Sheet
---

# Amp Cheat Sheet

## Installation

| Method | Command |
|--------|---------|
| macOS (Homebrew) | brew install ampcode/tap/amp |
| Direct download | Visit ampcode.com |

## CLI Commands

| Command | Description |
|---------|-------------|
| amp | Start interactive session |
| amp "task description" | Run with initial prompt |
| amp --model model | Override model |
| amp --continue | Resume last session |
| amp --version | Show version |

## In-Session Commands

| Command | Action |
|---------|--------|
| /help | Show available commands |
| /clear | Clear conversation |
| /model name | Switch model |
| /undo | Undo last change |
| /diff | Show pending changes |
| /approve | Approve pending changes |
| /reject | Reject pending changes |

## Features
- Agentic coding with file editing and shell access
- Built by Sourcegraph team
- MCP server support
- Auto-approval for safe operations
- Project-level configuration
- Multi-model support

## Tips

- Use .amp/config.json for project-specific instructions
- Auto-approve read operations for faster workflows
- MCP servers extend tool capabilities
- --continue picks up where you left off
