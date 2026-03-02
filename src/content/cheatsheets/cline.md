---
tool: cline
title: Cline Cheat Sheet
lastUpdated: 2026-03-02
---

# Cline Cheat Sheet

VS Code extension for AI-assisted coding. Autonomous agent with approval workflow and MCP integration.

---

## Installation

1. Open VS Code
2. Install **Cline** extension from marketplace
3. Set API key in Cline settings (OpenAI, Anthropic, or local)
4. Open Cline panel: `Cmd+Shift+P` → "Cline: Open"

---

## Core Workflow

| Step | Action |
|------|--------|
| 1 | Open Cline panel in VS Code |
| 2 | Describe task with clear constraints |
| 3 | Review proposed file edits in diff view |
| 4 | Approve / reject per action |
| 5 | Iterate until task complete |

---

## Commands

### Panel Controls
| Action | Shortcut |
|--------|----------|
| Open Cline | `Cmd+Shift+P` → "Cline: Open" |
| New conversation | Click "New Chat" or `Cmd+K Cmd+N` |
| Stop generation | "Stop" button or `Esc` |
| Clear chat | "Clear" button |

### Slash Commands (In Chat)
| Command | Description |
|---------|-------------|
| `/files <pattern>` | Add files to context (glob supported) |
| `/folder <path>` | Add entire folder to context |
| `/clear` | Clear conversation history |
| `/model` | Switch AI model |
| `/memory` | Show memory/context usage |
| `/settings` | Open Cline settings |

---

## Settings

Access via: **VS Code Settings** → Search "Cline"

### Model Configuration
| Setting | Options |
|---------|---------|
| `cline.model` | gpt-4-turbo, claude-3.5-sonnet, gpt-4o, etc. |
| `cline.apiKey` | Your API key (or use env var) |
| `cline.provider` | openai, anthropic, azure, local |
| `cline.baseUrl` | Custom API endpoint (for local models) |

### Behavior
| Setting | Description |
|---------|-------------|
| `cline.autoApprove` | Auto-approve file edits (risky!) |
| `cline.maxTokens` | Max tokens per response |
| `cline.temperature` | Creativity (0-1) |
| `cline.systemPrompt` | Custom system instructions |
| `cline.contextWindow` | Token limit for context |

### MCP Integration
| Setting | Description |
|---------|-------------|
| `cline.mcpServers` | MCP server configurations (JSON) |
| `cline.enableMcp` | Enable/disable MCP tools |

---

## MCP Integration (Model Context Protocol)

Cline supports MCP for external tools and data sources.

### Enable MCP Servers
```json
// settings.json
{
  "cline.mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_..."
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://..."
      }
    }
  }
}
```

### Available MCP Servers
- **filesystem** — Enhanced file operations
- **github** — GitHub API (issues, PRs, repos)
- **postgres** — Database queries
- **brave-search** — Web search
- **puppeteer** — Browser automation

---

## Project Rules File

Create `.clinerules` in project root for consistent behavior:

```markdown
# .clinerules

## Code Style
- Use TypeScript strict mode
- Prefer functional components (React)
- Use async/await over promises

## Testing
- Write tests for all new features
- Use Jest for unit tests
- Minimum 80% coverage

## Commit Messages
- Follow conventional commits
- Format: <type>(<scope>): <description>
- Types: feat, fix, docs, refactor, test

## Forbidden Actions
- Never modify package.json without asking
- Never delete files without confirmation
- Always run tests before committing
```

Cline reads this file automatically and follows the rules.

---

## Examples

### Basic Task
```
> Add error handling to the API fetch in UserList.tsx

[Cline shows diff]
[Approve]
[Cline applies changes]
```

### Multi-File Task
```
> Refactor the authentication system:
> 1. Extract auth logic to AuthService.ts
> 2. Add JWT token refresh
> 3. Update Login.tsx to use new service
> 4. Write tests

[Cline proposes changes]
[Review each file]
[Approve]
```

### With Context
```
> /files src/auth/**/*.ts
> Explain the current authentication flow

[Cline analyzes files and explains]
```

### MCP-Powered
```
> Fetch the latest issues from our GitHub repo and summarize

[Uses MCP GitHub server]
[Displays summary]
```

---

## Tips & Best Practices

### Clear Instructions
- ✅ "Add JSDoc comments to all exported functions in auth.ts"
- ❌ "Document the code"

### Break Down Tasks
- ✅ "1. Add type definitions, 2. Implement API, 3. Write tests"
- ❌ "Build the entire feature"

### Use Project Rules
- Create `.clinerules` for consistent behavior
- Include code style, testing requirements, forbidden actions

### Context Management
- Use `/files` to include only relevant files
- Remove unneeded files to save tokens
- Use `/folder` sparingly (adds many files)

### Review Changes
- Always review diffs before approving
- Test changes locally
- Use version control (git) for easy rollback

---

## Keyboard Shortcuts

| Action | Shortcut (Mac) | Shortcut (Windows/Linux) |
|--------|----------------|--------------------------|
| Open Cline | `Cmd+Shift+P` → "Cline" | `Ctrl+Shift+P` → "Cline" |
| Accept suggestion | `Tab` | `Tab` |
| Reject suggestion | `Esc` | `Esc` |
| New chat | `Cmd+K Cmd+N` | `Ctrl+K Ctrl+N` |

---

## Model Support

### Recommended Models
| Model | Use Case | Cost |
|-------|----------|------|
| **claude-3.5-sonnet** | Best balance (recommended) | Medium |
| **gpt-4-turbo** | Fast, good quality | Medium |
| **gpt-4o** | Very fast, multimodal | Medium |
| **claude-3-opus** | Most capable, complex tasks | High |
| **gpt-3.5-turbo** | Quick edits, simple tasks | Low |

### Local Models
Cline works with local models via OpenAI-compatible API:

```json
{
  "cline.provider": "local",
  "cline.baseUrl": "http://localhost:1234/v1",
  "cline.model": "llama-3-70b"
}
```

---

## Troubleshooting

### "API key not found"
- Set `cline.apiKey` in settings
- Or export env var: `export ANTHROPIC_API_KEY="sk-ant-..."`

### Cline stuck/not responding
- Click "Stop" button
- Restart Cline panel
- Reload VS Code window

### Context too large
- Use `/clear` to reset conversation
- Remove files with `/files` (toggle off)
- Lower `cline.contextWindow` setting

### Changes not applying
- Check file permissions
- Ensure file is not open in read-only mode
- Review diff carefully (Cline shows proposed changes)

### MCP server errors
- Check MCP server logs in Output panel
- Verify command and args in settings
- Ensure dependencies are installed (npx auto-installs)

---

## Advanced: Custom System Prompt

Override default behavior with custom instructions:

```json
{
  "cline.systemPrompt": "You are a senior TypeScript developer. Always:\n- Use strict type checking\n- Prefer composition over inheritance\n- Write concise JSDoc comments\n- Follow airbnb style guide"
}
```

---

## Resources

- **GitHub:** https://github.com/cline/cline
- **VS Code Marketplace:** Search "Cline"
- **Documentation:** https://github.com/cline/cline/wiki
- **MCP Servers:** https://github.com/modelcontextprotocol/servers
