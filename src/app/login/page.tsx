import { Suspense } from "react";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="max-w-6xl w-full mx-auto px-6 pt-8 flex items-center justify-between">
        <Brand size="md" />
        <Link href="/signup" className="btn-ghost">
          Solicitar acesso
        </Link>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="card-glass w-full max-w-md p-8 sm:p-10 animate-fade-up">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Bem-vindo de volta
          </h1>
          <p className="mt-2 text-sm text-white/60 leading-relaxed">
            Acesse sua conta LowDigital com o e-mail liberado pela curadoria.
          </p>

          <Suspense fallback={<div className="mt-7 h-40 animate-pulse bg-white/5 rounded-xl" />}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
