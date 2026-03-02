---
tool: codex-cli
title: Codex CLI Cheat Sheet
lastUpdated: 2026-03-02
---

# Codex CLI Cheat Sheet

Fast, sandboxed CLI for autonomous AI code edits. Supports full-auto mode with safety guarantees.

---

## Installation

```bash
# npm
npm install -g codex-cli

# yarn
yarn global add codex-cli

# pipx (Python version)
pipx install codex-cli
```

---

## Basic Usage

| Command | Description |
|---------|-------------|
| `codex` | Start interactive session |
| `codex "query"` | One-shot prompt (suggests changes) |
| `codex --model <model>` | Specify model to use |
| `codex --provider <name>` | Choose AI provider (openai, anthropic, etc.) |
| `codex --approval-mode <mode>` | Set approval mode (suggest, auto-edit, full-auto) |

---

## Approval Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| `suggest` | Default — suggests changes, you approve each one | Safe, manual review |
| `auto-edit` | Auto-applies file edits, asks for shell commands | Faster, still safe |
| `full-auto` | Runs everything automatically (sandboxed) | Fully autonomous |

### Examples
```bash
# Default (suggest mode)
codex "add error handling to api.ts"

# Auto-edit mode (applies file edits automatically)
codex --approval-mode auto-edit "refactor auth system"

# Full-auto mode (no approvals, sandboxed)
codex --approval-mode full-auto "fix all lint errors"
```

---

## CLI Flags

### Model & Provider
| Flag | Description |
|------|-------------|
| `--model / -m` | Model name (o4-mini, gpt-4-turbo, claude-3.5-sonnet) |
| `--provider / -p` | AI provider (openai, anthropic, azure, local) |
| `--api-key` | API key override (instead of env var) |
| `--base-url` | Custom API endpoint (for local models) |

### Behavior
| Flag | Description |
|------|-------------|
| `--approval-mode / -a` | suggest, auto-edit, or full-auto |
| `--quiet / -q` | Non-interactive, print final output only |
| `--json` | Output in JSON format (for scripting) |
| `--yes / -y` | Auto-approve all (same as full-auto) |

### Context
| Flag | Description |
|------|-------------|
| `--files <glob>` | Include files in context (e.g., "src/**/*.ts") |
| `--full-context` | Disable context condensing (use all files) |
| `--no-project-doc` | Skip reading project docs (README, CONTRIBUTING) |
| `--include-hidden` | Include hidden files/folders |

### Advanced
| Flag | Description |
|------|-------------|
| `--notify` | Desktop notification when finished |
| `--timeout <seconds>` | Max execution time |
| `--max-turns <N>` | Limit agentic turns |
| `--sandbox` | Force sandbox mode (default in full-auto) |
| `--no-sandbox` | Disable sandbox (use carefully!) |
| `--verbose` | Show detailed logs |
| `--debug` | Debug mode (very verbose) |

---

## Configuration

### Config File Location
- **Linux/macOS:** `~/.codex/config.yaml`
- **Windows:** `%APPDATA%/codex/config.yaml`

### Example config.yaml
```yaml
# Model settings
model: o4-mini
provider: openai
api_key: sk-...

# Behavior
approval_mode: suggest
max_turns: 20
timeout: 300

# Context
include_hidden: false
auto_read_docs: true

# Sandbox
sandbox_enabled: true
sandbox_network: false
```

### Set Config Values
```bash
codex config set model o4-mini
codex config set approval_mode auto-edit
codex config set provider anthropic
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `CODEX_HOME` | Config directory override |
| `CODEX_APPROVAL_MODE` | Default approval mode |
| `CODEX_MODEL` | Default model |

---

## Sandbox Mode

**Full-auto mode is sandboxed by default** for safety:

### Sandbox Restrictions
- ✅ Read/write files in working directory
- ✅ Run safe commands (git, npm, etc.)
- ❌ Network access disabled
- ❌ Filesystem access outside working directory
- ❌ Destructive system commands (rm -rf /, shutdown, etc.)

### Force Sandbox
```bash
codex --sandbox "make risky changes"
```

### Disable Sandbox (Risky!)
```bash
codex --no-sandbox --approval-mode full-auto "deploy to production"
```

---

## Examples

### Quick Fixes
```bash
# Fix lint errors
codex "fix all eslint errors"

# Add type annotations
codex --files "src/**/*.js" "convert to TypeScript"

# Update dependencies
codex "upgrade all packages to latest"
```

### Refactoring
```bash
# Extract function
codex "extract authentication logic to auth.ts"

# Rename
codex "rename UserService to UserRepository across project"

# Modularize
codex "split api.ts into separate endpoint files"
```

### Testing
```bash
# Generate tests
codex "write unit tests for all functions in utils.ts"

# Increase coverage
codex "add tests to reach 80% coverage"

# Fix failing tests
codex --auto-edit "fix failing tests in auth.test.ts"
```

### Automation (Full-Auto)
```bash
# Auto-fix CI failures
codex --full-auto "fix the failing CI tests"

# Auto-migrate
codex --full-auto "migrate from Webpack to Vite"

# Batch processing
for file in src/**/*.ts; do
  codex --quiet --full-auto "add JSDoc to $file" >> log.txt
done
```

---

## Multimodal Support

Codex supports images and screenshots:

```bash
# Describe screenshot
codex "describe this screenshot" < screenshot.png

# Implement from design
codex "implement this design mockup" < design.png

# Debug from error screenshot
codex "fix the error shown in this screenshot" < error.png
```

---

## Tips & Best Practices

### Performance
- Use `--model o4-mini` for simple tasks (fast + cheap)
- Use `--model claude-3.5-sonnet` for complex refactors
- Limit context with `--files` glob patterns

### Safety
- Start with `suggest` mode, graduate to `auto-edit`
- Use `full-auto` only in sandboxed environments
- Review `--no-sandbox` changes carefully
- Always use version control (git)

### Context Management
- Use `--files` to include only relevant files
- Enable `--no-project-doc` to skip README/CONTRIBUTING
- Use `--full-context` for small projects only

### Automation
- Use `--quiet` + `--json` for scripting
- Set `--timeout` to prevent hanging
- Use `--notify` for long-running tasks

---

## Troubleshooting

### "No API key found"
```bash
# Set environment variable
export OPENAI_API_KEY="sk-..."

# Or use flag
codex --api-key "sk-..." "query"

# Or set in config
codex config set api_key "sk-..."
```

### "Context too large"
```bash
# Limit files
codex --files "src/**/*.ts" "query"

# Skip docs
codex --no-project-doc "query"

# Use smaller model
codex --model gpt-3.5-turbo "query"
```

### Sandbox Blocking Network
```bash
# Disable sandbox (be careful!)
codex --no-sandbox "fetch data from API"

# Or switch to suggest/auto-edit mode (not sandboxed)
codex --approval-mode auto-edit "fetch data"
```

### Changes Not Applying
- Check file permissions
- Ensure files are tracked by git
- Try `--verbose` to see what's happening
- Review diff output before approving

---

## Resources

- **Official Docs:** https://codex-cli.dev/docs
- **GitHub:** https://github.com/codex-cli/codex
- **Examples:** https://codex-cli.dev/examples
- **Discord:** https://discord.gg/codex-cli
