import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const REFS_DIR = join(process.cwd(), "public", "api", "refs");
let errors = 0;

console.log("🔍 Validating payloads...\n");

const files = readdirSync(REFS_DIR).filter(f => f.endsWith(".json") && f !== "status.json");

for (const file of files) {
  const path = join(REFS_DIR, file);
  const content = readFileSync(path, "utf-8");
  
  // JSON parse check
  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    console.log(`❌ ${file}: invalid JSON — ${e.message}`);
    errors++;
    continue;
  }

  // Schema check
  if (!data.schema) {
    console.log(`⚠️  ${file}: missing schema field`);
  }

  // Checksum verification
  const checksumFile = `${path}.sha256`;
  if (existsSync(checksumFile)) {
    const expected = readFileSync(checksumFile, "utf-8").split(" ")[0];
    const actual = createHash("sha256").update(content).digest("hex");
    if (expected !== actual) {
      console.log(`❌ ${file}: checksum mismatch!`);
      errors++;
      continue;
    }
  }

  // Tool payload checks
  if (file !== "manifest.json" && file !== "status.json") {
    if (!data.payload) {
      console.log(`⚠️  ${file}: missing payload field`);
    }
    // Check meta is inside payload or at top level
    const meta = data.meta || data.payload?.meta;
    if (!meta?.latest_stable && !data.version) {
      console.log(`⚠️  ${file}: missing version info (meta.latest_stable or version)`);
    }
  }

  console.log(`✅ ${file}`);
}

console.log(`\n${errors === 0 ? "✅" : "❌"} ${files.length} payloads, ${errors} errors`);
process.exit(errors > 0 ? 1 : 0);
