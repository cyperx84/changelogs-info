---
tool: cline
title: Cline Cheat Sheet
---

# Cline Cheat Sheet

## Installation

**VS Code Extension Marketplace:**

1. Open VS Code
2. Go to Extensions (`Cmd+Shift+X` or `Ctrl+Shift+X`)
3. Search for "Cline"
4. Click Install

**Or install via command:**

```bash
code --install-extension cline.cline
```

## Getting Started

1. Open Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Type "Cline: Open Chat"
3. Configure API key on first launch

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+P` → "Cline" | Open command palette for Cline |
| `Cmd+L` | Open Cline chat (customizable) |
| `Enter` | Send message |
| `Shift+Enter` | New line in message |
| `Escape` | Close chat |

## Chat Commands

| Command | Description |
|---------|-------------|
| Type naturally | Request changes or ask questions |
| `/clear` | Clear conversation history |
| `/model` | Change AI model |
| `/settings` | Open settings |

## Capabilities

Cline can:

- ✅ Read and write files
- ✅ Create directories
- ✅ Execute terminal commands (with approval)
- ✅ Search files with grep/ripgrep
- ✅ Use browser via Puppeteer
- ✅ Apply multi-file edits
- ✅ Debug and fix errors
- ✅ Run tests and interpret results

## Permission System

Cline requests permission for:

- **File writes** — Creating or modifying files
- **Command execution** — Running terminal commands
- **Browser use** — Opening browser for research
- **File reads** — Reading file contents

**Permission Options:**

- **Approve** — Allow this action
- **Reject** — Deny this action
- **Always Allow** — Auto-approve similar actions

## API Configuration

Cline supports multiple providers:

### Anthropic (Claude)

```json
{
  "provider": "anthropic",
  "apiKey": "sk-ant-...",
  "model": "claude-opus-4"
}
```

### OpenAI

```json
{
  "provider": "openai",
  "apiKey": "sk-...",
  "model": "gpt-4-turbo"
}
```

### OpenRouter

```json
{
  "provider": "openrouter",
  "apiKey": "sk-or-...",
  "model": "anthropic/claude-opus-4"
}
```

### Local (Ollama)

```json
{
  "provider": "ollama",
  "baseUrl": "http://localhost:11434",
  "model": "codellama"
}
```

## Common Workflows

### Create New Feature

```
"Create a user authentication system with login and signup pages.
Use React for the frontend and Express for the backend."
```

### Fix Bug

```
"There's a TypeError on line 42 of src/utils.ts.
It says 'Cannot read property of undefined'. Please investigate and fix."
```

### Refactor Code

```
"Refactor the UserService class to use async/await instead of promises.
Update all calling code accordingly."
```

### Generate Tests

```
"Generate comprehensive unit tests for the PaymentProcessor class
using Jest. Aim for 90%+ coverage."
```

### Add Documentation

```
"Add JSDoc comments to all public methods in src/api/.
Include parameter types, return types, and examples."
```

## Advanced Features

### Browser Mode

Cline can launch a browser to:

- Research APIs and documentation
- Find code examples
- Debug web applications
- Test UI changes

### Task Planning

For complex tasks, Cline will:

1. Break down the request into steps
2. Show you the plan
3. Request approval
4. Execute step-by-step

### Error Recovery

When commands fail:

- Cline reads error output
- Analyzes the problem
- Proposes fixes
- Asks to retry

### Iterative Development

```
User: "Build a todo app"
Cline: [Creates basic structure]
User: "Add due dates"
Cline: [Adds due date feature]
User: "Add filtering by status"
Cline: [Adds filters]
```

## Settings

Access via Command Palette → "Cline: Open Settings"

| Setting | Description |
|---------|-------------|
| `cline.apiKey` | API key for AI provider |
| `cline.model` | Default model |
| `cline.temperature` | Response randomness (0-1) |
| `cline.maxTokens` | Max response length |
| `cline.alwaysApproveWrite` | Auto-approve file writes |
| `cline.alwaysApproveExecute` | Auto-approve commands |
| `cline.browserEnabled` | Enable browser mode |

## Tips

- **Be specific** — Detailed requests get better results
- **Review changes** — Check diffs before approving
- **Iterate** — Start simple, add complexity incrementally
- **Use context** — Mention relevant files and functions
- **Set boundaries** — Tell Cline what NOT to change
- **Leverage browser** — Let Cline research unfamiliar APIs
- **Check terminal output** — Cline learns from command results
- **Use approvals wisely** — "Always allow" for trusted operations

## Troubleshooting

### API Errors

- Verify API key in settings
- Check account has credits/quota
- Ensure correct provider selected

### Slow Responses

- Try a faster model (e.g., Claude Sonnet vs Opus)
- Reduce context by closing unrelated files
- Clear conversation history with `/clear`

### Permission Issues

- File not writable → Check file permissions
- Command blocked → Review workspace trust settings
- Browser fails → Check Puppeteer installation

## Comparison to Other Tools

| Feature | Cline | GitHub Copilot | Continue |
|---------|-------|----------------|----------|
| Multi-file edits | ✅ | ❌ | ✅ |
| Command execution | ✅ | ❌ | ⚠️ Limited |
| Browser use | ✅ | ❌ | ❌ |
| Permission system | ✅ Granular | N/A | ⚠️ Basic |
| Chat interface | ✅ | ⚠️ Limited | ✅ |

## Resources

- **Docs**: https://cline.bot/docs
- **GitHub**: https://github.com/cline/cline
- **Discord**: https://discord.gg/cline
