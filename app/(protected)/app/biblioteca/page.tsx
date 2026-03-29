import { MOCK_DFS_PRODUCTS, IS_MOCK } from "@/lib/mock-data";
import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";

export default async function BibliotecaPage() {
  let products = MOCK_DFS_PRODUCTS;

  if (!IS_MOCK) {
    const { createClient } = await import("@/lib/supabase/server");
    const { redirect } = await import("next/navigation");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const { data } = await supabase.from("dfs_products").select("*").eq("ativo", true).order("categoria").order("nome");
    products = (data ?? []) as typeof MOCK_DFS_PRODUCTS;
  }

  const byCategory = products.reduce<Record<string, typeof products>>((acc, p) => {
    (acc[p.categoria] = acc[p.categoria] || []).push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-medium text-[var(--foreground)]">Biblioteca MakeUpMoney</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Produtos padrão disponíveis para adicionar à sua carteira</p>
        </div>
        <Link href="/app/produtos" className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] text-sm text-[var(--muted)] rounded-[var(--radius)] hover:border-[var(--silver)] hover:text-[var(--foreground)] transition-all">
          Meus produtos
        </Link>
      </div>

      <div className="space-y-4">
        {Object.entries(byCategory).map(([cat, items]) => (
          <div key={cat} className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--background)]">
              <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">{cat}</span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {items.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-hover)] transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{p.nome}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {p.marca && <span className="text-xs text-[var(--muted)]">{p.marca}</span>}
                      {p.volume && <span className="text-xs text-[var(--muted)]">{p.volume}{p.unidade}</span>}
                      {p.rendimento_medio && <span className="text-xs text-[var(--muted)]">· ~{p.rendimento_medio} usos</span>}
                    </div>
                  </div>
                  <Link
                    href={`/app/produtos?from_library=${p.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[var(--border)] text-[var(--muted)] rounded-[var(--radius)] hover:border-[var(--silver)] hover:text-[var(--foreground)] transition-all"
                  >
                    <Plus className="h-3 w-3" />
                    Adicionar
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
