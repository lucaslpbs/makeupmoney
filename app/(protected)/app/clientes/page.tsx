import { MOCK_CLIENTS, MOCK_USER_ID, IS_MOCK } from "@/lib/mock-data";
import { ClientesClient } from "./ClientesClient";

export default async function ClientesPage() {
  if (IS_MOCK) {
    return <ClientesClient clients={MOCK_CLIENTS as any} userId={MOCK_USER_ID} />;
  }
  const { createClient } = await import("@/lib/supabase/server");
  const { redirect } = await import("next/navigation");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: clients } = await supabase
    .from("clients")
    .select("*, client_appointments(id, data_atendimento, valor_cobrado)")
    .eq("user_id", user!.id)
    .eq("ativo", true)
    .order("nome");
  return <ClientesClient clients={clients ?? []} userId={user!.id} />;
}
