---
tool: continue
title: Continue Cheat Sheet
lastUpdated: 2026-03-08
---

## What's New

_Auto-detected changes from upstream documentation (2026-03-08)_

**New Documentation Sections:**
- Getting started
- How it works
- Install CLI
- Contributing
- License

---

# Continue Cheat Sheet

Open-source AI code assistant for VS Code and JetBrains. Fully customizable with any LLM.

---

## Installation

### VS Code
1. Open Extensions (`Cmd+Shift+X` / `Ctrl+Shift+X`)
2. Search "Continue"
3. Install
4. Configure API keys in Continue settings

### JetBrains (IntelliJ, PyCharm, WebStorm, etc.)
1. Settings → Plugins
2. Search "Continue"
3. Install
4. Restart IDE
5. Configure in Continue settings

---

## Core Features

### Chat
Ask questions and get code suggestions.

**Open:** `Cmd+L` (Mac) / `Ctrl+L` (Win/Linux)

```
> Explain this function
> How do I add authentication?
> Fix the bug in line 42
```

### Edit
Inline code edits.

**Open:** `Cmd+I` (Mac) / `Ctrl+I` (Win/Linux)

1. Select code
2. Press `Cmd+I`
3. Describe change
4. Accept/Reject

### Autocomplete
Tab completion as you type.

- `Tab` — Accept suggestion
- `Escape` — Reject

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+L / Ctrl+L` | Open Chat |
| `Cmd+I / Ctrl+I` | Inline Edit |
| `Cmd+Shift+L / Ctrl+Shift+L` | New Chat |
| `Cmd+Shift+R / Ctrl+Shift+R` | Regenerate Response |
| `Tab` | Accept autocomplete |
| `Escape` | Cancel/Reject |

---

## Slash Commands

### In Chat
| Command | Description |
|---------|-------------|
| `/edit` | Edit selected code |
| `/comment` | Add comments to code |
| `/share` | Share conversation |
| `/cmd` | Run terminal command |
| `/commit` | Generate commit message |

### Examples
```
> /edit Add error handling to this function
> /comment Document this API endpoint
> /cmd npm run test
> /commit
```

---

## Configuration (config.json)

**Location:**
- **macOS:** `~/.continue/config.json`
- **Windows:** `%USERPROFILE%\.continue\config.json`
- **Linux:** `~/.continue/config.json`

### Example config.json
```json
{
  "models": [
    {
      "title": "GPT-4 Turbo",
      "provider": "openai",
      "model": "gpt-4-turbo",
      "apiKey": "sk-..."
    },
    {
      "title": "Claude Sonnet",
      "provider": "anthropic",
      "model": "claude-3.5-sonnet",
      "apiKey": "sk-ant-..."
    },
    {
      "title": "Local Llama",
      "provider": "ollama",
      "model": "llama3:70b"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Codestral",
    "provider": "mistral",
    "model": "codestral-latest",
    "apiKey": "..."
  },
  "embeddingsProvider": {
    "provider": "transformers.js"
  },
  "customCommands": [
    {
      "name": "test",
      "description": "Write unit tests",
      "prompt": "Write comprehensive unit tests for the selected code using Jest."
    }
  ],
  "contextProviders": [
    {
      "name": "code",
      "params": {}
    },
    {
      "name": "docs",
      "params": {}
    },
    {
      "name": "github",
      "params": {
        "token": "ghp_..."
      }
    }
  ]
}
```

---

## Supported Providers

### Cloud Providers
| Provider | Models |
|----------|--------|
| **OpenAI** | gpt-4-turbo, gpt-4o, gpt-3.5-turbo |
| **Anthropic** | claude-3.5-sonnet, claude-3-opus, claude-3-haiku |
| **Google** | gemini-1.5-pro, gemini-1.5-flash |
| **Mistral** | mistral-large, codestral |
| **Groq** | llama3-70b, mixtral-8x7b |
| **Together AI** | Various open-source models |

### Local Providers
| Provider | Description |
|----------|-------------|
| **Ollama** | Run Llama, Mistral, etc. locally |
| **LM Studio** | Local model inference |
| **llamafile** | Single-file local models |

### Configure Provider
```json
{
  "models": [
    {
      "title": "My Model",
      "provider": "openai",  // or anthropic, ollama, etc.
      "model": "gpt-4-turbo",
      "apiKey": "sk-...",
      "apiBase": "https://api.openai.com/v1"  // optional
    }
  ]
}
```

---

## Context Providers

Context providers add extra information to prompts.

### Built-in Context Providers
| Provider | Description |
|----------|-------------|
| `code` | Current file and selected code |
| `docs` | Project documentation |
| `terminal` | Terminal output |
| `problems` | Editor errors/warnings |
| `folder` | Folder contents |
| `codebase` | Entire codebase (indexed) |
| `github` | GitHub issues/PRs |
| `gitlab` | GitLab issues/MRs |
| `jira` | Jira issues |

### Use in Chat
```
> @docs How do I set up authentication?
> @terminal Why did the build fail?
> @codebase Find all API endpoints
> @github Show open bugs
```

---

## Custom Commands

Add custom slash commands in `config.json`:

```json
{
  "customCommands": [
    {
      "name": "review",
      "description": "Code review",
      "prompt": "Review this code for:\n1. Bugs\n2. Performance\n3. Security\n4. Best practices"
    },
    {
      "name": "test",
      "description": "Write tests",
      "prompt": "Write comprehensive unit tests using Jest. Include edge cases and error scenarios."
    },
    {
      "name": "optimize",
      "description": "Optimize performance",
      "prompt": "Analyze this code for performance issues and suggest optimizations."
    }
  ]
}
```

Use in chat: `/review`, `/test`, `/optimize`

---

## .continuerc (Project Config)

Create `.continuerc.json` in project root:

```json
{
  "systemMessage": "You are a TypeScript expert. Follow Airbnb style guide.",
  "rules": [
    "Always use async/await over promises",
    "Prefer functional components in React",
    "Write tests for all new features",
    "Use TypeScript strict mode"
  ],
  "temperature": 0.5,
  "contextLength": 16000
}
```

---

## Examples

### Code Explanation
```
Chat:
> @code Explain this authentication middleware

Continue analyzes selected code and explains how it works.
```

### Refactoring
```
Inline Edit (Cmd+I):
Select function → Cmd+I
> Extract this logic to a separate helper function

Continue creates helper and updates original code.
```

### Testing
```
Custom Command:
Select function → /test

Continue generates comprehensive unit tests.
```

### Bug Fixing
```
Chat:
> @problems Fix the TypeScript error on line 42
> @terminal Why is the build failing?

Continue analyzes errors and suggests fixes.
```

---

## Tips & Best Practices

### Model Selection
- Use **GPT-4 Turbo** for complex tasks
- Use **Claude 3.5 Sonnet** for large context
- Use **GPT-3.5 Turbo** for simple tasks (cheaper)
- Use **local models** for privacy

### Context Management
- Use `@code` for focused questions
- Use `@codebase` for broad searches
- Use `@docs` to reference documentation
- Clear context when switching tasks (Cmd+Shift+L)

### Custom Commands
- Create commands for repetitive tasks
- Use descriptive names
- Test prompts before committing

### Performance
- Lower `temperature` for code generation (0.3-0.5)
- Higher `temperature` for brainstorming (0.7-0.9)
- Limit `contextLength` to save costs

---

## Ollama Integration (Local Models)

### Setup
1. Install Ollama: https://ollama.ai
2. Pull model: `ollama pull llama3:70b`
3. Configure in Continue:

```json
{
  "models": [
    {
      "title": "Llama 3 70B",
      "provider": "ollama",
      "model": "llama3:70b"
    }
  ]
}
```

### Recommended Models
- **llama3:70b** — Best quality
- **codellama:34b** — Code-focused
- **mistral:7b** — Fast, small
- **deepseek-coder:33b** — Code generation

---

## Troubleshooting

### API Key Errors
- Check `config.json` for correct API keys
- Verify provider and model names
- Ensure API key has credits/access

### Autocomplete Not Working
- Check `tabAutocompleteModel` in config
- Reload window (Cmd+R / Ctrl+R)
- Check provider status

### Slow Responses
- Switch to faster model (gpt-3.5-turbo)
- Reduce context length
- Use local models (Ollama)

### Context Too Large
- Limit context with specific `@` references
- Clear chat (Cmd+Shift+L)
- Reduce `contextLength` in config

---

## Resources

- **Official Site:** https://continue.dev
- **GitHub:** https://github.com/continuedev/continue
- **Documentation:** https://continue.dev/docs
- **Discord:** https://discord.gg/continue
- **Model Providers:** https://continue.dev/docs/providers
