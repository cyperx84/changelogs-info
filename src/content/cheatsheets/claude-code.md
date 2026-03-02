---
tool: claude-code
title: Claude Code Cheat Sheet
lastUpdated: 2026-03-02
---

# Claude Code 2.1 Cheat Sheet

Complete reference for Claude Code CLI tool. Updated for v2.1.x (January 2026).

---

## What's New in v2.1

**Major Features:**
- **MCP Tool Search** — Lazy loading for tools, reducing context usage from ~134k to ~5k tokens
- **Background Agents** — Run up to 15 agents in parallel (`Ctrl+B`)
- **Task Management** — Built-in task tracking with dependencies (`/tasks`)
- **Skill Hot-Reload** — Skills update without restart
- **Forked Context** — `context: fork` for isolated sub-agent execution
- **Hooks in Frontmatter** — Define hooks directly in skills, commands, and agents
- **Setup Hooks** — New event triggered via `--init`, `--init-only`, `--maintenance`
- **Wildcard Permissions** — `Bash(npm *)`, `Bash(* --help)`, etc.
- **PR Review Status** — Colored dot showing PR state in prompt footer
- **Language Setting** — Configure Claude's response language
- **Customizable Keybindings** — `/keybindings` command
- **Web Session Teleport** — `/teleport` to claude.ai/code
- **Shift+Enter** — Works out-of-the-box (iTerm2, WezTerm, Ghostty, Kitty)

**New CLI Flags:**
`--agents`, `--json-schema`, `--fallback-model`, `--max-budget-usd`, `--remote`, `--teleport`, `--init`, `--maintenance`, `--chrome`, `--fork-session`, `--tools`

**New Slash Commands:**
`/keybindings`, `/tasks`, `/plan`, `/stats`, `/context`, `/feedback`, `/rename`, `/teleport`, `/remote-env`

---

## Core CLI Commands

| Command | Description |
|---------|-------------|
| `claude` | Start interactive REPL |
| `claude "query"` | One-shot prompt, no REPL |
| `claude -p "query"` | Print mode — output and exit |
| `claude -c` | Continue last conversation |
| `claude --resume <id>` | Resume a specific session |
| `claude --model <model>` | Use specific model (sonnet/opus/haiku) |
| `claude --allowedTools <tools>` | Restrict available tools |
| `claude --agents <path>` | Add custom agent definitions |
| `claude --init` | Run setup hooks only |
| `claude --maintenance` | Run maintenance tasks |
| `claude --teleport` | Send session to claude.ai/code |
| `claude --fork-session <id>` | Fork from specific session |
| `claude --remote <url>` | Connect to remote session |
| `claude mcp` | Manage MCP servers |
| `claude config` | View/set configuration |
| `claude config set <key> <value>` | Update config value |
| `claude config reset` | Reset to defaults |

---

## CLI Flags (Detailed)

### Model & Budget
- `--model <name>` — sonnet (default), opus, haiku
- `--fallback-model <name>` — Model to use if primary fails
- `--max-budget-usd <amount>` — Hard stop at dollar limit
- `--max-turns <N>` — Limit agentic turns (default: 100)

### Permissions & Safety
- `--no-permissions` — Use default permissions
- `--dangerously-skip-permissions` — Skip all prompts (use carefully!)
- `--allowedTools <tool1,tool2>` — Whitelist specific tools
- `--forbiddenTools <tool1,tool2>` — Blacklist specific tools

### Context & Session
- `--continue / -c` — Continue last conversation
- `--resume <id>` — Resume specific session
- `--fork-session <id>` — Fork from session, keep transcript
- `--add-dir <path>` — Add additional working directory
- `--remote <url>` — Connect to remote session
- `--teleport` — Send to claude.ai/code (web UI)

### Output & Verbosity
- `--print / -p` — Print mode (non-interactive)
- `--verbose` — Show full tool calls
- `--output-format json` — JSON output (for scripting)
- `--json-schema` — Output JSON schema for responses

### Tools & Agents
- `--agents <path>` — Load custom agent definitions
- `--tools <plugin:tool>` — Load specific MCP tools
- `--init` — Run setup hooks only
- `--init-only` — Setup hooks, then exit
- `--maintenance` — Run maintenance tasks

### Browser & Advanced
- `--chrome` — Enable Chrome MCP plugin
- `--no-cache` — Disable prompt caching

---

## Slash Commands (Inside REPL)

### Core Commands
| Command | Description |
|---------|-------------|
| `/help` | Show all available commands |
| `/clear` | Clear conversation context |
| `/compact` | Compress conversation (reduce tokens) |
| `/cost` | Show token usage and cost |
| `/stats` | Show detailed session statistics |
| `/status` | Show session status |
| `/copy` | Copy last response to clipboard |
| `/context` | View current context summary |

### Model & Configuration
| Command | Description |
|---------|-------------|
| `/model` | Switch model mid-conversation |
| `/permissions` | View and manage permissions |
| `/keybindings` | Customize keyboard shortcuts |
| `/rename <name>` | Rename current session |
| `/feedback` | Send feedback to Anthropic |

### Memory & Files
| Command | Description |
|---------|-------------|
| `/memory` | Edit CLAUDE.md memory file |
| `/cd <path>` | Change working directory |
| `/ls` | List files in current directory |

### Git & Code Review
| Command | Description |
|---------|-------------|
| `/commit` | Commit staged changes with AI message |
| `/pr` | Create a pull request |
| `/review` | Code review current changes |
| `/review-pr <number>` | Review a PR by number |
| `/simplify` | Review and simplify changed code |

### Advanced Features
| Command | Description |
|---------|-------------|
| `/plan` | Enter planning mode (approve before edit) |
| `/tasks` | View task list and dependencies |
| `/teleport` | Send session to claude.ai/code |
| `/remote-env` | Connect to remote environment |
| `/batch <file>` | Execute batch commands from file |

---

## Agent Teams (Subagents)

Claude Code can spawn multiple agents to work in parallel or specialize tasks.

### Built-in Agent Types

| Agent Type | Tools Available | Use Case |
|------------|-----------------|----------|
| `general-purpose` | All tools (Read, Write, Edit, Bash, etc.) | Full implementation tasks |
| `Explore` | Read-only (Read, Glob, Grep) | Codebase exploration, search |
| `Plan` | Read-only + planning tools | Architecture planning, design |
| `statusline-setup` | Read, Edit | Configure status line |

### Team Workflow

1. **Create team** — `TeamCreate` tool
2. **Create tasks** — `TaskCreate` with dependencies
3. **Spawn teammates** — `Agent` tool with `team_name` parameter
4. **Assign tasks** — `TaskUpdate` with `owner` field
5. **Coordinate** — Teammates communicate via `SendMessage`
6. **Shutdown** — Send `shutdown_request` when done

### Example: Parallel Work
```
- Teammate A: Implement backend API
- Teammate B: Build frontend UI
- Teammate C: Write tests
```

### Task Management Commands
- `TaskCreate` — Create new task
- `TaskList` — List all tasks
- `TaskUpdate` — Update task status/owner
- `SendMessage` — DM or broadcast to teammates

---

## Hooks System

Hooks run shell commands on specific events. Configure in `.claude/settings.json` or skill frontmatter.

### Hook Events

| Event | When it fires |
|-------|---------------|
| `PreToolUse` | Before any tool runs |
| `PostToolUse` | After any tool runs |
| `Notification` | On agent notifications |
| `Stop` | When agent stops |
| `Setup` | On `--init`, `--init-only`, `--maintenance` |
| `SubmitPrompt` | When user submits prompt |

### Hook Configuration (settings.json)
```json
{
  "hooks": {
    "PostToolUse": {
      "Write": "echo 'File written: {{file_path}}'",
      "Edit": "prettier --write {{file_path}}"
    },
    "Setup": "npm install && npm run build"
  }
}
```

### Hook Variables
- `{{file_path}}` — File being operated on
- `{{command}}` — Bash command being run
- `{{content}}` — Tool content/result

### Frontmatter Hooks (Skills/Commands/Agents)
```yaml
---
name: my-skill
hooks:
  PreToolUse:
    Bash: echo "Running bash command"
---
```

---

## Keyboard Shortcuts

### Default Bindings
| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift+Enter` | New line (iTerm2, WezTerm, Ghostty, Kitty) |
| `Escape` | Cancel current action |
| `Ctrl+C` | Interrupt generation |
| `Ctrl+L` | Clear screen |
| `Ctrl+R` | Search history |
| `Ctrl+B` | View background agents |
| `Tab` | Accept autocomplete |
| `Up/Down` | Navigate history |

### Customizable Keybindings
Use `/keybindings` command or edit `~/.claude/keybindings.json`:

```json
{
  "toggleTodos": "ctrl+shift+t",
  "toggleTranscript": "ctrl+shift+x",
  "searchHistory": "ctrl+/",
  "chatStash": "ctrl+shift+s"
}
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project instructions (root) |
| `.claude/settings.json` | Project settings |
| `~/.claude/CLAUDE.md` | Global user instructions |
| `~/.claude/settings.json` | Global settings |
| `~/.claude/keybindings.json` | Custom keyboard shortcuts |
| `.claude/commands/*.md` | Custom slash commands |
| `.claude/skills/*/SKILL.md` | Agent skills (auto-invoked) |
| `.claude/agents/*/AGENT.md` | Custom agent definitions |

### CLAUDE.md Structure
- User preferences and environment context
- Project-specific instructions
- Code style guidelines
- Forbidden actions (e.g., "don't run tests on commit")

### settings.json Options
```json
{
  "model": "sonnet",
  "maxTurns": 100,
  "permissionMode": "default",
  "language": "en",
  "hooks": { /* ... */ },
  "allowedTools": ["Read", "Write", "Edit"],
  "forbiddenTools": ["Bash"]
}
```

---

## Skills vs Commands vs Agents

### Commands (User-Invoked)
- Location: `.claude/commands/<name>.md`
- Invocation: `/command-name`
- Examples: `/commit`, `/review-pr`, `/simplify`

**Frontmatter:**
```yaml
---
allowed-tools: Read, Write, Edit
description: Review and simplify code changes
---
```

### Skills (Model-Invoked)
- Location: `.claude/skills/<name>/SKILL.md`
- Invocation: Automatic (model decides)
- Examples: `claude-developer-platform`, `frontend-design`

**Frontmatter:**
```yaml
---
name: frontend-design
description: Build production-grade UIs
triggers:
  - user asks to build web components
  - user mentions React/Vue/Svelte
allowed-tools: Read, Write, Edit, Bash
---
```

### Agents (Custom Subagent Types)
- Location: `.claude/agents/<name>/AGENT.md`
- Invocation: Via `Agent` tool with `subagent_type`
- Examples: Custom test runners, specialized reviewers

**Frontmatter:**
```yaml
---
name: test-runner
description: Runs tests and reports results
allowed-tools: Read, Bash
context: fork
---
```

---

## Worktree Patterns

Use `EnterWorktree` to work in isolated git worktrees:

```bash
# User says: "work in a worktree"
claude uses EnterWorktree

# Creates: .claude/worktrees/<name>
# On exit: prompt to keep or remove
```

### When to Use Worktrees
- Experimental changes without affecting main branch
- Parallel feature development
- Testing risky refactors

---

## /simplify Command

**Purpose:** Review changed code for reuse, quality, and efficiency.

**Workflow:**
1. User invokes `/simplify`
2. Reviews git diff
3. Identifies:
   - Duplicate code → Extract helpers
   - Over-engineering → Simplify abstractions
   - Missing error handling → Add validation
   - Performance issues → Optimize

**Auto-applies fixes** — No confirmation needed.

---

## /batch Command

**Purpose:** Execute multiple prompts from a file sequentially.

**Usage:**
```bash
# Create batch.txt
echo "Add logging to user.ts" > batch.txt
echo "Write tests for auth.ts" >> batch.txt
echo "Update README with new API" >> batch.txt

# Execute
/batch batch.txt
```

Each line is executed as a separate prompt in order.

---

## MCP Plugin System

**Model Context Protocol** — Extend Claude with external tools.

### Manage Plugins
```bash
claude mcp add <plugin-name>
claude mcp remove <plugin-name>
claude mcp list
```

### Popular Plugins
- **filesystem** — Enhanced file operations
- **github** — GitHub API integration
- **postgres** — Database queries
- **brave-search** — Web search
- **chrome** — Browser automation (`--chrome` flag)

### Lazy Loading (v2.1)
Tools are loaded on-demand via `ToolSearch` instead of all-at-once, reducing context from ~134k to ~5k tokens.

---

## HTTP API (Remote Sessions)

Run Claude Code as an HTTP server for remote access:

```bash
claude --remote http://0.0.0.0:8080
```

**Endpoints:**
- `POST /messages` — Send message
- `GET /sessions` — List sessions
- `GET /sessions/:id` — Get session details

**Connect from another machine:**
```bash
claude --remote http://remote-ip:8080
```

---

## Tips & Best Practices

### Performance
- Use `--max-turns` to prevent runaway loops
- Use `/compact` to compress context when approaching limits
- Prefer `Explore` agent over `general-purpose` for read-only tasks

### Security
- Never use `--dangerously-skip-permissions` in shared environments
- Use `.gitignore` to exclude `.claude/` from version control (or commit selectively)
- Review CLAUDE.md before sharing projects

### Collaboration
- Commit `.claude/CLAUDE.md` for team-shared instructions
- Use hooks to enforce code style (`prettier`, `eslint`)
- Use `/plan` mode for high-impact changes

### Debugging
- Use `/stats` to see token usage breakdown
- Use `--verbose` to inspect tool calls
- Check `.claude/sessions/*.jsonl` for full transcripts

---

## Common Workflows

### 1. Quick Fix
```bash
claude "Fix the bug in auth.ts where tokens expire too soon"
```

### 2. Code Review
```bash
# Make changes, then:
/review
/simplify
/commit
```

### 3. Feature Development
```bash
claude
> /plan
> [Review plan]
> Approve
> [Implementation begins]
> /commit
> /pr
```

### 4. Multi-Agent Parallel Work
```bash
claude
> Create a team to build a REST API with tests
> [Spawns backend, frontend, test agents]
> [Agents work in parallel]
> [Review final output]
```

---

## Troubleshooting

### "Context too large" error
- Use `/compact` to compress
- Reduce conversation length with `/clear`
- Use `--max-turns` to limit agent loops

### Agent stuck in loop
- `Ctrl+C` to interrupt
- Review task list with `/tasks`
- Simplify prompt or break into smaller steps

### Hooks not firing
- Check `.claude/settings.json` syntax
- Ensure hook scripts are executable
- Check hook output in console (`--verbose`)

### MCP plugin not loading
- Verify plugin is installed: `claude mcp list`
- Check plugin config in `~/.claude/mcp.json`
- Try `--tools <plugin:tool>` to load explicitly

---

## Resources

- **Official Docs:** https://docs.claude.ai/code
- **GitHub:** https://github.com/anthropics/claude-code
- **Changelog:** https://github.com/anthropics/claude-code/releases
- **Community:** https://discord.gg/anthropic
