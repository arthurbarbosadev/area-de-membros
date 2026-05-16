import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SetPasswordForm } from "./set-password-form";

export const metadata = {
  title: "Defina sua senha",
};

export const dynamic = "force-dynamic";

export default async function SetPasswordPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Esse fluxo só faz sentido para alguém vindo do magic link de
  // invite/recovery. Se a sessão expirou ou não existe, manda pro login.
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen flex flex-col">
      <header className="max-w-6xl w-full mx-auto px-6 pt-8">
        <Brand size="md" />
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="card-glass w-full max-w-md p-8 sm:p-10 animate-fade-up">
          <span className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-marine-mint" />
            Quase lá
          </span>
          <h1 className="font-display text-3xl font-semibold mt-5 tracking-tight">
            Defina sua senha
          </h1>
          <p className="mt-2 text-sm text-white/60 leading-relaxed">
            Olá, <strong className="text-white">{user.email}</strong>. Crie
            uma senha para acessar a LowDigital sempre que quiser.
          </p>

          <SetPasswordForm />
        </div>
      </section>
    </main>
  );
}
