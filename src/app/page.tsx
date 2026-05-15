import Link from "next/link";
import { Brand } from "@/components/Brand";

export default function Home() {
  return (
    <main className="relative">
      <header className="max-w-6xl mx-auto px-6 pt-8 flex items-center justify-between">
        <Brand size="md" />
        <nav className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost">
            Entrar
          </Link>
          <Link href="/signup" className="btn-glow">
            Solicitar acesso
          </Link>
        </nav>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-24 pb-32 text-center">
        <span className="chip animate-fade-up">
          <span className="h-1.5 w-1.5 rounded-full bg-marine-mint animate-pulse" />
          Acesso por convite curado
        </span>

        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight mt-6 animate-fade-up">
          A área de membros{" "}
          <span className="bg-gradient-to-r from-marine-mint via-marine-glow to-navy-glow bg-clip-text text-transparent">
            que não se parece com nenhuma outra
          </span>
        </h1>

        <p
          className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          Conteúdo exclusivo, ambiente privado, zero spam. Solicite acesso —
          nossa curadoria libera apenas membros aprovados.
        </p>

        <div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          <Link href="/signup" className="btn-glow">
            Solicitar meu acesso
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m13 5 7 7-7 7" />
            </svg>
          </Link>
          <Link href="/login" className="btn-ghost">
            Já sou membro
          </Link>
        </div>

        <div
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-up"
          style={{ animationDelay: "360ms" }}
        >
          <FeatureCard
            title="Acesso curado"
            description="Cada membro é aprovado manualmente. Comunidade densa, sem ruído."
            icon={
              <path d="M9 12l2 2 4-4m5.5-2A9.5 9.5 0 1 1 2.5 12 9.5 9.5 0 0 1 21.5 10z" />
            }
          />
          <FeatureCard
            title="Conteúdo evolutivo"
            description="Aulas e atualizações constantes — você assiste no seu ritmo."
            icon={<path d="m22 8-10 6L2 8m20 0v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8" />}
          />
          <FeatureCard
            title="Segurança em camadas"
            description="Autenticação e autorização rígidas, sem brechas para o acaso."
            icon={
              <path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z" />
            }
          />
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-white/40">
        © {new Date().getFullYear()} Membros. Todos os direitos reservados.
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card-glass p-6 text-left">
      <div className="h-11 w-11 rounded-xl grid place-items-center bg-gradient-to-br from-marine-deep to-navy-deep border border-marine/40 mb-4">
        <svg
          className="h-5 w-5 text-marine-mint"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon}
        </svg>
      </div>
      <h3 className="font-display text-lg font-semibold text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-white/65 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
