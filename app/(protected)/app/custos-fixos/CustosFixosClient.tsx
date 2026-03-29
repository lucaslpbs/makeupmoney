"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FixedCost } from "@/lib/supabase/types";
import { CATEGORIAS_CUSTO_FIXO } from "@/lib/utils";
import { formatBRL } from "@/lib/calculations";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, DollarSign, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  categoria: z.string().min(1, "Obrigatório"),
  descricao: z.string().min(1, "Obrigatório"),
  valor_mensal: z.coerce.number().positive("Deve ser positivo"),
});
type FormData = z.infer<typeof schema>;

interface Props { costs: FixedCost[]; userId: string; atendimentosMes: number; }

export function CustosFixosClient({ costs: initial, userId, atendimentosMes }: Props) {
  const [costs, setCosts] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FixedCost | null>(null);
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData, any, FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { categoria: "Aluguel" },
  });

  const total = costs.filter((c) => c.ativo).reduce((sum, c) => sum + Number(c.valor_mensal), 0);
  const porAtendimento = atendimentosMes > 0 ? total / atendimentosMes : 0;

  function openCreate() {
    setEditing(null);
    reset({ categoria: "Aluguel", descricao: "", valor_mensal: 0 });
    setModalOpen(true);
  }

  function openEdit(c: FixedCost) {
    setEditing(c);
    reset({ categoria: c.categoria, descricao: c.descricao, valor_mensal: c.valor_mensal });
    setModalOpen(true);
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    const supabase = createClient();
    if (editing) {
      const { error } = await supabase.from("fixed_costs").update(data).eq("id", editing.id);
      if (error) { toast.error("Erro ao atualizar."); setLoading(false); return; }
      setCosts((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...data } : c));
      toast.success("Custo atualizado!");
    } else {
      const { data: inserted, error } = await supabase.from("fixed_costs").insert({ ...data, user_id: userId }).select().single();
      if (error || !inserted) { toast.error("Erro ao cadastrar."); setLoading(false); return; }
      setCosts((prev) => [...prev, inserted]);
      toast.success("Custo cadastrado!");
    }
    setModalOpen(false);
    setLoading(false);
  }

  async function deleteCost(id: string) {
    if (!confirm("Excluir este custo fixo?")) return;
    const supabase = createClient();
    await supabase.from("fixed_costs").delete().eq("id", id);
    setCosts((prev) => prev.filter((c) => c.id !== id));
    toast.success("Custo removido.");
  }

  async function toggleAtivo(c: FixedCost) {
    const supabase = createClient();
    await supabase.from("fixed_costs").update({ ativo: !c.ativo }).eq("id", c.id);
    setCosts((prev) => prev.map((x) => x.id === c.id ? { ...x, ativo: !x.ativo } : x));
    toast.success(c.ativo ? "Custo inativado." : "Custo ativado.");
  }

  const byCategory = costs.reduce<Record<string, FixedCost[]>>((acc, c) => {
    (acc[c.categoria] = acc[c.categoria] || []).push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-medium text-[var(--foreground)]">Custos Fixos</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Despesas mensais do seu negócio</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors">
          <Plus className="h-4 w-4" />
          Novo custo
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius)] border border-[rgba(212,212,212,0.3)] bg-[rgba(212,212,212,0.03)] p-4">
          <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-2">Total mensal</p>
          <p className="text-2xl font-medium shimmer" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {formatBRL(total)}
          </p>
        </div>
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">Por atendimento</p>
          <p className="text-2xl font-medium text-[var(--foreground)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {formatBRL(porAtendimento)}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">com {atendimentosMes} atend./mês</p>
        </div>
      </div>

      {/* Cost list by category */}
      {costs.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <DollarSign className="h-10 w-10 text-[var(--muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--muted)] mb-3">Nenhum custo fixo cadastrado.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)]">
            <Plus className="h-4 w-4" />
            Adicionar primeiro custo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat} className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]">
                <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">{cat}</span>
                <span className="text-xs text-[var(--muted)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatBRL(items.filter(i => i.ativo).reduce((s, i) => s + Number(i.valor_mensal), 0))}
                </span>
              </div>
              {items.map((c) => (
                <div key={c.id} className={`flex items-center justify-between px-4 py-3 border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors ${!c.ativo ? "opacity-50" : ""}`}>
                  <div>
                    <p className="text-sm text-[var(--foreground)]">{c.descricao}</p>
                    <Badge variant={c.ativo ? "active" : "inactive"} className="mt-1">{c.ativo ? "Ativo" : "Inativo"}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[var(--foreground)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {formatBRL(Number(c.valor_mensal))}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => toggleAtivo(c)} className="p-1.5 rounded text-[var(--muted)] hover:text-[var(--silver)] hover:bg-[var(--background)] text-xs">
                        {c.ativo ? "Inativar" : "Ativar"}
                      </button>
                      <button onClick={() => deleteCost(c.id)} className="p-1.5 rounded text-[var(--muted)] hover:text-[#fca5a5] hover:bg-[var(--background)]">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-display font-medium text-[var(--foreground)]">
                {editing ? "Editar custo" : "Novo custo fixo"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Categoria *</label>
                <select {...register("categoria")} className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--silver)] focus:outline-none">
                  {CATEGORIAS_CUSTO_FIXO.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.categoria && <p className="text-xs text-[#fca5a5]">{errors.categoria.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Descrição *</label>
                <input {...register("descricao")} placeholder="Ex: Aluguel do espaço" className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none" />
                {errors.descricao && <p className="text-xs text-[#fca5a5]">{errors.descricao.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Valor mensal (R$) *</label>
                <input {...register("valor_mensal")} type="number" step="0.01" min="0" placeholder="1500.00" className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
                {errors.valor_mensal && <p className="text-xs text-[#fca5a5]">{errors.valor_mensal.message}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 h-9 border border-[var(--border)] text-sm text-[var(--muted)] rounded-[var(--radius)] hover:border-[var(--border-light)] hover:text-[var(--foreground)] transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 h-9 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors disabled:opacity-50">
                  {loading ? "Salvando..." : editing ? "Salvar" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
