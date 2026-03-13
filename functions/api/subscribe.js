/**
 * POST /api/subscribe
 * Newsletter subscription endpoint for Cloudflare Pages Functions.
 *
 * Expects: { email: string } (JSON body)
 * Stores subscribers in KV namespace bound as SUBSCRIBERS.
 * On local dev without KV, logs and returns success.
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // Parse body — accept JSON or form-encoded
  let email = '';
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await request.json();
    email = (body.email || '').trim();
  } else {
    const form = await request.formData();
    email = (form.get('email') || '').toString().trim();
  }

  // Validate
  if (!email) {
    return json({ ok: false, error: 'email is required' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'invalid email' }, 400);
  }

  const normalizedEmail = email.toLowerCase();

  // Store in KV if available
  if (env.SUBSCRIBERS) {
    try {
      // Check for duplicate
      const existing = await env.SUBSCRIBERS.get(normalizedEmail);
      if (existing) {
        return json({ ok: true, message: 'already subscribed' }, 200);
      }

      await env.SUBSCRIBERS.put(normalizedEmail, JSON.stringify({
        email: normalizedEmail,
        subscribedAt: new Date().toISOString(),
        source: 'website',
      }));
    } catch (err) {
      console.error('KV write error:', err);
      // Fall through — don't fail the user
    }
  } else {
    console.log(`[newsletter] new subscriber: ${normalizedEmail}`);
  }

  return json({ ok: true, message: 'subscribed' }, 200);
}

// Block non-POST methods
export async function onRequestGet() {
  return json({ ok: false, error: 'POST only' }, 405);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
