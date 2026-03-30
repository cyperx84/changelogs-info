export interface Section {
  id: string;
  name: string;
  route: string;
  toolId: string; // maps to tool in tools.json
  color: string;
  accent: string;
  colorRgb: string; // for rgba() usage
  subNav: { label: string; href: string }[];
}

export const SECTIONS: Section[] = [
  {
    id: "openclaw",
    name: "OpenClaw",
    route: "/openclaw/",
    toolId: "openclaw",
    color: "#ff3333",
    accent: "#ff6b6b",
    colorRgb: "255, 51, 51",
    subNav: [
      { label: "Changelog", href: "/openclaw/changelog/" },
      { label: "Cheatsheet", href: "/openclaw/cheatsheet/" },
      { label: "Configs", href: "/openclaw/configs/" },
      { label: "Releases", href: "/openclaw/releases/" },
    ],
  },
  {
    id: "claude-code",
    name: "Claude Code",
    route: "/claude-code/",
    toolId: "claude-code",
    color: "#ffb800",
    accent: "#ffd93d",
    colorRgb: "255, 184, 0",
    subNav: [
      { label: "Changelog", href: "/claude-code/changelog/" },
      { label: "Cheatsheet", href: "/claude-code/cheatsheet/" },
      { label: "Configs", href: "/claude-code/configs/" },
      { label: "Releases", href: "/claude-code/releases/" },
    ],
  },
  {
    id: "codex-cli",
    name: "Codex CLI",
    route: "/codex-cli/",
    toolId: "codex-cli",
    color: "#33ff33",
    accent: "#00ff41",
    colorRgb: "51, 255, 51",
    subNav: [
      { label: "Changelog", href: "/codex-cli/changelog/" },
      { label: "Cheatsheet", href: "/codex-cli/cheatsheet/" },
      { label: "Configs", href: "/codex-cli/configs/" },
      { label: "Releases", href: "/codex-cli/releases/" },
    ],
  },
  {
    id: "models",
    name: "Models",
    route: "/models/",
    toolId: "models",
    color: "#a855f7",
    accent: "#c084fc",
    colorRgb: "168, 85, 247",
    subNav: [],
  },
];

export const MODELS_SECTION = {
  id: "models",
  name: "Models",
  route: "/models/",
  toolId: "models",
  color: "#a855f7",
  accent: "#c084fc",
  colorRgb: "168, 85, 247",
  subNav: [],
};

export const TOOLS_SECTION = {
  id: "tools",
  name: "Tools",
  route: "/tools/",
  color: "#8b949e",
  accent: "#c9d1d9",
  colorRgb: "139, 148, 158",
};

export function getSectionByToolId(toolId: string): Section | undefined {
  return SECTIONS.find((s) => s.toolId === toolId);
}

export function getSectionById(sectionId: string): Section | undefined {
  return SECTIONS.find((s) => s.id === sectionId);
}
