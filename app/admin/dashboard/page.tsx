import { IS_MOCK, MOCK_CLIENTS, MOCK_SUBSCRIPTION } from "@/lib/mock-data";
import { formatBRL } from "@/lib/calculations";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Users, CreditCard, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage() {
  let totalUsers = 5;
  let activeSubs = 4;
  let mrr = 4 * 59.9;
  let recentUsers = [
    { id: "u1", nome_profissional: "Larissa Mendes", created_at: "2025-03-15T10:00:00Z" },
    { id: "u2", nome_profissional: "Amanda Costa", created_at: "2025-03-12T10:00:00Z" },
    { id: "u3", nome_profissional: "Carla Santos", created_at: "2025-03-10T10:00:00Z" },
    { id: "u4", nome_profissional: "Julia Pereira", created_at: "2025-03-05T10:00:00Z" },
    { id: "u5", nome_profissional: "Mariana Lima", created_at: "2025-02-28T10:00:00Z" },
  ];

  if (!IS_MOCK) {
    const { createClient } = await import("@/lib/supabase/server");
    const { redirect } = await import("next/navigation");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/admin/login");
    const [{ count }, { data: subs }, { data: users }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("subscriptions").select("plano, status, valor").eq("status", "ativo"),
      supabase.from("profiles").select("id, nome_profissional, created_at").order("created_at", { ascending: false }).limit(10),
    ]);
    totalUsers = count ?? 0;
    activeSubs = subs?.length ?? 0;
    mrr = (subs ?? []).reduce((sum, s) => sum + Number(s.valor ?? 0), 0);
    recentUsers = (users ?? []) as typeof recentUsers;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <nav className="flex items-center justify-between px-6 h-14 border-b border-[#2A2A2A] bg-[#0A0A0A]">
        <div className="flex items-center gap-3">
          <span className="text-lg font-display shimmer font-semibold">MakeUpMoney</span>
          <span className="text-xs text-[#7A7A7A] uppercase tracking-widest">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          {[
            { href: "/admin/dashboard", label: "Dashboard" },
            { href: "/admin/usuarios", label: "Usuários" },
            { href: "/admin/biblioteca", label: "Biblioteca" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-[#7A7A7A] hover:text-[#F5F5F5] transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-display font-medium text-[#F5F5F5]">Dashboard Admin</h1>
          <p className="text-sm text-[#7A7A7A] mt-0.5">Visão geral da plataforma MakeUpMoney</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Total de usuários", value: String(totalUsers), icon: Users },
            { label: "Assinaturas ativas", value: String(activeSubs), icon: CreditCard },
            { label: "MRR estimado", value: formatBRL(mrr), icon: TrendingUp },
          ].map((m) => (
            <div key={m.label} className="rounded-[0.5rem] border border-[#2A2A2A] bg-[#141414] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#7A7A7A] uppercase tracking-wide">{m.label}</span>
                <m.icon className="h-4 w-4 text-[#7A7A7A]" />
              </div>
              <p className="text-2xl font-medium text-[#F5F5F5]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[0.5rem] border border-[#2A2A2A] bg-[#141414] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2A2A2A]">
            <h2 className="text-sm font-medium text-[#F5F5F5]">Usuários recentes</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                <th className="text-left px-4 py-3 text-xs font-medium text-[#7A7A7A] uppercase tracking-wide">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#7A7A7A] uppercase tracking-wide hidden sm:table-cell">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id} className="border-b border-[#2A2A2A] last:border-0 hover:bg-[#1A1A1A] transition-colors">
                  <td className="px-4 py-3 text-[#F5F5F5]">{u.nome_profissional ?? "—"}</td>
                  <td className="px-4 py-3 text-[#7A7A7A] hidden sm:table-cell">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
