---
tool: aider
title: Aider Cheat Sheet
---

# Aider Cheat Sheet

## Installation

```bash
pip install aider-chat
# or
pipx install aider-chat
```

## Starting Aider

```bash
aider                          # Start in current directory
aider file1.py file2.py        # Add specific files to chat
aider --model gpt-4-turbo      # Use specific model
aider --sonnet                 # Use Claude Sonnet
aider --opus                   # Use Claude Opus
aider --read README.md         # Add read-only file for context
```

## In-Chat Commands

| Command | Description |
|---------|-------------|
| `/add <file>` | Add file to chat for editing |
| `/drop <file>` | Remove file from chat |
| `/read <file>` | Add read-only file for context |
| `/undo` | Undo last git commit by aider |
| `/diff` | Show diff of pending changes |
| `/commit` | Commit pending changes |
| `/run <cmd>` | Run shell command |
| `/help` | Show help |
| `/exit` | Exit aider |
| `/clear` | Clear chat history |
| `/ls` | List files in chat |
| `/git` | Run git command |
| `/tokens` | Show token usage |
| `/model` | Switch model |
| `/architect` | Switch to architect mode |
| `/editor` | Switch to editor mode |
| `/ask` | Ask question without editing |

## Model Selection

| Model Flag | Model |
|------------|-------|
| `--opus` | Claude Opus (most capable) |
| `--sonnet` | Claude Sonnet (balanced) |
| `--4-turbo` | GPT-4 Turbo |
| `--gpt-4o` | GPT-4 Omni |
| `--deepseek` | DeepSeek Coder |
| `--model <name>` | Any OpenRouter/LiteLLM model |

## Edit Formats

Aider supports multiple edit formats:

```bash
aider --edit-format diff       # Unified diff (most reliable)
aider --edit-format whole      # Replace whole files
aider --edit-format udiff      # Universal diff format
```

## Git Integration

Aider auto-commits changes:

```bash
aider --auto-commits           # Enable auto-commits (default)
aider --no-auto-commits        # Disable auto-commits
aider --commit-prompt          # Customize commit messages
aider --dirty-commits          # Allow commits with dirty repo
```

## Context Management

```bash
# Add files for editing
aider src/main.py src/utils.py

# Add files as read-only context
aider --read docs/spec.md --read tests/test_main.py

# Use repo map for context
aider --map-tokens 1024        # Allocate tokens for repo map

# Load all git tracked files
aider --auto-commits $(git ls-files)
```

## Common Workflows

### Bug Fix

```bash
aider buggy_file.py
# In chat: "Fix the IndexError on line 42"
```

### Feature Addition

```bash
aider --read requirements.md src/features.py
# "Add user authentication as specified in requirements"
```

### Refactoring

```bash
aider src/*.py
# "Refactor to use dependency injection"
```

### Test Generation

```bash
aider --read src/app.py tests/test_app.py
# "Generate comprehensive unit tests"
```

## Configuration

Config file: `~/.aider.conf.yml`

```yaml
model: gpt-4-turbo
edit-format: diff
auto-commits: true
dirty-commits: false
attribute-author: true
attribute-committer: false
map-tokens: 1024
env-file: .env
```

## Environment Variables

```bash
OPENAI_API_KEY=...           # OpenAI API key
ANTHROPIC_API_KEY=...        # Anthropic API key
AIDER_MODEL=...              # Default model
AIDER_AUTO_COMMITS=true      # Auto-commit changes
```

## Advanced Features

### Architect Mode

```bash
aider --architect  # High-level planning, edits many files
```

### Editor Mode

```bash
aider --editor     # Precise edits, single file focus
```

### Voice Input

```bash
aider --voice      # Enable voice input
```

### Linting

```bash
aider --lint       # Run linter after edits
aider --test       # Run tests after edits
```

### Multi-file Edits

```bash
# Add multiple files and request coordinated changes
aider src/models.py src/views.py src/controllers.py
# "Update the user model and propagate changes to views and controllers"
```

## Tips

- Start with a few key files, add more as needed with `/add`
- Use `/read` for context files you don't want edited
- `/undo` is your friend — don't hesitate to experiment
- Use `--opus` for complex refactorings
- Use `--sonnet` for speed and cost efficiency
- Check `/diff` before committing
- Use architect mode for greenfield projects
- Use editor mode for surgical fixes
- Enable `--test` to catch regressions early
