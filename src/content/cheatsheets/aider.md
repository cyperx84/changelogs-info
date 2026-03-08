---
tool: aider
title: Aider Cheat Sheet
lastUpdated: 2026-03-08
---

## What's New

_Auto-detected changes from upstream documentation (2026-03-08)_

**New Documentation Sections:**
- Features
- [Cloud and local LLMs](https://aider.chat/docs/llms.html)
- [Maps your codebase](https://aider.chat/docs/repomap.html)
- [100+ code languages](https://aider.chat/docs/languages.html)
- [Git integration](https://aider.chat/docs/git.html)

**New Commands Detected:**
- `aider-install`
- `aider --model deepseek --api-key deepseek=<key>`
- `aider --model sonnet --api-key anthropic=<key>`
- `aider --model o3-mini --api-key openai=<key>`

**New Flags Detected:**
- `--model`
- `--api-key`

---

# Aider Cheat Sheet

AI pair programming in your terminal. Works with any git repo and supports GPT-4, Claude, and more.

---

## Installation

```bash
# pip
pip install aider-chat

# pipx (recommended)
pipx install aider-chat

# Upgrade
pip install --upgrade aider-chat
```

---

## Core Commands

| Command | Description |
|---------|-------------|
| `aider` | Start in current git repo |
| `aider file1.py file2.py` | Start with specific files in context |
| `aider --model <model>` | Choose AI model |
| `aider --no-auto-commits` | Disable automatic commits |
| `aider --dark-mode` | Use dark color scheme |
| `aider --light-mode` | Use light color scheme |
| `aider --vim` | Enable vim keybindings |
| `aider --restore-chat` | Restore previous session |

---

## Slash Commands (In-Session)

### File Management
| Command | Description |
|---------|-------------|
| `/add <file>` | Add file(s) to context |
| `/drop <file>` | Remove file(s) from context |
| `/ls` | List files in context |
| `/read <file>` | Add file as read-only (referenced but not edited) |
| `/clear` | Remove all files from context |

### Git Operations
| Command | Description |
|---------|-------------|
| `/commit` | Commit current changes with AI-generated message |
| `/commit <message>` | Commit with custom message |
| `/diff` | Show unstaged changes |
| `/undo` | Undo last commit (git reset --soft HEAD~1) |
| `/git <command>` | Run arbitrary git command |

### Session Control
| Command | Description |
|---------|-------------|
| `/run <command>` | Execute shell command and show output |
| `/test` | Run tests (looks for pytest, npm test, etc.) |
| `/reset` | Reset chat history (keep files in context) |
| `/exit` | Exit aider |
| `/quit` | Exit aider (alias) |

### Model & Configuration
| Command | Description |
|---------|-------------|
| `/model` | Show available models |
| `/model <name>` | Switch to different model |
| `/architect` | Switch to architect mode (plan-first) |
| `/editor` | Switch to editor mode (direct edits) |
| `/help` | Show all slash commands |
| `/tokens` | Show token usage |
| `/cost` | Show estimated cost |

### Advanced
| Command | Description |
|---------|-------------|
| `/voice` | Enable voice input (requires whisper) |
| `/paste` | Paste from clipboard |
| `/web <url>` | Fetch and add web content to context |
| `/lint` | Run linter on files |
| `/settings` | Show current settings |

---

## CLI Flags

### Model Selection
| Flag | Description |
|------|-------------|
| `--model <name>` | gpt-4-turbo, claude-3-opus, gpt-3.5-turbo, etc. |
| `--opus` | Use claude-3-opus (shorthand) |
| `--sonnet` | Use claude-3.5-sonnet (shorthand) |
| `--4-turbo` | Use gpt-4-turbo (shorthand) |
| `--4o` | Use gpt-4o (shorthand) |
| `--list-models` | Show all available models |

### Git Behavior
| Flag | Description |
|------|-------------|
| `--no-auto-commits` | Don't auto-commit changes |
| `--auto-test` | Run tests after each change |
| `--no-dirty-commits` | Refuse to edit if repo is dirty |
| `--commit-prompt <template>` | Custom commit message template |

### Context & Files
| Flag | Description |
|------|-------------|
| `--read <file>` | Add file as read-only |
| `--yes` | Accept all changes without confirmation |
| `--no-stream` | Don't stream responses (wait for complete answer) |
| `--show-diffs` | Show diffs before applying changes |

### UI & Display
| Flag | Description |
|------|-------------|
| `--dark-mode` | Dark color scheme |
| `--light-mode` | Light color scheme |
| `--no-fancy-input` | Disable fancy readline input |
| `--vim` | Enable vim keybindings |
| `--no-pretty` | Disable syntax highlighting |

### Advanced
| Flag | Description |
|------|-------------|
| `--api-key <key>` | Override API key |
| `--message <prompt>` | Send prompt and exit (one-shot mode) |
| `--restore-chat` | Resume previous session |
| `--config <file>` | Use custom config file |
| `--encoding <type>` | Force token encoding (cl100k_base, etc.) |

---

## Configuration File (.aider.conf.yml)

### Location
Place in project root or `~/.aider.conf.yml` for global settings.

### Example Configuration
```yaml
# Model settings
model: claude-3.5-sonnet
edit-format: diff

# Git settings
auto-commits: true
auto-test: false
dirty-commits: false

# UI settings
dark-mode: true
fancy-input: true
vim-mode: true

# Cost tracking
show-cost: true

# Default files (always include)
files:
  - src/main.py
  - src/utils.py

# Read-only files (context but not editable)
read:
  - README.md
  - docs/api.md

# Custom commit prompt
commit-prompt: |
  Write a concise commit message following conventional commits.
  Focus on the "why" not the "what".
```

---

## Edit Formats

Aider supports different edit modes:

| Format | Description | Best For |
|--------|-------------|----------|
| `diff` | Unified diff format | Large files, precise edits |
| `whole` | Replace entire file | Small files, major rewrites |
| `udiff` | Unified diff with context | Default, balanced approach |

**Set via CLI:**
```bash
aider --edit-format diff
```

**Set via config:**
```yaml
edit-format: diff
```

---

## Examples

### Basic Usage
```bash
# Start with files
aider main.py utils.py

# Inside aider:
> Add error handling to the API call in main.py
> Write tests for the new error handling
> /test
> /commit
```

### One-Shot Mode
```bash
# Make change and exit
aider --message "Add type hints to all functions" src/api.py
```

### Architect Mode (Plan-First)
```bash
aider --architect app.py

> Refactor this to use dependency injection
[Aider plans changes, shows plan, gets approval, then applies]
```

### With Read-Only Context
```bash
# Include docs as reference but don't edit
aider --read README.md --read docs/api.md src/main.py
```

### Auto-Test Workflow
```bash
# Run tests after every change
aider --auto-test tests/test_api.py src/api.py

> Fix the failing authentication test
[Aider edits, runs tests automatically, iterates until passing]
```

---

## Git Integration

### Auto-Commits
By default, aider commits after each change:
```
feat: add authentication middleware

- Added JWT verification
- Added error handling for invalid tokens
```

### Disable Auto-Commits
```bash
aider --no-auto-commits
# Then manually: /commit
```

### Custom Commit Messages
```yaml
# .aider.conf.yml
commit-prompt: |
  Format: <type>(<scope>): <description>
  Types: feat, fix, docs, refactor, test
```

---

## Model Support

### Supported Providers
- **OpenAI:** gpt-4-turbo, gpt-4o, gpt-3.5-turbo
- **Anthropic:** claude-3-opus, claude-3.5-sonnet, claude-3-haiku
- **Local Models:** via OpenAI-compatible API

### Set API Keys
```bash
# OpenAI
export OPENAI_API_KEY="sk-..."

# Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Cost Tracking
```bash
# Show cost estimate
/cost

# Enable cost display
aider --show-cost
```

---

## Tips & Best Practices

### Context Management
- Add only files you're actively editing to context
- Use `/read` for documentation/reference files
- Use `/drop` to remove files when done

### Commit Workflow
1. Make changes with aider
2. Review with `/diff`
3. Test with `/run pytest` or `/test`
4. Commit with `/commit` or custom message

### Performance
- Use `--4o` for fast, cheap edits
- Use `--opus` for complex refactors
- Use `--no-stream` for scripting

### Safety
- Enable `--no-dirty-commits` to prevent editing uncommitted work
- Use `--show-diffs` to review before applying
- Use `/undo` to revert last commit

---

## Troubleshooting

### "Repository not found"
```bash
# Initialize git first
git init
git add .
git commit -m "Initial commit"
```

### "No API key found"
```bash
# Set environment variable
export OPENAI_API_KEY="your-key"

# Or use --api-key flag
aider --api-key "your-key"
```

### Context Too Large
```bash
# Drop unnecessary files
/drop large_file.py

# Use read-only for reference
/read docs.md
```

### Edits Not Applying
- Try `--edit-format diff` for better precision
- Ensure files are tracked by git
- Check file permissions

---

## Resources

- **Official Docs:** https://aider.chat/docs/
- **GitHub:** https://github.com/paul-gauthier/aider
- **Examples:** https://aider.chat/examples/
- **Discord:** https://discord.gg/aider
