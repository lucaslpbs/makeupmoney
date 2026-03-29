"use client";
// Store em memória para operações CRUD em mock mode
// Persiste no sessionStorage para sobreviver a navegações na mesma aba

import {
  MOCK_PRODUCTS,
  MOCK_FIXED_COSTS,
  MOCK_SERVICE_TYPES,
  MOCK_SIMULATIONS,
  MOCK_CLIENTS,
} from "./mock-data";

type StoreKey = "products" | "fixed_costs" | "service_types" | "simulations" | "clients";

const DEFAULTS: Record<StoreKey, any[]> = {
  products: MOCK_PRODUCTS,
  fixed_costs: MOCK_FIXED_COSTS,
  service_types: MOCK_SERVICE_TYPES,
  simulations: MOCK_SIMULATIONS,
  clients: MOCK_CLIENTS,
};

function getStore<T>(key: StoreKey): T[] {
  if (typeof window === "undefined") return DEFAULTS[key] as T[];
  try {
    const stored = sessionStorage.getItem(`dfs_mock_${key}`);
    return stored ? JSON.parse(stored) : (DEFAULTS[key] as T[]);
  } catch {
    return DEFAULTS[key] as T[];
  }
}

function setStore<T>(key: StoreKey, data: T[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`dfs_mock_${key}`, JSON.stringify(data));
  } catch {}
}

export const mockStore = {
  getProducts: () => getStore<(typeof MOCK_PRODUCTS)[0]>("products"),
  setProducts: (data: any[]) => setStore("products", data),

  getFixedCosts: () => getStore<(typeof MOCK_FIXED_COSTS)[0]>("fixed_costs"),
  setFixedCosts: (data: any[]) => setStore("fixed_costs", data),

  getServiceTypes: () => getStore<(typeof MOCK_SERVICE_TYPES)[0]>("service_types"),
  setServiceTypes: (data: any[]) => setStore("service_types", data),

  getSimulations: () => getStore<(typeof MOCK_SIMULATIONS)[0]>("simulations"),
  setSimulations: (data: any[]) => setStore("simulations", data),

  getClients: () => getStore<(typeof MOCK_CLIENTS)[0]>("clients"),
  setClients: (data: any[]) => setStore("clients", data),

  reset: () => {
    if (typeof window === "undefined") return;
    (["products", "fixed_costs", "service_types", "simulations", "clients"] as StoreKey[]).forEach(
      (key) => sessionStorage.removeItem(`dfs_mock_${key}`)
    );
  },
};
