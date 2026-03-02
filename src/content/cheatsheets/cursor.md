---
tool: cursor
title: Cursor Cheat Sheet
lastUpdated: 2026-03-02
---

# Cursor Cheat Sheet

AI-first code editor. Fork of VS Code with built-in GPT-4, Claude, and custom models.

---

## Installation

1. Download from https://cursor.sh
2. Install like VS Code
3. Sign in with Cursor account
4. Set API keys in Settings → Cursor → API Keys

---

## Core Features

### Chat (Cmd+L / Ctrl+L)
Ask questions about your codebase in sidebar.

```
> Explain how authentication works
> Show me all API endpoints
> Find bugs in UserService.ts
```

### Edit (Cmd+K / Ctrl+K)
Inline code edits with AI.

```
1. Select code
2. Press Cmd+K (Mac) or Ctrl+K (Win/Linux)
3. Describe change
4. Accept/Reject
```

### Composer (Cmd+I / Ctrl+I)
Multi-file edits across codebase.

```
1. Press Cmd+I (Mac) or Ctrl+I (Win/Linux)
2. Describe task
3. Review changes across files
4. Accept all or selectively
```

---

## Keyboard Shortcuts

| Shortcut | Action | Mode |
|----------|--------|------|
| `Cmd+L / Ctrl+L` | Open Chat | All |
| `Cmd+K / Ctrl+K` | Inline Edit | Selection |
| `Cmd+I / Ctrl+I` | Open Composer | All |
| `Cmd+Shift+L / Ctrl+Shift+L` | New Chat | All |
| `Escape` | Cancel/Close | All |
| `Tab` | Accept suggestion | Inline |
| `Cmd+. / Ctrl+.` | Show Quick Fix | Error |

---

## Chat Commands

### Codebase Queries
| Query | Description |
|-------|-------------|
| `@codebase` | Search entire codebase |
| `@file` | Reference specific file |
| `@folder` | Reference folder |
| `@docs` | Search documentation |
| `@web` | Search web (requires internet) |

### Examples
```
> @codebase How is user authentication implemented?
> @file:api.ts Explain this endpoint
> @folder:components Find unused React components
> @docs Next.js data fetching
> @web Latest React 19 features
```

---

## Edit Modes

### Inline Edit (Cmd+K)
Best for: Single-file, targeted changes

```
1. Select function/block
2. Cmd+K
3. "Add error handling"
4. Accept
```

### Composer (Cmd+I)
Best for: Multi-file, architectural changes

```
1. Cmd+I
2. "Refactor auth to use JWT instead of sessions"
3. Review changes across files
4. Accept all
```

### Chat with Apply
Best for: Exploratory changes

```
1. Cmd+L
2. "Show me how to add Redis caching"
3. Click "Apply" on code blocks
```

---

## Model Selection

### Available Models
| Model | Speed | Quality | Cost |
|-------|-------|---------|------|
| **cursor-small** | Fastest | Good | Free tier |
| **gpt-4-turbo** | Fast | Great | Premium |
| **gpt-4o** | Very Fast | Great | Premium |
| **claude-3.5-sonnet** | Medium | Excellent | Premium |
| **claude-3-opus** | Slower | Best | Premium |

### Switch Models
- **Chat:** Click model dropdown in chat
- **Edit:** Settings → Cursor → Default Model
- **Composer:** Click model in composer header

---

## Settings

### Cursor Settings
- `Cursor: Default Model` — Model for edits
- `Cursor: Chat Model` — Model for chat
- `Cursor: Temperature` — Creativity (0-1)
- `Cursor: Max Tokens` — Response length
- `Cursor: Auto-Apply Edits` — Auto-accept low-risk edits
- `Cursor: Enable Composer` — Enable/disable Composer

### Privacy
- `Cursor: Privacy Mode` — Disable code indexing
- `Cursor: Telemetry` — Disable usage tracking

---

## .cursorrules File

Create `.cursorrules` in project root for consistent AI behavior:

```markdown
# .cursorrules

## Code Style
- Use TypeScript strict mode
- Prefer functional components
- Use Tailwind for styling
- Follow Airbnb style guide

## Testing
- Write tests with Vitest
- Minimum 80% coverage
- Test error cases

## Commit Messages
- Use conventional commits
- Format: type(scope): description

## Forbidden
- Never use `any` type
- Never disable ESLint rules
- Always handle errors
```

Cursor reads this file automatically.

---

## Autocomplete (Tab)

Cursor suggests code as you type.

### Accept Suggestions
- `Tab` — Accept full suggestion
- `Cmd+→` / `Ctrl+→` — Accept word-by-word
- `Escape` — Reject

### Configure
- `Cursor: Enable Autocomplete` — On/Off
- `Cursor: Autocomplete Model` — Model to use
- `Cursor: Autocomplete Trigger` — Auto or Manual

---

## Tips & Best Practices

### Chat Effectively
- ✅ "Add error handling to the API fetch in UserList.tsx"
- ❌ "Fix the code"
- Use `@codebase` for broad questions
- Use `@file` for specific file questions

### Inline Edits
- Select exact code to change
- Be specific in instruction
- Review diff before accepting

### Composer Workflow
- Use for multi-file changes
- Review each file's changes
- Test after applying

### Context Management
- Use `@file` and `@folder` to focus context
- Don't overload chat with too many files
- Clear chat when switching tasks (Cmd+Shift+L)

---

## Extensions

Cursor supports VS Code extensions:

### Recommended
- **Prettier** — Code formatting
- **ESLint** — Linting
- **GitLens** — Git integration
- **Error Lens** — Inline error display
- **Tailwind CSS IntelliSense** — Tailwind autocomplete

---

## Advanced Features

### Terminal Integration
Ask Cursor to run commands:
```
> Run the dev server
> Install dependencies
> Run tests
```

### Debugging
Ask Cursor to help debug:
```
> Why is this component not rendering?
> Fix the TypeScript error on line 42
> Explain this console error
```

### Refactoring
```
> Extract this logic to a custom hook
> Convert this class to functional component
> Split this file into smaller modules
```

---

## Shortcuts Summary

| Action | Mac | Win/Linux |
|--------|-----|-----------|
| Chat | `Cmd+L` | `Ctrl+L` |
| Inline Edit | `Cmd+K` | `Ctrl+K` |
| Composer | `Cmd+I` | `Ctrl+I` |
| New Chat | `Cmd+Shift+L` | `Ctrl+Shift+L` |
| Command Palette | `Cmd+Shift+P` | `Ctrl+Shift+P` |
| Quick Open | `Cmd+P` | `Ctrl+P` |
| Accept Suggestion | `Tab` | `Tab` |
| Reject Suggestion | `Escape` | `Escape` |

---

## Pricing

### Free Tier
- 2,000 completions/month
- cursor-small model
- Basic features

### Pro ($20/month)
- Unlimited completions
- All models (GPT-4, Claude, etc.)
- Priority support
- Advanced features

### Business ($40/user/month)
- Everything in Pro
- Team workspace
- SSO/SAML
- Admin controls
- Audit logs

---

## Troubleshooting

### Autocomplete Not Working
- Check `Cursor: Enable Autocomplete` setting
- Verify API key is set
- Try reloading window (Cmd+R / Ctrl+R)

### Chat Responses Slow
- Switch to faster model (cursor-small, gpt-4o)
- Reduce context size (avoid `@codebase` for simple queries)
- Check internet connection

### Edits Not Applying
- Review diff carefully
- Check file permissions
- Ensure file is not open in multiple editors

---

## Resources

- **Official Site:** https://cursor.sh
- **Documentation:** https://cursor.sh/docs
- **Discord:** https://discord.gg/cursor
- **Changelog:** https://cursor.sh/changelog
