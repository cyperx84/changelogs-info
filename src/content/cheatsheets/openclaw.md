---
tool: openclaw
title: OpenClaw Cheat Sheet
lastUpdated: 2026-03-02
---

# OpenClaw Cheat Sheet

Open-source AI agent gateway. Automate workflows with skills, cron jobs, and integrations.

---

## Installation

```bash
# npm
npm install -g openclaw

# Docker
docker pull openclaw/openclaw
docker run -p 8080:8080 openclaw/openclaw

# From source
git clone https://github.com/openclaw/openclaw
cd openclaw
npm install
npm run build
npm start
```

---

## Core Commands

### Gateway Management
| Command | Description |
|---------|-------------|
| `openclaw gateway start` | Start OpenClaw gateway service |
| `openclaw gateway stop` | Stop gateway service |
| `openclaw gateway restart` | Restart gateway |
| `openclaw gateway status` | Check gateway health |
| `openclaw gateway logs` | View runtime logs |

### Setup & Configuration
| Command | Description |
|---------|-------------|
| `openclaw onboard` | Guided setup wizard |
| `openclaw configure` | Configure plugins/channels/models |
| `openclaw configure plugins` | Manage plugins |
| `openclaw configure channels` | Configure notification channels |
| `openclaw configure models` | Set up AI models |
| `openclaw status` | Check system health |

### Diagnostics
| Command | Description |
|---------|-------------|
| `openclaw doctor` | Diagnose setup issues |
| `openclaw logs` | View all logs |
| `openclaw logs --level error` | Show only errors |
| `openclaw logs --follow` | Tail logs (live) |

---

## Skills System

Skills are reusable AI workflows/capabilities.

### Manage Skills
| Command | Description |
|---------|-------------|
| `openclaw skill create <name>` | Create new skill |
| `openclaw skill list` | List all skills |
| `openclaw skill enable <name>` | Enable skill |
| `openclaw skill disable <name>` | Disable skill |
| `openclaw skill delete <name>` | Delete skill |
| `openclaw skill run <name>` | Execute skill manually |

### Skill Structure
```yaml
# skills/summarize-pr.yaml
name: summarize-pr
description: Summarize GitHub PRs
triggers:
  - github.pull_request.opened
model: claude-3.5-sonnet
prompt: |
  Summarize this pull request in 3 bullet points:
  {{event.pull_request.title}}
  {{event.pull_request.body}}
actions:
  - type: comment
    target: github
    message: "{{response}}"
```

---

## Cron Jobs (Scheduled Tasks)

### Manage Cron Jobs
| Command | Description |
|---------|-------------|
| `openclaw cron add <schedule> <command>` | Add cron job |
| `openclaw cron list` | List all cron jobs |
| `openclaw cron remove <id>` | Remove cron job |
| `openclaw cron enable <id>` | Enable cron job |
| `openclaw cron disable <id>` | Disable cron job |

### Examples
```bash
# Daily standup reminder
openclaw cron add "0 9 * * 1-5" "send-message 'Daily standup in 30 mins!'"

# Weekly dependency check
openclaw cron add "0 10 * * 1" "run-skill check-outdated-deps"

# Hourly health check
openclaw cron add "0 * * * *" "run-skill monitor-api-health"
```

### Cron Schedule Format
```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7, Sun=0 or 7)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

---

## Events & Triggers

### Trigger Event Manually
```bash
# Trigger immediate event
openclaw system event --text "Deploy completed" --mode now

# Trigger delayed event
openclaw system event --text "Check deploy status" --mode delay --delay 300

# Trigger with custom data
openclaw system event --data '{"repo": "myapp", "branch": "main"}' --mode now
```

### Event Types
- `github.*` — GitHub webhooks (PR opened, issue created, etc.)
- `gitlab.*` — GitLab webhooks
- `slack.*` — Slack events (message, reaction, etc.)
- `cron.*` — Scheduled cron jobs
- `custom.*` — Custom user events

---

## Channels (Notifications)

### Configure Channels
```bash
# Add Slack channel
openclaw channel add slack \
  --webhook https://hooks.slack.com/... \
  --name engineering

# Add Discord
openclaw channel add discord \
  --webhook https://discord.com/api/webhooks/... \
  --name alerts

# Add Email
openclaw channel add email \
  --smtp smtp.gmail.com \
  --from bot@example.com \
  --to team@example.com
```

### List Channels
```bash
openclaw channel list
```

### Send Message to Channel
```bash
openclaw channel send slack-engineering "Build completed! ✅"
```

---

## Memory System

OpenClaw agents have persistent memory across conversations.

### Manage Memory
| Command | Description |
|---------|-------------|
| `openclaw memory set <key> <value>` | Store key-value pair |
| `openclaw memory get <key>` | Retrieve value |
| `openclaw memory delete <key>` | Delete key |
| `openclaw memory list` | List all memory entries |
| `openclaw memory clear` | Clear all memory |

### Examples
```bash
# Store project context
openclaw memory set project-status "in-development"
openclaw memory set last-deploy "2026-03-02T10:30:00Z"

# Use in skills
openclaw memory get project-status
```

---

## Plugins

### Manage Plugins
| Command | Description |
|---------|-------------|
| `openclaw plugin install <name>` | Install plugin |
| `openclaw plugin uninstall <name>` | Uninstall plugin |
| `openclaw plugin list` | List installed plugins |
| `openclaw plugin enable <name>` | Enable plugin |
| `openclaw plugin disable <name>` | Disable plugin |

### Popular Plugins
- **github** — GitHub integration (webhooks, API)
- **gitlab** — GitLab integration
- **slack** — Slack bot and webhooks
- **discord** — Discord bot
- **jira** — Jira issue tracking
- **linear** — Linear issue tracking
- **sentry** — Error monitoring
- **datadog** — Metrics and monitoring

---

## Configuration File

**Location:** `~/.openclaw/config.yaml`

### Example config.yaml
```yaml
# Gateway settings
gateway:
  port: 8080
  host: 0.0.0.0
  log_level: info

# AI models
models:
  default: claude-3.5-sonnet
  providers:
    anthropic:
      api_key: sk-ant-...
    openai:
      api_key: sk-...

# Channels
channels:
  slack-engineering:
    type: slack
    webhook: https://hooks.slack.com/...
  email-alerts:
    type: email
    smtp: smtp.gmail.com
    from: bot@example.com

# Plugins
plugins:
  github:
    enabled: true
    token: ghp_...
  slack:
    enabled: true
    bot_token: xoxb-...

# Memory
memory:
  backend: sqlite # or redis, postgres
  path: ~/.openclaw/memory.db
```

---

## Examples

### Auto-Review PRs
```yaml
# skills/pr-review.yaml
name: pr-review
description: Automatically review pull requests
triggers:
  - github.pull_request.opened
model: claude-3.5-sonnet
prompt: |
  Review this pull request:
  Title: {{event.pull_request.title}}
  Files changed: {{event.pull_request.changed_files}}
  Diff: {{event.pull_request.diff}}

  Provide:
  1. Code quality assessment
  2. Potential bugs
  3. Suggestions for improvement
actions:
  - type: comment
    target: github
    message: "{{response}}"
```

### Daily Standup Reminder
```bash
# Add cron job
openclaw cron add "0 9 * * 1-5" "run-skill daily-standup-reminder"

# Skill: skills/daily-standup-reminder.yaml
name: daily-standup-reminder
description: Send daily standup reminder
model: gpt-4-turbo
prompt: |
  Generate a friendly reminder for daily standup.
  Include:
  - Meeting link: https://meet.google.com/xyz
  - What to prepare: updates, blockers, plans
actions:
  - type: send
    channel: slack-engineering
    message: "{{response}}"
```

### Monitor API Health
```yaml
# skills/monitor-api-health.yaml
name: monitor-api-health
description: Check API health and alert if down
triggers:
  - cron.hourly
actions:
  - type: http
    url: https://api.example.com/health
    method: GET
  - type: evaluate
    condition: "{{http.status}} != 200"
    actions:
      - type: send
        channel: slack-alerts
        message: "🚨 API is down! Status: {{http.status}}"
```

---

## Tips & Best Practices

### Skills
- Keep skills focused and composable
- Use clear, descriptive names
- Test skills manually before enabling triggers

### Cron Jobs
- Use cron for reminders, checks, and reports
- Avoid high-frequency cron (< 5 min intervals)
- Monitor cron job execution in logs

### Integrations
- Prefer tool-first integrations (plugins) over custom scripts
- Use webhooks for real-time events
- Store secrets in env vars or config, not in skill files

### Memory
- Use memory for cross-conversation context
- Clean up old memory entries periodically
- Use structured keys (e.g., `project:status`, `deploy:last-timestamp`)

---

## Troubleshooting

### Gateway Won't Start
```bash
# Check port availability
lsof -i :8080

# Check logs
openclaw logs --level error

# Run diagnostics
openclaw doctor
```

### Skill Not Triggering
```bash
# Check skill is enabled
openclaw skill list

# Verify trigger configuration
cat ~/.openclaw/skills/skill-name.yaml

# Check event logs
openclaw logs --follow
```

### Plugin Issues
```bash
# Reinstall plugin
openclaw plugin uninstall github
openclaw plugin install github

# Check plugin config
openclaw configure plugins

# View plugin logs
openclaw logs --filter plugin=github
```

---

## Resources

- **Official Docs:** https://openclaw.dev/docs
- **GitHub:** https://github.com/openclaw/openclaw
- **Community:** https://discord.gg/openclaw
- **Examples:** https://github.com/openclaw/examples
