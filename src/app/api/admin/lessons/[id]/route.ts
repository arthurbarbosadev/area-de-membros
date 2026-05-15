import { NextResponse } from "next/server";
import { requireAdmin } from "../../_guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Falha ao remover." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
