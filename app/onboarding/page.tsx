"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { TIPOS_ATUACAO, CATEGORIAS_CUSTO_FIXO } from "@/lib/utils";
import { Check, Plus, Trash2 } from "lucide-react";

const STEPS = ["Perfil", "Atuação", "Frequência", "Meta", "Custos fixos"];

interface FixedCostItem { categoria: string; descricao: string; valor: string; }

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    nome_profissional: "",
    cidade: "",
    tipo_atuacao: "",
    atendimentos_mes: 20,
    meta_mensal: "",
  });
  const [custos, setCustos] = useState<FixedCostItem[]>([
    { categoria: "Aluguel", descricao: "Aluguel do espaço", valor: "" },
  ]);

  function update(field: string, value: string | number) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function addCusto() {
    setCustos((prev) => [...prev, { categoria: "Outros", descricao: "", valor: "" }]);
  }

  function updateCusto(idx: number, field: keyof FixedCostItem, value: string) {
    setCustos((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  }

  function removeCusto(idx: number) {
    setCustos((prev) => prev.filter((_, i) => i !== idx));
  }

  async function finish() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      nome_profissional: data.nome_profissional,
      cidade: data.cidade,
      tipo_atuacao: data.tipo_atuacao,
      atendimentos_mes: data.atendimentos_mes,
      meta_mensal: data.meta_mensal ? Number(data.meta_mensal) : null,
      updated_at: new Date().toISOString(),
    });
    if (profileError) { toast.error("Erro ao salvar perfil."); setLoading(false); return; }

    const validCustos = custos.filter((c) => c.descricao && Number(c.valor) > 0);
    if (validCustos.length > 0) {
      await supabase.from("fixed_costs").insert(
        validCustos.map((c) => ({
          user_id: user.id,
          categoria: c.categoria,
          descricao: c.descricao,
          valor_mensal: Number(c.valor),
        }))
      );
    }

    // Create trial subscription
    await supabase.from("subscriptions").insert({
      user_id: user.id,
      plano: "profissional",
      status: "ativo",
      gateway: "trial",
      valor: 0,
      periodicidade: "mensal",
      inicio: new Date().toISOString(),
      fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    toast.success("Perfil configurado! Seja bem-vinda ao MakeUpMoney.");
    router.push("/app/dashboard");
  }

  const canNext = () => {
    if (step === 0) return data.nome_profissional.trim().length > 0;
    if (step === 1) return data.tipo_atuacao !== "";
    if (step === 2) return data.atendimentos_mes > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-3xl font-display shimmer font-semibold">MakeUpMoney</span>
          <p className="text-xs text-[var(--muted)] mt-1 uppercase tracking-widest">Studio</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-1.5 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs border transition-all ${
                i < step
                  ? "bg-[var(--silver)] border-[var(--silver)] text-[var(--background)]"
                  : i === step
                  ? "border-[var(--silver)] text-[var(--silver)]"
                  : "border-[var(--border)] text-[var(--muted)]"
              }`}>
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-px transition-all ${i < step ? "bg-[var(--silver)]" : "bg-[var(--border)]"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
          {/* Step 0 — Perfil */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-display font-medium text-[var(--foreground)]">Como quer ser chamada?</h2>
                <p className="text-sm text-[var(--muted)] mt-1">Seu nome profissional aparecerá no painel.</p>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Nome profissional</label>
                  <input
                    value={data.nome_profissional}
                    onChange={(e) => update("nome_profissional", e.target.value)}
                    placeholder="Ex: Maria Lima"
                    className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Cidade</label>
                  <input
                    value={data.cidade}
                    onChange={(e) => update("cidade", e.target.value)}
                    placeholder="São Paulo, SP"
                    className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Atuação */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-display font-medium text-[var(--foreground)]">Qual é o seu tipo de atuação?</h2>
                <p className="text-sm text-[var(--muted)] mt-1">Isso nos ajuda a personalizar suas sugestões.</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {TIPOS_ATUACAO.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => update("tipo_atuacao", t.value)}
                    className={`flex items-center justify-between px-4 py-3 rounded-[var(--radius)] border text-sm text-left transition-all ${
                      data.tipo_atuacao === t.value
                        ? "border-[var(--silver)] bg-[rgba(212,212,212,0.06)] text-[var(--foreground)]"
                        : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-light)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {t.label}
                    {data.tipo_atuacao === t.value && <Check className="h-4 w-4 text-[var(--silver)]" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Frequência */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-display font-medium text-[var(--foreground)]">Quantos atendimentos faz por mês?</h2>
                <p className="text-sm text-[var(--muted)] mt-1">Usamos isso para calcular o custo fixo por atendimento.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Atendimentos / mês</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={data.atendimentos_mes}
                  onChange={(e) => update("atendimentos_mes", Number(e.target.value))}
                  className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--silver)] focus:outline-none"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[10, 15, 20, 30, 40].map((n) => (
                  <button
                    key={n}
                    onClick={() => update("atendimentos_mes", n)}
                    className={`px-3 py-1.5 rounded-[var(--radius)] border text-sm transition-all ${
                      data.atendimentos_mes === n
                        ? "border-[var(--silver)] text-[var(--silver)] bg-[rgba(212,212,212,0.06)]"
                        : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-light)]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Meta */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-display font-medium text-[var(--foreground)]">Qual é a sua meta mensal?</h2>
                <p className="text-sm text-[var(--muted)] mt-1">Quanto você quer faturar por mês com maquiagem?</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Meta (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={data.meta_mensal}
                    onChange={(e) => update("meta_mensal", e.target.value)}
                    placeholder="5000"
                    className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[3000, 5000, 8000, 10000, 15000].map((n) => (
                  <button
                    key={n}
                    onClick={() => update("meta_mensal", String(n))}
                    className={`px-3 py-1.5 rounded-[var(--radius)] border text-sm transition-all ${
                      data.meta_mensal === String(n)
                        ? "border-[var(--silver)] text-[var(--silver)] bg-[rgba(212,212,212,0.06)]"
                        : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-light)]"
                    }`}
                  >
                    R$ {(n / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — Custos fixos */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-display font-medium text-[var(--foreground)]">Seus custos fixos mensais</h2>
                <p className="text-sm text-[var(--muted)] mt-1">Pode pular e adicionar depois. Isso é importante para precificar corretamente.</p>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {custos.map((c, i) => (
                  <div key={i} className="flex gap-2 items-start p-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)]">
                    <div className="flex-1 space-y-2">
                      <select
                        value={c.categoria}
                        onChange={(e) => updateCusto(i, "categoria", e.target.value)}
                        className="flex h-8 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--foreground)] focus:border-[var(--silver)] focus:outline-none"
                      >
                        {CATEGORIAS_CUSTO_FIXO.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <input
                          value={c.descricao}
                          onChange={(e) => updateCusto(i, "descricao", e.target.value)}
                          placeholder="Descrição"
                          className="flex-1 h-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none"
                        />
                        <input
                          type="number"
                          value={c.valor}
                          onChange={(e) => updateCusto(i, "valor", e.target.value)}
                          placeholder="R$"
                          className="w-20 h-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        />
                      </div>
                    </div>
                    <button onClick={() => removeCusto(i)} className="p-1 text-[var(--muted)] hover:text-[#fca5a5] mt-1">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addCusto}
                className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--silver)] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Adicionar custo
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--border)]">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 h-9 border border-[var(--border)] text-sm text-[var(--muted)] rounded-[var(--radius)] hover:border-[var(--border-light)] hover:text-[var(--foreground)] transition-all"
              >
                Voltar
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="flex-1 h-9 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors disabled:opacity-40"
              >
                Continuar
              </button>
            ) : (
              <button
                onClick={finish}
                disabled={loading}
                className="flex-1 h-9 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Começar agora"}
              </button>
            )}
          </div>

          {step < STEPS.length - 1 && (
            <button
              onClick={() => step === STEPS.length - 2 ? setStep(STEPS.length - 1) : setStep((s) => s + 1)}
              className="w-full mt-2 text-xs text-[var(--muted)] hover:text-[var(--silver)] text-center py-1"
            >
              Pular esta etapa
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
