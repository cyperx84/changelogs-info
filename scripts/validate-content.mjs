import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const releasesDir = join(root, 'src/content/releases');
const checks = [
  { name: 'cheatsheet', dir: join(root, 'src/content/cheatsheets'), ext: '.md' },
  { name: 'config', dir: join(root, 'src/content/configs'), ext: '.json' },
];

const toolIds = readdirSync(releasesDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''))
  .sort();

const failures = [];
for (const toolId of toolIds) {
  for (const check of checks) {
    const p = join(check.dir, `${toolId}${check.ext}`);
    if (!existsSync(p)) {
      failures.push(`missing ${check.name}: ${toolId}${check.ext}`);
    }
  }
}

if (failures.length) {
  console.error(`❌ Content integrity failed (${failures.length} issues):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(`✅ Content integrity ok: ${toolIds.length} tools have releases + cheatsheets + configs.`);
