import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    // Em modo mock, retorna um cliente fake que não faz chamadas reais
    // Os client components gerenciam estado localmente com useState
    return {
      from: (table: string) => ({
        select: (...args: any[]) => ({ eq: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }), order: (..._: any[]) => ({ limit: (..._: any[]) => ({ single: () => Promise.resolve({ data: null, error: null }) }) }), single: () => Promise.resolve({ data: null, error: null }) }),
        insert: (data: any) => ({ select: () => ({ single: () => Promise.resolve({ data: { ...data, id: `mock-${Date.now()}`, created_at: new Date().toISOString() }, error: null }) }) }),
        update: (data: any) => ({ eq: (..._: any[]) => ({ eq: (..._: any[]) => Promise.resolve({ data: null, error: null }) }) }),
        delete: () => ({ eq: (..._: any[]) => ({ eq: (..._: any[]) => Promise.resolve({ data: null, error: null }) }) }),
        upsert: (data: any) => Promise.resolve({ data: null, error: null }),
      }),
      auth: {
        getUser: () => Promise.resolve({
          data: {
            user: {
              id: "mock-user-00000000-0000-0000-0000-000000000001",
              email: "larissa@dfsestudio.com",
            },
          },
          error: null,
        }),
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
    } as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
