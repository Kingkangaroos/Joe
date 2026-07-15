// =============================================================
// Gamenfy — Jarvis edge function, Gemini edition (v9.0 DRAFT)
// Ready to deploy the moment Joey's Gemini key exists.
//
// Deploy:  supabase functions deploy jarvis --no-verify-jwt
// Secrets: supabase secrets set GEMINI_API_KEY=... PUSH_SECRET=...
//          (PUSH_SECRET must equal the existing shared x-push-secret)
//
// Conventions (per GAMENFY-MASTER.md §7):
//  - verify_jwt: false; auth via the shared `x-push-secret` header
//  - context comes from app_state key `rpg` (streak, character)
//  - no secrets in this public repo — everything via Deno.env
// =============================================================

const GEMINI_MODEL = "gemini-flash-latest"; // matches the DEPLOYED function (v9.8, live since 2026-07-15)

const SYSTEM_PROMPT = `You are Jarvis, the in-app coach of Gamenfy — Joey's gamified Life OS.
Be concise, warm and action-first. English only. No emoji walls, no bullet spam.
You know his world: skills with XP levels 1-100, tier gates at 10/25/50/75,
daily habit missions (0-10 score), a streak, ventures (Grip, Gamenfy Public).
Always end with exactly one concrete next action he can do tonight.`;

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type, x-push-secret",
    "Content-Type": "application/json",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // Shared-secret auth (same pattern as send-daily-push / import-media)
  const secret = Deno.env.get("PUSH_SECRET") ?? "";
  if (!secret || req.headers.get("x-push-secret") !== secret) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: cors });
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY") ?? "";
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "GEMINI_API_KEY not set" }), { status: 500, headers: cors });
  }

  let body: { messages?: Array<{ role: string; content: string }> };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), { status: 400, headers: cors });
  }
  const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
  if (!messages.length) {
    return new Response(JSON.stringify({ error: "messages required" }), { status: 400, headers: cors });
  }

  // Optional live context: streak + top-line stats from app_state key `rpg`
  let context = "";
  try {
    const sbUrl = Deno.env.get("SUPABASE_URL")!;
    const sbKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    const r = await fetch(`${sbUrl}/rest/v1/app_state?key=eq.rpg&select=data`, {
      headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` },
    });
    if (r.ok) {
      const rows = await r.json();
      const d = rows?.[0]?.data ?? {};
      const streak = d?.rpg_streak_v1?.current ?? d?.streak?.current;
      if (streak != null) context = `\n\nLive context: current streak = ${streak} days.`;
    }
  } catch { /* context is best-effort */ }

  // Gemini: system prompt via systemInstruction, history as contents
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: String(m.content ?? "").slice(0, 4000) }],
  }));

  const gr = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT + context }] },
        contents,
        generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
      }),
    },
  );

  if (!gr.ok) {
    const detail = await gr.text().catch(() => "");
    return new Response(JSON.stringify({ error: "gemini_error", status: gr.status, detail: detail.slice(0, 300) }), {
      status: 502, headers: cors,
    });
  }

  const data = await gr.json();
  const reply: string =
    data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ??
    "…";

  return new Response(JSON.stringify({ reply }), { headers: cors });
});
