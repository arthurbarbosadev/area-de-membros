import { NextResponse } from "next/server";
import { requireAdmin } from "../_guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description =
    typeof body?.description === "string" && body.description.trim()
      ? body.description.trim()
      : null;
  const moduleField =
    typeof body?.module === "string" && body.module.trim()
      ? body.module.trim()
      : "Geral";
  const videoUrl =
    typeof body?.video_url === "string" && body.video_url.trim()
      ? body.video_url.trim()
      : null;
  const thumbnailUrl =
    typeof body?.thumbnail_url === "string" && body.thumbnail_url.trim()
      ? body.thumbnail_url.trim()
      : null;
  const position = Number.isFinite(Number(body?.position))
    ? Number(body.position)
    : 0;

  if (title.length < 2 || title.length > 140) {
    return NextResponse.json({ error: "Título inválido." }, { status: 400 });
  }
  for (const url of [videoUrl, thumbnailUrl]) {
    if (url && !/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: "URL inválida." }, { status: 400 });
    }
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("lessons")
    .insert({
      title,
      description,
      module: moduleField,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      position,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[admin/lessons] insert failed:", error);
    return NextResponse.json({ error: "Falha ao criar." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, lesson: data });
}
