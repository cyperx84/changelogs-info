/**
 * Auto-detect new flags, commands, and features from release notes
 */

export interface DetectedItem {
  type: 'flag' | 'command' | 'env_var' | 'feature';
  name: string;
  description?: string;
  confidence: number; // 0-1, higher = more confident
  source: string; // release version
}

/**
 * Patterns to detect new features in release notes
 */
const FLAG_PATTERN = /--([a-z][a-z0-9-]*)/gi;
const SHORT_FLAG_PATTERN = /-([a-z])\b/gi;
const COMMAND_PATTERN = /\/([a-z][a-z0-9-]*)/gi;
const ENV_VAR_PATTERN = /([A-Z_]{2,}_[A-Z_]+)\s*=/gi;
const FEATURE_PATTERN = /(?:new|added|introduce|launch)s?\s+(?:feature|command|flag|support|option).*?--?([a-z][a-z0-9-]*)/gi;

/**
 * Common words to exclude from detection
 */
const EXCLUDE_WORDS = new Set([
  'https',
  'http',
  'github',
  'com',
  'org',
  'fix',
  'bug',
  'issue',
  'release',
  'version',
  'update',
  'improve',
  'refactor',
  'performance',
  'support',
  'api',
  'sdk',
  'cli',
  'ui',
  'docs',
  'test',
  'example',
  'demo',
  'sample',
]);

export function detectNewFlags(releaseBody: string, _toolId: string): DetectedItem[] {
  const items: DetectedItem[] = [];
  const seen = new Set<string>();

  // Detect long flags (--flag-name)
  const flagMatches = releaseBody.matchAll(FLAG_PATTERN);
  for (const match of flagMatches) {
    const flag = match[1].toLowerCase();
    if (!EXCLUDE_WORDS.has(flag) && !seen.has(`flag:${flag}`)) {
      seen.add(`flag:${flag}`);
      items.push({
        type: 'flag',
        name: `--${flag}`,
        confidence: 0.7,
        source: 'release-notes',
      });
    }
  }

  // Detect short flags (-f)
  const shortFlagMatches = releaseBody.matchAll(SHORT_FLAG_PATTERN);
  for (const match of shortFlagMatches) {
    const flag = match[1].toLowerCase();
    if (!EXCLUDE_WORDS.has(flag) && !seen.has(`shortflag:${flag}`)) {
      seen.add(`shortflag:${flag}`);
      items.push({
        type: 'flag',
        name: `-${flag}`,
        confidence: 0.5,
        source: 'release-notes',
      });
    }
  }

  // Detect slash commands (/command)
  const commandMatches = releaseBody.matchAll(COMMAND_PATTERN);
  for (const match of commandMatches) {
    const cmd = match[1].toLowerCase();
    if (!EXCLUDE_WORDS.has(cmd) && !seen.has(`cmd:${cmd}`)) {
      seen.add(`cmd:${cmd}`);
      items.push({
        type: 'command',
        name: `/${cmd}`,
        confidence: 0.8,
        source: 'release-notes',
      });
    }
  }

  // Detect environment variables
  const envMatches = releaseBody.matchAll(ENV_VAR_PATTERN);
  for (const match of envMatches) {
    const envVar = match[1];
    if (!EXCLUDE_WORDS.has(envVar) && !seen.has(`env:${envVar}`)) {
      seen.add(`env:${envVar}`);
      items.push({
        type: 'env_var',
        name: envVar,
        confidence: 0.85,
        source: 'release-notes',
      });
    }
  }

  // Detect explicit feature mentions
  const featureMatches = releaseBody.matchAll(FEATURE_PATTERN);
  for (const match of featureMatches) {
    const feature = match[1].toLowerCase();
    if (!EXCLUDE_WORDS.has(feature) && !seen.has(`feature:${feature}`)) {
      seen.add(`feature:${feature}`);
      items.push({
        type: 'feature',
        name: feature,
        description: `New ${match[0].split(/\s+/)[0]} in this release`,
        confidence: 0.9,
        source: 'release-notes',
      });
    }
  }

  return items;
}

/**
 * Extract description from release notes for a specific flag
 */
export function extractDescription(releaseBody: string, flagName: string): string | undefined {
  const lines = releaseBody.split('\n');
  const flagIndex = lines.findIndex((line) => line.includes(flagName));

  if (flagIndex !== -1) {
    // Try to find description on same or next line
    const currentLine = lines[flagIndex];
    const match = currentLine.match(/--[\w-]+\s*[–—-]*\s*(.+)/);
    if (match) {
      return match[1].trim();
    }

    // Check next line
    if (flagIndex + 1 < lines.length) {
      const nextLine = lines[flagIndex + 1].trim();
      if (nextLine && !nextLine.startsWith('--') && !nextLine.startsWith('/')) {
        return nextLine;
      }
    }
  }

  return undefined;
}

/**
 * Merge detected items with existing cheatsheet items
 */
export function mergeDetected(
  detected: DetectedItem[],
  existing: any[],
  type: 'flag' | 'command'
): any[] {
  const existingNames = new Set(existing.map((item) => item.name));
  const highConfidence = detected.filter((item) => {
    if (type === 'flag') return item.type === 'flag' && item.confidence >= 0.7 && !existingNames.has(item.name);
    if (type === 'command') return item.type === 'command' && item.confidence >= 0.8 && !existingNames.has(item.name);
    return false;
  });

  return [...existing, ...highConfidence.map((item) => ({
    name: item.name,
    description: item.description || 'Detected from release notes - requires review',
    example: type === 'flag' ? `command ${item.name}` : item.name,
    added: new Date().toISOString().split('T')[0],
    confidence: item.confidence,
    needsReview: true,
  }))];
}
