import type { APIRoute } from "astro";

interface HealthResponse {
  schema: "clwatch.health.v1";
  status: "ok" | "degraded" | "error";
  timestamp: string;
  pipeline: {
    last_run: string | null;
    status: string;
    tools_checked: number;
    tools_updated: number;
    age_seconds: number | null;
  };
  site: {
    version: string;
    uptime: string;
  };
}

export const GET: APIRoute = async ({ request }) => {
  const startTime = Date.now();
  
  let status: HealthResponse["status"] = "ok";
  let pipelineInfo = {
    last_run: null as string | null,
    status: "unknown",
    tools_checked: 0,
    tools_updated: 0,
    age_seconds: null as number | null,
  };

  try {
    const url = new URL(request.url);
    const refsUrl = `${url.origin}/api/refs/status.json`;
    const res = await fetch(refsUrl);
    if (res.ok) {
      const data = await res.json();
      pipelineInfo = {
        last_run: data.pipeline?.last_run_at || null,
        status: data.pipeline?.status || "unknown",
        tools_checked: data.pipeline?.tools_checked || 0,
        tools_updated: data.pipeline?.tools_updated || 0,
        age_seconds: data.pipeline?.last_run_at
          ? Math.floor((Date.now() - new Date(data.pipeline.last_run_at).getTime()) / 1000)
          : null,
      };
      // Degraded if pipeline hasn't run in > 2 hours
      if (pipelineInfo.age_seconds && pipelineInfo.age_seconds > 7200) {
        status = "degraded";
      }
      if (pipelineInfo.status === "error") {
        status = "error";
      }
    } else {
      status = "degraded";
    }
  } catch {
    status = "error";
  }

  const health: HealthResponse = {
    schema: "clwatch.health.v1",
    status,
    timestamp: new Date().toISOString(),
    pipeline: pipelineInfo,
    site: {
      version: "1.0.0",
      uptime: `${Math.floor(process.uptime())}s`,
    },
  };

  return new Response(JSON.stringify(health, null, 2), {
    status: status === "ok" ? 200 : status === "degraded" ? 200 : 503,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
