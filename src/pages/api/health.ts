/**
 * GET /api/health
 *
 * Static health check — points to the live status.json for real-time data.
 * For a more detailed health check, use /api/refs/status.json directly.
 */
export async function GET() {
  return new Response(
    JSON.stringify({
      schema: "clwatch.health.v1",
      status: "ok",
      timestamp: new Date().toISOString(),
      endpoints: {
        status: "/api/refs/status.json",
        manifest: "/api/refs/manifest.json",
        payload: "/api/refs/{tool}.json",
      },
      site: { version: "1.1.0" },
    }, null, 2),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    }
  );
}

export const prerender = true;
