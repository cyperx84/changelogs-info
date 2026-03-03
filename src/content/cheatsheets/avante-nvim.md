---
tool: avante-nvim
title: Avante.nvim Cheat Sheet
lastUpdated: 2026-03-04
---

# Avante.nvim Cheat Sheet

AI-powered code assistance inside Neovim, inspired by Cursor's UX.

---

## Installation

```lua
-- lazy.nvim
{
  "yetone/avante.nvim",
  event = "VeryLazy",
  build = "make",
  dependencies = {
    "nvim-treesitter/nvim-treesitter",
    "stevearc/dressing.nvim",
    "nvim-lua/plenary.nvim",
    "MunifTanjim/nui.nvim",
  },
  opts = {},
}
```

---

## Key Bindings

| Keybind | Description |
|---------|-------------|
| `<leader>aa` | Open Avante ask panel |
| `<leader>ae` | Edit selected code with AI |
| `<leader>ar` | Refresh AI response |
| `<leader>af` | Focus Avante window |
| `<leader>at` | Toggle Avante sidebar |
| `co` | Choose ours (conflict) |
| `ct` | Choose theirs (conflict) |
| `ca` | Choose all (conflict) |
| `c0` | Choose none (conflict) |
| `]x` | Next conflict |
| `[x` | Previous conflict |

---

## Configuration

```lua
require("avante").setup({
  provider = "claude",              -- claude | openai | azure | copilot | gemini
  auto_suggestions_provider = "copilot",
  claude = {
    endpoint = "https://api.anthropic.com",
    model = "claude-sonnet-4-20250514",
    temperature = 0,
    max_tokens = 4096,
  },
  behaviour = {
    auto_suggestions = false,
    auto_set_highlight_group = true,
    auto_set_keymaps = true,
    auto_apply_diff_after_generation = false,
    support_paste_from_clipboard = false,
  },
  windows = {
    position = "right",             -- right | left | top | bottom
    wrap = true,
    width = 30,                     -- percentage
    sidebar_header = { align = "center" },
  },
})
```

---

## Providers

| Provider | Env Variable |
|----------|-------------|
| Claude | `ANTHROPIC_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| Azure | `AZURE_OPENAI_API_KEY` |
| Copilot | GitHub Copilot auth |
| Gemini | `GEMINI_API_KEY` |

---

## Workflow

1. Select code or open file
2. `<leader>aa` to open ask panel
3. Type your prompt
4. Review AI suggestions in sidebar
5. Accept/reject diffs with conflict keybinds
6. `<leader>ae` for inline edits on selection

---

## Tips

- Works best with treesitter for context-aware code selection
- Use `provider = "copilot"` for free tier usage
- Supports multi-file context via `@file` mentions
- Combine with `avante-status` for token usage tracking
