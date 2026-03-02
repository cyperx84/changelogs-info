---
tool: gemini-cli
title: Gemini CLI Cheat Sheet
---

# Gemini CLI Cheat Sheet

## Installation

```bash
npm install -g @google/gemini-cli
# or
brew install gemini-cli
```

## Authentication

```bash
gemini auth login              # Login to Google Cloud
gemini auth status             # Check auth status
gemini config set api-key KEY  # Set API key directly
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `gemini chat` | Start interactive chat session |
| `gemini "query"` | One-shot query |
| `gemini -f file.txt` | Process file content |
| `gemini --code` | Code generation mode |
| `gemini --stream` | Stream responses |
| `gemini history` | Show conversation history |
| `gemini clear` | Clear history |

## Models

| Model | Description |
|-------|-------------|
| `gemini-1.5-pro` | Most capable, large context |
| `gemini-1.5-flash` | Fast, efficient |
| `gemini-2.0-flash-exp` | Experimental, latest features |

```bash
gemini --model gemini-1.5-pro "query"
gemini config set model gemini-1.5-flash
```

## Code Mode

```bash
# Generate code
gemini --code "create a REST API in Python"

# Explain code
gemini --code --explain < script.py

# Review code
gemini --code --review < main.ts

# Fix bugs
gemini --code --fix "error message" < buggy.js
```

## File Operations

```bash
# Process single file
gemini -f input.txt "summarize this"

# Process multiple files
gemini -f *.md "analyze these docs"

# Output to file
gemini "generate config" > config.yaml

# Pipe input
cat data.json | gemini "parse and explain"
```

## Flags

| Flag | Description |
|------|-------------|
| `--model <name>` | Select model |
| `--stream` | Stream response tokens |
| `--json` | JSON output format |
| `--temperature <0-2>` | Control randomness (default: 1.0) |
| `--max-tokens <n>` | Limit response length |
| `--system <text>` | Set system instructions |
| `--file / -f` | Input file(s) |
| `--verbose` | Show debug info |

## Interactive Mode

```bash
gemini chat
```

**Commands in chat:**

| Command | Description |
|---------|-------------|
| `/help` | Show help |
| `/clear` | Clear context |
| `/history` | Show history |
| `/model <name>` | Switch model |
| `/system <text>` | Update system prompt |
| `/save <file>` | Save conversation |
| `/load <file>` | Load conversation |
| `/exit` | Exit chat |

## Configuration

Config file: `~/.gemini/config.json`

```json
{
  "model": "gemini-1.5-pro",
  "temperature": 0.7,
  "maxTokens": 8192,
  "apiKey": "...",
  "systemPrompt": "You are a helpful coding assistant"
}
```

## Environment Variables

```bash
GEMINI_API_KEY=...           # API key
GEMINI_MODEL=gemini-1.5-pro  # Default model
GEMINI_CONFIG_PATH=...       # Custom config location
```

## Advanced Usage

### Multi-turn Conversations

```bash
# Maintain context across commands
gemini chat --session my-project
gemini --session my-project "follow-up question"
```

### Code Execution

```bash
# Generate and execute
gemini --code --execute "python script to analyze CSV"
```

### Multimodal Input

```bash
# Image analysis
gemini -f image.png "what's in this image?"

# Mixed content
gemini -f code.py -f diagram.png "explain how this works"
```

## Tips

- Use `--stream` for faster perceived response time
- Set `temperature: 0` for deterministic code generation
- Use `--system` to customize behavior per task
- Save frequently used prompts in shell aliases
- Use JSON mode for parsing structured output
