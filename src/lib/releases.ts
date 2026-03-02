import toolsData from "../../scrapers/tools.json";

export interface Tool {
  id: string;
  name: string;
  repo: string;
  description: string;
  category: string;
  website: string;
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

export function getTools(): Tool[] {
  return toolsData as Tool[];
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
    cli: "CLI Tool",
    "ide-extension": "IDE Extension",
    ide: "IDE",
    "web-platform": "Web Platform",
    "autonomous-agent": "Autonomous Agent",
    library: "Library",
    harness: "Agent Harness",
  };
  return labels[category] || category;
}
