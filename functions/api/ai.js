/**
 * Intcu AI Proxy — Cloudflare Pages Function
 * Route: POST /api/ai
 *
 * Proxies requests to Anthropic API with server-side API key.
 * Includes rate limiting and input validation.
 *
 * Environment variable required:
 *   ANTHROPIC_API_KEY — set in Cloudflare Dashboard → Pages → intcu → Settings → Environment variables
 *
 * NASA P10: guarded, bounded, all returns checked.
 */

const MAX_TOKENS = 4000;
const MAX_BODY_SIZE = 50000; // 50KB max request body
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 20; // 20 requests per minute per IP

// Simple in-memory rate limiter (resets on cold start — acceptable for Pages Functions)
const rateLimits = new Map();

function checkRateLimit(ip) {
  if (!ip) return true; // P10-R5: guard
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimits.set(ip, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) return false;
  return true;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // P10-R5: Guard — check API key exists
  if (!env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Rate limit by IP
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Rate limited — try again in a moment" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  // P10-R5: Validate request body
  let body;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_SIZE) {
      return new Response(JSON.stringify({ error: "Request too large" }), {
        status: 413,
        headers: { "Content-Type": "application/json" },
      });
    }
    body = JSON.parse(text);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // P10-R5: Validate required fields
  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages array required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // P10-R2: Bound token count
  const maxTokens = Math.min(body.max_tokens || 1000, MAX_TOKENS);
  const engine = body.engine || "claude";

  // Engine routing — 8 providers
  const ENGINES = {
    claude:   { url: "https://api.anthropic.com/v1/messages",            keyEnv: "ANTHROPIC_API_KEY",  fmt: "anthropic" },
    deepseek: { url: "https://api.deepseek.com/v1/chat/completions",     keyEnv: "DEEPSEEK_API_KEY",   fmt: "openai" },
    grok:     { url: "https://api.x.ai/v1/chat/completions",            keyEnv: "GROK_API_KEY",       fmt: "openai" },
    gemini:   { url: "https://generativelanguage.googleapis.com/v1beta/models/${body.model || 'gemini-2.5-flash'}:generateContent", keyEnv: "GEMINI_API_KEY", fmt: "gemini" },
    openai:   { url: "https://api.openai.com/v1/chat/completions",       keyEnv: "OPENAI_API_KEY",     fmt: "openai" },
    minimax:  { url: "https://api.minimax.chat/v1/text/chatcompletion_v2", keyEnv: "MINIMAX_API_KEY",  fmt: "openai" },
    mistral:  { url: "https://api.mistral.ai/v1/chat/completions",       keyEnv: "MISTRAL_API_KEY",    fmt: "openai" },
    groq:     { url: "https://api.groq.com/openai/v1/chat/completions",  keyEnv: "GROQ_API_KEY",       fmt: "openai" },
  };

  const eng = ENGINES[engine] || ENGINES.claude;
  const apiKey = env[eng.keyEnv];
  if (!apiKey) {
    // Fallback to Claude if requested engine key not set
    if (engine !== "claude" && env.ANTHROPIC_API_KEY) {
      // Retry with Claude
      body.engine = "claude";
      body.model = "claude-sonnet-4-20250514";
      return onRequestPost(context);
    }
    return new Response(JSON.stringify({ error: `${engine} API key not configured` }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  // Build request based on API format
  let apiUrl, headers, apiBody;
  if (eng.fmt === "anthropic") {
    apiUrl = eng.url;
    headers = { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" };
    apiBody = { model: body.model || "claude-sonnet-4-20250514", max_tokens: maxTokens,
      ...(body.system ? { system: body.system } : {}), messages: body.messages };
  } else if (eng.fmt === "gemini") {
    // Gemini uses a different format — API key in URL param
    apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${body.model || "gemini-2.5-flash"}:generateContent?key=${apiKey}`;
    headers = { "Content-Type": "application/json" };
    const parts = [];
    if (body.system) parts.push({ text: body.system + "\n\n" });
    if (body.messages) body.messages.forEach(m => parts.push({ text: m.content }));
    apiBody = { contents: [{ parts }], generationConfig: { maxOutputTokens: maxTokens } };
  } else {
    // OpenAI-compatible format (Grok, DeepSeek, OpenAI, MiniMax, Mistral, Groq)
    apiUrl = eng.url;
    headers = { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` };
    const msgs = [];
    if (body.system) msgs.push({ role: "system", content: body.system });
    msgs.push(...body.messages);
    apiBody = { model: body.model, max_tokens: maxTokens, messages: msgs };
  }

  // Proxy request
  try {
    const apiRes = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(apiBody),
    });

    // P10-R7: Check response
    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("Anthropic API error:", apiRes.status, errText);
      return new Response(JSON.stringify({ error: "AI service error", status: apiRes.status }), {
        status: apiRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await apiRes.json();

    // Normalize all formats to Anthropic content format
    let normalized = data;
    if (eng.fmt === "openai" && data.choices) {
      normalized = { content: [{ type: "text", text: data.choices[0]?.message?.content || "" }] };
    } else if (eng.fmt === "gemini" && data.candidates) {
      const text = data.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";
      normalized = { content: [{ type: "text", text }] };
    }

    return new Response(JSON.stringify(normalized), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Proxy error:", err.message);
    return new Response(JSON.stringify({ error: "Proxy connection failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
