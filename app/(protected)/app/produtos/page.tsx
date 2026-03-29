import { MOCK_PRODUCTS, MOCK_USER_ID, IS_MOCK } from "@/lib/mock-data";
import { ProdutosClient } from "./ProdutosClient";

export default async function ProdutosPage() {
  if (IS_MOCK) {
    return <ProdutosClient products={MOCK_PRODUCTS as any} userId={MOCK_USER_ID} />;
  }
  const { createClient } = await import("@/lib/supabase/server");
  const { redirect } = await import("next/navigation");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: products } = await supabase
    .from("user_products")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });
  return <ProdutosClient products={products ?? []} userId={user!.id} />;
}
