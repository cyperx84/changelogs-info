import { readdirSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const HISTORY_DIR = join(process.cwd(), "public", "api", "history");
if (!existsSync(HISTORY_DIR)) {
  mkdirSync(HISTORY_DIR, { recursive: true });
}

const files = readdirSync(HISTORY_DIR).filter(f => f.endsWith(".json") && f !== "index.json");
const byTool = {};

for (const f of files) {
  const [tool, ...rest] = f.replace(".json", "").split("-");
  const version = rest.join("-");
  if (!byTool[tool]) byTool[tool] = [];
  byTool[tool].push({ version, file: f });
}

writeFileSync(
  join(HISTORY_DIR, "index.json"),
  JSON.stringify({ schema: "clwatch.history.v1", tools: byTool }, null, 2) + "\n"
);
console.log(`History index: ${Object.keys(byTool).length} tools, ${files.length} files`);
