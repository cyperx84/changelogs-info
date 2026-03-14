// Static health endpoint — returns site version info
// For Cloudflare Pages, security headers are set via public/_headers

export async function GET() {
  return new Response(
    JSON.stringify({
      schema: "clwatch.health.v1",
      status: "ok",
      timestamp: new Date().toISOString(),
      site: { version: "1.1.0" },
    }, null, 2),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

export const prerender = true;
