"use client";

import { useRouter } from "next/navigation";

export function AdminLogout() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin");
    router.refresh();
  }
  return (
    <button onClick={logout} className="btn-ghost text-sm py-2 px-3">
      Sair
    </button>
  );
}
