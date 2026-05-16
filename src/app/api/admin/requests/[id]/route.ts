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
  const origin = new URL(req.url).origin;

  // 1. Allow-list (so the auth.users trigger lets us insert).
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

  // 2. Generate the invite link WITHOUT sending any email.
  //    generateLink returns the link to us; we ship it back to the admin
  //    who shares it manually with the user (WhatsApp, etc).
  const link = await generateAccessLink({
    email,
    fullName: request.full_name,
    redirectTo: `${origin}/auth/callback?next=/set-password`,
  });

  if (!link.ok) {
    await supabase.from("allowed_emails").delete().eq("email", email);
    console.error("[approve] generateLink failed:", link.error);
    return NextResponse.json(
      { error: link.error ?? "Falha ao gerar link." },
      { status: 500 },
    );
  }

  // 3. Mark request approved.
  await supabase
    .from("signup_requests")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({
    ok: true,
    action_link: link.url,
    email,
    full_name: request.full_name,
  });
}

async function generateAccessLink(params: {
  email: string;
  fullName?: string;
  redirectTo: string;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const supabase = getSupabaseAdmin();

  // Check if the user already exists. If yes, use 'recovery' (password reset
  // link) instead of 'invite' (which would fail).
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const exists = list?.users.some(
    (u) => u.email?.toLowerCase() === params.email,
  );

  const type = exists ? "recovery" : "invite";

  const { data, error } = await supabase.auth.admin.generateLink({
    type,
    email: params.email,
    options: {
      redirectTo: params.redirectTo,
      ...(type === "invite" && params.fullName
        ? { data: { full_name: params.fullName } }
        : {}),
    },
  });

  if (error || !data?.properties?.action_link) {
    return { ok: false, error: error?.message ?? "Sem action_link." };
  }
  return { ok: true, url: data.properties.action_link };
}
