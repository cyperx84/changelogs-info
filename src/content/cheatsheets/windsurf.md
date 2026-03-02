---
tool: windsurf
title: Windsurf Cheat Sheet
lastUpdated: 2026-03-02
---

# Windsurf Cheat Sheet

Codeium's agentic IDE. AI pair programmer with flows, memory, and deep codebase understanding.

---

## Installation

1. Download from https://codeium.com/windsurf
2. Install (available for macOS, Windows, Linux)
3. Sign in with Codeium account (free)
4. Start coding with built-in AI

---

## Core Features

### Cascade (AI Chat)
Multi-turn conversation with codebase context.

**Open:** `Cmd+Shift+Space` (Mac) / `Ctrl+Shift+Space` (Win/Linux)

```
> Explain the authentication flow
> Add rate limiting to the API
> Write tests for UserService
```

### Autocomplete (Tab)
Inline code suggestions as you type.

- `Tab` — Accept suggestion
- `Escape` — Reject
- Works across all languages

### Flows (Workflows)
Reusable AI workflows for common tasks.

**Open Flows:** `Cmd+Shift+F` (Mac) / `Ctrl+Shift+F` (Win/Linux)

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+Space` / `Ctrl+Shift+Space` | Open Cascade (Chat) |
| `Cmd+Shift+F` / `Ctrl+Shift+F` | Open Flows |
| `Cmd+Shift+L` / `Ctrl+Shift+L` | New Chat |
| `Tab` | Accept autocomplete |
| `Escape` | Cancel/Reject |
| `Cmd+K` / `Ctrl+K` | Inline command |

---

## Cascade Commands

### Context References
| Command | Description |
|---------|-------------|
| `@file` | Reference specific file |
| `@folder` | Reference folder |
| `@symbol` | Reference function/class |
| `@terminal` | Reference terminal output |
| `@web` | Search web (requires internet) |

### Examples
```
> @file:auth.ts Explain this middleware
> @folder:components List all React components
> @symbol:UserService Show all methods
> @terminal Why did the build fail?
> @web Latest TypeScript 5.4 features
```

---

## Flows (Pre-built Workflows)

Windsurf includes flows for common tasks:

### Built-in Flows
| Flow | Description |
|------|-------------|
| **Review Code** | Code review with suggestions |
| **Write Tests** | Generate unit tests |
| **Fix Errors** | Debug and fix errors |
| **Refactor** | Refactor code for quality |
| **Explain Code** | Explain complex code |
| **Document** | Add JSDoc/docstrings |
| **Optimize** | Performance optimization |

### Use a Flow
1. Open Flows (`Cmd+Shift+F`)
2. Select flow
3. Follow prompts
4. Review changes

### Custom Flows
Create `.windsurf/flows/` in project root:

```yaml
# .windsurf/flows/add-api-endpoint.yaml
name: Add API Endpoint
description: Add new REST API endpoint with validation
steps:
  - prompt: "What is the endpoint name?"
    variable: endpoint_name
  - prompt: "What HTTP method? (GET, POST, PUT, DELETE)"
    variable: http_method
  - action: generate
    template: |
      Create a {{http_method}} endpoint at /api/{{endpoint_name}}
      - Add request validation
      - Add error handling
      - Add tests
```

---

## Inline Commands (Cmd+K / Ctrl+K)

Quick inline edits:

1. Select code
2. Press `Cmd+K` (Mac) or `Ctrl+K` (Win/Linux)
3. Enter command
4. Accept/Reject

### Common Commands
```
/fix - Fix selected code
/explain - Explain selected code
/test - Write tests for selected code
/refactor - Refactor selected code
/document - Add documentation
/optimize - Optimize performance
```

---

## Memory System

Windsurf remembers context across sessions.

### What's Remembered
- Previous conversations
- Code changes
- Project structure
- User preferences

### Manage Memory
- **Clear Memory:** Settings → Windsurf → Clear Memory
- **Privacy Mode:** Settings → Windsurf → Privacy Mode

---

## Settings

### Windsurf Settings
| Setting | Description |
|---------|-------------|
| `Windsurf: Enable Autocomplete` | Toggle autocomplete on/off |
| `Windsurf: Temperature` | Creativity (0-1) |
| `Windsurf: Max Tokens` | Response length |
| `Windsurf: Context Window` | Token limit for context |
| `Windsurf: Privacy Mode` | Disable cloud sync/memory |
| `Windsurf: Auto-Apply Low-Risk Edits` | Auto-accept simple edits |

### Model Configuration
Windsurf uses Codeium's proprietary models:
- **Windsurf-Large** — Best quality
- **Windsurf-Fast** — Fast responses
- **Windsurf-Balanced** — Default (balanced speed/quality)

---

## Project Configuration (.windsurfrules)

Create `.windsurfrules` in project root:

```markdown
# .windsurfrules

## Code Style
- Use TypeScript strict mode
- Prefer functional programming patterns
- Use async/await over promises
- Follow Prettier formatting

## Testing
- Use Jest for unit tests
- Use Testing Library for React
- Aim for 80%+ coverage
- Test edge cases

## Commit Messages
- Format: <type>(<scope>): <description>
- Types: feat, fix, docs, refactor, test
- Max 72 characters

## Forbidden Actions
- Never modify package.json without asking
- Never delete tests
- Never disable linting rules
- Always add error handling
```

---

## Examples

### Code Generation
```
Cascade:
> Create a REST API for user management with:
> - GET /users (list all)
> - GET /users/:id (get one)
> - POST /users (create)
> - PUT /users/:id (update)
> - DELETE /users/:id (delete)
> Add validation and error handling
```

### Refactoring
```
Cascade:
> @file:LegacyComponent.tsx Refactor this to:
> 1. Use functional components
> 2. Add TypeScript types
> 3. Extract custom hooks
> 4. Add error boundaries
```

### Testing
```
Flow: Write Tests
> Select file: UserService.ts
> Generate tests with 90% coverage
> Include edge cases and error scenarios
```

### Bug Fixing
```
Cascade:
> @terminal The build is failing with this error
> Find the root cause and fix it
```

---

## Tips & Best Practices

### Cascade (Chat)
- Start conversations with clear goals
- Use `@file` and `@folder` to provide context
- Reference errors with `@terminal`
- Ask follow-up questions for clarification

### Autocomplete
- Wait 100-200ms for suggestions
- Use `Tab` for quick acceptance
- Reject bad suggestions with `Escape`

### Flows
- Use built-in flows for common tasks
- Create custom flows for repetitive work
- Test flows before relying on them

### Memory
- Clear memory when switching projects
- Use privacy mode for sensitive code
- Review what Windsurf remembers in settings

---

## Pricing

### Free (Forever)
- Unlimited autocomplete
- Unlimited Cascade chat
- All built-in flows
- No credit card required

### Pro ($10/month)
- Priority access
- Faster responses
- Early access to new features
- Advanced flows

### Teams ($12/user/month)
- Everything in Pro
- Team workspaces
- Shared flows
- Admin controls
- Usage analytics

---

## Troubleshooting

### Autocomplete Not Working
- Check `Windsurf: Enable Autocomplete` setting
- Reload window (`Cmd+R` / `Ctrl+R`)
- Check internet connection

### Cascade Responses Slow
- Switch to Windsurf-Fast model (Settings)
- Reduce context size (avoid large folders)
- Check internet connection

### Flows Not Running
- Check flow syntax in `.windsurf/flows/`
- Reload window to refresh flows
- Check logs: Help → Toggle Developer Tools

### Memory Issues
- Clear memory: Settings → Clear Memory
- Check storage: Settings → Storage Usage
- Use privacy mode to disable memory

---

## Advanced Features

### Terminal Integration
```
> @terminal Run the dev server
> @terminal Install dependencies with npm
> @terminal What's the error from the last command?
```

### Multi-File Edits
```
> Refactor authentication across all files:
> 1. Extract to AuthService
> 2. Update all components to use AuthService
> 3. Update tests
```

### Documentation Generation
```
Flow: Document
> Select folder: src/api/
> Generate JSDoc for all functions
```

---

## Extensions

Windsurf supports VS Code extensions:

### Recommended
- **Prettier** — Code formatting
- **ESLint** — Linting
- **GitLens** — Git integration
- **Error Lens** — Inline errors
- **Tailwind IntelliSense** — Tailwind support

---

## Resources

- **Official Site:** https://codeium.com/windsurf
- **Documentation:** https://codeium.com/windsurf/docs
- **Discord:** https://discord.gg/codeium
- **Changelog:** https://codeium.com/windsurf/changelog
- **Flows Repo:** https://github.com/codeium/windsurf-flows
