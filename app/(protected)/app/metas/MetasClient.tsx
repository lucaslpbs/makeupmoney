"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/supabase/types";
import { formatBRL, calcAtendimentosNecessarios } from "@/lib/calculations";
import { toast } from "sonner";
import { Target, TrendingUp, Calculator } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  profile: Profile | null;
  totalFixedCosts: number;
  avgPrecoIdeal: number;
  avgLucro: number;
  userId: string;
}

export function MetasClient({ profile, totalFixedCosts, avgPrecoIdeal, avgLucro, userId }: Props) {
  const [meta, setMeta] = useState(String(profile?.meta_mensal ?? ""));
  const [atendimentos, setAtendimentos] = useState(profile?.atendimentos_mes ?? 20);
  const [saving, setSaving] = useState(false);

  const metaNum = Number(meta) || 0;
  const lucroEstimado = avgLucro > 0 ? avgLucro : Math.max(0, avgPrecoIdeal - totalFixedCosts / atendimentos);
  const atendNecessarios = calcAtendimentosNecessarios(metaNum, lucroEstimado);
  const projecaoAtual = avgPrecoIdeal * atendimentos;
  const progressPct = metaNum > 0 ? Math.min(100, Math.round((projecaoAtual / metaNum) * 100)) : 0;

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({
      meta_mensal: metaNum || null,
      atendimentos_mes: atendimentos,
      updated_at: new Date().toISOString(),
    }).eq("id", userId);
    if (error) { toast.error("Erro ao salvar."); setSaving(false); return; }
    toast.success("Meta atualizada!");
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-medium text-[var(--foreground)]">Metas Financeiras</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Defina sua meta e veja quantos atendimentos você precisa fazer</p>
      </div>

      {/* Inputs */}
      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
        <h2 className="text-sm font-display font-medium text-[var(--foreground)]">Configurar meta</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Meta mensal (R$)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">R$</span>
              <input
                type="number"
                min="0"
                step="100"
                value={meta}
                onChange={(e) => setMeta(e.target.value)}
                placeholder="5000"
                className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Atendimentos / mês</label>
            <input
              type="number"
              min="1"
              max="200"
              value={atendimentos}
              onChange={(e) => setAtendimentos(Number(e.target.value))}
              className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--silver)] focus:outline-none"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>
        </div>
        <button onClick={save} disabled={saving} className="h-9 px-5 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors disabled:opacity-50">
          {saving ? "Salvando..." : "Salvar meta"}
        </button>
      </div>

      {/* Results */}
      {metaNum > 0 && (
        <div className="space-y-4">
          {/* Progress */}
          <div className="rounded-[var(--radius)] border border-[rgba(212,212,212,0.2)] bg-[rgba(212,212,212,0.02)] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[var(--silver)]" />
                <span className="text-sm font-medium text-[var(--foreground)]">Progresso da meta</span>
              </div>
              <span className={`text-sm font-medium ${progressPct >= 100 ? "text-[#86efac]" : "text-[var(--muted)]"}`}>
                {progressPct}%
              </span>
            </div>
            <Progress value={progressPct} className="h-2 mb-3" />
            <div className="flex justify-between text-xs text-[var(--muted)]">
              <span>Projeção: {formatBRL(projecaoAtual)}</span>
              <span>Meta: {formatBRL(metaNum)}</span>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-2">Atendimentos necessários</p>
              <p className="text-3xl font-medium text-[var(--foreground)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {lucroEstimado > 0 ? atendNecessarios : "—"}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">para atingir {formatBRL(metaNum)}</p>
            </div>
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-2">Ticket médio sugerido</p>
              <p className="text-3xl font-medium text-[var(--silver)] shimmer" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {avgPrecoIdeal > 0 ? formatBRL(avgPrecoIdeal) : "—"}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">baseado nas suas simulações</p>
            </div>
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-2">Lucro estimado / atend.</p>
              <p className="text-3xl font-medium text-[var(--foreground)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {lucroEstimado > 0 ? formatBRL(lucroEstimado) : "—"}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">com seu ticket atual</p>
            </div>
          </div>

          {/* Insight */}
          {atendNecessarios > atendimentos && (
            <div className="rounded-[var(--radius)] border border-[rgba(252,165,165,0.2)] bg-[rgba(127,29,29,0.15)] p-4 flex gap-3 items-start">
              <TrendingUp className="h-4 w-4 text-[#fca5a5] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-[var(--foreground)] font-medium">Você precisa aumentar seus preços ou atendimentos</p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Com o ticket atual de {formatBRL(avgPrecoIdeal)}, você precisaria de {atendNecessarios} atendimentos,
                  mas está fazendo apenas {atendimentos}. Considere aumentar seu preço ou otimizar seus custos.
                </p>
              </div>
            </div>
          )}

          {atendNecessarios <= atendimentos && atendNecessarios > 0 && (
            <div className="rounded-[var(--radius)] border border-[rgba(134,239,172,0.2)] bg-[rgba(20,83,45,0.15)] p-4 flex gap-3 items-start">
              <Calculator className="h-4 w-4 text-[#86efac] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-[var(--foreground)] font-medium">Sua meta está ao alcance!</p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Fazendo {atendNecessarios} atendimentos ao mês com o ticket de {formatBRL(avgPrecoIdeal)}, você atinge sua meta de {formatBRL(metaNum)}.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {metaNum === 0 && (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <Target className="h-10 w-10 text-[var(--muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--muted)]">Defina uma meta financeira mensal para ver as projeções.</p>
        </div>
      )}
    </div>
  );
}
