---
tool: copilot-cli
title: GitHub Copilot CLI Cheat Sheet
lastUpdated: 2026-03-02
---

# GitHub Copilot CLI Cheat Sheet

GitHub Copilot for the command line. AI-powered shell assistance and command suggestions.

---

## Installation

```bash
# Install via npm
npm install -g @githubnext/github-copilot-cli

# Or via GitHub CLI
gh extension install github/gh-copilot

# Authenticate
gh auth login
```

---

## Core Commands

| Command | Description |
|---------|-------------|
| `gh copilot suggest` | Get command suggestion |
| `gh copilot explain` | Explain a command |
| `??` | Quick suggest (alias) |
| `git?` | Git-specific suggestions |
| `gh?` | GitHub CLI suggestions |

---

## gh copilot suggest

Get command suggestions from natural language.

```bash
# Basic usage
gh copilot suggest "find all js files modified today"

# Interactive mode
gh copilot suggest
> find all js files modified today
```

**Output:**
```bash
find . -name "*.js" -type f -mtime -1
```

Press `Enter` to run, `Ctrl+C` to cancel.

---

## gh copilot explain

Explain what a command does.

```bash
# Explain command
gh copilot explain "tar -xzf archive.tar.gz"

# Interactive mode
gh copilot explain
> tar -xzf archive.tar.gz
```

**Output:**
```
This command extracts a tar archive:
- tar: tape archive utility
- -x: extract files
- -z: decompress using gzip
- -f: specify filename
- archive.tar.gz: the file to extract
```

---

## Shell Aliases (Optional)

Add to `.bashrc` or `.zshrc` for quick access:

```bash
# Suggest
alias '??'='gh copilot suggest -t shell'

# Git suggestions
alias 'git?'='gh copilot suggest -t git'

# GitHub CLI suggestions
alias 'gh?'='gh copilot suggest -t gh'

# Explain
alias 'explain'='gh copilot explain'
```

**Usage:**
```bash
?? "kill process on port 3000"
git? "undo last commit but keep changes"
gh? "list my open PRs"
explain "ps aux | grep node"
```

---

## Target Types (-t flag)

Specialize suggestions for specific tools:

| Target | Description |
|--------|-------------|
| `shell` | General shell commands (default) |
| `git` | Git commands |
| `gh` | GitHub CLI commands |

### Examples
```bash
# Shell (default)
gh copilot suggest "compress folder"

# Git-specific
gh copilot suggest -t git "undo last commit"

# GitHub CLI-specific
gh copilot suggest -t gh "create PR"
```

---

## Interactive Mode

Run without arguments for interactive prompts:

```bash
gh copilot suggest
```

You'll be prompted to:
1. Enter what you want to do
2. Review suggested command
3. Accept (Enter), Revise, Explain, or Cancel

---

## Examples

### File Operations
```bash
?? "find all files larger than 100MB"
# Output: find . -type f -size +100M

?? "delete all node_modules folders"
# Output: find . -name "node_modules" -type d -exec rm -rf {} +

?? "count lines in all ts files"
# Output: find . -name "*.ts" | xargs wc -l
```

### Process Management
```bash
?? "kill process on port 8080"
# Output: lsof -ti:8080 | xargs kill -9

?? "show top 10 memory-consuming processes"
# Output: ps aux --sort=-%mem | head -11

?? "restart nginx"
# Output: sudo systemctl restart nginx
```

### Git Operations
```bash
git? "undo last commit but keep changes"
# Output: git reset --soft HEAD~1

git? "show files changed in last commit"
# Output: git diff --name-only HEAD~1 HEAD

git? "create branch and switch to it"
# Output: git checkout -b new-branch-name
```

### GitHub CLI
```bash
gh? "list my open PRs"
# Output: gh pr list --author @me --state open

gh? "create PR with title and body"
# Output: gh pr create --title "Title" --body "Description"

gh? "view CI status"
# Output: gh run list --limit 5
```

### System Operations
```bash
?? "check disk usage"
# Output: df -h

?? "show listening ports"
# Output: netstat -tuln

?? "compress folder to tar.gz"
# Output: tar -czf folder.tar.gz folder/
```

---

## Flags

| Flag | Description |
|------|-------------|
| `-t <target>` | Target type (shell, git, gh) |
| `--explain` | Explain the suggested command |
| `--non-interactive` | Non-interactive mode (print only) |

### Examples
```bash
# Non-interactive (print suggestion only)
gh copilot suggest --non-interactive "find js files"

# Auto-explain
gh copilot suggest --explain "tar -xzf file.tar.gz"
```

---

## Tips & Best Practices

### Clear Descriptions
- ✅ "find all TypeScript files modified in the last 7 days"
- ❌ "find files"

### Use Target Types
- Use `-t git` for Git commands
- Use `-t gh` for GitHub CLI commands
- Use `-t shell` (or omit) for general shell

### Review Before Running
- Always review suggested commands
- Use `explain` if unsure what a command does
- Press `Ctrl+C` to cancel

### Combine with Pipes
```bash
?? "show disk usage sorted by size" | head -10
```

---

## Common Use Cases

### Development
```bash
?? "install node dependencies and run dev server"
git? "stash changes and switch to main branch"
gh? "check CI status for current branch"
```

### DevOps
```bash
?? "docker remove all stopped containers"
?? "kubectl get pods in namespace default"
?? "show last 50 lines of nginx logs"
```

### Data Processing
```bash
?? "convert json to csv"
?? "count unique IPs in access.log"
?? "replace all tabs with spaces in ts files"
```

### System Admin
```bash
?? "check CPU usage per process"
?? "show open network connections"
?? "add user to sudo group"
```

---

## Explain Command Examples

### Complex Commands
```bash
explain "awk '{sum+=$1} END {print sum}' file.txt"
explain "sed -i 's/foo/bar/g' *.txt"
explain "find . -name '*.log' -mtime +30 -delete"
```

### Docker
```bash
explain "docker run -d -p 80:80 nginx"
explain "docker-compose up --build"
```

### Git
```bash
explain "git rebase -i HEAD~3"
explain "git cherry-pick abc123"
```

---

## Pricing

**Included with GitHub Copilot subscription:**
- **Individual:** $10/month or $100/year
- **Business:** $19/user/month
- **Free for students, teachers, open-source maintainers**

No additional cost for CLI usage if you have Copilot.

---

## Troubleshooting

### "Not authenticated"
```bash
# Re-authenticate
gh auth login

# Check status
gh auth status
```

### "Command not found: gh"
```bash
# Install GitHub CLI first
brew install gh  # macOS
# or download from https://cli.github.com
```

### Slow Responses
- Check internet connection
- Try again (GitHub API may be slow)
- Use `--non-interactive` for faster output

### Wrong Suggestions
- Be more specific in description
- Use target types (`-t git`, `-t gh`)
- Try rephrasing the request

---

## Resources

- **GitHub CLI:** https://cli.github.com
- **Copilot CLI Docs:** https://github.com/github/gh-copilot
- **GitHub Copilot:** https://github.com/features/copilot
- **Support:** https://support.github.com
