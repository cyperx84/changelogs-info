---
tool: openclaw
title: OpenClaw Cheat Sheet
lastUpdated: 2026-03-02
---

# OpenClaw Cheat Sheet

## CLI Basics
| Command | What it does |
|---|---|
| `openclaw onboard` | Guided setup |
| `openclaw status` | Check gateway/health |
| `openclaw gateway start` | Start service |
| `openclaw gateway stop` | Stop service |
| `openclaw gateway restart` | Restart service |
| `openclaw configure` | Configure plugins/channels/models |

## Helpful Ops
| Command | Purpose |
|---|---|
| `openclaw doctor` | Diagnose setup issues |
| `openclaw logs` | View runtime logs |
| `openclaw system event --text "..." --mode now` | Trigger immediate event |

## Tips
- Keep skills focused and composable.
- Use cron jobs for reminders and checks.
- Prefer tool-first integrations over custom scripts.
