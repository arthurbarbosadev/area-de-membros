"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "error";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/dashboard";
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
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
      setError("E-mail ou senha incorretos.");
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-7 space-y-4">
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

      <p className="text-xs text-white/40 text-center pt-2">
        Esqueceu a senha? Peça um novo link para o admin da turma.
      </p>
    </form>
  );
}
