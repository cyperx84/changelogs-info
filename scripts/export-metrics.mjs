import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DATA_FILE = join(process.cwd(), "data", "metrics.json");
const OUT_FILE = join(process.cwd(), "public", "api", "metrics.json");

if (existsSync(DATA_FILE)) {
  const metrics = JSON.parse(readFileSync(DATA_FILE, "utf-8"));
  writeFileSync(OUT_FILE, JSON.stringify(metrics, null, 2) + "\n");
  console.log(`📊 Exported metrics: ${metrics.total_runs} runs`);
} else {
  console.log("No metrics file yet");
}
