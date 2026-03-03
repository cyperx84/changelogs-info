---
tool: khoj
title: Khoj Cheat Sheet
lastUpdated: 2026-03-04
---

# Khoj Cheat Sheet

Self-hosted AI assistant with web search, personal knowledge base, and agent capabilities.

---

## Installation

```bash
# Docker (recommended)
docker run -d -p 42110:42110 \
  --name khoj ghcr.io/khoj-ai/khoj:latest

# pip
pip install khoj

# From source
git clone https://github.com/khoj-ai/khoj
cd khoj && pip install -e '.[dev]'
```

---

## Access

| Interface | URL |
|-----------|-----|
| Web UI | `http://localhost:42110` |
| API | `http://localhost:42110/api` |
| Obsidian plugin | Install from community plugins |
| Emacs package | `khoj.el` |

---

## CLI Usage

```bash
khoj                                  # Start server
khoj --host 0.0.0.0 --port 42110    # Custom bind
khoj --anonymous-mode                 # No auth required
khoj --config /path/to/config.yml    # Custom config
```

---

## Chat Commands

| Command | Description |
|---------|-------------|
| `/online` | Search web for current info |
| `/image` | Generate images |
| `/help` | Show commands |
| `/general` | General knowledge mode |
| `/notes` | Search your notes only |
| `/default` | Default hybrid mode |
| `/automated` | Run as background agent |

---

## Data Sources

```yaml
# Configure in web UI or config.yml
content-type:
  org:
    input-files: ["~/notes/**/*.org"]
  markdown:
    input-files: ["~/notes/**/*.md"]
  pdf:
    input-files: ["~/docs/**/*.pdf"]
  github:
    repos: ["user/repo"]
  notion:
    token: "secret_..."
```

---

## API Endpoints

```bash
# Chat
curl -X POST http://localhost:42110/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"q": "your question"}'

# Search notes
curl "http://localhost:42110/api/search?q=query&t=markdown"

# Index update
curl -X POST http://localhost:42110/api/update

# Health
curl http://localhost:42110/api/health
```

---

## Agents

```yaml
# Create custom agents in web UI
name: "Research Assistant"
personality: "Thorough researcher"
tools:
  - online      # web search
  - notes       # personal knowledge
  - general     # LLM knowledge
chat_model: "gpt-4"
```

---

## Tips

- Supports Obsidian, Emacs, and web interfaces
- Indexes your notes for semantic search
- Agents can run scheduled/automated tasks
- Self-hosted = your data stays local
- Supports multiple LLM backends (OpenAI, Claude, local)
