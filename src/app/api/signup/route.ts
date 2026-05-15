import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`signup:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em alguns instantes." },
      { status: 429 },
    );
  }

  let payload: { full_name?: unknown; email?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const fullName =
    typeof payload.full_name === "string" ? payload.full_name.trim() : "";
  const email =
    typeof payload.email === "string"
      ? payload.email.trim().toLowerCase()
      : "";

  if (fullName.length < 2 || fullName.length > 80) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { error } = await supabase
    .from("signup_requests")
    .insert({ full_name: fullName, email });

  if (error) {
    // Unique violation = there is already a pending request for this email.
    // We respond as if accepted to prevent email enumeration.
    if (error.code === "23505") {
      return NextResponse.json({ ok: true });
    }
    console.error("[signup] insert failed:", error);
    return NextResponse.json(
      { error: "Não foi possível registrar agora." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
