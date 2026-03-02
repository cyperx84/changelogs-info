---
tool: codex-cli
title: Codex CLI Cheat Sheet
---

# Codex CLI Cheat Sheet

## Basic Usage

| Command | Description |
|---------|-------------|
| `codex` | Start interactive session |
| `codex "query"` | One-shot prompt |
| `codex --model <model>` | Specify model to use |
| `codex --provider <name>` | Choose AI provider |

## Approval Modes

| Mode | Description |
|------|-------------|
| `suggest` | Default — suggests changes, you approve |
| `auto-edit` | Auto-applies file edits, asks for commands |
| `full-auto` | Runs everything automatically |

```bash
codex --approval-mode full-auto "fix all lint errors"
codex --approval-mode auto-edit "add tests"
```

## Flags

| Flag | Description |
|------|-------------|
| `--model` / `-m` | Model to use (e.g. `o4-mini`) |
| `--provider` / `-p` | AI provider |
| `--approval-mode` / `-a` | Set approval mode |
| `--quiet` / `-q` | Non-interactive, print final output |
| `--json` | Output JSON (for piping) |
| `--full-context` | Disable context condensing |
| `--no-project-doc` | Skip reading project docs |
| `--notify` | Desktop notification on finish |

## Configuration

Config file: `~/.codex/config.yaml`

```yaml
model: o4-mini
provider: openai
approval_mode: suggest
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `CODEX_HOME` | Config directory override |

## Full-Auto Mode

Runs with no human approval. Sandboxed by default.

```bash
codex --full-auto "migrate the database schema"
```

Network disabled in sandbox. Only the working directory is writable.

## Multimodal

Supports passing images and screenshots:

```bash
codex "describe this screenshot" < screenshot.png
```
