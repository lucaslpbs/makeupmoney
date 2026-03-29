import { MOCK_SIMULATIONS, IS_MOCK } from "@/lib/mock-data";
import { HistoricoClient } from "./HistoricoClient";

export default async function HistoricoPage() {
  if (IS_MOCK) {
    return <HistoricoClient simulations={MOCK_SIMULATIONS as any} />;
  }
  const { createClient } = await import("@/lib/supabase/server");
  const { redirect } = await import("next/navigation");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: simulations } = await supabase
    .from("simulations")
    .select("*, service_types(nome_servico)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });
  return <HistoricoClient simulations={simulations ?? []} />;
}
