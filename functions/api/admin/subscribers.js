/**
 * GET /api/admin/subscribers
 * Admin endpoint to list all newsletter subscribers.
 * Requires x-admin-key header matching env.ADMIN_KEY.
 * Returns JSON with count and subscriber list from KV SUBSCRIBERS namespace.
 */

export async function onRequestGet(context) {
  const { request, env } = context;

  // Check admin key
  const adminKey = request.headers.get('x-admin-key') || '';
  if (!env.ADMIN_KEY || adminKey !== env.ADMIN_KEY) {
    return json({ ok: false, error: 'unauthorized' }, 403);
  }

  // List all subscribers from KV
  const subscribers = [];
  if (env.SUBSCRIBERS) {
    try {
      const list = await env.SUBSCRIBERS.list();
      for (const key of list.keys) {
        const data = await env.SUBSCRIBERS.get(key.name);
        if (data) {
          const subscriber = JSON.parse(data);
          subscribers.push({
            email: subscriber.email,
            subscribedAt: subscriber.subscribedAt,
          });
        }
      }
    } catch (err) {
      console.error('KV read error:', err);
      return json({ ok: false, error: 'failed to read subscribers' }, 500);
    }
  }

  return json({
    count: subscribers.length,
    subscribers,
  }, 200);
}

// Block non-GET methods
export async function onRequestPost() {
  return json({ ok: false, error: 'GET only' }, 405);
}

export async function onRequestPut() {
  return json({ ok: false, error: 'GET only' }, 405);
}

export async function onRequestDelete() {
  return json({ ok: false, error: 'GET only' }, 405);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
