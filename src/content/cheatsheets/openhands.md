---
tool: openhands
title: OpenHands Cheat Sheet
---

# OpenHands Cheat Sheet

## Installation

| Method | Command |
|--------|---------|
| Docker (recommended) | docker pull ghcr.io/all-hands-ai/openhands:latest |
| pip | pip install openhands-ai |

## CLI Mode

openhands-cli -t "Fix the bug in auth.py"

## Environment Variables
| Variable | Purpose |
|----------|---------|
| LLM_API_KEY | LLM provider API key |
| LLM_MODEL | Model to use (e.g. anthropic/claude-sonnet-4-5) |
| LLM_BASE_URL | Custom API endpoint |
| SANDBOX_RUNTIME_CONTAINER_IMAGE | Docker runtime image |
| WORKSPACE_BASE | Base workspace directory |

## Agents

| Agent | Purpose |
|-------|---------|
| **CodeActAgent** | Default. Writes and executes code |
| **BrowsingAgent** | Web browsing and interaction |
| **DelegatorAgent** | Coordinates multiple agents |

## Web UI Features
- Real-time agent workspace view
- File browser and editor
- Terminal output streaming
- Conversation history
- Settings panel for model/agent config

## Tips

- Docker mode is most reliable for sandboxing
- Set WORKSPACE_BASE to mount your project into the sandbox
- CodeActAgent is best for most coding tasks
- Web UI at http://localhost:3000 after Docker start
- Use CLI mode for CI/CD integration
