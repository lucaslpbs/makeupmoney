"use client";
import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserProduct } from "@/lib/supabase/types";
import { calcSimulacao, formatBRL } from "@/lib/calculations";
import { toast } from "sonner";
import { Plus, Trash2, Calculator, Save, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface ServiceWithItems {
  id: string;
  nome_servico: string;
  service_items: Array<{
    id: string;
    quantidade_uso: number;
    user_products: UserProduct;
  }>;
}

interface ProductLine {
  product_id: string;
  quantidade: number;
}

interface Props {
  userId: string;
  products: UserProduct[];
  services: ServiceWithItems[];
  totalFixedCosts: number;
  atendimentosMes: number;
}

const saveSchema = z.object({ nome_simulacao: z.string().min(1, "Dê um nome para a simulação") });

export function CalculadoraClient({ userId, products, services, totalFixedCosts, atendimentosMes }: Props) {
  const [selectedService, setSelectedService] = useState<string>("");
  const [lines, setLines] = useState<ProductLine[]>([{ product_id: "", quantidade: 1 }]);
  const [extras, setExtras] = useState({
    deslocamento: 0,
    taxa_pagamento_percentual: 0,
    reserva_reposicao: 0,
    lucro_desejado: 0,
  });
  const [saveModal, setSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(saveSchema) });

  function loadService(serviceId: string) {
    setSelectedService(serviceId);
    if (!serviceId) return;
    const svc = services.find((s) => s.id === serviceId);
    if (!svc) return;
    setLines(
      svc.service_items.map((item) => {
        const prod = item.user_products;
        const isVolumetric = prod.volume > 0 && (prod.unidade === "ml" || prod.unidade === "g");
        // Convert from "uses" to native unit (ml/g) so the input makes sense to the user
        const quantidade = isVolumetric
          ? item.quantidade_uso * (Number(prod.volume) / Number(prod.rendimento_estimado))
          : item.quantidade_uso;
        return { product_id: prod.id, quantidade };
      })
    );
  }

  function addLine() {
    setLines((prev) => [...prev, { product_id: "", quantidade: 1 }]);
  }

  function updateLine(idx: number, field: keyof ProductLine, value: string | number) {
    setLines((prev) => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  }

  function removeLine(idx: number) {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  const simulation = useMemo(() => {
    const produtoLines = lines
      .filter((l) => l.product_id && l.quantidade > 0)
      .map((l) => {
        const prod = products.find((p) => p.id === l.product_id);
        if (!prod) return null;
        const isVolumetric = Number(prod.volume) > 0 && (prod.unidade === "ml" || prod.unidade === "g");
        // For ml/g products: cost = (valor_pago / volume) × quantidade
        // For unit products: cost = custo_por_uso × quantidade (uses)
        const custo_por_uso = isVolumetric
          ? Number(prod.valor_pago) / Number(prod.volume)
          : Number(prod.custo_por_uso);
        return {
          custo_por_uso,
          quantidade_usada: Number(l.quantidade),
        };
      })
      .filter(Boolean) as { custo_por_uso: number; quantidade_usada: number }[];

    return calcSimulacao({
      produtos: produtoLines,
      total_custos_fixos_mensais: totalFixedCosts,
      atendimentos_mes_previstos: atendimentosMes,
      ...extras,
    });
  }, [lines, extras, products, totalFixedCosts, atendimentosMes]);

  async function onSave(data: { nome_simulacao: string }) {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("simulations").insert({
      user_id: userId,
      service_type_id: selectedService || null,
      nome_simulacao: data.nome_simulacao,
      custo_variavel: simulation.custo_variavel,
      custo_fixo_rateado: simulation.custo_fixo_rateado,
      deslocamento: extras.deslocamento,
      taxa_pagamento: extras.taxa_pagamento_percentual,
      reserva_reposicao: extras.reserva_reposicao,
      lucro_desejado: extras.lucro_desejado,
      preco_minimo: simulation.preco_minimo,
      preco_ideal: simulation.preco_ideal,
    });
    if (error) { toast.error("Erro ao salvar simulação."); setSaving(false); return; }
    toast.success("Simulação salva!");
    setSaveModal(false);
    reset();
    setSaving(false);
  }

  const Row = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <div className={`flex justify-between items-center py-2.5 border-b border-[var(--border)] last:border-0 ${highlight ? "pt-4 border-t border-[var(--border)]" : ""}`}>
      <span className={`text-sm ${highlight ? "text-[var(--foreground)] font-medium" : "text-[var(--muted)]"}`}>{label}</span>
      <span
        className={highlight ? "text-lg font-medium shimmer" : "text-sm text-[var(--foreground)]"}
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-display font-medium text-[var(--foreground)]">Calculadora</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Simule o preço ideal para seu atendimento</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Inputs */}
        <div className="space-y-4">
          {/* Service selector */}
          {services.length > 0 && (
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2">
              <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">
                Carregar tipo de serviço
              </label>
              <select
                value={selectedService}
                onChange={(e) => loadService(e.target.value)}
                className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--silver)] focus:outline-none"
              >
                <option value="">— montar manualmente —</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.nome_servico}</option>
                ))}
              </select>
            </div>
          )}

          {/* Products */}
          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-[var(--foreground)]">Produtos usados</h2>
              <button onClick={addLine} className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--silver)] transition-colors">
                <Plus className="h-3.5 w-3.5" />
                Adicionar
              </button>
            </div>

            {lines.length === 0 && (
              <p className="text-xs text-[var(--muted)] py-4 text-center">
                Adicione os produtos utilizados no atendimento.
              </p>
            )}

            {lines.map((line, idx) => {
              const prod = products.find((p) => p.id === line.product_id);
              const isVolumetric = prod && Number(prod.volume) > 0 && (prod.unidade === "ml" || prod.unidade === "g");
              const custoPorUnidade = prod && isVolumetric
                ? Number(prod.valor_pago) / Number(prod.volume)
                : prod ? Number(prod.custo_por_uso) : 0;
              const inputStep = isVolumetric ? "0.1" : "1";
              const inputMin = isVolumetric ? "0.01" : "1";
              return (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1.5">
                    <select
                      value={line.product_id}
                      onChange={(e) => updateLine(idx, "product_id", e.target.value)}
                      className="flex h-8 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-2 text-xs text-[var(--foreground)] focus:border-[var(--silver)] focus:outline-none"
                    >
                      <option value="">Selecionar produto</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.nome} {p.marca ? `(${p.marca})` : ""}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="number"
                          min={inputMin}
                          step={inputStep}
                          value={line.quantidade}
                          onChange={(e) => updateLine(idx, "quantidade", Number(e.target.value))}
                          className="w-20 h-7 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-2 text-xs text-[var(--foreground)] focus:border-[var(--silver)] focus:outline-none"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        />
                        <span className="text-xs text-[var(--muted)]">{prod?.unidade ?? "un"}</span>
                      </div>
                      {prod && (
                        <span className="text-xs text-[var(--silver)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          = {formatBRL(custoPorUnidade * line.quantidade)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => removeLine(idx)} className="p-1 mt-1 text-[var(--muted)] hover:text-[#fca5a5]">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Extras */}
          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
            <h2 className="text-sm font-medium text-[var(--foreground)]">Outros custos</h2>

            {[
              { key: "deslocamento", label: "Deslocamento (R$)", placeholder: "0.00", suffix: "R$" },
              { key: "taxa_pagamento_percentual", label: "Taxa de pagamento (%)", placeholder: "0", suffix: "%" },
              { key: "reserva_reposicao", label: "Reserva de reposição (R$)", placeholder: "0.00", suffix: "R$" },
              { key: "lucro_desejado", label: "Lucro desejado (R$)", placeholder: "0.00", suffix: "R$" },
            ].map((field) => (
              <div key={field.key} className="flex items-center gap-3">
                <label className="flex-1 text-xs text-[var(--muted)]">{field.label}</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={extras[field.key as keyof typeof extras] || ""}
                    onChange={(e) => setExtras((prev) => ({ ...prev, [field.key]: Number(e.target.value) }))}
                    placeholder={field.placeholder}
                    className="w-28 h-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-2 text-xs text-[var(--foreground)] text-right focus:border-[var(--silver)] focus:outline-none"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Results */}
        <div className="space-y-4">
          <div className="rounded-[var(--radius)] border border-[rgba(212,212,212,0.2)] bg-[rgba(212,212,212,0.02)] p-5 sticky top-8">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-4 w-4 text-[var(--silver)]" />
              <h2 className="text-sm font-display font-medium text-[var(--foreground)]">Resultado</h2>
            </div>

            <div>
              <Row label="Custo variável (produtos)" value={formatBRL(simulation.custo_variavel)} />
              <Row label="Custo fixo rateado" value={formatBRL(simulation.custo_fixo_rateado)} />
              {simulation.custo_deslocamento > 0 && (
                <Row label="Deslocamento" value={formatBRL(simulation.custo_deslocamento)} />
              )}
              {simulation.custo_taxa_pagamento > 0 && (
                <Row label="Taxa de pagamento" value={formatBRL(simulation.custo_taxa_pagamento)} />
              )}
              {simulation.custo_reserva_reposicao > 0 && (
                <Row label="Reserva de reposição" value={formatBRL(simulation.custo_reserva_reposicao)} />
              )}
              <Row label="Custo total" value={formatBRL(simulation.custo_total)} />
            </div>

            <div className="mt-4 space-y-3">
              {/* Preço mínimo */}
              <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-4 py-3">
                <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">Preço mínimo</p>
                <p className="text-xl font-medium text-[var(--foreground)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatBRL(simulation.preco_minimo)}
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5">Abaixo deste valor você terá prejuízo</p>
              </div>

              {/* Preço ideal */}
              <div className="rounded-[var(--radius)] border border-[rgba(212,212,212,0.3)] bg-[rgba(212,212,212,0.05)] px-4 py-4">
                <p className="text-xs text-[var(--silver)] uppercase tracking-wide mb-1">Preço ideal</p>
                <p className="text-3xl font-medium shimmer" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatBRL(simulation.preco_ideal)}
                </p>
                {simulation.lucro_por_atendimento > 0 && (
                  <p className="text-xs text-[#86efac] mt-1">
                    + {formatBRL(simulation.lucro_por_atendimento)} de lucro por atendimento
                  </p>
                )}
              </div>
            </div>

            {totalFixedCosts === 0 && (
              <div className="mt-3 flex gap-2 items-start p-3 rounded-[var(--radius)] border border-[rgba(212,212,212,0.15)] bg-[rgba(212,212,212,0.04)]">
                <Info className="h-3.5 w-3.5 text-[var(--muted)] mt-0.5 shrink-0" />
                <p className="text-xs text-[var(--muted)]">
                  Você não tem custos fixos cadastrados. Adicione-os para um cálculo mais preciso.
                </p>
              </div>
            )}

            <button
              onClick={() => setSaveModal(true)}
              className="w-full mt-4 flex items-center justify-center gap-2 h-9 border border-[var(--border)] text-sm text-[var(--muted)] rounded-[var(--radius)] hover:border-[var(--silver)] hover:text-[var(--foreground)] transition-all"
            >
              <Save className="h-4 w-4" />
              Salvar simulação
            </button>
          </div>
        </div>
      </div>

      {/* Save modal */}
      {saveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSaveModal(false)} />
          <div className="relative w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 animate-fade-in">
            <h2 className="text-lg font-display font-medium text-[var(--foreground)] mb-4">Salvar simulação</h2>
            <form onSubmit={handleSubmit(onSave)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Nome da simulação</label>
                <input
                  {...register("nome_simulacao")}
                  placeholder="Ex: Make de noiva completa"
                  className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none"
                />
                {errors.nome_simulacao && (
                  <p className="text-xs text-[#fca5a5]">{errors.nome_simulacao.message as string}</p>
                )}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setSaveModal(false)} className="flex-1 h-9 border border-[var(--border)] text-sm text-[var(--muted)] rounded-[var(--radius)] hover:border-[var(--border-light)] hover:text-[var(--foreground)] transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 h-9 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors disabled:opacity-50">
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
