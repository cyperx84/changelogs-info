---
title: ClawForge Changelog — Auto-Updating Reference Files
category: maintenance
tools: [clwatch]
difficulty: beginner
lastUpdated: "2026-03-14"
source: https://github.com/cyperx84/clawforge
---

# ClawForge Changelog — Auto-Updating Reference Files

Tracks coding tool changelogs and auto-patches reference files when new features are released. Requires clwatch.

## When to Use

- Keeping agent context files current
- Tracking Claude Code, Codex CLI, Gemini CLI updates
- Auto-documenting new capabilities

## Prerequisites

```bash
# Install clwatch
brew install cyperx84/tap/clwatch
```

## Basic Usage

```bash
# One-shot check
clawforge changelog check

# Auto-patch without prompt
clawforge changelog check --auto

# Daemon mode (polls every 6h)
clawforge changelog watch

# Show status
clawforge changelog status
```

## Key Commands

| Command | Description |
|---------|-------------|
| `check` | One-shot update check |
| `watch` | Daemon mode with polling |
| `status` | Show known vs current versions |
| `ack <tool>` | Mark version as reviewed |

## Key Flags

| Flag | Description |
|------|-------------|
| `--auto` | Auto-patch without confirmation |
| `--notify` | Discord notification on changes |
| `--webhook URL` | POST to webhook on changes |
| `--interval N` | Daemon poll interval (default: 6h) |
| `--tools LIST` | Specific tools to watch |
| `--stop` | Stop running daemon |

## Reference File Mapping

| Tool | Reference File |
|------|----------------|
| claude-code | `references/claude-code-features.md` |
| codex-cli | `references/codex-cli-features.md` |
| gemini-cli | `references/gemini-cli-features.md` |
| opencode | `references/opencode-features.md` |
| openclaw | `references/openclaw-features.md` |

## The Flow

```
1. clwatch polls changelogs.info
2. Detects version change
3. Fetches structured delta (new features, commands, flags)
4. ClawForge prompts to patch (or auto with --auto)
5. Claude Code updates the reference file
6. Notification sent (if --notify)
```

## Examples

### Manual check with prompt

```bash
clawforge changelog check
# Output:
# claude-code 2.1.74 → 2.1.75
#   + 2 new features: /simplify, /batch
#   + 1 new command: /loop
# Patch references/claude-code-features.md? [y/N]
```

### Hands-free daemon

```bash
clawforge changelog watch --auto --notify
# Runs in background, patches automatically, sends Discord notification
```

### Specific tools only

```bash
clawforge changelog check --tools claude-code,codex-cli
```

### Combined with agent watch

```bash
clawforge watch --daemon --changelog
# Agent health monitoring + changelog checking in one daemon
```

## Graceful Degradation

Works standalone without clwatch:
- Commands print install instructions
- ClawForge continues normally
- No errors or blocked workflows

## Configuration

In `~/.clawforge/config.json`:

```json
{
  "changelog_check_interval": "6h",
  "changelog_auto_patch": false,
  "changelog_tools": "claude-code,codex-cli,gemini-cli,opencode,openclaw"
}
```

## Tips

- Use `--auto --notify` for hands-off tracking
- Check `clawforge changelog status` after install
- Combine with `watch --daemon --changelog` for unified monitoring
- Reference files are markdown — commit them to git
