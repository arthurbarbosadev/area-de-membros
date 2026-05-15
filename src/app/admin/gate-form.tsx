"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

export function AdminGateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(e.currentTarget);
    const secret = String(data.get("secret") ?? "");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });

    if (!res.ok) {
      setLoading(false);
      setError("Chave inválida.");
      return;
    }
    router.replace("/admin/console");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-7 space-y-4">
      <div>
        <label className="label" htmlFor="secret">
          Chave secreta
        </label>
        <input
          id="secret"
          name="secret"
          type="password"
          required
          autoComplete="off"
          autoFocus
          className="input-glow font-mono tracking-wider"
          placeholder="••••••••••••••••"
        />
      </div>
      {error && (
        <div className="text-sm text-rose-300/90 bg-rose-950/30 border border-rose-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Verificando…" : "Entrar"}
      </Button>
    </form>
  );
}
