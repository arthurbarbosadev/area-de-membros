"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SetPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");

    if (password.length < 8) {
      setLoading(false);
      setError("Mínimo de 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setLoading(false);
      setError("As senhas não batem.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-7 space-y-4">
      <div>
        <label className="label" htmlFor="password">
          Nova senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="input-glow"
          placeholder="Mínimo 8 caracteres"
        />
      </div>

      <div>
        <label className="label" htmlFor="confirm">
          Confirme a senha
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="input-glow"
          placeholder="Digite de novo"
        />
      </div>

      {error && (
        <div className="text-sm text-rose-300/90 bg-rose-950/30 border border-rose-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Salvando…" : "Salvar e entrar"}
      </Button>
    </form>
  );
}
