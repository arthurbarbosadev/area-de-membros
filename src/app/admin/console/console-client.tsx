"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

type SignupRequest = {
  id: string;
  full_name: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

type AllowedEmail = { email: string; added_at: string };

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  module: string | null;
  position: number;
  created_at: string;
};

type Tab = "requests" | "members" | "lessons";

export function ConsoleClient({
  initialRequests,
  initialAllowed,
  initialLessons,
}: {
  initialRequests: SignupRequest[];
  initialAllowed: AllowedEmail[];
  initialLessons: Lesson[];
}) {
  const [tab, setTab] = useState<Tab>("requests");
  const [toast, setToast] = useState<string>("");

  const pendingCount = useMemo(
    () => initialRequests.filter((r) => r.status === "pending").length,
    [initialRequests],
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Console
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Gerencie aprovações de acesso, membros liberados e aulas.
          </p>
        </div>
        <div className="flex items-center gap-2 p-1 rounded-xl bg-ink-900 border border-white/5">
          <TabButton active={tab === "requests"} onClick={() => setTab("requests")}>
            Solicitações
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-marine-mint text-ink-950 text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </TabButton>
          <TabButton active={tab === "members"} onClick={() => setTab("members")}>
            Membros
          </TabButton>
          <TabButton active={tab === "lessons"} onClick={() => setTab("lessons")}>
            Aulas
          </TabButton>
        </div>
      </div>

      {toast && (
        <div className="mt-6 chip chip-warn">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
          {toast}
        </div>
      )}

      <div className="mt-8">
        {tab === "requests" && (
          <RequestsPanel
            initial={initialRequests}
            onToast={setToast}
          />
        )}
        {tab === "members" && (
          <MembersPanel
            initial={initialAllowed}
            onToast={setToast}
          />
        )}
        {tab === "lessons" && (
          <LessonsPanel
            initial={initialLessons}
            onToast={setToast}
          />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-sm font-medium px-4 py-2 rounded-lg transition flex items-center ${
        active
          ? "bg-gradient-to-br from-marine to-navy text-white shadow"
          : "text-white/60 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------------- Requests panel ----------------------------------- */

function RequestsPanel({
  initial,
  onToast,
}: {
  initial: SignupRequest[];
  onToast: (msg: string) => void;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string>("");

  async function act(id: string, action: "approve" | "reject") {
    setBusyId(id);
    const res = await fetch(`/api/admin/requests/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusyId("");
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      onToast(body?.error ?? "Falha na ação.");
      return;
    }
    setItems((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: action === "approve" ? "approved" : "rejected" }
          : r,
      ),
    );
    onToast(action === "approve" ? "Acesso aprovado e e-mail enviado." : "Solicitação rejeitada.");
    startTransition(() => router.refresh());
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nenhuma solicitação"
        description="Quando alguém solicitar acesso, aparece aqui."
      />
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((r) => (
        <div
          key={r.id}
          className="card-glass p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
        >
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-lg font-semibold">
                {r.full_name}
              </span>
              <StatusBadge status={r.status} />
            </div>
            <div className="text-sm text-white/55 mt-1">
              {r.email} · {new Date(r.created_at).toLocaleString("pt-BR")}
            </div>
          </div>
          {r.status === "pending" ? (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => act(r.id, "reject")}
                disabled={pending || busyId === r.id}
              >
                Rejeitar
              </Button>
              <Button
                onClick={() => act(r.id, "approve")}
                disabled={pending || busyId === r.id}
              >
                {busyId === r.id ? "Aprovando…" : "Aprovar e enviar acesso"}
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: SignupRequest["status"] }) {
  if (status === "approved") return <span className="chip">Aprovado</span>;
  if (status === "rejected") return <span className="chip chip-error">Rejeitado</span>;
  return <span className="chip chip-warn">Pendente</span>;
}

/* ---------------- Members panel (allowed_emails) -------------------- */

function MembersPanel({
  initial,
  onToast,
}: {
  initial: AllowedEmail[];
  onToast: (msg: string) => void;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, full_name: name }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      onToast(body?.error ?? "Falha ao liberar.");
      return;
    }
    setItems((prev) => [
      { email: email.toLowerCase(), added_at: new Date().toISOString() },
      ...prev.filter((p) => p.email !== email.toLowerCase()),
    ]);
    setEmail("");
    setName("");
    onToast("Membro liberado e convite enviado.");
    router.refresh();
  }

  async function remove(targetEmail: string) {
    if (!confirm(`Remover acesso de ${targetEmail}?`)) return;
    const res = await fetch("/api/admin/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      onToast(body?.error ?? "Falha ao remover.");
      return;
    }
    setItems((prev) => prev.filter((p) => p.email !== targetEmail));
    onToast("Acesso revogado.");
    router.refresh();
  }

  return (
    <div className="grid gap-8">
      <div className="card-glass p-6">
        <h3 className="font-display text-lg font-semibold">
          Liberar acesso direto
        </h3>
        <p className="text-sm text-white/55 mt-1">
          Adiciona o e-mail à allow-list e envia um convite (sem precisar de
          uma solicitação anterior).
        </p>
        <form onSubmit={add} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            maxLength={80}
            required
            className="input-glow"
          />
          <input
            type="email"
            placeholder="email@membro.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-glow"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Liberando…" : "Liberar"}
          </Button>
        </form>
      </div>

      {items.length === 0 ? (
        <EmptyState title="Nenhum membro liberado" description="Adicione acima." />
      ) : (
        <div className="card-glass overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/60 text-white/55">
              <tr>
                <th className="text-left px-5 py-3 font-medium">E-mail</th>
                <th className="text-left px-5 py-3 font-medium">Liberado em</th>
                <th className="text-right px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.email} className="border-t border-white/5">
                  <td className="px-5 py-3 font-mono text-white/85">
                    {item.email}
                  </td>
                  <td className="px-5 py-3 text-white/55">
                    {new Date(item.added_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => remove(item.email)}
                      className="text-rose-300/80 hover:text-rose-200 text-sm"
                    >
                      Revogar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------- Lessons panel ------------------------------------ */

function LessonsPanel({
  initial,
  onToast,
}: {
  initial: Lesson[];
  onToast: (msg: string) => void;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get("title") ?? "").trim(),
      description: String(fd.get("description") ?? "").trim() || null,
      module: String(fd.get("module") ?? "").trim() || "Geral",
      video_url: String(fd.get("video_url") ?? "").trim() || null,
      thumbnail_url: String(fd.get("thumbnail_url") ?? "").trim() || null,
      position: Number(fd.get("position") ?? 0),
    };
    const res = await fetch("/api/admin/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      onToast(body?.error ?? "Falha ao criar aula.");
      return;
    }
    setItems((prev) => [body.lesson as Lesson, ...prev]);
    (e.target as HTMLFormElement).reset();
    onToast("Aula criada.");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remover essa aula?")) return;
    const res = await fetch(`/api/admin/lessons/${id}`, { method: "DELETE" });
    if (!res.ok) {
      onToast("Falha ao remover.");
      return;
    }
    setItems((prev) => prev.filter((l) => l.id !== id));
    onToast("Aula removida.");
    router.refresh();
  }

  return (
    <div className="grid gap-8">
      <div className="card-glass p-6">
        <h3 className="font-display text-lg font-semibold">Nova aula</h3>
        <form onSubmit={create} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Título</label>
            <input
              name="title"
              required
              minLength={2}
              maxLength={140}
              className="input-glow"
              placeholder="Ex: Introdução ao módulo"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Descrição</label>
            <textarea
              name="description"
              rows={3}
              className="input-glow resize-none"
              placeholder="O que essa aula cobre?"
            />
          </div>
          <div>
            <label className="label">Módulo</label>
            <input
              name="module"
              defaultValue="Geral"
              className="input-glow"
              placeholder="Geral"
            />
          </div>
          <div>
            <label className="label">Posição</label>
            <input
              name="position"
              type="number"
              defaultValue={0}
              className="input-glow"
            />
          </div>
          <div>
            <label className="label">URL do vídeo</label>
            <input
              name="video_url"
              type="url"
              className="input-glow"
              placeholder="https://…"
            />
          </div>
          <div>
            <label className="label">Thumbnail (URL)</label>
            <input
              name="thumbnail_url"
              type="url"
              className="input-glow"
              placeholder="https://…"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando…" : "Publicar aula"}
            </Button>
          </div>
        </form>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Nenhuma aula publicada"
          description="Crie a primeira no formulário acima."
        />
      ) : (
        <div className="grid gap-3">
          {items.map((l) => (
            <div
              key={l.id}
              className="card-glass p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-lg font-semibold">
                    {l.title}
                  </span>
                  <span className="chip">{l.module ?? "Geral"}</span>
                  <span className="chip">pos {l.position}</span>
                </div>
                {l.description && (
                  <p className="text-sm text-white/55 mt-1 line-clamp-2">
                    {l.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {l.video_url && (
                  <a
                    href={l.video_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-ghost text-sm py-2"
                  >
                    Abrir
                  </a>
                )}
                <button
                  onClick={() => remove(l.id)}
                  className="text-rose-300/80 hover:text-rose-200 text-sm"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- helpers ------------------------------------------ */

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="card-glass p-10 text-center">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="text-sm text-white/55 mt-1">{description}</p>
    </div>
  );
}
