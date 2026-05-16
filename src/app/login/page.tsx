import Link from "next/link";
import { Brand } from "@/components/Brand";

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
          <span className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-marine-mint" />
            Acesso por link
          </span>

          <h1 className="font-display text-3xl font-semibold mt-5 tracking-tight">
            Entre pelo seu link
          </h1>
          <p className="mt-3 text-sm text-white/65 leading-relaxed">
            A LowDigital não usa senha. Você acessa clicando no link que o
            admin te enviou no WhatsApp.
          </p>

          <div className="mt-7 p-4 rounded-xl bg-ink-950/60 border border-marine/20">
            <div className="text-xs font-semibold uppercase tracking-wider text-marine-mint mb-2">
              Não tem o link?
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Se você já é aluno, peça um link novo para o admin da turma.
              Se ainda não é, faça uma solicitação:
            </p>
            <Link href="/signup" className="btn-glow w-full mt-4 justify-center">
              Solicitar acesso
            </Link>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-amber-950/20 border border-amber-500/15">
            <p className="text-xs text-amber-200/80 leading-relaxed">
              <strong className="text-amber-100">Dica:</strong> Depois que
              você entrar pelo link, sua sessão fica ativa nesse navegador.
              Não precisa de novo link toda hora — só se você deslogar ou
              limpar os cookies.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
