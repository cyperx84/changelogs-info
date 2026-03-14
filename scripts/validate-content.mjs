import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const releasesDir = join(root, 'src/content/releases');
const toolsPath = join(root, 'scrapers/tools.json');

const checks = [
  { name: 'cheatsheet', dir: join(root, 'src/content/cheatsheets-json'), ext: '.json' },
  { name: 'config', dir: join(root, 'src/content/configs'), ext: '.json' },
];

const featuredTools = ['openclaw', 'claude-code'];
const migrationsDir = join(root, 'src/content/migrations');

const releaseIds = readdirSync(releasesDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''))
  .sort();

const tools = JSON.parse(readFileSync(toolsPath, 'utf-8'));
const toolIds = tools.map((t) => t.id).sort();

const failures = [];

// Parity: tools registry ↔ releases data
for (const id of toolIds) {
  if (!releaseIds.includes(id)) failures.push(`missing release data: ${id}.json`);
}
for (const id of releaseIds) {
  if (!toolIds.includes(id)) failures.push(`orphan release data (not in tools.json): ${id}.json`);
}

// Required per-tool content for all tracked tools
for (const toolId of toolIds) {
  for (const check of checks) {
    const p = join(check.dir, `${toolId}${check.ext}`);
    if (!existsSync(p)) {
      failures.push(`missing ${check.name}: ${toolId}${check.ext}`);
    }
  }
}

// Featured-tool guardrails
for (const id of featuredTools) {
  const migrationPath = join(migrationsDir, `${id}.json`);
  if (!existsSync(migrationPath)) failures.push(`missing featured migration guide: ${id}.json`);
}

if (failures.length) {
  console.error(`❌ Content integrity failed (${failures.length} issues):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `✅ Content integrity ok: ${toolIds.length} tools synced (tools.json + releases + cheatsheets + configs) and featured migrations present.`
);
