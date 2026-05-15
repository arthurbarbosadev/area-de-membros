import { NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/admin-session";

export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdminSessionValid()) return null;
  return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
}
