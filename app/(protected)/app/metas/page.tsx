import { MOCK_PROFILE, MOCK_SIMULATIONS, MOCK_FIXED_COSTS, MOCK_USER_ID, IS_MOCK } from "@/lib/mock-data";
import { MetasClient } from "./MetasClient";

export default async function MetasPage() {
  if (IS_MOCK) {
    const totalFixedCosts = MOCK_FIXED_COSTS.reduce((sum, c) => sum + c.valor_mensal, 0);
    const avgPrecoIdeal = MOCK_SIMULATIONS.reduce((sum, s) => sum + (s.preco_ideal ?? 0), 0) / MOCK_SIMULATIONS.length;
    const avgLucro = MOCK_SIMULATIONS.reduce((sum, s) => sum + (s.lucro_desejado ?? 0), 0) / MOCK_SIMULATIONS.length;
    return (
      <MetasClient
        profile={MOCK_PROFILE as any}
        totalFixedCosts={totalFixedCosts}
        avgPrecoIdeal={avgPrecoIdeal}
        avgLucro={avgLucro}
        userId={MOCK_USER_ID}
      />
    );
  }
  const { createClient } = await import("@/lib/supabase/server");
  const { redirect } = await import("next/navigation");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: profile }, { data: simulations }, { data: fixedCosts }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("simulations").select("preco_ideal, lucro_desejado").eq("user_id", user!.id),
    supabase.from("fixed_costs").select("valor_mensal").eq("user_id", user!.id).eq("ativo", true),
  ]);
  const totalFixedCosts = (fixedCosts ?? []).reduce((sum, c) => sum + Number(c.valor_mensal), 0);
  const avgPrecoIdeal = simulations && simulations.length > 0
    ? simulations.reduce((sum, s) => sum + Number(s.preco_ideal ?? 0), 0) / simulations.length
    : 0;
  const avgLucro = simulations && simulations.length > 0
    ? simulations.reduce((sum, s) => sum + Number(s.lucro_desejado ?? 0), 0) / simulations.length
    : 0;
  return (
    <MetasClient
      profile={profile}
      totalFixedCosts={totalFixedCosts}
      avgPrecoIdeal={avgPrecoIdeal}
      avgLucro={avgLucro}
      userId={user!.id}
    />
  );
}
