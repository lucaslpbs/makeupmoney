import { MOCK_SERVICE_TYPES, MOCK_PRODUCTS, MOCK_USER_ID, IS_MOCK } from "@/lib/mock-data";
import { ServicosClient } from "./ServicosClient";

export default async function ServicosPage() {
  if (IS_MOCK) {
    return (
      <ServicosClient
        services={MOCK_SERVICE_TYPES as any}
        products={MOCK_PRODUCTS as any}
        userId={MOCK_USER_ID}
      />
    );
  }
  const { createClient } = await import("@/lib/supabase/server");
  const { redirect } = await import("next/navigation");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: services }, { data: products }] = await Promise.all([
    supabase.from("service_types").select("*, service_items(*, user_products(*))").eq("user_id", user!.id).order("created_at", { ascending: false }),
    supabase.from("user_products").select("*").eq("user_id", user!.id).eq("ativo", true).order("nome"),
  ]);
  return <ServicosClient services={services ?? []} products={products ?? []} userId={user!.id} />;
}
