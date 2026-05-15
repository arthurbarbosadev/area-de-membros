"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

type Status = "idle" | "loading" | "success" | "error";

export function SignupForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const data = new FormData(e.currentTarget);
    const fullName = String(data.get("full_name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim().toLowerCase();

    if (fullName.length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setStatus("error");
      setMessage("Verifique nome e e-mail.");
      return;
    }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(body?.error ?? "Não foi possível enviar agora.");
        return;
      }

      setStatus("success");
      setMessage(
        "Recebemos sua solicitação! Você receberá um e-mail assim que for aprovado.",
      );
      e.currentTarget.reset();
    } catch {
      setStatus("error");
      setMessage("Falha de rede. Tente novamente em instantes.");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-6 rounded-xl border border-marine/40 bg-marine-deep/30 p-5 text-sm text-marine-mint">
        <strong className="block font-display text-base text-white mb-1">
          Solicitação enviada
        </strong>
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-7 space-y-4">
      <div>
        <label className="label" htmlFor="full_name">
          Nome completo
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          className="input-glow"
          placeholder="Como devemos te chamar?"
        />
      </div>

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

      {status === "error" && (
        <div className="text-sm text-rose-300/90 bg-rose-950/30 border border-rose-500/20 rounded-lg px-3 py-2">
          {message}
        </div>
      )}

      <Button type="submit" disabled={status === "loading"} className="w-full">
        {status === "loading" ? "Enviando…" : "Enviar solicitação"}
      </Button>
    </form>
  );
}
