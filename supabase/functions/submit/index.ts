// Supabase Edge Function: POST /functions/v1/submit
// Receives guestbook notes and contact messages from the portfolio, verifies the Cloudflare Turnstile
// token on the SERVER, validates the input, rate-limits per network and inserts with the service role.
//
// Deploy:   supabase functions deploy submit --no-verify-jwt
//           (--no-verify-jwt because visitors are anonymous; Turnstile + the checks below protect it)
// Secrets:  supabase secrets set TURNSTILE_SECRET_KEY=<your Turnstile secret key> IP_SALT=<at least 32 random characters>
//           Optional: ALLOWED_ORIGINS=https://www.okirorinnocent.tech,https://okirorinnocent.tech
//           SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided to functions automatically.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ??
  "https://www.okirorinnocent.tech,https://okirorinnocent.tech").split(",").map((s) => s.trim());
const SECRET = Deno.env.get("TURNSTILE_SECRET_KEY") ?? "";
const SALT = Deno.env.get("IP_SALT") ?? "";
const CONFIGURED = Boolean(SECRET && SALT.length >= 32);
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

const MAX_PER_WINDOW = 3;            // posts per network per window
const WINDOW_MINUTES = 10;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
// strip control characters, keep normal text and line breaks
const clean = (v: unknown) => String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  const cors = {
    "Access-Control-Allow-Origin": ALLOWED.includes(origin) ? origin : ALLOWED[0],
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
  const reply = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return reply(405, { error: "Method not allowed" });
  if (!ALLOWED.includes(origin)) return reply(403, { error: "Origin not allowed" });
  if (!CONFIGURED) return reply(503, { error: "Service is not configured" });

  const raw = await req.text();
  if (raw.length > 6000) return reply(413, { error: "Request too large", code: "invalid" });
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw); } catch { return reply(400, { error: "Bad JSON", code: "invalid" }); }

  if (clean(body.website)) return reply(200, { ok: true });          // honeypot filled: pretend success

  const type = body.type;
  const name = clean(body.name), message = clean(body.message), email = clean(body.email);
  if (type !== "guestbook" && type !== "contact") return reply(400, { error: "Unknown type", code: "invalid" });
  if (type === "guestbook" && (!name || name.length > 40 || !message || message.length > 280)) {
    return reply(400, { error: "Invalid guestbook entry", code: "invalid" });
  }
  if (type === "contact" && (!name || name.length > 80 || !message || message.length > 1500 ||
      email.length > 120 || !EMAIL_RE.test(email))) {
    return reply(400, { error: "Invalid contact message", code: "invalid" });
  }

  // 1) Verify the Turnstile token with Cloudflare (this is the check the browser alone could not enforce)
  const ip = (req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const token = clean(body.token);
  if (!token || !SECRET) return reply(400, { error: "Security check failed", code: "captcha_failed" });
  const form = new FormData();
  form.append("secret", SECRET); form.append("response", token); form.append("remoteip", ip);
  let verdict: { success?: boolean; action?: string } = {};
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    verdict = await r.json();
  } catch { return reply(502, { error: "Could not verify the security check", code: "captcha_failed" }); }
  if (!verdict.success || (verdict.action && verdict.action !== type)) {
    return reply(400, { error: "Security check failed", code: "captcha_failed" });
  }

  // 2) Rate limit per network (hashed IP, never stored in clear)
  const ipHash = await sha256(SALT + ip);
  const table = type === "guestbook" ? "guestbook" : "contact_messages";
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();
  const { count, error: cErr } = await db.from(table).select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash).gte("created_at", since);
  if (cErr) return reply(500, { error: "Server error" });
  if ((count ?? 0) >= MAX_PER_WINDOW) return reply(429, { error: "Too many messages", code: "rate_limited" });

  // 3) Insert (guestbook rows start unapproved; contact rows are only readable by you in /admin)
  const row = type === "guestbook"
    ? { name, message, approved: false, ip_hash: ipHash }
    : { name, email, message, ip_hash: ipHash };
  const { error } = await db.from(table).insert(row);
  if (error) return reply(500, { error: "Could not save your message" });
  return reply(200, { ok: true });
});
