import { MOCK_PROFILE, MOCK_SUBSCRIPTION, MOCK_USER_ID, IS_MOCK } from "@/lib/mock-data";
import { PerfilClient } from "./PerfilClient";

export default async function PerfilPage() {
  if (IS_MOCK) {
    return (
      <PerfilClient
        profile={MOCK_PROFILE as any}
        subscription={MOCK_SUBSCRIPTION as any}
        email="larissa@dfsestudio.com"
        userId={MOCK_USER_ID}
      />
    );
  }
  const { createClient } = await import("@/lib/supabase/server");
  const { redirect } = await import("next/navigation");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("subscriptions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(1).single(),
  ]);
  return <PerfilClient profile={profile} subscription={subscription} email={user!.email ?? ""} userId={user!.id} />;
}
