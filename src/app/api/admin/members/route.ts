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

  const { error: allowErr } = await supabase
    .from("allowed_emails")
    .upsert({ email });
  if (allowErr) {
    return NextResponse.json(
      { error: "Falha ao liberar." },
      { status: 500 },
    );
  }

  const origin = new URL(req.url).origin;
  const { error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(
    email,
    {
      data: { full_name: fullName },
      redirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  );

  if (
    inviteErr &&
    !(
      inviteErr.message?.toLowerCase().includes("already") ||
      inviteErr.message?.toLowerCase().includes("registered")
    )
  ) {
    await supabase.from("allowed_emails").delete().eq("email", email);
    return NextResponse.json(
      { error: "Falha ao enviar convite." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
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

  // Remove from allow-list.
  await supabase.from("allowed_emails").delete().eq("email", email);

  // Find and delete the auth user (revokes access entirely).
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const target = list?.users.find(
    (u) => u.email?.toLowerCase() === email,
  );
  if (target) {
    await supabase.auth.admin.deleteUser(target.id);
  }

  return NextResponse.json({ ok: true });
}
