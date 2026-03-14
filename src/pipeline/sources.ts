export interface Source {
  toolSlug: string;
  role: "release_notes" | "changelog" | "docs" | "github_releases" | "package_registry";
  url: string;
  official: boolean;
  priority: number;
  format: "html" | "json" | "markdown" | "github_atom";
  pollIntervalMinutes: number;
  noisePatterns?: string[];
}

export const sources: Source[] = [
  // claude-code
  {
    toolSlug: "claude-code",
    role: "github_releases",
    url: "https://api.github.com/repos/anthropics/claude-code/releases",
    official: true,
    priority: 90,
    format: "json",
    pollIntervalMinutes: 30,
  },
  {
    toolSlug: "claude-code",
    role: "changelog",
    url: "https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md",
    official: true,
    priority: 70,
    format: "markdown",
    pollIntervalMinutes: 60,
    noisePatterns: ["<!--[\\s\\S]*?-->"],
  },

  // codex-cli
  {
    toolSlug: "codex-cli",
    role: "github_releases",
    url: "https://api.github.com/repos/openai/codex/releases",
    official: true,
    priority: 90,
    format: "json",
    pollIntervalMinutes: 30,
  },

  // gemini-cli
  {
    toolSlug: "gemini-cli",
    role: "github_releases",
    url: "https://api.github.com/repos/google-gemini/gemini-cli/releases",
    official: true,
    priority: 90,
    format: "json",
    pollIntervalMinutes: 30,
  },

  // opencode
  {
    toolSlug: "opencode",
    role: "github_releases",
    url: "https://api.github.com/repos/anomalyco/opencode/releases",
    official: true,
    priority: 90,
    format: "json",
    pollIntervalMinutes: 30,
  },

  // openclaw
  {
    toolSlug: "openclaw",
    role: "github_releases",
    url: "https://api.github.com/repos/openclaw/openclaw/releases",
    official: true,
    priority: 90,
    format: "json",
    pollIntervalMinutes: 30,
  },

  // cline
  {
    toolSlug: "cline",
    role: "github_releases",
    url: "https://api.github.com/repos/cline/cline/releases",
    official: true,
    priority: 90,
    format: "json",
    pollIntervalMinutes: 30,
  },
  {
    toolSlug: "cline",
    role: "changelog",
    url: "https://raw.githubusercontent.com/cline/cline/main/CHANGELOG.md",
    official: true,
    priority: 70,
    format: "markdown",
    pollIntervalMinutes: 60,
  },

  // aider
  {
    toolSlug: "aider",
    role: "github_releases",
    url: "https://api.github.com/repos/Aider-AI/aider/releases",
    official: true,
    priority: 90,
    format: "json",
    pollIntervalMinutes: 30,
  },
  {
    toolSlug: "aider",
    role: "package_registry",
    url: "https://pypi.org/pypi/aider-chat/json",
    official: true,
    priority: 85,
    format: "json",
    pollIntervalMinutes: 30,
  },

  // continue
  {
    toolSlug: "continue",
    role: "github_releases",
    url: "https://api.github.com/repos/continuedev/continue/releases",
    official: true,
    priority: 90,
    format: "json",
    pollIntervalMinutes: 30,
  },

  // roo-code
  {
    toolSlug: "roo-code",
    role: "github_releases",
    url: "https://api.github.com/repos/RooCodeInc/Roo-Code/releases",
    official: true,
    priority: 90,
    format: "json",
    pollIntervalMinutes: 30,
  },
];

export function getSourcesForTool(toolSlug: string): Source[] {
  return sources.filter((s) => s.toolSlug === toolSlug).sort((a, b) => b.priority - a.priority);
}

export function getAllToolSlugs(): string[] {
  return [...new Set(sources.map((s) => s.toolSlug))];
}
