import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const toolArgIndex = args.findIndex((arg) => arg === '--tool');
const onlyTool = toolArgIndex >= 0 ? args[toolArgIndex + 1] : null;
const summaryPathArgIndex = args.findIndex((arg) => arg === '--summary-file');
const summaryFile = summaryPathArgIndex >= 0 ? args[summaryPathArgIndex + 1] : null;
const reportPathArgIndex = args.findIndex((arg) => arg === '--report-file');
const reportFile = reportPathArgIndex >= 0 ? args[reportPathArgIndex + 1] : null;
const writeState = args.includes('--write-state');
const statePathArgIndex = args.findIndex((arg) => arg === '--state-file');
const stateFile = statePathArgIndex >= 0 ? args[statePathArgIndex + 1] : join(root, 'scripts', 'cheatsheet-source-state.json');
const toolsConfigPath = join(root, 'scripts', 'cheatsheet-tools.json');
const tools = JSON.parse(readFileSync(toolsConfigPath, 'utf8'));
const selectedTools = onlyTool ? tools.filter((tool) => tool.id === onlyTool) : tools;

if (onlyTool && selectedTools.length === 0) {
  console.error(`Unknown tool: ${onlyTool}`);
  process.exit(1);
}

function normalizeContent(text) {
  return text.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').trim();
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'changelogs-info-cheatsheet-detector',
      Accept: 'text/plain, text/markdown, text/html;q=0.9, application/json;q=0.8, */*;q=0.5',
    },
  });

  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} for ${url}`);
  }

  return res.text();
}

function loadState() {
  try {
    return JSON.parse(readFileSync(stateFile, 'utf8'));
  } catch {
    return { generatedAt: null, tools: {} };
  }
}

async function inspectTool(tool, previousState) {
  const previousTool = previousState.tools?.[tool.id] || null;
  const sources = [];
  const failures = [];

  for (const url of tool.docs) {
    try {
      const raw = await fetchText(url);
      const normalized = normalizeContent(await raw);
      sources.push({
        url,
        hash: sha256(normalized),
        bytes: Buffer.byteLength(normalized, 'utf8'),
      });
    } catch (error) {
      failures.push({ url, error: error.message });
    }
  }

  const combinedHash = sha256(
    JSON.stringify({
      tool: tool.id,
      sources: sources.map(({ url, hash }) => ({ url, hash })),
    }),
  );

  const previousSources = new Map((previousTool?.sources || []).map((item) => [item.url, item.hash]));
  const changedSources = sources.filter((source) => previousSources.get(source.url) !== source.hash).map((source) => source.url);
  const changed = !previousTool || previousTool.combinedHash !== combinedHash;

  return {
    id: tool.id,
    name: tool.name,
    file: tool.file,
    changed,
    combinedHash,
    previousHash: previousTool?.combinedHash || null,
    changedSources,
    failures,
    sources,
  };
}

async function main() {
  const previousState = loadState();
  const results = [];

  for (const tool of selectedTools) {
    results.push(await inspectTool(tool, previousState));
  }

  const changedTools = results.filter((tool) => tool.changed).map((tool) => tool.id);
  const report = {
    generatedAt: new Date().toISOString(),
    checkedTools: results.map((tool) => tool.id),
    changedTools,
    hasChanges: changedTools.length > 0,
    tools: results.map((tool) => ({
      id: tool.id,
      name: tool.name,
      file: tool.file,
      changed: tool.changed,
      previousHash: tool.previousHash,
      combinedHash: tool.combinedHash,
      changedSources: tool.changedSources,
      failures: tool.failures,
      sourceCount: tool.sources.length,
    })),
  };

  if (reportFile) {
    mkdirSync(dirname(reportFile), { recursive: true });
    writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`);
  }

  if (summaryFile) {
    mkdirSync(dirname(summaryFile), { recursive: true });
    const lines = ['## Cheatsheet source detection', ''];
    lines.push(`Checked tools: ${report.checkedTools.join(', ') || 'none'}`);
    lines.push(`Changed tools: ${changedTools.join(', ') || 'none'}`);
    lines.push('');

    for (const tool of results) {
      lines.push(`### ${tool.name} (${tool.id})`);
      lines.push(`- Status: ${tool.changed ? 'changed' : 'unchanged'}`);
      lines.push(`- Sources checked: ${tool.sources.length}`);
      if (tool.changedSources.length > 0) {
        lines.push('- Changed sources:');
        for (const url of tool.changedSources) {
          lines.push(`  - ${url}`);
        }
      }
      if (tool.failures.length > 0) {
        lines.push('- Fetch failures:');
        for (const failure of tool.failures) {
          lines.push(`  - ${failure.url} — ${failure.error}`);
        }
      }
      lines.push('');
    }

    writeFileSync(summaryFile, `${lines.join('\n')}\n`);
  }

  if (writeState) {
    const nextState = {
      generatedAt: report.generatedAt,
      tools: Object.fromEntries(
        results.map((tool) => [
          tool.id,
          {
            name: tool.name,
            file: tool.file,
            combinedHash: tool.combinedHash,
            sources: tool.sources,
          },
        ]),
      ),
    };

    mkdirSync(dirname(stateFile), { recursive: true });
    writeFileSync(stateFile, `${JSON.stringify(nextState, null, 2)}\n`);
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
