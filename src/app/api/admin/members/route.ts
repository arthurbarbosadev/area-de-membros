import { NextResponse } from "next/server";
import { requireAdmin } from "../_guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const fullName =
    typeof body?.full_name === "string" ? body.full_name.trim() : "";

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }
  if (fullName.length < 2 || fullName.length > 80) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const origin = new URL(req.url).origin;

  // 1. Allow-list.
  const { error: allowErr } = await supabase
    .from("allowed_emails")
    .upsert({ email });
  if (allowErr) {
    console.error("[members] allow-list upsert failed:", allowErr);
    return NextResponse.json(
      { error: "Falha ao liberar." },
      { status: 500 },
    );
  }

  // 2. Check if user exists — choose between invite (new) and recovery (exists).
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const exists = list?.users.some((u) => u.email?.toLowerCase() === email);
  const type = exists ? "recovery" : "invite";

  const { data, error } = await supabase.auth.admin.generateLink({
    type,
    email,
    options: {
      redirectTo: `${origin}/auth/callback?next=/dashboard`,
      ...(type === "invite" ? { data: { full_name: fullName } } : {}),
    },
  });

  if (error || !data?.properties?.action_link) {
    console.error("[members] generateLink failed:", error);
    await supabase.from("allowed_emails").delete().eq("email", email);
    return NextResponse.json(
      { error: "Falha ao gerar link de acesso." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    action_link: data.properties.action_link,
    email,
    full_name: fullName,
  });
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  await supabase.from("allowed_emails").delete().eq("email", email);

  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const target = list?.users.find((u) => u.email?.toLowerCase() === email);
  if (target) {
    await supabase.auth.admin.deleteUser(target.id);
  }

  return NextResponse.json({ ok: true });
}
