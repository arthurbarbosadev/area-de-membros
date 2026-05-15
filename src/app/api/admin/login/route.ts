import { NextResponse } from "next/server";
import {
  checkAdminSecret,
  createAdminSessionCookie,
} from "@/lib/admin-session";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`admin-login:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Aguarde um pouco." }, { status: 429 });
  }

  let body: { secret?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const secret = typeof body.secret === "string" ? body.secret : "";
  if (!checkAdminSecret(secret)) {
    return NextResponse.json({ error: "Chave inválida." }, { status: 401 });
  }

  await createAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
