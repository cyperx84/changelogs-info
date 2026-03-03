---
tool: roo-code
title: Roo Code Cheat Sheet
---

# Roo Code Cheat Sheet

## Installation

| Method | Command |
|--------|---------|
| VS Code Marketplace | Search "Roo Code" in Extensions |
| CLI install | code --install-extension RooVetGit.roo-cline |
| VSIX | Download from GitHub releases |

## Core Concepts

### Modes
| Mode | Purpose |
|------|---------|
| **Code** | Write and edit code with full file access |
| **Architect** | Plan features and design systems |
| **Ask** | Answer questions about your codebase |
| **Debug** | Find and fix bugs with diagnostic context |
| **Orchestrator** | Coordinate multi-step complex tasks |

### Key Features
- **Auto-approve**: Configure which actions need manual approval
- **Context mentions**: Use @file, @folder, @url to add context
- **Checkpoints**: Auto-saves state, rollback anytime
- **Custom modes**: Create your own modes with .roomodes file
- **MCP support**: Extend with Model Context Protocol servers

## Configuration

### .roomodes (Custom Modes)

Custom modes let you create specialized agents for your workflow.
Define role, permissions, and source per mode.

### Settings
| Setting | Description |
|---------|-------------|
| roo-cline.apiProvider | Model provider (anthropic, openai, etc.) |
| roo-cline.customInstructions | Global instructions for all modes |
| roo-cline.autoApproveReadOnly | Auto-approve read-only operations |
| roo-cline.alwaysAllowBrowser | Skip approval for browser actions |

## Commands

| Command | Description |
|---------|-------------|
| Roo Code: Open | Open Roo Code panel |
| Roo Code: New Task | Start a new conversation |
| Roo Code: Open History | View conversation history |
| Roo Code: Settings | Open settings |

## Context Mentions

| Syntax | What it does |
|--------|-------------|
| @file.ts | Add a specific file |
| @folder/ | Add folder contents |
| @url https://... | Fetch and add URL content |
| @problems | Add VS Code diagnostics |
| @terminal | Add recent terminal output |
| @git | Add git diff/status |

## Tips

- Use Orchestrator mode for complex multi-file tasks
- Set up .rooignore to keep sensitive files out of context
- Use checkpoints to experiment safely and rollback if it breaks
- Configure auto-approve for trusted operations to speed up workflow
- Custom modes let you create specialized agents for your team
