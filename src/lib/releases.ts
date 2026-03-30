import toolsData from "../../scrapers/tools.json";

export interface Tool {
  id: string;
  name: string;
  repo: string;
  description: string;
  category: string;
  website: string;
  color?: string;
  tags: string[];
}

export interface Release {
  version: string;
  name: string;
  body: string;
  date: string;
  url: string;
  prerelease: boolean;
}

export interface ToolReleases {
  tool: Tool;
  releases: Release[];
  lastUpdated: string;
}

export const FEATURED_TOOLS: string[] = [];

export const CLWATCH_TOOLS = ['claude-code', 'codex-cli', 'gemini-cli', 'opencode', 'openclaw', 'kilocode'];

export function isFeatured(_toolId: string): boolean {
  return false;
}

export function getTools(): Tool[] {
  const tools = toolsData as Tool[];
  const priority: Record<string, number> = { 'openclaw': 0, 'claude-code': 1, 'codex-cli': 2, 'gemini-cli': 3, 'opencode': 4, 'kilocode': 5 };
  return tools.sort((a, b) => {
    const pa = priority[a.id] ?? 3;
    const pb = priority[b.id] ?? 3;
    return pa !== pb ? pa - pb : a.name.localeCompare(b.name);
  });
}

/** Returns only the tools tracked by clwatch (the 5 core tools). */
export function getClwatchTools(): Tool[] {
  const tools = toolsData as Tool[];
  return tools
    .filter((t) => CLWATCH_TOOLS.includes(t.id))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getToolById(id: string): Tool | undefined {
  return getTools().find((t) => t.id === id);
}

export async function getToolReleases(toolId: string): Promise<ToolReleases | null> {
  try {
    const modules = import.meta.glob<ToolReleases>("../content/releases/*.json", {
      eager: true,
      import: "default",
    });
    const key = `../content/releases/${toolId}.json`;
    return modules[key] ?? null;
  } catch {
    return null;
  }
}

export async function getAllToolReleases(): Promise<ToolReleases[]> {
  const modules = import.meta.glob<ToolReleases>("../content/releases/*.json", {
    eager: true,
    import: "default",
  });

  return Object.values(modules);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    cli: "CLI Harness",
    ide: "IDE Harness",
    "ide-extension": "IDE Extension",
    library: "Library",
    harness: "Agent Platform",
  };
  return labels[category] || category;
}
