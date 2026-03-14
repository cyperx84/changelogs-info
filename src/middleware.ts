/**
 * Astro middleware — adds cache headers and security headers to API responses.
 */
import type { APIContext, MiddlewareNext } from "astro";

const CACHE_HEADERS: Record<string, { "Cache-Control": string; "CDN-Cache-Control"?: string }> = {
  // Payload files change hourly at most — cache aggressively
  "/api/refs/": {
    "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
    "CDN-Cache-Control": "public, max-age=86400",
  },
  // Health endpoint — short cache
  "/api/health": {
    "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
  },
  // Status endpoint
  "/api/refs/status.json": {
    "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
  },
};

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export const onRequest = async (context: APIContext, next: MiddlewareNext) => {
  const response = await next();

  // Add security headers to all responses
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // Add cache headers for API routes
  const pathname = new URL(context.request.url).pathname;
  for (const [prefix, headers] of Object.entries(CACHE_HEADERS)) {
    if (pathname.startsWith(prefix)) {
      for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value);
      }
      break;
    }
  }

  return response;
};
