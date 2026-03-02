---
tool: openclaw
title: OpenClaw Cheat Sheet
---

# OpenClaw Cheat Sheet

## Installation

```bash
# Install via npm
npm install -g openclaw

# Or clone and build
git clone https://github.com/openclaw/openclaw
cd openclaw
npm install
npm run build
```

## Starting OpenClaw

```bash
openclaw                       # Start with default config
openclaw --config my-config.yml # Use custom config
openclaw --dev                 # Development mode with hot reload
openclaw serve                 # Start web UI
```

## Core Commands

| Command | Description |
|---------|-------------|
| `openclaw init` | Initialize new OpenClaw project |
| `openclaw serve` | Start web interface |
| `openclaw chat` | Start CLI chat interface |
| `openclaw run <agent>` | Run specific agent |
| `openclaw plugins` | List available plugins |
| `openclaw config` | Show current configuration |
| `openclaw --help` | Show all commands |

## Configuration

Config file: `openclaw.config.yml`

```yaml
# Model Configuration
models:
  default: gpt-4-turbo
  providers:
    openai:
      apiKey: ${OPENAI_API_KEY}
    anthropic:
      apiKey: ${ANTHROPIC_API_KEY}

# Agent Configuration
agents:
  - name: coder
    model: gpt-4-turbo
    systemPrompt: "You are an expert programmer"
    tools: [file, shell, browser]

  - name: researcher
    model: claude-opus
    systemPrompt: "You are a research assistant"
    tools: [browser, search]

# Plugin Configuration
plugins:
  - name: "@openclaw/git"
    enabled: true
  - name: "@openclaw/docker"
    enabled: false

# Server Configuration
server:
  port: 3000
  host: localhost
  cors: true
```

## Agent System

### Creating Agents

```yaml
# agents/my-agent.yml
name: my-agent
description: Custom agent for specific tasks
model: gpt-4-turbo
systemPrompt: |
  You are a specialized agent for...

tools:
  - file-read
  - file-write
  - shell-exec
  - web-search

temperature: 0.7
maxTokens: 4000
```

### Running Agents

```bash
# Run single agent
openclaw run coder "implement user auth"

# Run agent with specific file context
openclaw run coder --files src/*.ts "refactor to use classes"

# Interactive mode
openclaw chat --agent researcher
```

## Tools & Plugins

### Built-in Tools

| Tool | Description |
|------|-------------|
| `file` | Read/write files |
| `shell` | Execute shell commands |
| `browser` | Web browsing and scraping |
| `search` | Web search integration |
| `git` | Git operations |
| `code-exec` | Execute code in sandbox |

### Installing Plugins

```bash
# Install from npm
openclaw plugin add @openclaw/plugin-name

# Install from local path
openclaw plugin add ./my-plugin

# List installed plugins
openclaw plugins list

# Remove plugin
openclaw plugin remove @openclaw/plugin-name
```

### Creating Custom Tools

```typescript
// tools/custom-tool.ts
import { Tool } from '@openclaw/core';

export class MyCustomTool extends Tool {
  name = 'my-tool';
  description = 'Does something useful';

  async execute(params: any) {
    // Tool logic here
    return { result: '...' };
  }
}
```

## Web UI

Access at `http://localhost:3000` after running `openclaw serve`

**Features:**

- Chat interface with multiple agents
- File browser and editor
- Real-time logs and debugging
- Agent configuration UI
- Plugin management
- Token usage monitoring

## CLI Chat Mode

```bash
openclaw chat --agent coder
```

**Chat Commands:**

| Command | Description |
|---------|-------------|
| `/agent <name>` | Switch agent |
| `/files <glob>` | Add files to context |
| `/clear` | Clear conversation |
| `/history` | Show conversation history |
| `/save <file>` | Save conversation |
| `/load <file>` | Load conversation |
| `/tools` | List available tools |
| `/config` | Show current config |
| `/exit` | Exit chat |

## Multi-Agent Workflows

```yaml
# workflows/full-stack.yml
name: full-stack-development
description: Coordinate frontend and backend agents

agents:
  - frontend:
      model: gpt-4-turbo
      tools: [file, browser]
      context: ["src/frontend/**"]

  - backend:
      model: claude-opus
      tools: [file, shell, docker]
      context: ["src/backend/**"]

  - tester:
      model: gpt-3.5-turbo
      tools: [shell, file-read]
      context: ["tests/**"]

workflow:
  - step: design
    agent: frontend
    prompt: "Design the UI components"

  - step: implement
    agents: [frontend, backend]
    prompt: "Implement the feature"
    parallel: true

  - step: test
    agent: tester
    prompt: "Write and run tests"
    dependsOn: [implement]
```

Run workflow:

```bash
openclaw workflow run full-stack.yml
```

## Environment Variables

```bash
OPENCLAW_CONFIG_PATH=...      # Custom config file path
OPENCLAW_PLUGINS_DIR=...      # Custom plugins directory
OPENCLAW_DATA_DIR=...         # Data storage directory
OPENAI_API_KEY=...            # OpenAI API key
ANTHROPIC_API_KEY=...         # Anthropic API key
OPENCLAW_LOG_LEVEL=...        # debug, info, warn, error
```

## Advanced Features

### Sandboxed Code Execution

```yaml
tools:
  - name: code-exec
    config:
      timeout: 30000
      memory: 512
      allowNetwork: false
      allowFileSystem: true
```

### Context Management

```bash
# Add specific files to context
openclaw chat --context src/main.ts,src/utils.ts

# Add entire directory
openclaw chat --context src/**

# Use .openclawignore to exclude files
echo "node_modules/" >> .openclawignore
```

### Custom System Prompts

```yaml
systemPrompts:
  coder: |
    You are an expert programmer.
    - Write clean, maintainable code
    - Follow best practices
    - Add comments for complex logic

  reviewer: |
    You are a code reviewer.
    - Focus on bugs and security issues
    - Suggest improvements
    - Be constructive
```

## Debugging

```bash
# Enable verbose logging
openclaw --log-level debug chat

# Save debug logs
openclaw --log-file debug.log chat

# Watch agent internals
openclaw chat --debug
```

## Tips

- Use workflows for complex multi-step tasks
- Create specialized agents for different roles
- Leverage plugins for extended functionality
- Use the web UI for visual debugging
- Configure tool permissions carefully
- Start with built-in agents, customize as needed
- Monitor token usage to control costs
- Use `.openclawignore` to exclude large files

## Security

```yaml
security:
  # Restrict tool access
  allowedTools: [file-read, browser]

  # Limit file system access
  allowedPaths:
    - ./src
    - ./docs

  # Require approval for commands
  approvalRequired:
    - shell-exec
    - file-write

  # Sandbox settings
  sandbox:
    enabled: true
    timeout: 30000
```

## Resources

- **GitHub**: https://github.com/openclaw/openclaw
- **Docs**: https://openclaw.dev/docs
- **Plugin Registry**: https://openclaw.dev/plugins
- **Discord**: https://discord.gg/openclaw
