/**
 * Cloudflare Pages Function: GET /api/refs/diff?tool=claude-code&from=2.1.71&to=latest
 *
 * Returns a structured diff between two payload versions.
 * Reads from static files deployed with the site.
 */
import type { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  ASSETS: Fetcher;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const tool = url.searchParams.get("tool");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!tool) {
    return jsonResponse({ error: "tool parameter required" }, 400);
  }

  if (!/^[a-z][a-z0-9-]*$/.test(tool)) {
    return jsonResponse({ error: "invalid tool slug" }, 400);
  }

  // Fetch the two versions via internal asset serving
  const fromPayload = await fetchPayload(context, tool, from);
  const toPayload = await fetchPayload(context, tool, to || "latest");

  if (!fromPayload && !toPayload) {
    return jsonResponse({ error: `no payloads found for ${tool}` }, 404);
  }

  if (!fromPayload || !toPayload) {
    return jsonResponse({
      schema: "clwatch.diff.v1",
      tool,
      message: "only one version available, cannot diff",
      available_versions: await getAvailableVersions(tool),
    });
  }

  const diff = computeDiff(fromPayload, toPayload, from || "unknown", to || "latest");

  return jsonResponse({
    schema: "clwatch.diff.v1",
    tool,
    ...diff,
  });
};

async function fetchPayload(context: any, tool: string, version: string | null): Promise<Record<string, unknown> | null> {
  if (!version || version === "latest") {
    // Fetch current
    const res = await context.env.ASSETS.fetch(new URL(`/api/refs/${tool}.json`, "https://x"));
    if (res.ok) return await res.json();
    return null;
  }
  // Fetch from history
  const res = await context.env.ASSETS.fetch(new URL(`/api/history/${tool}-${version}.json`, "https://x"));
  if (res.ok) return await res.json();
  return null;
}

async function getAvailableVersions(tool: string): Promise<string[]> {
  try {
    const res = await fetch(`https://changelogs.info/api/history/${tool}`);
    if (res.ok) {
      const data = await res.json();
      return data.versions?.map((v: any) => v.version) || [];
    }
  } catch {}
  return [];
}

function computeDiff(from: Record<string, unknown>, to: Record<string, unknown>, fromVer: string, toVer: string) {
  const fp = (from.payload || {}) as Record<string, unknown>;
  const tp = (to.payload || {}) as Record<string, unknown>;

  const ids = (arr: unknown): Set<string> => {
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map((i: any) => i.id || i.name || i.flag || "").filter(Boolean));
  };

  const added = (a: string, b: string) => [...ids(tp[b])].filter(id => !ids(fp[a]).has(id));
  const removed = (a: string, b: string) => [...ids(fp[a])].filter(id => !ids(tp[b]).has(id));

  return {
    from_version: fromVer,
    to_version: toVer,
    changes: {
      features: { added: added("features", "features"), removed: removed("features", "features") },
      commands: { added: added("commands", "commands"), removed: removed("commands", "commands") },
      flags: { added: added("flags", "flags"), removed: removed("flags", "flags") },
      env_vars: { added: added("env_vars", "env_vars"), removed: removed("env_vars", "env_vars") },
    },
  };
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}
