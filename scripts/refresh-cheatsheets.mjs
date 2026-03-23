import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const toolArgIndex = args.findIndex((arg) => arg === '--tool');
const onlyTool = toolArgIndex >= 0 ? args[toolArgIndex + 1] : null;
const summaryPathArgIndex = args.findIndex((arg) => arg === '--summary-file');
const summaryFile = summaryPathArgIndex >= 0 ? args[summaryPathArgIndex + 1] : null;
const toolsConfigPath = join(root, 'scripts', 'cheatsheet-tools.json');
const tools = JSON.parse(readFileSync(toolsConfigPath, 'utf8'));

const selectedTools = onlyTool ? tools.filter((tool) => tool.id === onlyTool) : tools;
if (onlyTool && selectedTools.length === 0) {
  console.error(`Unknown tool: ${onlyTool}`);
  process.exit(1);
}

function truncate(text, maxChars = 16000) {
  if (!text) return '';
  return text.length <= maxChars ? text : `${text.slice(0, maxChars)}\n\n[truncated]`;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'changelogs-info-cheatsheet-refresh',
      Accept: 'text/plain, text/markdown, text/html;q=0.9, application/json;q=0.8, */*;q=0.5',
    },
  });

  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} for ${url}`);
  }

  const text = await res.text();
  return text;
}

function stripCodeFences(text) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
}

function extractJson(text) {
  const cleaned = stripCodeFences(text);
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) {
    throw new Error('Model response did not contain JSON object');
  }
  return cleaned.slice(first, last + 1);
}

function validateCheatsheetShape(data, toolId) {
  const requiredArrays = [
    'dailyWorkflows',
    'powerMoves',
    'gotchas',
    'cliFlags',
    'slashCommands',
    'config',
    'resources',
    'proTips',
  ];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`${toolId}: root must be an object`);
  }
  if (data.tool !== toolId) {
    throw new Error(`${toolId}: tool field mismatch`);
  }
  if (!data.quickStart || typeof data.quickStart !== 'object' || !Array.isArray(data.quickStart.steps)) {
    throw new Error(`${toolId}: quickStart.steps missing`);
  }

  for (const key of requiredArrays) {
    if (!Array.isArray(data[key])) {
      throw new Error(`${toolId}: ${key} must be an array`);
    }
  }
}

async function postChatCompletion({ apiUrl, apiKey, model, messages }) {
  const body = {
    model,
    temperature: 0.2,
    messages,
  };

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://changelogs.info',
      'X-Title': 'changelogs.info cheatsheet refresh',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM call failed ${res.status}: ${text}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('LLM response missing content');
  }

  return content;
}

function parseAndValidateCheatsheet(content, toolId) {
  const parsed = JSON.parse(extractJson(content));
  validateCheatsheetShape(parsed, toolId);
  return parsed;
}

async function repairJson({ apiUrl, apiKey, model, tool, brokenContent }) {
  const messages = [
    {
      role: 'system',
      content: 'Repair malformed JSON for a software cheatsheet. Return valid JSON only. Do not add commentary or markdown fences. Preserve meaning; only fix syntax/escaping/structure.',
    },
    {
      role: 'user',
      content: [
        `Fix this malformed JSON for tool id ${tool.id}.`,
        'Requirements:',
        '- Return one valid JSON object only.',
        '- Keep the tool field exactly unchanged.',
        '- Do not invent new facts.',
        '- Repair syntax only unless structure is obviously broken.',
        '',
        brokenContent,
      ].join('\n'),
    },
  ];

  return postChatCompletion({ apiUrl, apiKey, model, messages });
}

async function callLLM(tool, currentJson, sources) {
  const apiKey = process.env.LLM_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('LLM_API_KEY or OPENROUTER_API_KEY is required');
  }

  const apiUrl = process.env.LLM_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
  const model = process.env.LLM_MODEL || 'google/gemini-2.0-flash-001';

  const system = [
    'You update structured software cheatsheets for changelogs.info.',
    'Output JSON only. No markdown fences. No explanation.',
    'Preserve the existing schema and overall structure.',
    'Optimize for high-signal practical guidance, not completeness or marketing.',
    'Delete stale or weak items instead of just appending.',
    'Prefer official docs and changelogs. Do not invent commands, flags, or slash commands.',
    'Keep the site useful: concise, actionable, current.',
  ].join(' ');

  const user = [
    `Refresh the ${tool.name} cheatsheet JSON.`,
    'Requirements:',
    '- Keep valid JSON.',
    '- Keep tool field unchanged.',
    '- Update lastUpdated to today if the content changed materially.',
    '- Preserve strong existing items if still current.',
    '- Remove undocumented/stale claims.',
    '- Avoid duplicate advice across sections.',
    '- Keep examples concrete and realistic.',
    '- Return the full updated JSON object only.',
    '',
    'Current JSON:',
    currentJson,
    '',
    'Official sources:',
    sources.map((source, index) => `SOURCE ${index + 1}: ${source.url}\n${source.content}`).join('\n\n'),
  ].join('\n');

  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  const content = await postChatCompletion({ apiUrl, apiKey, model, messages });

  try {
    return parseAndValidateCheatsheet(content, tool.id);
  } catch (error) {
    const repairedContent = await repairJson({
      apiUrl,
      apiKey,
      model,
      tool,
      brokenContent: content,
    });
    return parseAndValidateCheatsheet(repairedContent, tool.id);
  }
}

function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function main() {
  const summaries = [];
  let changedCount = 0;

  for (const tool of selectedTools) {
    const filePath = join(root, tool.file);
    const currentRaw = readFileSync(filePath, 'utf8');

    const sourcePayloads = [];
    for (const url of tool.docs) {
      try {
        const text = await fetchText(url);
        sourcePayloads.push({ url, content: truncate(text) });
      } catch (error) {
        sourcePayloads.push({ url, content: `[fetch failed] ${error.message}` });
      }
    }

    const nextData = await callLLM(tool, currentRaw, sourcePayloads);
    const nextRaw = stableStringify(nextData);
    const changed = nextRaw !== currentRaw;

    summaries.push({
      tool: tool.id,
      changed,
      file: tool.file,
      lastUpdated: nextData.lastUpdated,
    });

    if (changed) {
      changedCount += 1;
      if (!dryRun) {
        writeFileSync(filePath, nextRaw);
      }
    }
  }

  if (summaryFile) {
    mkdirSync(dirname(summaryFile), { recursive: true });
    const lines = ['## Cheatsheet refresh summary', ''];
    for (const item of summaries) {
      lines.push(`- ${item.tool}: ${item.changed ? 'updated' : 'no change'} (${item.file})`);
    }
    writeFileSync(summaryFile, `${lines.join('\n')}\n`);
  }

  console.log(JSON.stringify({ changedCount, summaries }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
