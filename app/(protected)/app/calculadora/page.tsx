import { MOCK_PRODUCTS, MOCK_SERVICE_TYPES, MOCK_FIXED_COSTS, MOCK_PROFILE, MOCK_USER_ID, IS_MOCK } from "@/lib/mock-data";
import { CalculadoraClient } from "./CalculadoraClient";

export default async function CalculadoraPage() {
  if (IS_MOCK) {
    const totalFixedCosts = MOCK_FIXED_COSTS.reduce((sum, c) => sum + c.valor_mensal, 0);
    return (
      <CalculadoraClient
        userId={MOCK_USER_ID}
        products={MOCK_PRODUCTS as any}
        services={MOCK_SERVICE_TYPES as any}
        totalFixedCosts={totalFixedCosts}
        atendimentosMes={MOCK_PROFILE.atendimentos_mes}
      />
    );
  }
  const { createClient } = await import("@/lib/supabase/server");
  const { redirect } = await import("next/navigation");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [
    { data: profile },
    { data: products },
    { data: services },
    { data: fixedCosts },
  ] = await Promise.all([
    supabase.from("profiles").select("atendimentos_mes").eq("id", user!.id).single(),
    supabase.from("user_products").select("*").eq("user_id", user!.id).eq("ativo", true).order("nome"),
    supabase.from("service_types").select("*, service_items(*, user_products(*))").eq("user_id", user!.id).eq("ativo", true),
    supabase.from("fixed_costs").select("valor_mensal").eq("user_id", user!.id).eq("ativo", true),
  ]);
  const totalFixedCosts = (fixedCosts ?? []).reduce((sum, c) => sum + Number(c.valor_mensal), 0);
  return (
    <CalculadoraClient
      userId={user!.id}
      products={products ?? []}
      services={services ?? []}
      totalFixedCosts={totalFixedCosts}
      atendimentosMes={profile?.atendimentos_mes ?? 20}
    />
  );
}
