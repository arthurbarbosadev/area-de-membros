"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "error" | "magic-sent";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/dashboard";
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [usePassword, setUsePassword] = useState(true);

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");

    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (err) {
      setStatus("error");
      setError("Credenciais inválidas ou acesso ainda não liberado.");
      return;
    }
    router.replace(next);
    router.refresh();
  }

  async function handleMagic(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();

    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (err) {
      setStatus("error");
      setError("Não foi possível enviar o link. Verifique o e-mail.");
      return;
    }
    setStatus("magic-sent");
  }

  if (status === "magic-sent") {
    return (
      <div className="mt-6 rounded-xl border border-marine/40 bg-marine-deep/30 p-5 text-sm text-marine-mint">
        <strong className="block font-display text-base text-white mb-1">
          Link enviado
        </strong>
        Confira sua caixa de entrada e clique no link para entrar.
      </div>
    );
  }

  return (
    <div className="mt-7">
      <div className="flex gap-2 p-1 rounded-xl bg-ink-900 border border-white/5 mb-5">
        <button
          type="button"
          onClick={() => setUsePassword(true)}
          className={`flex-1 text-sm font-medium py-2 rounded-lg transition ${
            usePassword
              ? "bg-gradient-to-br from-marine to-navy text-white shadow"
              : "text-white/60 hover:text-white"
          }`}
        >
          Senha
        </button>
        <button
          type="button"
          onClick={() => setUsePassword(false)}
          className={`flex-1 text-sm font-medium py-2 rounded-lg transition ${
            !usePassword
              ? "bg-gradient-to-br from-marine to-navy text-white shadow"
              : "text-white/60 hover:text-white"
          }`}
        >
          Link mágico
        </button>
      </div>

      {usePassword ? (
        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input-glow"
              placeholder="voce@exemplo.com"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              className="input-glow"
              placeholder="Sua senha"
            />
          </div>
          {error && (
            <div className="text-sm text-rose-300/90 bg-rose-950/30 border border-rose-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <Button type="submit" disabled={status === "loading"} className="w-full">
            {status === "loading" ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleMagic} className="space-y-4">
          <div>
            <label className="label" htmlFor="email-magic">
              E-mail
            </label>
            <input
              id="email-magic"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input-glow"
              placeholder="voce@exemplo.com"
            />
          </div>
          {error && (
            <div className="text-sm text-rose-300/90 bg-rose-950/30 border border-rose-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <Button type="submit" disabled={status === "loading"} className="w-full">
            {status === "loading" ? "Enviando…" : "Enviar link mágico"}
          </Button>
        </form>
      )}
    </div>
  );
}
