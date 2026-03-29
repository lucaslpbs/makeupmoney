// Mock client para uso em client components sem banco de dados
// Simula as operações CRUD em memória (sem persistência entre reloads)

export function createMockClient() {
  const noOp = async () => ({ data: null, error: null });
  const noOpSingle = async () => ({ data: null, error: null });

  const queryBuilder = {
    select: () => queryBuilder,
    insert: () => ({ select: () => ({ single: noOpSingle }), ...{ then: (r: any) => Promise.resolve({ data: null, error: null }).then(r) } }),
    update: () => ({ eq: () => ({ eq: () => noOp, then: (r: any) => Promise.resolve({ data: null, error: null }).then(r) }) }),
    delete: () => ({ eq: () => ({ eq: () => noOp }) }),
    eq: () => queryBuilder,
    order: () => queryBuilder,
    limit: () => queryBuilder,
    single: noOpSingle,
    then: (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve),
  };

  return {
    from: () => queryBuilder,
    auth: {
      getUser: async () => ({ data: { user: { id: "mock-user-00000000-0000-0000-0000-000000000001", email: "larissa@dfsestudio.com" } }, error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
  };
}
