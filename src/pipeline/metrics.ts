/**
 * Pipeline run metrics — tracks run statistics over time.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const METRICS_FILE = join(process.cwd(), "data", "metrics.json");

export interface PipelineMetrics {
  schema: "clwatch.metrics.v1";
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  last_failure: string | null;
  total_extractions: number;
  total_patches: number;
  tools: Record<string, {
    updates_detected: number;
    tier2_runs: number;
    tier2_changes: number;
  }>;
  history: Array<{
    timestamp: string;
    status: "ok" | "error";
    tools_checked: number;
    tools_updated: number;
    duration_ms: number;
  }>;
}

export function loadMetrics(): PipelineMetrics {
  if (existsSync(METRICS_FILE)) {
    try {
      return JSON.parse(readFileSync(METRICS_FILE, "utf-8"));
    } catch {}
  }
  return {
    schema: "clwatch.metrics.v1",
    total_runs: 0,
    successful_runs: 0,
    failed_runs: 0,
    last_failure: null,
    total_extractions: 0,
    total_patches: 0,
    tools: {},
    history: [],
  };
}

export function recordRun(
  metrics: PipelineMetrics,
  status: "ok" | "error",
  toolsChecked: number,
  toolsUpdated: number,
  durationMs: number,
  tier2Changes: Record<string, number>,
): PipelineMetrics {
  metrics.total_runs++;
  if (status === "ok") {
    metrics.successful_runs++;
  } else {
    metrics.failed_runs++;
    metrics.last_failure = new Date().toISOString();
  }

  // Update per-tool stats
  for (const [tool, changes] of Object.entries(tier2Changes)) {
    if (!metrics.tools[tool]) {
      metrics.tools[tool] = { updates_detected: 0, tier2_runs: 0, tier2_changes: 0 };
    }
    if (changes > 0) {
      metrics.tools[tool].updates_detected++;
      metrics.tools[tool].tier2_runs++;
      metrics.tools[tool].tier2_changes += changes;
      metrics.total_extractions += changes;
    }
  }

  // Add to history (keep last 100 runs)
  metrics.history.push({
    timestamp: new Date().toISOString(),
    status,
    tools_checked: toolsChecked,
    tools_updated: toolsUpdated,
    duration_ms: durationMs,
  });
  if (metrics.history.length > 100) {
    metrics.history = metrics.history.slice(-100);
  }

  return metrics;
}

export function saveMetrics(metrics: PipelineMetrics): void {
  try {
    writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2) + "\n");
  } catch (err) {
    console.warn(`⚠️  Failed to save metrics: ${(err as Error).message}`);
  }
}

export function metricsSummary(metrics: PipelineMetrics): string {
  const successRate = metrics.total_runs > 0
    ? Math.round((metrics.successful_runs / metrics.total_runs) * 100)
    : 100;
  return `📊 ${metrics.total_runs} runs, ${successRate}% success, ${metrics.total_extractions} total extractions`;
}
