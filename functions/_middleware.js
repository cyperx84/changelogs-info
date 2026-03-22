/**
 * Cloudflare Pages Middleware
 *
 * Subdomain routing:
 *   openclaw.changelogs.info/* → /openclaw/* (serves the same Pages deployment)
 *
 * Path-based routing still works for local dev:
 *   changelogs.info/openclaw/* → unchanged
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const hostname = url.hostname;

  // Route openclaw subdomain to /openclaw/* path
  if (hostname === "openclaw.changelogs.info") {
    let newPathname;

    if (url.pathname === "/" || url.pathname === "") {
      newPathname = "/openclaw/";
    } else if (url.pathname.startsWith("/openclaw")) {
      // Already has /openclaw prefix — pass through
      newPathname = url.pathname;
    } else {
      newPathname = "/openclaw" + url.pathname;
    }

    const newUrl = new URL(url.toString());
    newUrl.pathname = newPathname;

    // Fetch from the assets with the rewritten URL
    const newRequest = new Request(newUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "manual",
    });

    return env.ASSETS.fetch(newRequest);
  }

  // All other requests pass through normally
  return context.next();
}
