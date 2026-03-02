---
tool: gemini-cli
title: Gemini CLI Cheat Sheet
lastUpdated: 2026-03-02
---

# Gemini CLI Cheat Sheet

Google's official CLI for Gemini models. Fast, scriptable, and designed for terminal workflows.

---

## Installation

```bash
# npm
npm install -g @google/generative-ai-cli

# yarn
yarn global add @google/generative-ai-cli

# Set API key
export GEMINI_API_KEY="your-key-here"
```

---

## Core Commands

| Command | Description |
|---------|-------------|
| `gemini` | Start interactive chat session |
| `gemini "prompt"` | One-shot prompt (prints response and exits) |
| `gemini -f file.ts "explain this"` | Include file as context |
| `gemini -f *.ts "find bugs"` | Include multiple files with glob |
| `gemini chat` | Explicit interactive mode |
| `gemini models` | List available models |
| `gemini config` | Show current configuration |

---

## Flags

### Model Selection
| Flag | Description |
|------|-------------|
| `--model <name>` | Choose model (gemini-pro, gemini-pro-vision, gemini-ultra) |
| `--model-version <version>` | Specific version (e.g., gemini-1.5-pro) |

### Input/Output
| Flag | Description |
|------|-------------|
| `-f, --file <path>` | Include file(s) in context (supports globs) |
| `--json` | Output in JSON format |
| `--stream` | Stream response tokens (default) |
| `--no-stream` | Wait for complete response |
| `--output <file>` | Write response to file |

### Behavior
| Flag | Description |
|------|-------------|
| `--temperature <0-1>` | Creativity control (0=focused, 1=creative) |
| `--top-p <0-1>` | Nucleus sampling threshold |
| `--top-k <number>` | Top-k sampling limit |
| `--max-tokens <number>` | Maximum response length |
| `--system <message>` | System instruction/persona |

### Advanced
| Flag | Description |
|------|-------------|
| `--api-key <key>` | Override API key (instead of env var) |
| `--timeout <ms>` | Request timeout in milliseconds |
| `--verbose` | Show debug information |
| `--no-color` | Disable colored output |
| `--help` | Show help message |

---

## Slash Commands (Interactive Mode)

| Command | Description |
|---------|-------------|
| `/help` | Show available commands |
| `/clear` | Clear conversation history |
| `/history` | Show conversation history |
| `/save <file>` | Save conversation to file |
| `/load <file>` | Load conversation from file |
| `/model <name>` | Switch model mid-conversation |
| `/temp <0-1>` | Change temperature |
| `/system <message>` | Set system instruction |
| `/exit` | Exit interactive mode |

---

## Configuration

### Config File Location
- **Linux/macOS:** `~/.config/gemini-cli/config.json`
- **Windows:** `%APPDATA%/gemini-cli/config.json`

### Example config.json
```json
{
  "model": "gemini-1.5-pro",
  "temperature": 0.7,
  "maxTokens": 2048,
  "stream": true,
  "defaultSystemMessage": "You are a helpful coding assistant."
}
```

### Set Config Values
```bash
gemini config set model gemini-1.5-pro
gemini config set temperature 0.8
gemini config set maxTokens 4096
```

---

## Examples

### One-Shot Prompts
```bash
# Simple question
gemini "Explain async/await in JavaScript"

# Code generation
gemini "Write a Python function to merge two sorted arrays"

# With file context
gemini -f app.ts "Explain this code"
gemini -f src/**/*.ts "Find potential bugs"
```

### Interactive Sessions
```bash
# Start interactive mode
gemini

# Multi-turn conversation
> Write a REST API in Express
> Add authentication with JWT
> Add rate limiting
> /save api-conversation.json
```

### Scripting & Automation
```bash
# JSON output for parsing
gemini --json "List 5 Linux commands" | jq '.response'

# Generate code and save
gemini "Create a React component for a login form" --output Login.tsx

# Batch processing
for file in src/*.ts; do
  gemini -f "$file" "Add JSDoc comments" --output "$file.new"
done
```

---

## Extensions & Plugins

### Vision Support (gemini-pro-vision)
```bash
# Analyze image
gemini --model gemini-pro-vision -f screenshot.png "What's in this image?"

# Compare images
gemini --model gemini-pro-vision -f before.png -f after.png "What changed?"
```

### Function Calling
```json
// Define functions in config
{
  "functions": [
    {
      "name": "getCurrentWeather",
      "description": "Get current weather for a location",
      "parameters": {
        "type": "object",
        "properties": {
          "location": { "type": "string" }
        }
      }
    }
  ]
}
```

### Code Execution
```bash
# Enable code execution (experimental)
gemini --enable-code-execution "Calculate fibonacci(50)"
```

---

## Tips & Best Practices

### Performance
- Use `--no-stream` for scripting to get complete responses
- Set `--max-tokens` to limit costs
- Use `gemini-1.5-flash` for faster, cheaper responses

### Accuracy
- Lower temperature (0.2-0.4) for factual/code tasks
- Higher temperature (0.7-0.9) for creative writing
- Use `--system` to set persona/constraints

### File Context
- Gemini CLI supports glob patterns: `-f src/**/*.ts`
- Large files are automatically chunked
- Use `--json` output for parsing in scripts

### Cost Management
```bash
# Count tokens before sending
wc -w prompt.txt  # Rough estimate

# Use flash model for simple tasks
gemini --model gemini-1.5-flash "Quick question"
```

---

## Troubleshooting

### API Key Issues
```bash
# Verify key is set
echo $GEMINI_API_KEY

# Test with explicit key
gemini --api-key "your-key" "Test prompt"
```

### Rate Limiting
- Default: 60 requests/minute (gemini-pro)
- Use `--timeout` to handle retries
- Upgrade API tier for higher limits

### File Not Found
```bash
# Check file path
ls -la file.ts

# Use absolute paths if needed
gemini -f /absolute/path/to/file.ts "Explain"
```

---

## Resources

- **Official Docs:** https://ai.google.dev/docs
- **API Reference:** https://ai.google.dev/api
- **Pricing:** https://ai.google.dev/pricing
- **GitHub:** https://github.com/google/generative-ai-cli
