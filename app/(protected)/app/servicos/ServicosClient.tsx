"use client";
import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserProduct } from "@/lib/supabase/types";
import { formatBRL, calcCustoVariavel } from "@/lib/calculations";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Scissors, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ServiceItem { id?: string; product_id: string; quantidade_uso: number; user_products?: UserProduct; }
interface Service { id: string; nome_servico: string; duracao_media: number | null; ativo: boolean; service_items: ServiceItem[]; }
interface Props { services: Service[]; products: UserProduct[]; userId: string; }

export function ServicosClient({ services: initial, products, userId }: Props) {
  const [services, setServices] = useState(initial);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [nome, setNome] = useState("");
  const [duracao, setDuracao] = useState<number | "">(60);
  const [items, setItems] = useState<{ product_id: string; quantidade_uso: number }[]>([{ product_id: "", quantidade_uso: 1 }]);
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setEditing(null);
    setNome(""); setDuracao(60);
    setItems([{ product_id: "", quantidade_uso: 1 }]);
    setModal(true);
  }

  function openEdit(s: Service) {
    setEditing(s);
    setNome(s.nome_servico);
    setDuracao(s.duracao_media ?? 60);
    setItems(s.service_items.map((i) => ({ product_id: i.product_id, quantidade_uso: i.quantidade_uso })));
    setModal(true);
  }

  function addItem() { setItems((p) => [...p, { product_id: "", quantidade_uso: 1 }]); }
  function updateItem(idx: number, field: string, val: string | number) {
    setItems((p) => p.map((x, i) => i === idx ? { ...x, [field]: val } : x));
  }
  function removeItem(idx: number) { setItems((p) => p.filter((_, i) => i !== idx)); }

  const previewCusto = useMemo(() => {
    const lines = items.filter((l) => l.product_id && l.quantidade_uso > 0).map((l) => {
      const prod = products.find((p) => p.id === l.product_id);
      if (!prod) return null;
      return { custo_por_uso: Number(prod.custo_por_uso), quantidade_usada: l.quantidade_uso };
    }).filter(Boolean) as { custo_por_uso: number; quantidade_usada: number }[];
    return calcCustoVariavel(lines);
  }, [items, products]);

  async function save() {
    if (!nome.trim()) { toast.error("Informe o nome do serviço."); return; }
    setLoading(true);
    const supabase = createClient();

    if (editing) {
      await supabase.from("service_types").update({ nome_servico: nome, duracao_media: duracao || null }).eq("id", editing.id);
      await supabase.from("service_items").delete().eq("service_type_id", editing.id);
      const validItems = items.filter((i) => i.product_id);
      if (validItems.length > 0) {
        const prod_map = Object.fromEntries(products.map((p) => [p.id, Number(p.custo_por_uso)]));
        await supabase.from("service_items").insert(validItems.map((i) => ({
          service_type_id: editing.id,
          product_id: i.product_id,
          quantidade_uso: i.quantidade_uso,
          custo_calculado: prod_map[i.product_id] * i.quantidade_uso,
        })));
      }
      toast.success("Serviço atualizado!");
    } else {
      const { data: newService, error } = await supabase.from("service_types").insert({ user_id: userId, nome_servico: nome, duracao_media: duracao || null }).select().single();
      if (error || !newService) { toast.error("Erro ao criar serviço."); setLoading(false); return; }
      const validItems = items.filter((i) => i.product_id);
      if (validItems.length > 0) {
        const prod_map = Object.fromEntries(products.map((p) => [p.id, Number(p.custo_por_uso)]));
        await supabase.from("service_items").insert(validItems.map((i) => ({
          service_type_id: newService.id,
          product_id: i.product_id,
          quantidade_uso: i.quantidade_uso,
          custo_calculado: prod_map[i.product_id] * i.quantidade_uso,
        })));
      }
      toast.success("Serviço criado!");
    }

    // Refresh
    const { data: updated } = await supabase.from("service_types").select("*, service_items(*, user_products(*))").eq("user_id", userId).order("created_at", { ascending: false });
    if (updated) setServices(updated as Service[]);
    setModal(false);
    setLoading(false);
  }

  async function deleteService(id: string) {
    if (!confirm("Excluir este serviço?")) return;
    const supabase = createClient();
    await supabase.from("service_items").delete().eq("service_type_id", id);
    await supabase.from("service_types").delete().eq("id", id);
    setServices((prev) => prev.filter((s) => s.id !== id));
    toast.success("Serviço excluído.");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-medium text-[var(--foreground)]">Serviços</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Defina os tipos de atendimento e os produtos utilizados</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors">
          <Plus className="h-4 w-4" />
          Novo serviço
        </button>
      </div>

      {services.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <Scissors className="h-10 w-10 text-[var(--muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--muted)] mb-3">Nenhum serviço cadastrado ainda.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)]">
            <Plus className="h-4 w-4" />
            Criar primeiro serviço
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((s) => {
            const custo = calcCustoVariavel(
              s.service_items
                .filter((i) => i.user_products)
                .map((i) => ({ custo_por_uso: Number(i.user_products!.custo_por_uso), quantidade_usada: i.quantidade_uso }))
            );
            return (
              <div key={s.id} className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-[var(--foreground)]">{s.nome_servico}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      {s.duracao_media && (
                        <span className="text-xs text-[var(--muted)]">{s.duracao_media} min</span>
                      )}
                      <span className="text-xs text-[var(--muted)]">{s.service_items.length} produto{s.service_items.length !== 1 ? "s" : ""}</span>
                      <Badge variant={s.ativo ? "active" : "inactive"}>{s.ativo ? "Ativo" : "Inativo"}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-[var(--muted)]">Custo variável</p>
                      <p className="text-sm font-medium text-[var(--silver)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatBRL(custo)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteService(s.id)} className="p-1.5 rounded text-[var(--muted)] hover:text-[#fca5a5] hover:bg-[var(--background)]">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                {s.service_items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap gap-2">
                    {s.service_items.filter(i => i.user_products).map((item) => (
                      <span key={item.id} className="badge badge-silver">
                        {item.user_products!.nome} × {item.quantidade_uso} {item.user_products!.unidade}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-display font-medium text-[var(--foreground)]">
                {editing ? "Editar serviço" : "Novo serviço"}
              </h2>
              <button onClick={() => setModal(false)}><X className="h-5 w-5 text-[var(--muted)]" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Nome do serviço *</label>
                  <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Maquiagem Social Completa" className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Duração (min)</label>
                  <input type="number" min="0" value={duracao} onChange={(e) => setDuracao(e.target.value ? Number(e.target.value) : "")} placeholder="60" className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--silver)] focus:outline-none" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Produtos utilizados</label>
                  <button onClick={addItem} className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--silver)]">
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar
                  </button>
                </div>
                {items.map((item, idx) => {
                  const prod = products.find((p) => p.id === item.product_id);
                  return (
                    <div key={idx} className="flex gap-2 items-center">
                      <select value={item.product_id} onChange={(e) => updateItem(idx, "product_id", e.target.value)} className="flex-1 h-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-2 text-xs text-[var(--foreground)] focus:border-[var(--silver)] focus:outline-none">
                        <option value="">Selecionar produto</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                      </select>
                      <input type="number" min="0.001" step="0.001" value={item.quantidade_uso} onChange={(e) => updateItem(idx, "quantidade_uso", Number(e.target.value))} className="w-16 h-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-2 text-xs text-[var(--foreground)] focus:border-[var(--silver)] focus:outline-none" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
                      <span className="text-xs text-[var(--muted)] w-4">{prod?.unidade}</span>
                      <button onClick={() => removeItem(idx)} className="text-[var(--muted)] hover:text-[#fca5a5]"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  );
                })}
              </div>

              {previewCusto > 0 && (
                <div className="rounded-[var(--radius)] border border-[rgba(212,212,212,0.2)] bg-[rgba(212,212,212,0.04)] px-4 py-3 flex items-center justify-between">
                  <span className="text-xs text-[var(--muted)]">Custo variável estimado</span>
                  <span className="text-lg font-medium shimmer" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatBRL(previewCusto)}
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(false)} className="flex-1 h-9 border border-[var(--border)] text-sm text-[var(--muted)] rounded-[var(--radius)] hover:border-[var(--border-light)] hover:text-[var(--foreground)] transition-all">Cancelar</button>
                <button onClick={save} disabled={loading} className="flex-1 h-9 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors disabled:opacity-50">
                  {loading ? "Salvando..." : editing ? "Salvar" : "Criar serviço"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
