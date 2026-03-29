import { MOCK_FIXED_COSTS, MOCK_PROFILE, MOCK_USER_ID, IS_MOCK } from "@/lib/mock-data";
import { CustosFixosClient } from "./CustosFixosClient";

export default async function CustosFixosPage() {
  if (IS_MOCK) {
    return (
      <CustosFixosClient
        costs={MOCK_FIXED_COSTS as any}
        userId={MOCK_USER_ID}
        atendimentosMes={MOCK_PROFILE.atendimentos_mes}
      />
    );
  }
  const { createClient } = await import("@/lib/supabase/server");
  const { redirect } = await import("next/navigation");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: costs }, { data: profile }] = await Promise.all([
    supabase.from("fixed_costs").select("*").eq("user_id", user!.id).order("categoria"),
    supabase.from("profiles").select("atendimentos_mes").eq("id", user!.id).single(),
  ]);
  return (
    <CustosFixosClient
      costs={costs ?? []}
      userId={user!.id}
      atendimentosMes={profile?.atendimentos_mes ?? 20}
    />
  );
}
