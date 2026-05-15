import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { isAdminSessionValid } from "@/lib/admin-session";
import { AdminGateForm } from "./gate-form";

export const metadata = {
  title: "Painel admin · Membros",
  robots: { index: false, follow: false },
};

export default async function AdminGatePage() {
  if (await isAdminSessionValid()) redirect("/admin/console");

  return (
    <main className="min-h-screen flex flex-col">
      <header className="max-w-6xl w-full mx-auto px-6 pt-8 flex items-center justify-between">
        <Brand size="md" />
        <Link href="/" className="btn-ghost">
          Voltar
        </Link>
      </header>
      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="card-glass w-full max-w-md p-8 sm:p-10 animate-fade-up">
          <span className="chip chip-warn">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            Acesso restrito
          </span>
          <h1 className="font-display text-3xl font-semibold mt-5 tracking-tight">
            Painel administrativo
          </h1>
          <p className="mt-2 text-sm text-white/60 leading-relaxed">
            Informe a chave secreta do administrador para entrar.
          </p>
          <AdminGateForm />
        </div>
      </section>
    </main>
  );
}
