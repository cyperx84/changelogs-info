import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const REFS = join(process.cwd(), "public/api/refs");
const SOURCES = join(process.cwd(), "src/pipeline/sources.ts");

const newTools = ["cline", "aider", "continue", "roo-code"];
let pass = 0, fail = 0;

const ok = (label) => { process.stdout.write(`  ✅ ${label}\n`); pass++; };
const err = (label) => { process.stdout.write(`  ❌ ${label}\n`); fail++; };

console.log("🔍 Testing new tool additions...\n");

for (const tool of newTools) {
  console.log(`📦 ${tool}`);
  const payloadPath = join(REFS, `${tool}.json`);
  if (!existsSync(payloadPath)) { err("payload file MISSING"); continue; }
  ok("payload file exists");

  let payload;
  try { payload = JSON.parse(readFileSync(payloadPath, "utf-8")); ok("valid JSON"); }
  catch (e) { err(`invalid JSON: ${e.message}`); continue; }

  for (const f of ["schema","tool","version","generated_at","verification","stale_after","delta","payload"]) {
    payload[f] !== undefined ? ok(`has field: ${f}`) : err(`missing field: ${f}`);
  }
  payload.tool === tool ? ok(`tool slug matches: ${tool}`) : err(`slug mismatch: payload.tool=${payload.tool}`);

  const meta = payload.payload?.meta;
  if (meta) {
    for (const f of ["display_name","vendor","kind","tags","homepage","repo_url","license","latest_stable","status"]) {
      meta[f] ? ok(`meta.${f} present`) : err(`meta.${f} MISSING`);
    }
  } else err("payload.meta MISSING");

  for (const arr of ["features","commands","flags","env_vars","models","breaking_changes"]) {
    Array.isArray(payload.payload?.[arr]) ? ok(`has array: ${arr}`) : err(`missing array: ${arr}`);
  }

  existsSync(join(REFS, `${tool}.json.sha256`)) ? ok("checksum file exists") : err("checksum MISSING (will generate on next pipeline run)");

  const manifest = JSON.parse(readFileSync(join(REFS, "manifest.json"), "utf-8"));
  manifest.tools[tool] ? ok("in manifest") : err("NOT in manifest");

  const src = readFileSync(SOURCES, "utf-8");
  src.includes(`toolSlug: "${tool}"`) ? ok("in sources.ts") : err("NOT in sources.ts");

  console.log();
}

const manifest = JSON.parse(readFileSync(join(REFS, "manifest.json"), "utf-8"));
console.log(`📋 Total tools in manifest: ${Object.keys(manifest.tools).length}`);
console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
