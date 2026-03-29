"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatBRL } from "@/lib/calculations";
import { formatDate } from "@/lib/utils";
import { History, Trash2, Calculator } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Simulation {
  id: string;
  nome_simulacao: string | null;
  custo_variavel: number | null;
  custo_fixo_rateado: number | null;
  deslocamento: number;
  taxa_pagamento: number;
  reserva_reposicao: number;
  lucro_desejado: number;
  preco_minimo: number | null;
  preco_ideal: number | null;
  created_at: string;
  service_types: { nome_servico: string } | null;
}

export function HistoricoClient({ simulations: initial }: { simulations: Simulation[] }) {
  const [simulations, setSimulations] = useState(initial);

  async function deleteSim(id: string) {
    if (!confirm("Excluir esta simulação?")) return;
    const supabase = createClient();
    await supabase.from("simulations").delete().eq("id", id);
    setSimulations((prev) => prev.filter((s) => s.id !== id));
    toast.success("Simulação excluída.");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-medium text-[var(--foreground)]">Histórico</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">{simulations.length} simulação{simulations.length !== 1 ? "ões" : ""} salva{simulations.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/app/calculadora" className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] text-sm text-[var(--muted)] rounded-[var(--radius)] hover:border-[var(--silver)] hover:text-[var(--foreground)] transition-all">
          <Calculator className="h-4 w-4" />
          Nova simulação
        </Link>
      </div>

      {simulations.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <History className="h-10 w-10 text-[var(--muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--muted)] mb-3">Nenhuma simulação salva ainda.</p>
          <Link href="/app/calculadora" className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)]">
            <Calculator className="h-4 w-4" />
            Criar primeira simulação
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {simulations.map((s) => (
            <div key={s.id} className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--border-light)] transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--foreground)] truncate">
                    {s.nome_simulacao ?? "Simulação sem nome"}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="text-xs text-[var(--muted)]">{formatDate(s.created_at)}</span>
                    {s.service_types && (
                      <span className="text-xs text-[var(--muted)]">· {s.service_types.nome_servico}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3">
                    {s.custo_variavel !== null && (
                      <div>
                        <p className="text-xs text-[var(--muted)]">Custo variável</p>
                        <p className="text-sm text-[var(--foreground)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatBRL(Number(s.custo_variavel))}</p>
                      </div>
                    )}
                    {s.custo_fixo_rateado !== null && (
                      <div>
                        <p className="text-xs text-[var(--muted)]">Custo fixo rateado</p>
                        <p className="text-sm text-[var(--foreground)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatBRL(Number(s.custo_fixo_rateado))}</p>
                      </div>
                    )}
                    {s.lucro_desejado > 0 && (
                      <div>
                        <p className="text-xs text-[var(--muted)]">Lucro desejado</p>
                        <p className="text-sm text-[var(--foreground)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatBRL(Number(s.lucro_desejado))}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-[var(--muted)]">Preço mínimo</p>
                    <p className="text-sm text-[var(--foreground)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.preco_minimo ? formatBRL(Number(s.preco_minimo)) : "—"}</p>
                    <p className="text-xs text-[var(--muted)] mt-2">Preço ideal</p>
                    <p className="text-base font-medium text-[var(--silver)] shimmer" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.preco_ideal ? formatBRL(Number(s.preco_ideal)) : "—"}</p>
                  </div>
                  <button onClick={() => deleteSim(s.id)} className="p-1.5 text-[var(--muted)] hover:text-[#fca5a5] hover:bg-[var(--background)] rounded transition-colors mt-0.5">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
