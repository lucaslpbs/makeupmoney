import { MOCK_CLIENTS, MOCK_CLIENT_DETAIL, MOCK_PRODUCTS, MOCK_SERVICE_TYPES, MOCK_USER_ID, IS_MOCK } from "@/lib/mock-data";
import { ClientePerfilClient } from "./ClientePerfilClient";
import { notFound } from "next/navigation";

export default async function ClientePerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (IS_MOCK) {
    const client = MOCK_CLIENTS.find((c) => c.id === id);
    if (!client) notFound();
    const detail = MOCK_CLIENT_DETAIL[id as keyof typeof MOCK_CLIENT_DETAIL];
    const appointments = detail?.client_appointments ?? [];
    return (
      <ClientePerfilClient
        client={client as any}
        appointments={appointments as any}
        products={MOCK_PRODUCTS as any}
        services={MOCK_SERVICE_TYPES.map((s) => ({ id: s.id, nome_servico: s.nome_servico })) as any}
        userId={MOCK_USER_ID}
      />
    );
  }

  const { createClient } = await import("@/lib/supabase/server");
  const { redirect } = await import("next/navigation");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: client }, { data: appointments }, { data: products }, { data: services }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).eq("user_id", user!.id).single(),
    supabase.from("client_appointments").select("*, service_types(nome_servico), appointment_products(*, user_products(*))").eq("client_id", id).eq("user_id", user!.id).order("data_atendimento", { ascending: false }),
    supabase.from("user_products").select("*").eq("user_id", user!.id).eq("ativo", true).order("nome"),
    supabase.from("service_types").select("*").eq("user_id", user!.id).eq("ativo", true),
  ]);
  if (!client) notFound();
  return (
    <ClientePerfilClient
      client={client}
      appointments={appointments ?? []}
      products={products ?? []}
      services={services ?? []}
      userId={user!.id}
    />
  );
}
