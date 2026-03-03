---
tool: void
title: Void Cheat Sheet
lastUpdated: 2026-03-04
---

# Void Cheat Sheet

Open-source AI code editor. VS Code fork with built-in AI features and local model support.

---

## Installation

```bash
# Download from voideditor.com
# Available for macOS, Linux, Windows

# From source
git clone https://github.com/voideditor/void
cd void && yarn && yarn build
```

---

## Key Features

| Feature | Description |
|---------|-------------|
| Inline Edit | `Ctrl+K` — AI edit at cursor |
| Chat | Sidebar AI chat panel |
| Autocomplete | Tab-based AI completions |
| Apply | Review and apply AI suggestions |
| Diff View | Side-by-side change preview |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Inline AI edit |
| `Ctrl+L` | Open chat panel |
| `Ctrl+Shift+L` | Add selection to chat |
| `Tab` | Accept autocomplete |
| `Esc` | Dismiss suggestion |
| `Ctrl+Shift+Y` | Toggle AI panel |

---

## Model Configuration

Void supports multiple providers:

| Provider | Setup |
|----------|-------|
| OpenAI | API key in settings |
| Anthropic | API key in settings |
| Ollama | Local URL (default `localhost:11434`) |
| OpenRouter | API key + model selection |
| Custom | Any OpenAI-compatible endpoint |

---

## Settings

Access via `Ctrl+,` → search "Void":

| Setting | Description |
|---------|-------------|
| `void.provider` | AI provider selection |
| `void.model` | Model name |
| `void.apiKey` | Provider API key |
| `void.endpoint` | Custom API endpoint |
| `void.autocomplete` | Enable/disable autocomplete |
| `void.contextLines` | Lines of context to send |

---

## Chat Features

- `@file` — reference specific files
- `@workspace` — include workspace context
- `@selection` — reference selected code
- Markdown rendering in responses
- Code block copy/apply buttons
- Conversation history

---

## Tips

- Fork of VS Code — all VS Code extensions work
- Use Ollama for fully local/private AI
- Inline edit (`Ctrl+K`) is the fastest workflow
- Supports multi-file context in chat
- Open source — customize and self-host
