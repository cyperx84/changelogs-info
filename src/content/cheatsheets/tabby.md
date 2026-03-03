---
tool: tabby
title: Tabby Cheat Sheet
lastUpdated: 2026-03-04
---

# Tabby Cheat Sheet

Self-hosted AI coding assistant. Open-source alternative to GitHub Copilot with local model support.

---

## Installation

```bash
# Docker (recommended)
docker run -it --gpus all -p 8080:8080 \
  -v $HOME/.tabby:/data \
  tabbyml/tabby serve --model StarCoder-1B --device cuda

# Homebrew (CPU)
brew install tabbyml/tabby/tabby

# From binary
curl -LSs https://github.com/TabbyML/tabby/releases/latest/download/tabby_$(uname -s) -o tabby
chmod +x tabby
```

---

## Server Commands

```bash
tabby serve                             # Start server (default model)
tabby serve --model StarCoder-1B       # Specific model
tabby serve --device cuda              # GPU acceleration
tabby serve --device metal             # Apple Silicon
tabby serve --port 8080                # Custom port
tabby download --model StarCoder-1B    # Pre-download model
```

---

## IDE Extensions

| IDE | Extension |
|-----|-----------|
| VS Code | Tabby extension |
| JetBrains | Tabby plugin |
| Vim/Neovim | `TabbyML/vim-tabby` |
| Emacs | `tabby-mode` |

---

## Configuration

```toml
# ~/.tabby/config.toml

[server]
endpoint = "http://localhost:8080"

[model.completion]
kind = "llama.cpp/starcoderbase-1b"

[model.chat]
kind = "llama.cpp/codellama-7b-instruct"

# Repository indexing for context
[[repositories]]
name = "my-project"
git_url = "file:///path/to/repo"
```

---

## API Endpoints

```bash
# Code completion
curl -X POST http://localhost:8080/v1/completions \
  -H "Content-Type: application/json" \
  -d '{"language":"python","segments":{"prefix":"def hello(","suffix":")"}}'

# Health check
curl http://localhost:8080/v1/health

# Chat (if chat model configured)
curl -X POST http://localhost:8080/v1beta/chat/completions \
  -d '{"messages":[{"role":"user","content":"explain this code"}]}'
```

---

## Supported Models

| Model | Size | Best For |
|-------|------|----------|
| StarCoder-1B | 1B | Fast completions, low VRAM |
| StarCoder-3B | 3B | Better quality |
| StarCoder-7B | 7B | Best quality |
| CodeLlama-7B | 7B | Chat + completion |
| DeepSeek-Coder | 1-33B | Various sizes |

---

## Admin UI

Access `http://localhost:8080` for:
- Connection status
- Model configuration
- Repository indexing
- Usage analytics
- User management

---

## Tips

- Index your repos for project-aware completions
- Use Metal backend on Apple Silicon for GPU acceleration
- Supports team deployment with authentication
- RAG over codebase for context-aware suggestions
- Runs fully offline — no data leaves your machine
