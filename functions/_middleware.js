/**
 * Cloudflare Pages Middleware
 *
 * Subdomain routing:
 *   openclaw.changelogs.info/*   → /openclaw/* 
 *   claude-code.changelogs.info/* → /claude-code/*
 *   codex.changelogs.info/*      → /codex-cli/*
 *   codex-cli.changelogs.info/*  → /codex-cli/*
 *
 * Path-based routing still works for local dev:
 *   changelogs.info/openclaw/*     → unchanged
 *   changelogs.info/claude-code/*  → unchanged
 *   changelogs.info/codex-cli/*    → unchanged
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const hostname = url.hostname;

  // Determine which tool prefix this subdomain maps to
  let toolPrefix = null;

  if (hostname === "openclaw.changelogs.info") {
    toolPrefix = "/openclaw";
  } else if (hostname === "claude-code.changelogs.info") {
    toolPrefix = "/claude-code";
  } else if (
    hostname === "codex.changelogs.info" ||
    hostname === "codex-cli.changelogs.info"
  ) {
    toolPrefix = "/codex-cli";
  }

  if (toolPrefix) {
    let newPathname;

    if (url.pathname === "/" || url.pathname === "") {
      newPathname = toolPrefix + "/";
    } else if (url.pathname.startsWith(toolPrefix)) {
      // Already has the correct prefix — pass through
      newPathname = url.pathname;
    } else {
      newPathname = toolPrefix + url.pathname;
    }

    const newUrl = new URL(url.toString());
    newUrl.pathname = newPathname;

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
