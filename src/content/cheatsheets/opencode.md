---
tool: opencode
title: OpenCode Cheat Sheet
---

# OpenCode Cheat Sheet

## Installation

| Method | Command |
|--------|---------|
| Go | go install github.com/opencode-ai/opencode@latest |

## CLI

| Command | Description |
|---------|-------------|
| opencode | Launch TUI interface |
| opencode -p "task" | Run headless prompt |
| opencode --model model | Override model |
| opencode --version | Show version |

## TUI Keybindings

| Key | Action |
|-----|--------|
| Enter | Send message |
| Ctrl+C | Cancel/quit |
| Ctrl+N | New conversation |
| Tab | Switch panels |
| Ctrl+L | Clear screen |
| / | Command mode |

## Supported Providers
| Provider | Models |
|----------|--------|
| Anthropic | Claude Sonnet, Opus, Haiku |
| OpenAI | GPT-4o, o1, o3 |
| Google | Gemini 2.5 |
| Groq | Llama, Mixtral |
| Ollama | Local models |

## Features
- Terminal UI with real-time streaming
- File editing with diff preview
- Shell command execution
- MCP server support
- Git-aware context
- Conversation history
- Multi-model support

## Tips

- Headless mode (-p) is great for scripts and CI
- TUI gives you real-time file diffs before applying
- MCP servers extend capabilities (filesystem, database, APIs)
- Supports .opencode.json in project root for per-project config
