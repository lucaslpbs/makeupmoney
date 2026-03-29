import {
  MOCK_PROFILE,
  MOCK_SIMULATIONS,
  MOCK_PRODUCTS,
  MOCK_FIXED_COSTS,
  MOCK_CLIENTS,
  IS_MOCK,
} from "@/lib/mock-data";
import { MetricCard } from "@/components/MetricCard";
import { formatBRL } from "@/lib/calculations";
import { formatDate } from "@/lib/utils";
import { Calculator, Target, TrendingUp, Users, Package, DollarSign, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

async function getData() {
  if (IS_MOCK) {
    return {
      profile: MOCK_PROFILE,
      simulations: MOCK_SIMULATIONS,
      products: MOCK_PRODUCTS,
      fixedCosts: MOCK_FIXED_COSTS,
      clients: MOCK_CLIENTS,
    };
  }
  const { createClient } = await import("@/lib/supabase/server");
  const { redirect } = await import("next/navigation");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: simulations },
    { data: products },
    { data: fixedCosts },
    { data: clients },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("simulations").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("user_products").select("id").eq("user_id", user!.id).eq("ativo", true),
    supabase.from("fixed_costs").select("valor_mensal").eq("user_id", user!.id).eq("ativo", true),
    supabase.from("clients").select("id").eq("user_id", user!.id).eq("ativo", true),
  ]);
  return { profile, simulations, products, fixedCosts, clients };
}

export default async function DashboardPage() {
  const { profile, simulations, products, fixedCosts, clients } = await getData();

  const totalFixedCosts = (fixedCosts ?? []).reduce((sum, c) => sum + Number(c.valor_mensal), 0);
  const avgPrecoIdeal = simulations && simulations.length > 0
    ? simulations.reduce((sum, s) => sum + Number(s.preco_ideal ?? 0), 0) / simulations.length
    : 0;
  const avgCusto = simulations && simulations.length > 0
    ? simulations.reduce((sum, s) => sum + Number(s.custo_variavel ?? 0) + Number(s.custo_fixo_rateado ?? 0), 0) / simulations.length
    : 0;
  const meta = Number(profile?.meta_mensal ?? 0);
  const progressPct = meta > 0 && avgPrecoIdeal > 0
    ? Math.min(100, Math.round((avgPrecoIdeal * (profile?.atendimentos_mes ?? 20) / meta) * 100))
    : 0;

  const recentSimulations = (simulations ?? []).slice(0, 5);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-medium text-[var(--foreground)]">
            Olá, {profile?.nome_profissional?.split(" ")[0] ?? "bem-vinda"} ✨
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Aqui está o resumo do seu negócio.
          </p>
        </div>
        <Link
          href="/app/calculadora"
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors"
        >
          <Calculator className="h-4 w-4" />
          Nova simulação
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Preço médio sugerido"
          value={avgPrecoIdeal > 0 ? formatBRL(avgPrecoIdeal) : "—"}
          description="Baseado nas suas simulações"
          icon={TrendingUp}
          highlight
          className="col-span-2 lg:col-span-1"
        />
        <MetricCard
          label="Custo médio estimado"
          value={avgCusto > 0 ? formatBRL(avgCusto) : "—"}
          description="Por atendimento"
          icon={Calculator}
        />
        <MetricCard
          label="Produtos cadastrados"
          value={String(Array.isArray(products) ? products.length : 0)}
          description="Ativos na sua carteira"
          icon={Package}
        />
        <MetricCard
          label="Clientes"
          value={String(Array.isArray(clients) ? clients.length : 0)}
          description="Na sua base"
          icon={Users}
        />
      </div>

      {/* Meta progress */}
      {meta > 0 && (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[var(--silver)]" />
              <span className="text-sm font-medium text-[var(--foreground)]">Meta mensal</span>
            </div>
            <span className="text-xs text-[var(--muted)]">
              {formatBRL(meta)} / mês
            </span>
          </div>
          <Progress value={progressPct} className="mb-2" />
          <div className="flex justify-between text-xs text-[var(--muted)]">
            <span>Projeção atual: {formatBRL(avgPrecoIdeal * (profile?.atendimentos_mes ?? 20))}</span>
            <span className={progressPct >= 100 ? "text-[#86efac]" : ""}>{progressPct}%</span>
          </div>
        </div>
      )}

      {/* Quick actions + Recent simulations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick actions */}
        <div className="lg:col-span-1">
          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-sm font-display font-medium mb-4 text-[var(--foreground)]">Ações rápidas</h2>
            <div className="space-y-2">
              {[
                { href: "/app/calculadora", label: "Calcular novo atendimento", icon: Calculator },
                { href: "/app/produtos", label: "Adicionar produto", icon: Package },
                { href: "/app/clientes", label: "Ver clientes", icon: Users },
                { href: "/app/custos-fixos", label: "Custos fixos", icon: DollarSign },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-[var(--radius)] border border-[var(--border)] hover:border-[var(--border-light)] hover:bg-[var(--surface-hover)] transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <a.icon className="h-4 w-4 text-[var(--muted)] group-hover:text-[var(--silver)] transition-colors" />
                    <span className="text-sm text-[var(--foreground)]">{a.label}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-[var(--muted)] group-hover:text-[var(--silver)]" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent simulations */}
        <div className="lg:col-span-2">
          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-display font-medium text-[var(--foreground)]">Últimas simulações</h2>
              <Link href="/app/historico" className="text-xs text-[var(--muted)] hover:text-[var(--silver)] transition-colors">
                Ver todas
              </Link>
            </div>

            {recentSimulations.length === 0 ? (
              <div className="text-center py-8">
                <Calculator className="h-8 w-8 text-[var(--muted)] mx-auto mb-2" />
                <p className="text-sm text-[var(--muted)]">Nenhuma simulação ainda.</p>
                <Link href="/app/calculadora" className="inline-flex items-center gap-1 mt-2 text-xs text-[var(--silver)] hover:text-[var(--foreground)]">
                  <Plus className="h-3 w-3" />
                  Criar primeira simulação
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentSimulations.map((sim) => (
                  <div
                    key={sim.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-[var(--radius)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all"
                  >
                    <div>
                      <p className="text-sm text-[var(--foreground)]">
                        {sim.nome_simulacao ?? "Simulação sem nome"}
                      </p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">
                        {formatDate(sim.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--silver)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {sim.preco_ideal ? formatBRL(Number(sim.preco_ideal)) : "—"}
                      </p>
                      <p className="text-xs text-[var(--muted)]">preço ideal</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Costs summary */}
      {totalFixedCosts > 0 && (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="h-4 w-4 text-[var(--silver)]" />
            <div>
              <p className="text-sm text-[var(--foreground)]">Total de custos fixos</p>
              <p className="text-xs text-[var(--muted)]">
                {formatBRL(totalFixedCosts / (profile?.atendimentos_mes ?? 20))} por atendimento
                ({profile?.atendimentos_mes ?? 20} atend./mês)
              </p>
            </div>
          </div>
          <span className="text-lg font-medium text-[var(--foreground)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {formatBRL(totalFixedCosts)}
          </span>
        </div>
      )}
    </div>
  );
}
