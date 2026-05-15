import { NextResponse } from "next/server";
import { requireAdmin } from "../../_guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const action = body?.action;
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: request, error: getErr } = await supabase
    .from("signup_requests")
    .select("id, full_name, email, status")
    .eq("id", id)
    .maybeSingle();

  if (getErr || !request) {
    return NextResponse.json(
      { error: "Solicitação não encontrada." },
      { status: 404 },
    );
  }
  if (request.status !== "pending") {
    return NextResponse.json(
      { error: "Solicitação já foi tratada." },
      { status: 409 },
    );
  }

  if (action === "reject") {
    await supabase
      .from("signup_requests")
      .update({ status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", id);
    return NextResponse.json({ ok: true });
  }

  const email = request.email.toLowerCase();

  // 1. Add email to allow-list (so the auth.users trigger lets us insert).
  const { error: allowErr } = await supabase
    .from("allowed_emails")
    .upsert({ email });
  if (allowErr) {
    console.error("[approve] allow-list error:", allowErr);
    return NextResponse.json(
      { error: "Falha ao liberar e-mail." },
      { status: 500 },
    );
  }

  // 2. Send invite (creates the auth.users row) with the user's full name.
  const origin = new URL(req.url).origin;
  const { error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(
    email,
    {
      data: { full_name: request.full_name },
      redirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  );
  if (inviteErr) {
    console.error("[approve] invite error:", inviteErr);
    // If user already existed in auth.users, surface a friendlier message.
    if (
      inviteErr.message?.toLowerCase().includes("already") ||
      inviteErr.message?.toLowerCase().includes("registered")
    ) {
      // Mark approved anyway — the user already has access.
      await supabase
        .from("signup_requests")
        .update({ status: "approved", reviewed_at: new Date().toISOString() })
        .eq("id", id);
      return NextResponse.json({ ok: true, note: "user-already-exists" });
    }
    // Roll back allow-list addition to keep things consistent.
    await supabase.from("allowed_emails").delete().eq("email", email);
    return NextResponse.json(
      { error: "Falha ao enviar convite." },
      { status: 500 },
    );
  }

  // 3. Mark request as approved.
  await supabase
    .from("signup_requests")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
