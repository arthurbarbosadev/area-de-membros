import Link from "next/link";
import { Brand } from "@/components/Brand";
import { SignupForm } from "./signup-form";

export const metadata = {
  title: "Solicitar acesso",
};

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="max-w-6xl w-full mx-auto px-6 pt-8 flex items-center justify-between">
        <Brand size="md" />
        <Link href="/login" className="btn-ghost">
          Já sou membro
        </Link>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="card-glass w-full max-w-md p-8 sm:p-10 animate-fade-up">
          <span className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-marine-mint" />
            Acesso por aprovação
          </span>
          <h1 className="font-display text-3xl font-semibold mt-5 tracking-tight">
            Entre para a LowDigital
          </h1>
          <p className="mt-2 text-sm text-white/60 leading-relaxed">
            Deixe seu nome e e-mail. Avaliamos cada solicitação manualmente e
            você recebe o convite quando for aprovado.
          </p>

          <SignupForm />

          <p className="mt-6 text-xs text-white/40 leading-relaxed">
            Ao solicitar acesso você concorda em receber um e-mail de
            confirmação quando seu cadastro for aprovado.
          </p>
        </div>
      </section>
    </main>
  );
}
