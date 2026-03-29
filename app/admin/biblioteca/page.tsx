import { MOCK_DFS_PRODUCTS, IS_MOCK } from "@/lib/mock-data";
import { AdminBibliotecaClient } from "./AdminBibliotecaClient";

export default async function AdminBibliotecaPage() {
  if (IS_MOCK) {
    return <AdminBibliotecaClient products={MOCK_DFS_PRODUCTS as any} />;
  }
  const { createClient } = await import("@/lib/supabase/server");
  const { redirect } = await import("next/navigation");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: products } = await supabase.from("dfs_products").select("*").order("categoria").order("nome");
  return <AdminBibliotecaClient products={products ?? []} />;
}
