"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DfsProduct } from "@/lib/supabase/types";
import { CATEGORIAS_PRODUTO, UNIDADES } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import Link from "next/link";

export function AdminBibliotecaClient({ products: initial }: { products: DfsProduct[] }) {
  const [products, setProducts] = useState(initial);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<DfsProduct | null>(null);
  const [form, setForm] = useState({ nome: "", marca: "", categoria: "Base", volume: "", unidade: "ml", rendimento_medio: "" });
  const [loading, setLoading] = useState(false);

  function openCreate() { setEditing(null); setForm({ nome: "", marca: "", categoria: "Base", volume: "", unidade: "ml", rendimento_medio: "" }); setModal(true); }
  function openEdit(p: DfsProduct) {
    setEditing(p);
    setForm({ nome: p.nome, marca: p.marca ?? "", categoria: p.categoria, volume: String(p.volume ?? ""), unidade: p.unidade ?? "ml", rendimento_medio: String(p.rendimento_medio ?? "") });
    setModal(true);
  }

  async function save() {
    if (!form.nome.trim()) { toast.error("Nome é obrigatório."); return; }
    setLoading(true);
    const supabase = createClient();
    const payload = {
      nome: form.nome,
      marca: form.marca || null,
      categoria: form.categoria,
      volume: form.volume ? Number(form.volume) : null,
      unidade: form.unidade,
      rendimento_medio: form.rendimento_medio ? Number(form.rendimento_medio) : null,
    };

    if (editing) {
      const { error } = await supabase.from("dfs_products").update(payload).eq("id", editing.id);
      if (error) { toast.error("Erro."); setLoading(false); return; }
      setProducts((prev) => prev.map((p) => p.id === editing.id ? { ...p, ...payload } : p));
      toast.success("Produto atualizado!");
    } else {
      const { data: inserted, error } = await supabase.from("dfs_products").insert(payload).select().single();
      if (error || !inserted) { toast.error("Erro."); setLoading(false); return; }
      setProducts((prev) => [...prev, inserted]);
      toast.success("Produto adicionado!");
    }
    setModal(false);
    setLoading(false);
  }

  async function deleteProduct(id: string) {
    if (!confirm("Excluir?")) return;
    const supabase = createClient();
    await supabase.from("dfs_products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Excluído.");
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <nav className="flex items-center justify-between px-6 h-14 border-b border-[#2A2A2A] bg-[#0A0A0A]">
        <div className="flex items-center gap-3">
          <span className="text-lg font-display shimmer font-semibold">MakeUpMoney</span>
          <span className="text-xs text-[#7A7A7A] uppercase tracking-widest">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-sm text-[#7A7A7A] hover:text-[#F5F5F5]">Dashboard</Link>
          <Link href="/admin/usuarios" className="text-sm text-[#7A7A7A] hover:text-[#F5F5F5]">Usuários</Link>
        </div>
      </nav>

      <main className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-medium text-[#F5F5F5]">Biblioteca MakeUpMoney</h1>
            <p className="text-sm text-[#7A7A7A] mt-0.5">{products.length} produtos cadastrados</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F5] text-[#0A0A0A] text-sm font-medium rounded-[0.5rem] hover:bg-[#D4D4D4] transition-colors">
            <Plus className="h-4 w-4" />
            Novo produto
          </button>
        </div>

        <div className="rounded-[0.5rem] border border-[#2A2A2A] bg-[#141414] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                <th className="text-left px-4 py-3 text-xs font-medium text-[#7A7A7A] uppercase tracking-wide">Produto</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#7A7A7A] uppercase tracking-wide hidden sm:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#7A7A7A] uppercase tracking-wide hidden md:table-cell">Volume</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-[#2A2A2A] last:border-0 hover:bg-[#1A1A1A] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#F5F5F5]">{p.nome}</p>
                    {p.marca && <p className="text-xs text-[#7A7A7A]">{p.marca}</p>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-[#7A7A7A]">{p.categoria}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-[#7A7A7A]">{p.volume ? `${p.volume}${p.unidade}` : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-[#7A7A7A] hover:text-[#F5F5F5] hover:bg-[#0A0A0A] rounded">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-[#7A7A7A] hover:text-[#fca5a5] hover:bg-[#0A0A0A] rounded">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative w-full max-w-md bg-[#141414] border border-[#2A2A2A] rounded-[0.5rem] p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-display font-medium text-[#F5F5F5]">{editing ? "Editar" : "Novo"} produto</h2>
              <button onClick={() => setModal(false)}><X className="h-5 w-5 text-[#7A7A7A]" /></button>
            </div>
            <div className="space-y-3">
              {[
                { key: "nome", label: "Nome *", placeholder: "Base líquida" },
                { key: "marca", label: "Marca", placeholder: "MAC" },
              ].map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <label className="text-xs font-medium text-[#7A7A7A] uppercase tracking-wide">{f.label}</label>
                  <input value={form[f.key as keyof typeof form]} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} className="flex h-9 w-full rounded-[0.5rem] border border-[#2A2A2A] bg-[#0A0A0A] px-3 text-sm text-[#F5F5F5] placeholder:text-[#7A7A7A] focus:border-[#C0C0C0] focus:outline-none" />
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#7A7A7A] uppercase tracking-wide">Categoria</label>
                <select value={form.categoria} onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))} className="flex h-9 w-full rounded-[0.5rem] border border-[#2A2A2A] bg-[#0A0A0A] px-3 text-sm text-[#F5F5F5] focus:border-[#C0C0C0] focus:outline-none">
                  {CATEGORIAS_PRODUTO.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#7A7A7A] uppercase tracking-wide">Volume</label>
                  <input type="number" value={form.volume} onChange={(e) => setForm((p) => ({ ...p, volume: e.target.value }))} placeholder="30" className="flex h-9 w-full rounded-[0.5rem] border border-[#2A2A2A] bg-[#0A0A0A] px-3 text-sm text-[#F5F5F5] focus:border-[#C0C0C0] focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#7A7A7A] uppercase tracking-wide">Unidade</label>
                  <select value={form.unidade} onChange={(e) => setForm((p) => ({ ...p, unidade: e.target.value }))} className="flex h-9 w-full rounded-[0.5rem] border border-[#2A2A2A] bg-[#0A0A0A] px-3 text-sm text-[#F5F5F5] focus:border-[#C0C0C0] focus:outline-none">
                    {UNIDADES.map((u) => <option key={u.value} value={u.value}>{u.value}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#7A7A7A] uppercase tracking-wide">Rendimento médio (usos)</label>
                <input type="number" value={form.rendimento_medio} onChange={(e) => setForm((p) => ({ ...p, rendimento_medio: e.target.value }))} placeholder="60" className="flex h-9 w-full rounded-[0.5rem] border border-[#2A2A2A] bg-[#0A0A0A] px-3 text-sm text-[#F5F5F5] focus:border-[#C0C0C0] focus:outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(false)} className="flex-1 h-9 border border-[#2A2A2A] text-sm text-[#7A7A7A] rounded-[0.5rem] hover:border-[#333] hover:text-[#F5F5F5] transition-all">Cancelar</button>
                <button onClick={save} disabled={loading} className="flex-1 h-9 bg-[#F5F5F5] text-[#0A0A0A] text-sm font-medium rounded-[0.5rem] hover:bg-[#D4D4D4] transition-colors disabled:opacity-50">
                  {loading ? "Salvando..." : editing ? "Salvar" : "Adicionar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
