import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface Source {
  type: "github-readme" | "github-file";
  repo: string;
  path?: string;
}

interface CheatsheetSource {
  id: string;
  sources: Source[];
  skip?: boolean;
  reason?: string;
}

interface FetchedContent {
  source: Source;
  content: string;
  url: string;
}

interface CheatsheetUpdate {
  id: string;
  hasChanges: boolean;
  newSections: string[];
  updatedContent?: string;
}

const GITHUB_API = "https://api.github.com";
const DRY_RUN = process.argv.includes("--dry-run");

// Extract frontmatter from markdown
function extractFrontmatter(content: string): {
  frontmatter: string;
  body: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: "", body: content };
  }

  return {
    frontmatter: match[1],
    body: match[2],
  };
}

// GitHub API fetch with auth
async function fetchGitHub(url: string): Promise<string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "changelogs-info-cheatsheet-updater",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    if (res.status === 404) {
      console.warn(`  ⚠️  Not found: ${url}`);
      return "";
    }
    if (res.status === 403) {
      console.error(`  ❌ Rate limited or forbidden: ${url}`);
      return "";
    }
    console.error(`  ❌ Failed to fetch: ${res.status} ${res.statusText}`);
    return "";
  }

  const data = await res.json();

  // Handle both README endpoint and file content endpoint
  if (data.content) {
    // Content is base64 encoded
    return Buffer.from(data.content, "base64").toString("utf-8");
  }

  return "";
}

// Fetch content from a source
async function fetchSource(source: Source): Promise<FetchedContent> {
  let url: string;
  let content: string;

  if (source.type === "github-readme") {
    url = `${GITHUB_API}/repos/${source.repo}/readme`;
    content = await fetchGitHub(url);
  } else if (source.type === "github-file") {
    url = `${GITHUB_API}/repos/${source.repo}/contents/${source.path}`;
    content = await fetchGitHub(url);
  } else {
    content = "";
    url = "";
  }

  return {
    source,
    content,
    url: `https://github.com/${source.repo}${
      source.path ? `/blob/main/${source.path}` : ""
    }`,
  };
}

// Extract key sections from markdown content
function extractKeySections(content: string): Map<string, string> {
  const sections = new Map<string, string>();

  // Split by h2 headers (##)
  const headerRegex = /^## (.+)$/gm;
  const parts: { title: string; content: string }[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = headerRegex.exec(content)) !== null) {
    if (lastIndex > 0) {
      const prevMatch = parts[parts.length - 1];
      prevMatch.content = content.slice(lastIndex, match.index).trim();
    }

    parts.push({
      title: match[1],
      content: "",
    });

    lastIndex = match.index;
  }

  // Get content for last section
  if (parts.length > 0) {
    parts[parts.length - 1].content = content.slice(lastIndex).trim();
  }

  // Store sections
  for (const part of parts) {
    sections.set(part.title.toLowerCase(), part.content);
  }

  return sections;
}

// Extract useful commands, flags, and patterns from README
function extractUsefulContent(content: string): {
  commands: string[];
  flags: string[];
  sections: string[];
} {
  const commands: string[] = [];
  const flags: string[] = [];
  const sections: string[] = [];

  // Extract code blocks that look like CLI commands
  const codeBlockRegex = /```(?:bash|sh|shell)?\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const code = match[1];
    const lines = code.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith("#")) continue;

      // Extract CLI commands (simple heuristic)
      if (
        trimmed.match(/^(claude|aider|cline|cursor|gemini|continue|copilot)/i)
      ) {
        commands.push(trimmed);
      }

      // Extract flags
      const flagMatches = trimmed.match(/--[\w-]+/g);
      if (flagMatches) {
        flags.push(...flagMatches);
      }
    }
  }

  // Extract section headers
  const headerRegex = /^#{2,3} (.+)$/gm;
  while ((match = headerRegex.exec(content)) !== null) {
    sections.push(match[1]);
  }

  return {
    commands: [...new Set(commands)],
    flags: [...new Set(flags)],
    sections: [...new Set(sections)],
  };
}

// Compare new content with existing cheatsheet
function analyzeChanges(
  existingContent: string,
  fetchedContents: FetchedContent[]
): {
  hasChanges: boolean;
  newSections: string[];
  newCommands: string[];
  newFlags: string[];
} {
  const existingSections = extractKeySections(existingContent);
  const existingUseful = extractUsefulContent(existingContent);

  const allNewSections = new Set<string>();
  const allNewCommands = new Set<string>();
  const allNewFlags = new Set<string>();

  for (const fetched of fetchedContents) {
    if (!fetched.content) continue;

    const newSections = extractKeySections(fetched.content);
    const newUseful = extractUsefulContent(fetched.content);

    // Find sections in new content that don't exist in current
    for (const section of newUseful.sections) {
      const sectionKey = section.toLowerCase();
      if (!existingSections.has(sectionKey)) {
        allNewSections.add(section);
      }
    }

    // Find new commands
    for (const cmd of newUseful.commands) {
      if (!existingUseful.commands.includes(cmd)) {
        allNewCommands.add(cmd);
      }
    }

    // Find new flags
    for (const flag of newUseful.flags) {
      if (!existingUseful.flags.includes(flag)) {
        allNewFlags.add(flag);
      }
    }
  }

  const hasChanges =
    allNewSections.size > 0 ||
    allNewCommands.size > 0 ||
    allNewFlags.size > 0;

  return {
    hasChanges,
    newSections: [...allNewSections],
    newCommands: [...allNewCommands],
    newFlags: [...allNewFlags],
  };
}

// Generate "What's New" section
function generateWhatsNew(changes: {
  newSections: string[];
  newCommands: string[];
  newFlags: string[];
}): string {
  const lines: string[] = [];
  lines.push("## What's New");
  lines.push("");
  lines.push(
    `_Auto-detected changes from upstream documentation (${new Date().toISOString().split("T")[0]})_`
  );
  lines.push("");

  if (changes.newSections.length > 0) {
    lines.push("**New Documentation Sections:**");
    for (const section of changes.newSections.slice(0, 5)) {
      lines.push(`- ${section}`);
    }
    lines.push("");
  }

  if (changes.newCommands.length > 0) {
    lines.push("**New Commands Detected:**");
    for (const cmd of changes.newCommands.slice(0, 10)) {
      lines.push(`- \`${cmd}\``);
    }
    lines.push("");
  }

  if (changes.newFlags.length > 0) {
    lines.push("**New Flags Detected:**");
    for (const flag of changes.newFlags.slice(0, 10)) {
      lines.push(`- \`${flag}\``);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");

  return lines.join("\n");
}

// Update a single cheatsheet
async function updateCheatsheet(
  toolSource: CheatsheetSource
): Promise<CheatsheetUpdate> {
  console.log(`\n📝 Processing: ${toolSource.id}`);

  if (toolSource.skip) {
    console.log(`  ⏭️  Skipped: ${toolSource.reason}`);
    return {
      id: toolSource.id,
      hasChanges: false,
      newSections: [],
    };
  }

  if (toolSource.sources.length === 0) {
    console.log("  ⏭️  No sources configured");
    return {
      id: toolSource.id,
      hasChanges: false,
      newSections: [],
    };
  }

  // Fetch all sources
  const fetchedContents: FetchedContent[] = [];
  for (const source of toolSource.sources) {
    console.log(`  🔍 Fetching: ${source.repo}${source.path ? `/${source.path}` : " (README)"}`);
    const content = await fetchSource(source);
    if (content.content) {
      fetchedContents.push(content);
    }
    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  if (fetchedContents.length === 0) {
    console.log("  ⚠️  No content fetched");
    return {
      id: toolSource.id,
      hasChanges: false,
      newSections: [],
    };
  }

  // Read existing cheatsheet
  const cheatsheetPath = join(
    __dirname,
    "..",
    "src",
    "content",
    "cheatsheets",
    `${toolSource.id}.md`
  );

  if (!existsSync(cheatsheetPath)) {
    console.log("  ⚠️  Cheatsheet file not found, skipping");
    return {
      id: toolSource.id,
      hasChanges: false,
      newSections: [],
    };
  }

  const existingContent = readFileSync(cheatsheetPath, "utf-8");
  const { frontmatter, body } = extractFrontmatter(existingContent);

  // Analyze changes
  const changes = analyzeChanges(body, fetchedContents);

  if (!changes.hasChanges) {
    console.log("  ✅ No significant changes detected");
    return {
      id: toolSource.id,
      hasChanges: false,
      newSections: [],
    };
  }

  console.log("  🔄 Changes detected:");
  if (changes.newSections.length > 0) {
    console.log(`     - ${changes.newSections.length} new sections`);
  }
  if (changes.newCommands.length > 0) {
    console.log(`     - ${changes.newCommands.length} new commands`);
  }
  if (changes.newFlags.length > 0) {
    console.log(`     - ${changes.newFlags.length} new flags`);
  }

  // Generate updated content
  const whatsNew = generateWhatsNew(changes);

  // Remove old "What's New" section if exists
  const bodyWithoutWhatsNew = body.replace(
    /## What's New\n[\s\S]*?---\n\n/,
    ""
  );

  // Update lastUpdated in frontmatter
  const updatedFrontmatter = frontmatter.replace(
    /lastUpdated: .*/,
    `lastUpdated: ${new Date().toISOString().split("T")[0]}`
  );

  const updatedContent = `---\n${updatedFrontmatter}\n---\n\n${whatsNew}${bodyWithoutWhatsNew}`;

  return {
    id: toolSource.id,
    hasChanges: true,
    newSections: changes.newSections,
    updatedContent,
  };
}

// Main execution
async function main() {
  console.log("🚀 Cheatsheet Auto-Update Pipeline");
  console.log("==================================\n");

  if (DRY_RUN) {
    console.log("🔍 DRY RUN MODE - No files will be modified\n");
  }

  // Load sources configuration
  const sourcesPath = join(__dirname, "cheatsheet-sources.json");
  const sources: CheatsheetSource[] = JSON.parse(
    readFileSync(sourcesPath, "utf-8")
  );

  console.log(`📚 Found ${sources.length} tools in configuration`);

  const updates: CheatsheetUpdate[] = [];

  // Process each tool
  for (const toolSource of sources) {
    const update = await updateCheatsheet(toolSource);
    updates.push(update);
  }

  // Write updates
  console.log("\n\n📝 Writing Updates");
  console.log("==================\n");

  let updatedCount = 0;

  for (const update of updates) {
    if (!update.hasChanges || !update.updatedContent) continue;

    const cheatsheetPath = join(
      __dirname,
      "..",
      "src",
      "content",
      "cheatsheets",
      `${update.id}.md`
    );

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would update: ${update.id}.md`);
      console.log(`    New sections: ${update.newSections.join(", ")}`);
    } else {
      writeFileSync(cheatsheetPath, update.updatedContent);
      console.log(`  ✅ Updated: ${update.id}.md`);
      updatedCount++;
    }
  }

  // Summary
  console.log("\n\n📊 Summary");
  console.log("==========\n");
  console.log(`Total tools processed: ${sources.length}`);
  console.log(`Tools with updates: ${updates.filter((u) => u.hasChanges).length}`);
  if (!DRY_RUN) {
    console.log(`Files updated: ${updatedCount}`);
  }

  // List updated tools
  const updatedTools = updates.filter((u) => u.hasChanges).map((u) => u.id);
  if (updatedTools.length > 0) {
    console.log(`\nUpdated tools: ${updatedTools.join(", ")}`);
  }

  console.log("\n✨ Done!");
}

main().catch(console.error);
