"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserProduct } from "@/lib/supabase/types";
import { CATEGORIAS_PRODUTO, UNIDADES } from "@/lib/utils";
import { calcCustoPorUso, formatBRL } from "@/lib/calculations";
import { Plus, Package, Pencil, Trash2, X, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  nome: z.string().min(1, "Obrigatório"),
  marca: z.string().optional(),
  categoria: z.string().min(1, "Obrigatório"),
  valor_pago: z.coerce.number().positive("Deve ser positivo"),
  volume: z.coerce.number().positive("Deve ser positivo"),
  unidade: z.string().min(1, "Obrigatório"),
  rendimento_estimado: z.coerce.number().positive("Deve ser positivo"),
});
type FormData = z.infer<typeof schema>;

interface Props { products: UserProduct[]; userId: string; }

export function ProdutosClient({ products: initial, userId }: Props) {
  const router = useRouter();
  const [products, setProducts] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserProduct | null>(null);
  const [catFilter, setCatFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormData, any, FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { unidade: "ml", rendimento_estimado: 1 },
  });

  const valorPago = watch("valor_pago") ?? 0;
  const rendimento = watch("rendimento_estimado") ?? 1;
  const previewCusto = rendimento > 0 ? calcCustoPorUso(Number(valorPago), Number(rendimento)) : 0;

  function openCreate() {
    setEditing(null);
    reset({ unidade: "ml", rendimento_estimado: 1 });
    setModalOpen(true);
  }

  function openEdit(p: UserProduct) {
    setEditing(p);
    reset({
      nome: p.nome,
      marca: p.marca ?? "",
      categoria: p.categoria,
      valor_pago: p.valor_pago,
      volume: p.volume,
      unidade: p.unidade,
      rendimento_estimado: p.rendimento_estimado,
    });
    setModalOpen(true);
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    const supabase = createClient();
    if (editing) {
      const { error } = await supabase.from("user_products").update({
        ...data, updated_at: new Date().toISOString(),
      }).eq("id", editing.id);
      if (error) { toast.error("Erro ao atualizar."); setLoading(false); return; }
      toast.success("Produto atualizado!");
    } else {
      const { error } = await supabase.from("user_products").insert({ ...data, user_id: userId });
      if (error) { toast.error("Erro ao cadastrar."); setLoading(false); return; }
      toast.success("Produto cadastrado!");
    }
    setModalOpen(false);
    setLoading(false);
    router.refresh();
    // Refresh list
    const { data: updated } = await supabase.from("user_products").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (updated) setProducts(updated);
  }

  async function toggleAtivo(p: UserProduct) {
    const supabase = createClient();
    await supabase.from("user_products").update({ ativo: !p.ativo }).eq("id", p.id);
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, ativo: !x.ativo } : x));
    toast.success(p.ativo ? "Produto inativado." : "Produto ativado.");
  }

  async function deleteProduct(id: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    const supabase = createClient();
    await supabase.from("user_products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Produto excluído.");
  }

  const filtered = catFilter ? products.filter((p) => p.categoria === catFilter) : products;
  const categories = [...new Set(products.map((p) => p.categoria))].sort();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-medium text-[var(--foreground)]">Produtos</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">{products.length} produto{products.length !== 1 ? "s" : ""} cadastrado{products.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo produto
        </button>
      </div>

      {/* Filters */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCatFilter("")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition-all ${
              !catFilter ? "border-[var(--silver)] text-[var(--silver)] bg-[rgba(212,212,212,0.06)]" : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-light)]"
            }`}
          >
            <Filter className="h-3 w-3" />
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat === catFilter ? "" : cat)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                catFilter === cat ? "border-[var(--silver)] text-[var(--silver)] bg-[rgba(212,212,212,0.06)]" : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-light)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <Package className="h-10 w-10 text-[var(--muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--muted)] mb-3">Nenhum produto cadastrado ainda.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)]">
            <Plus className="h-4 w-4" />
            Cadastrar primeiro produto
          </button>
        </div>
      ) : (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Produto</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--muted)] uppercase tracking-wide hidden sm:table-cell">Categoria</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--muted)] uppercase tracking-wide hidden md:table-cell">Volume</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Custo/uso</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--muted)] uppercase tracking-wide hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--foreground)]">{p.nome}</p>
                      {p.marca && <p className="text-xs text-[var(--muted)]">{p.marca}</p>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="badge badge-silver">{p.categoria}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-[var(--muted)]">
                      {p.volume} {p.unidade}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[var(--silver)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatBRL(Number(p.custo_por_uso))}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant={p.ativo ? "active" : "inactive"}>
                        {p.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => toggleAtivo(p)} className="p-1.5 rounded text-[var(--muted)] hover:text-[var(--silver)] hover:bg-[var(--background)] transition-colors text-xs">
                          {p.ativo ? "Inativar" : "Ativar"}
                        </button>
                        <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded text-[var(--muted)] hover:text-[#fca5a5] hover:bg-[var(--background)] transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-display font-medium text-[var(--foreground)]">
                {editing ? "Editar produto" : "Novo produto"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Nome *</label>
                  <input {...register("nome")} placeholder="Ex: Base líquida HD" className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none" />
                  {errors.nome && <p className="text-xs text-[#fca5a5]">{errors.nome.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Marca</label>
                  <input {...register("marca")} placeholder="MAC, NYX..." className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Categoria *</label>
                  <select {...register("categoria")} className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--silver)] focus:outline-none">
                    <option value="">Selecionar</option>
                    {CATEGORIAS_PRODUTO.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.categoria && <p className="text-xs text-[#fca5a5]">{errors.categoria.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Valor pago (R$) *</label>
                  <input {...register("valor_pago")} type="number" step="0.01" min="0" placeholder="89.90" className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
                  {errors.valor_pago && <p className="text-xs text-[#fca5a5]">{errors.valor_pago.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Volume total *</label>
                  <div className="flex gap-2">
                    <input {...register("volume")} type="number" step="0.1" min="0" placeholder="30" className="flex-1 h-9 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
                    <select {...register("unidade")} className="w-20 h-9 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-2 text-sm text-[var(--foreground)] focus:border-[var(--silver)] focus:outline-none">
                      {UNIDADES.map((u) => <option key={u.value} value={u.value}>{u.value}</option>)}
                    </select>
                  </div>
                  {errors.volume && <p className="text-xs text-[#fca5a5]">{errors.volume.message}</p>}
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Rendimento estimado (nº de usos) *</label>
                  <input {...register("rendimento_estimado")} type="number" min="1" placeholder="Ex: 60 (usos por embalagem)" className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
                  {errors.rendimento_estimado && <p className="text-xs text-[#fca5a5]">{errors.rendimento_estimado.message}</p>}
                </div>
              </div>

              {/* Preview */}
              {previewCusto > 0 && (
                <div className="rounded-[var(--radius)] border border-[rgba(212,212,212,0.2)] bg-[rgba(212,212,212,0.04)] px-4 py-3 flex items-center justify-between">
                  <span className="text-xs text-[var(--muted)]">Custo por uso calculado</span>
                  <span className="text-lg font-medium text-[var(--silver)] shimmer" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatBRL(previewCusto)}
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 h-9 border border-[var(--border)] text-sm text-[var(--muted)] rounded-[var(--radius)] hover:border-[var(--border-light)] hover:text-[var(--foreground)] transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 h-9 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors disabled:opacity-50">
                  {loading ? "Salvando..." : editing ? "Salvar alterações" : "Cadastrar produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
