// Cashflo AI worker (Cloudflare Workers).
// Keeps your Claude API key off the web page and only answers your own Cashflo site.
//
// Settings → Variables and Secrets:
//   ANTHROPIC_API_KEY  (secret)  your key from console.anthropic.com
//   APP_TOKEN          (secret)  a long passphrase you make up; enter the same one in Cashflo → Settings → AI
//   ALLOWED_ORIGINS    (text)    https://cashflo.pages.dev   (comma-separate if you add more)
//   MODEL              (text, optional)  defaults to claude-sonnet-5-5

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
    const originOk = allowed.length > 0 && allowed.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": originOk ? origin : allowed[0] || "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type, x-cashflo-token",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    };
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (req.method !== "POST") return json({ error: "Cashflo AI worker is running. Use it from the Cashflo app." }, 405, cors);
    if (!originOk) return json({ error: "This site isn't allowed. Add its address to ALLOWED_ORIGINS in the worker settings." }, 403, cors);
    if (!env.APP_TOKEN || req.headers.get("x-cashflo-token") !== env.APP_TOKEN) return json({ error: "Wrong access code. It must match APP_TOKEN in the worker settings." }, 401, cors);
    if (!env.ANTHROPIC_API_KEY) return json({ error: "ANTHROPIC_API_KEY isn't set in the worker settings." }, 500, cors);

    let body;
    try { body = await req.json(); } catch { return json({ error: "Bad request." }, 400, cors); }
    if (body.ping) return json({ ok: true }, 200, cors);

    const system = String(body.system || "").slice(0, 8000);
    const prompt = String(body.prompt || "").slice(0, 80000);
    if (!prompt) return json({ error: "Nothing to send." }, 400, cors);
    const max_tokens = Math.min(Math.max(+body.max_tokens || 1500, 200), 3000);

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: env.MODEL || "claude-sonnet-5-5", max_tokens, system, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: data?.error?.message ? `Claude API: ${data.error.message}` : `Claude API error ${r.status}` }, 502, cors);
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    return json({ text, usage: data.usage }, 200, cors);
  },
};

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers: { ...headers, "content-type": "application/json" } });
}
