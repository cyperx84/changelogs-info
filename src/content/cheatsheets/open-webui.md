---
tool: open-webui
title: Open WebUI Cheat Sheet
---

# Open WebUI Cheat Sheet

## Installation

| Method | Command |
|--------|---------|
| Docker (recommended) | docker run -d -p 3000:8080 --name open-webui ghcr.io/open-webui/open-webui:main |
| pip | pip install open-webui and then open-webui serve |

## Environment Variables
| Variable | Default | Purpose |
|----------|---------|---------|
| OPENAI_API_BASE_URL | - | OpenAI-compatible API URL |
| OPENAI_API_KEY | - | API key for OpenAI provider |
| OLLAMA_BASE_URL | http://localhost:11434 | Ollama server URL |
| WEBUI_AUTH | True | Enable authentication |
| WEBUI_NAME | Open WebUI | Instance name |
| ENABLE_RAG_WEB_SEARCH | False | Enable web search in RAG |
| DEFAULT_MODELS | - | Comma-separated default model list |

## Key Features
- **Multi-model**: Connect to Ollama, OpenAI, Anthropic, and any OpenAI-compatible API
- **RAG**: Upload documents, web search integration
- **Tools/Functions**: Custom Python tools and pipelines
- **Modelfiles**: Create custom model profiles
- **User management**: Multi-user with roles (admin/user)
- **Chat sharing**: Share conversations with links

## Admin Settings
| Section | Key Options |
|---------|------------|
| Connections | Add/configure model providers |
| Models | Set default, create modelfiles |
| Documents | RAG settings, chunk size, embedding model |
| Web Search | Brave/Google/SearXNG integration |
| Interface | Theme, default prompt, title generation |

## Tips

- Mount a Docker volume for persistent data across updates
- Use pipelines for custom preprocessing/postprocessing
- Modelfiles let you create specialized chat profiles
- RAG works best with smaller, focused documents
- API is OpenAI-compatible so use as a proxy for other tools
