import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { isAdminSessionValid } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ConsoleClient } from "./console-client";
import { AdminLogout } from "./admin-logout";

export const metadata = {
  title: "Console admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type SignupRequest = {
  id: string;
  full_name: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

type AllowedEmail = { email: string; added_at: string };

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  module: string | null;
  position: number;
  created_at: string;
};

export default async function AdminConsolePage() {
  if (!(await isAdminSessionValid())) redirect("/admin");

  const supabase = getSupabaseAdmin();

  const [{ data: requests }, { data: allowed }, { data: lessons }] =
    await Promise.all([
      supabase
        .from("signup_requests")
        .select("id, full_name, email, status, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("allowed_emails")
        .select("email, added_at")
        .order("added_at", { ascending: false })
        .limit(200),
      supabase
        .from("lessons")
        .select("*")
        .order("module", { ascending: true })
        .order("position", { ascending: true })
        .limit(200),
    ]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/5 bg-ink-950/40 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Brand size="sm" />
            <span className="chip chip-warn hidden sm:inline-flex">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="btn-ghost text-sm py-2 px-3">
              Ver área
            </Link>
            <AdminLogout />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6 py-10">
        <ConsoleClient
          initialRequests={(requests ?? []) as SignupRequest[]}
          initialAllowed={(allowed ?? []) as AllowedEmail[]}
          initialLessons={(lessons ?? []) as Lesson[]}
        />
      </main>
    </div>
  );
}
