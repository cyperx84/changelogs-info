---
tool: claude-code
title: Claude Code Cheat Sheet
---

# Claude Code Cheat Sheet

## CLI Commands

| Command | Description |
|---------|-------------|
| `claude` | Start interactive REPL |
| `claude "query"` | One-shot prompt, no REPL |
| `claude -p "query"` | Print mode — output and exit |
| `claude -c` | Continue last conversation |
| `claude --resume <id>` | Resume a specific session |
| `claude --model <model>` | Use a specific model |
| `claude --allowedTools` | Restrict available tools |
| `claude mcp` | Manage MCP servers |
| `claude config` | View/set configuration |

## Slash Commands (Inside REPL)

| Command | Description |
|---------|-------------|
| `/help` | Show help |
| `/clear` | Clear conversation context |
| `/compact` | Compress conversation context |
| `/cost` | Show token usage and cost |
| `/model` | Switch model mid-conversation |
| `/memory` | Edit CLAUDE.md memory file |
| `/permissions` | View and manage permissions |
| `/status` | Show session status |
| `/copy` | Copy last response to clipboard |
| `/review` | Code review current changes |
| `/commit` | Commit staged changes |
| `/pr` | Create a pull request |
| `/simplify` | Review and simplify changed code |

## Flags

| Flag | Description |
|------|-------------|
| `--print` / `-p` | Print mode (non-interactive) |
| `--continue` / `-c` | Continue last conversation |
| `--verbose` | Show full tool calls |
| `--output-format json` | JSON output (for scripting) |
| `--max-turns N` | Limit agentic turns |
| `--no-permissions` | Use default permissions |
| `--dangerously-skip-permissions` | Skip all permission prompts |
| `--add-dir <path>` | Add additional working directory |

## Agent Teams (Subagents)

Claude Code can spawn subagents for parallel work:

| Agent Type | Description |
|------------|-------------|
| `general-purpose` | Full tool access, edits files |
| `Explore` | Read-only codebase exploration |
| `Plan` | Architecture planning, no edits |

**Team workflow**: Create team → Create tasks → Spawn teammates → Assign tasks → Coordinate

## Hooks

Hooks run shell commands on events:

| Event | Description |
|-------|-------------|
| `PreToolUse` | Before a tool runs |
| `PostToolUse` | After a tool runs |
| `Notification` | On notifications |
| `Stop` | When agent stops |

Configure in `.claude/settings.json` under `hooks`.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Escape` | Cancel current action |
| `Ctrl+C` | Interrupt generation |
| `Ctrl+L` | Clear screen |
| `Tab` | Accept autocomplete |
| `Up/Down` | Navigate history |

## Configuration Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project instructions (root) |
| `.claude/settings.json` | Project settings |
| `~/.claude/CLAUDE.md` | Global instructions |
| `~/.claude/settings.json` | Global settings |
| `.claude/commands/*.md` | Custom slash commands |
| `.claude/skills/*/SKILL.md` | Agent skills |
