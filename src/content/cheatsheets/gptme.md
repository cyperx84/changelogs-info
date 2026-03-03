---
tool: gptme
title: GPTMe Cheat Sheet
lastUpdated: 2026-03-04
---

# GPTMe Cheat Sheet

Personal AI assistant in the terminal with tool use, code execution, and self-correcting agents.

---

## Installation

```bash
# pipx (recommended)
pipx install gptme

# pip
pip install gptme

# With browser tools
pipx install 'gptme[browser]'

# With all extras
pipx install 'gptme[all]'
```

---

## Core Usage

```bash
gptme "your prompt"                    # One-shot message
gptme                                   # Interactive chat
gptme "fix bug" file.py                # Include file context
gptme --model claude-3-5-sonnet        # Specific model
gptme --non-interactive "task"         # Non-interactive mode
gptme -n "task"                        # Short form
```

---

## Chat Commands

| Command | Description |
|---------|-------------|
| `/help` | Show available commands |
| `/undo` | Undo last action |
| `/retry` | Retry last message |
| `/save` | Save conversation |
| `/load <file>` | Load conversation |
| `/exit` | Exit chat |
| `/model <name>` | Switch model mid-chat |
| `/system <msg>` | Set system message |
| `/tools` | List available tools |
| `/context <file>` | Add file to context |
| `/fork` | Fork conversation |
| `/rename <name>` | Rename conversation |
| `/block` | Create a code block for execution |

---

## Built-in Tools

| Tool | Description |
|------|-------------|
| `shell` | Execute shell commands |
| `python` | Run Python code |
| `patch` | Apply unified diffs |
| `save` | Write files |
| `read` | Read file contents |
| `browser` | Web browsing (playwright) |
| `vision` | Image analysis |
| `screenshot` | Take screenshots |
| `computer` | Computer use (click, type) |
| `tmux` | Terminal multiplexer control |
| `chats` | Search conversation history |
| `rag` | RAG over project files |

---

## Configuration

```toml
# ~/.config/gptme/config.toml

[prompt]
about_user = "Software developer"
response_preference = "concise"

[env]
MODEL = "anthropic/claude-3-5-sonnet"
OPENAI_API_KEY = "sk-..."
ANTHROPIC_API_KEY = "sk-ant-..."

[tools]
enabled = ["shell", "python", "patch", "save", "read"]
```

---

## Agent Mode

```bash
# Run as autonomous agent
gptme -n --tools shell,python,save "implement feature X"

# With file context
gptme -n file1.py file2.py "refactor these modules"

# Headless server
gptme-server                        # Start API server
```

---

## Tips

- Self-correcting: auto-retries on errors
- Use `--non-interactive` for CI/automation
- Conversation history persisted across sessions
- Supports context from stdin: `cat file | gptme "explain this"`
- Projects: use `.gptme/` dir for project-specific config
