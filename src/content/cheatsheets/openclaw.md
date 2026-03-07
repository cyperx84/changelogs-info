---
tool: openclaw
title: OpenClaw Cheat Sheet
lastUpdated: 2026-03-07
---

# OpenClaw Cheat Sheet

OpenClaw is a personal AI agent platform. Run AI agents across Discord, Telegram, Signal, WhatsApp, iMessage, and more — with skills, cron, memory, multi-model routing, and agent orchestration.

---

## Installation & Setup

```bash
# Install CLI
npm install -g openclaw

# Guided first-time setup
openclaw onboard

# Gateway service management
openclaw gateway start
openclaw gateway stop
openclaw gateway restart
openclaw gateway status

# System health check
openclaw status
openclaw doctor
```

---

## Gateway Configuration

**Config location:** `~/.openclaw/config.yaml` (or per-agent: `~/.openclaw/agents/<name>/`)

```yaml
# Core gateway config
gateway:
  port: 8080
  host: 0.0.0.0
  logLevel: info

# Model providers
models:
  default: anthropic/claude-sonnet-4-6
  aliases:
    fast:    google-gemini-cli/gemini-2.5-flash
    quality: anthropic/claude-opus-4-6
    code:    openai-codex/gpt-5.3-codex
    local:   ollama/qwen3:30b

# Channel plugins
channels:
  discord:
    plugin: discord
    config:
      token: ${DISCORD_BOT_TOKEN}
      guildId: ${DISCORD_GUILD_ID}
  telegram:
    plugin: telegram
    config:
      token: ${TELEGRAM_BOT_TOKEN}
  signal:
    plugin: signal
    config:
      number: "+1234567890"
```

### Key Config Sections

| Section | Purpose |
|---------|---------|
| `models.default` | Default model for all sessions |
| `models.aliases` | Short names for model overrides |
| `channels` | Enabled channel plugins |
| `agents` | Named agent definitions |
| `memory` | Memory backend (sqlite/redis) |
| `cron` | Scheduled job definitions |
| `skills` | Installed skill paths |

---

## Model Selection

### In Chat
```
/model flash           # switch to alias
/model anthropic/claude-opus-4-6  # full provider/model string
/status                # shows active model
```

### Model Aliases (configured)
```
flash    → google-gemini-cli/gemini-2.5-flash
sonnet   → anthropic/claude-sonnet-4-6
opus     → anthropic/claude-opus-4-6
code     → openai-codex/gpt-5.3-codex
local30  → ollama/qwen3:30b
```

### CLI Override
```bash
# Force a specific model for a session
openclaw session start --model anthropic/claude-opus-4-6

# Per-message model override
/model opus
Your next message uses Opus
/model flash           # switch back
```

---

## Agent Sessions

### Session Commands (in chat)
```
/status        Show session info, model, usage, time
/reasoning     Toggle reasoning mode on/off
/verbose       Toggle verbose tool output
/model <alias> Switch model for this session
/context       Show context window usage
/clear         Clear conversation context
/reset         Full session reset
/help          List all slash commands
```

### Session Spawn (from code/tools)
```typescript
// Spawn one-shot subagent
sessions_spawn({
  task: "Summarize the PR #42 diff and suggest review comments",
  model: "flash",
  mode: "run",
  runTimeoutSeconds: 120
})

// Spawn persistent thread-bound session (Discord)
sessions_spawn({
  task: "You are a code reviewer. Review PRs on request.",
  runtime: "acp",
  agentId: "claude-code",
  thread: true,
  mode: "session"
})
```

### Cross-Session Messaging
```typescript
// Send message to another active session
sessions_send({
  sessionKey: "agent:builder:discord:channel:12345",
  message: "The deploy is complete. Run smoke tests."
})

// List active sessions
sessions_list({ activeMinutes: 30, limit: 10 })
```

---

## Agent Orchestration (Multi-Agent)

### Spawn Patterns
```typescript
// Quick one-shot task
sessions_spawn({ task: "Fix lint errors in src/", runtime: "acp", agentId: "claude-code", mode: "run" })

// Persistent specialist session in Discord thread
sessions_spawn({
  task: "You are Builder — implement features as requested.",
  runtime: "acp",
  agentId: "claude-code",
  thread: true,
  mode: "session",
  label: "builder"
})

// Parallel execution
Promise.all([
  sessions_spawn({ task: "Write unit tests for auth module", mode: "run" }),
  sessions_spawn({ task: "Write unit tests for payment module", mode: "run" }),
])
```

### Subagent Management
```typescript
subagents({ action: "list" })           // list running agents
subagents({ action: "steer", target: "builder", message: "Focus on the API layer first" })
subagents({ action: "kill", target: "builder" })
```

### ACP Harness Agents
```
codex    → openai-codex/gpt-5.3-codex (OpenAI Codex)
claude   → anthropic/claude-sonnet-4-6 (Claude Code)
gemini   → google-gemini-cli (Gemini CLI)
```

---

## Skills System

Skills extend OpenClaw with new capabilities.

### ClawHub (Skill Marketplace)
```bash
# Search for skills
clawhub search "obsidian"
clawhub search "github"

# Install a skill
clawhub install obsidian
clawhub install github
clawhub install weather

# Update all skills to latest
clawhub sync

# Update specific skill
clawhub sync obsidian

# Publish a skill
clawhub publish ./my-skill/
```

### Common Skills
| Skill | What it does |
|-------|-------------|
| `obsidian` | Read/write Obsidian vault notes |
| `github` | PR/issue management via `gh` CLI |
| `apple-notes` | macOS Notes via `memo` CLI |
| `apple-reminders` | Reminders via `remindctl` |
| `weather` | Forecasts via wttr.in / Open-Meteo |
| `gog` | Gmail, Calendar, Drive, Docs |
| `bluebubbles` | iMessage via BlueBubbles |
| `wacli` | WhatsApp via wacli CLI |
| `defuddle` | Clean web content extraction |
| `summarize` | Summarize URLs, YouTube, podcasts |
| `clawforge` | Coding agent swarm workflows |
| `coding-agent` | Delegate coding tasks |
| `tmux` | Remote-control tmux sessions |
| `xurl` | X (Twitter) API operations |
| `goplaces` | Google Places search |
| `peekaboo` | macOS UI capture + automation |
| `sag` | ElevenLabs TTS |
| `nano-pdf` | Natural-language PDF editing |
| `gifgrep` | GIF search + download |
| `video-frames` | Extract frames/clips from video |
| `openai-whisper` | Local speech-to-text |
| `1password` | 1Password CLI integration |
| `json-canvas` | Obsidian Canvas (.canvas) files |
| `songsee` | Audio spectrogram visualization |
| `session-logs` | Search/analyze past conversations |

### SKILL.md Pattern
```markdown
# My Skill

## When to Use
Trigger conditions...

## Commands
- `my-tool list` — list items
- `my-tool create <name>` — create

## Examples
\`\`\`bash
my-tool list --format json
\`\`\`
```

---

## Memory System

OpenClaw agents have persistent MEMORY.md files.

### Memory Files
```
~/.openclaw/agents/<agent>/MEMORY.md       # main agent memory
~/.openclaw/agents/<agent>/memory/         # additional files
~/.openclaw/agents/<agent>/memory/YYYY-MM-DD.md  # daily logs
```

### Memory Tools (in-session)
```typescript
// Mandatory recall before answering about prior work
memory_search({ query: "openclaw config changes" })

// Read specific lines from memory
memory_get({ path: "MEMORY.md", from: 10, lines: 30 })

// After search, pull only needed lines
memory_get({ path: "memory/2026-03-07.md", from: 45, lines: 20 })
```

### MEMORY.md Best Practices
- Search memory before answering questions about prior decisions
- Write key facts/decisions right after they're made
- Use daily memory files (`memory/YYYY-MM-DD.md`) for logs
- Keep entries concise — good for semantic search
- Update when preferences change, not on every message

---

## Cron Jobs

### Configure in YAML
```yaml
cron:
  daily-report:
    schedule: "0 8 * * *"        # 8am daily
    task: "Send me a daily summary of yesterday's GitHub activity"
    channel: telegram
    model: flash

  weekly-review:
    schedule: "0 9 * * 1"        # 9am Monday
    task: "Generate weekly project status from Obsidian notes"
    channel: discord

  usage-budget-guard:
    schedule: "0 6 * * *"
    task: "Check API usage against budget. Alert if >80% of monthly budget used."
    channel: discord
```

### Cron Schedule Reference
```
 ┌─── minute    (0-59)
 │ ┌─── hour      (0-23)
 │ │ ┌─── day       (1-31)
 │ │ │ ┌─── month    (1-12)
 │ │ │ │ ┌─── weekday  (0-7, Sun=0/7)
 * * * * *

"0 9 * * 1-5"    → 9am weekdays
"0 */4 * * *"    → every 4 hours
"30 18 * * 5"    → 6:30pm Fridays
"0 0 1 * *"      → midnight, 1st of month
```

### Heartbeat System
```markdown
# HEARTBEAT.md — leave empty to skip heartbeat API calls
# Add tasks to make agent check periodically:

Check unreads in Discord #builder and summarize any blockers.
```

When non-empty, OpenClaw polls the agent on the heartbeat schedule and expects:
- `HEARTBEAT_OK` — nothing to action
- Any other text — treated as an alert, surfaced to the user

---

## Multi-Channel Routing

```yaml
channels:
  discord:
    plugin: discord
    config: { token: "${DISCORD_TOKEN}" }
  telegram:
    plugin: telegram
    config: { token: "${TELEGRAM_TOKEN}" }
  bluebubbles:
    plugin: bluebubbles
    config: { host: "http://localhost:1234", password: "${BB_PASSWORD}" }
  signal:
    plugin: signal
    config: { number: "${SIGNAL_NUMBER}" }
```

### Sending Messages
```typescript
// Send to specific channel
message({ action: "send", channel: "discord", target: "#general", message: "Done." })
message({ action: "send", channel: "telegram", target: "@user", message: "Deploy finished." })
message({ action: "send", channel: "bluebubbles", target: "+61412345678", message: "Hi" })

// React to message
message({ action: "react", channel: "discord", messageId: "123456", emoji: "✅" })

// Thread reply (Discord)
message({ action: "thread-reply", channel: "discord", threadId: "789", message: "Done." })

// Poll
message({
  action: "poll",
  channel: "discord",
  target: "#general",
  pollQuestion: "Deploy now or wait?",
  pollOption: ["Deploy now", "Wait for review", "Skip this release"],
  pollDurationHours: 4
})
```

---

## Nodes (Paired Devices)

Nodes let OpenClaw control paired phones/devices.

```typescript
// List paired nodes
nodes({ action: "status" })
nodes({ action: "describe", node: "my-iphone" })

// Camera
nodes({ action: "camera_snap", node: "my-iphone", facing: "back" })
nodes({ action: "camera_clip", node: "my-iphone", facing: "front", durationMs: 5000 })

// Location
nodes({ action: "location_get", node: "my-iphone", desiredAccuracy: "precise" })

// Notifications
nodes({ action: "notifications_list", node: "my-iphone", limit: 20 })
nodes({ action: "notify", node: "my-iphone", title: "Build done", body: "Tests passed ✅" })

// Run command on node
nodes({ action: "run", node: "my-mac", command: ["git", "pull", "origin", "main"] })

// Screen recording
nodes({ action: "screen_record", node: "my-mac", durationMs: 10000 })
```

---

## Canvas (Visual UI)

Canvas renders interactive UI panels.

```typescript
// Show a canvas panel
canvas({ action: "present", url: "https://changelogs.info/openclaw" })

// Evaluate JS in canvas
canvas({ action: "eval", javaScript: "document.title" })

// Snapshot the canvas
canvas({ action: "snapshot" })

// Hide canvas
canvas({ action: "hide" })
```

---

## Browser Control

```typescript
// Open URL
browser({ action: "open", url: "https://github.com/openclaw/openclaw/releases" })

// Take screenshot
browser({ action: "screenshot", type: "png" })

// Snapshot DOM (for automation)
browser({ action: "snapshot", refs: "aria" })

// Click, fill, press
browser({ action: "act", request: { kind: "click", ref: "e12" } })
browser({ action: "act", request: { kind: "fill", ref: "e5", text: "hello@example.com" } })
browser({ action: "act", request: { kind: "press", key: "Enter" } })

// Navigate
browser({ action: "navigate", url: "https://docs.openclaw.ai" })
```

---

## Agent Identity Files

Each agent workspace has identity configuration:

### SOUL.md — personality and tone
```markdown
# SOUL.md
You are **Claw** 🐾 — the orchestrator agent.

## Core Identity
Traits, values, communication style...

## What You Do
Dispatch tasks, summarize, coordinate...
```

### AGENTS.md — workspace instructions
```markdown
# AGENTS.md
## Every Session
1. Read SOUL.md
2. Read memory/YYYY-MM-DD.md

## Your Role
...dispatch mode decisions...
```

### USER.md — who you're helping
```markdown
# USER.md
Name: Chris
Timezone: Australia/Brisbane
Context: ...notes about preferences and projects...
```

### IDENTITY.md — agent self-definition
```markdown
# IDENTITY.md
Name: Claw
Creature: AI familiar
Vibe: sharp, warm, decisive
Emoji: 🐾
```

---

## TTS (Text-to-Speech)

```typescript
// Speak a message (ElevenLabs via sag skill, or system)
tts({ text: "Deploy complete. All tests passing." })
// After a successful tts call, reply with NO_REPLY
```

---

## Session Status & Debugging

```typescript
// Show usage, model, cost, time
session_status()

// Override model for this session
session_status({ model: "flash" })     // switch to flash
session_status({ model: "default" })  // reset to gateway default
```

### `/status` In Chat
Returns: session key, model, usage, time, reasoning on/off, elevated, thinking mode.

---

## Security & Permissions

```yaml
# In gateway config
security:
  allowedUsers:
    - discord_id: "140250972147417088"
      name: Chris
  allowedChannels:
    - discord: "1476163282825121940"

# Per-agent elevated permissions
agents:
  builder:
    elevated: true          # allow elevated exec
    sandbox: "inherit"      # inherit parent sandbox
```

---

## Environment Variables

```bash
# Core
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...

# Channel bots
DISCORD_BOT_TOKEN=...
TELEGRAM_BOT_TOKEN=...

# Node services
BLUEBUBBLES_HOST=http://localhost:1234
BLUEBUBBLES_PASSWORD=...

# Misc integrations
GITHUB_TOKEN=...
PLAUSIBLE_API_KEY=...
```

---

## Troubleshooting

### Gateway Won't Start
```bash
openclaw doctor          # diagnose
openclaw logs --level error
lsof -i :8080            # port conflict?
openclaw gateway restart
```

### Model Errors
```bash
/status                  # check which model is active
/model flash             # switch to a lighter model
openclaw configure models  # verify API keys
```

### Skill Not Working
```bash
openclaw status          # check skill loaded
clawhub sync <skill>     # update to latest
cat ~/openclaw/skills/<name>/SKILL.md  # re-read docs
```

### Session Stuck
```bash
/clear    # clear context
/reset    # full reset
```

### Memory Not Recalled
- Always run `memory_search()` before answering about prior work
- Check MEMORY.md exists and is non-empty
- Memory files must be under `~/.openclaw/agents/<agent>/`

---

## Resources

- **Docs:** https://docs.openclaw.ai
- **GitHub:** https://github.com/openclaw/openclaw
- **Community:** https://discord.com/invite/clawd
- **Skills marketplace:** https://clawhub.com
- **changelogs.info tracking:** https://changelogs.info/tools/openclaw
