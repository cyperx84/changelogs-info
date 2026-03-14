# clwatch Cheatsheet Command

Proposed CLI command for the `clwatch` tool to access and interact with cheatsheets.

## Overview

The cheatsheet command provides quick access to tool documentation directly from the terminal:

```bash
clwatch cheatsheet claude-code          # Print cheatsheet to stdout
clwatch cheatsheet claude-code --json   # JSON output
clwatch cheatsheet claude-code --filter flags  # Just flags
```

## Usage

### Basic Usage

```bash
# Print full cheatsheet to terminal
clwatch cheatsheet claude-code

# Print specific tool
clwatch cheatsheet cursor

# List available cheatsheets
clwatch cheatsheet --list
```

### Output Formats

```bash
# Human-readable markdown (default)
clwatch cheatsheet claude-code

# Structured JSON
clwatch cheatsheet claude-code --json

# Pretty-print JSON
clwatch cheatsheet claude-code --json --pretty

# Compact JSON (for piping)
clwatch cheatsheet claude-code --json --compact
```

### Filtering

```bash
# Show only CLI flags
clwatch cheatsheet claude-code --filter flags

# Show only slash commands
clwatch cheatsheet claude-code --filter commands

# Show only workflows
clwatch cheatsheet claude-code --filter workflows

# Show only configuration
clwatch cheatsheet claude-code --filter config

# Show only pro tips
clwatch cheatsheet claude-code --filter tips
```

### Search

```bash
# Search for a flag containing "model"
clwatch cheatsheet claude-code --search model

# Case-insensitive search
clwatch cheatsheet claude-code --search "max-turns"

# Search in all cheatsheets
clwatch cheatsheet --search "sandbox" --search-all
```

### Specific Sections

```bash
# Get "What's New" (items added in last 30 days)
clwatch cheatsheet claude-code --whatsnew

# Get all workflows
clwatch cheatsheet claude-code --workflows

# Get pro tips only
clwatch cheatsheet claude-code --tips

# Get resources/links
clwatch cheatsheet claude-code --resources
```

### Download

```bash
# Save as JSON file
clwatch cheatsheet claude-code --json --output claude-code.json

# Save as markdown
clwatch cheatsheet claude-code --output claude-code.md

# Save with timestamp
clwatch cheatsheet claude-code --output claude-code-$(date +%Y%m%d).json
```

### Integration with Other Tools

```bash
# Pipe to jq for JSON filtering
clwatch cheatsheet claude-code --json | jq '.cliFlags[]'

# Pipe to grep for searching
clwatch cheatsheet claude-code | grep "teleport"

# Pipe to less for paging
clwatch cheatsheet claude-code | less

# Extract just pro tips
clwatch cheatsheet claude-code --json | jq '.proTips'

# Count total flags
clwatch cheatsheet claude-code --json | jq '.cliFlags | length'
```

### Comparison

```bash
# Compare two tools
clwatch cheatsheet claude-code --json > cc.json
clwatch cheatsheet cursor --json > cursor.json
diff <(jq '.cliFlags' cc.json) <(jq '.cliFlags' cursor.json)

# Show differences in workflows
diff <(jq '.workflows' cc.json) <(jq '.workflows' cursor.json)
```

## Implementation Details

### Source Data

- Cheatsheets stored as JSON in `src/content/cheatsheets-json/`
- Each tool gets a `{tool-id}.json` file
- Schema defined in cheatsheet JSON format

### Available Tools

The following tools have cheatsheets available:

- `claude-code`
- `openclaw`
- `codex-cli`
- `cursor`
- `cline`
- `gemini-cli`
- `opencode`
- `roo-code`
- `continue`
- `windsurf`

### Examples

#### Example 1: Get all flags for a tool

```bash
$ clwatch cheatsheet claude-code --filter flags
Claude Code 2.1 Cheat Sheet - CLI Flags & Options

--print / -p
    Print mode — output and exit
    Example: claude -p "query"
    Added: 2.0.0

--continue / -c
    Continue last conversation
    Example: claude -c
    Added: 2.0.0

... (more flags)
```

#### Example 2: Extract commands in JSON

```bash
$ clwatch cheatsheet claude-code --filter commands --json | jq '.slashCommands[] | {name: .name, description: .description}'
{
  "name": "/help",
  "description": "Show all available commands"
}
{
  "name": "/clear",
  "description": "Clear conversation context"
}
... (more commands)
```

#### Example 3: Search for "model"

```bash
$ clwatch cheatsheet claude-code --search model
Found 5 matches:

CLI Flags:
  --model (sonnet/opus/haiku)
  --fallback-model

Slash Commands:
  /model

Config:
  model (default model setting)
```

#### Example 4: Get what's new

```bash
$ clwatch cheatsheet claude-code --whatsnew
What's New in Last 30 Days:

New Flags (3):
  --max-budget-usd (added 2.1.0)
  --remote (added 2.1.0)
  --teleport (added 2.1.0)

New Commands (2):
  /tasks (added 2.1.0)
  /thinking (added 2.1.0)
```

## Implementation Plan

1. **Core Command**: Implement `cheatsheet` subcommand in clwatch CLI
2. **Output Formatting**: Support markdown, JSON, and filtered views
3. **Search**: Add pattern matching across all sections
4. **Caching**: Cache cheatsheet JSON locally for offline access
5. **Updates**: Weekly sync with changelogs.info for latest cheatsheets
6. **Shell Completion**: Add bash/zsh completion for tool names and filters

## Benefits

- **Offline Access**: Don't need to visit website to look up flags
- **Scripting**: JSON output enables automation and tooling
- **Filtering**: Quick access to specific sections
- **Integration**: Pipes seamlessly with grep, jq, less, etc.
- **Searchable**: Find relevant flags/commands without browsing
- **Portable**: Single CLI command, no external dependencies

## Future Enhancements

- **Interactive Mode**: `clwatch cheatsheet --interactive` for exploring
- **Diff View**: Compare cheatsheets between versions
- **Contributions**: Allow users to suggest cheatsheet improvements
- **Marketplace**: Share custom cheatsheet filters/scripts
- **Watch Mode**: `clwatch cheatsheet --watch` to get alerts on changes
- **Locale Support**: Multi-language cheatsheets
