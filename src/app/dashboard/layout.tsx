import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const initial = (profile?.full_name ?? user.email ?? "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/5 bg-ink-950/40 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Brand size="sm" />
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-sm text-white/75 hover:text-white hover:bg-white/5 transition"
              >
                Aulas
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-right">
              <div>
                <div className="text-sm font-medium text-white leading-tight">
                  {profile?.full_name ?? "Membro"}
                </div>
                <div className="text-xs text-white/50 leading-tight">
                  {profile?.email ?? user.email}
                </div>
              </div>
              <span className="h-9 w-9 rounded-full grid place-items-center bg-gradient-to-br from-marine-glow to-navy-glow text-ink-950 font-bold">
                {initial}
              </span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
