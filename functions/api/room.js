/**
 * Intcu Room Sync — Cloudflare Pages Function
 * Route: /api/room
 *
 * GET  /api/room?code=XXXX&key=state     → read room data
 * POST /api/room                          → write room data
 *
 * KV Namespace required:
 *   INTCU_ROOMS — bind in wrangler.toml or Cloudflare Dashboard
 *
 * Keys expire after 2 hours (rooms auto-cleanup).
 * NASA P10: guarded, bounded, all returns checked.
 */

const ROOM_TTL = 7200; // 2 hours
const MAX_BODY = 100000; // 100KB
const RATE_WINDOW = 60000; // 1 minute
const RATE_MAX = 10; // 10 lookups per minute per IP

const rateLimits = new Map();

function checkRate(ip) {
  if (!ip) return true;
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateLimits.set(ip, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_MAX;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.INTCU_ROOMS) return json({ error: "KV not configured" }, 500);

  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRate(ip)) return json({ error: "Rate limited" }, 429);

  const url = new URL(request.url);
  const code = (url.searchParams.get("code") || "").toUpperCase();
  const key = url.searchParams.get("key") || "state";

  if (!code || code.length !== 6) return json({ error: "Invalid room code" }, 400);

  try {
    const data = await env.INTCU_ROOMS.get(`${code}:${key}`);
    if (!data) return json({ error: "Not found" }, 404);
    return json(JSON.parse(data), 200);
  } catch (e) {
    return json({ error: "Read failed" }, 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.INTCU_ROOMS) return json({ error: "KV not configured" }, 500);

  let body;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return json({ error: "Too large" }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const code = (body.code || "").toUpperCase();
  const key = body.key || "state";
  const data = body.data;

  if (!code || code.length !== 6) return json({ error: "Invalid room code" }, 400);
  if (!data) return json({ error: "data field required" }, 400);

  try {
    await env.INTCU_ROOMS.put(`${code}:${key}`, JSON.stringify(data), { expirationTtl: ROOM_TTL });
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: "Write failed" }, 500);
  }
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
