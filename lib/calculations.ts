// ============================================================
// MakeUpMoney — Cálculos de precificação para maquiadoras
// ============================================================

export interface ProductUsage {
  custo_por_uso: number; // valor_pago / rendimento_estimado
  quantidade_usada: number;
}

export interface SimulationInput {
  produtos: ProductUsage[];
  total_custos_fixos_mensais: number;
  atendimentos_mes_previstos: number;
  deslocamento?: number;
  taxa_pagamento_percentual?: number; // ex: 3 para 3%
  reserva_reposicao?: number;
  lucro_desejado?: number;
}

export interface SimulationResult {
  custo_variavel: number;
  custo_fixo_rateado: number;
  custo_deslocamento: number;
  custo_taxa_pagamento: number;
  custo_reserva_reposicao: number;
  custo_total: number;
  preco_minimo: number;
  preco_ideal: number;
  lucro_por_atendimento: number;
}

/** 1. Custo por uso de um produto */
export function calcCustoPorUso(valor_pago: number, rendimento_estimado: number): number {
  if (!rendimento_estimado || rendimento_estimado === 0) return 0;
  return valor_pago / rendimento_estimado;
}

/** 2. Custo variável de um atendimento (soma dos produtos usados) */
export function calcCustoVariavel(produtos: ProductUsage[]): number {
  return produtos.reduce((acc, p) => acc + p.custo_por_uso * p.quantidade_usada, 0);
}

/** 3. Custo fixo rateado por atendimento */
export function calcCustoFixoRateado(
  total_custos_fixos_mensais: number,
  atendimentos_mes_previstos: number
): number {
  if (!atendimentos_mes_previstos || atendimentos_mes_previstos === 0) return 0;
  return total_custos_fixos_mensais / atendimentos_mes_previstos;
}

/** 4–7. Simulação completa de precificação */
export function calcSimulacao(input: SimulationInput): SimulationResult {
  const custo_variavel = calcCustoVariavel(input.produtos);
  const custo_fixo_rateado = calcCustoFixoRateado(
    input.total_custos_fixos_mensais,
    input.atendimentos_mes_previstos
  );
  const custo_deslocamento = input.deslocamento ?? 0;
  const reserva = input.reserva_reposicao ?? 0;
  const lucro_desejado = input.lucro_desejado ?? 0;

  const custo_base = custo_variavel + custo_fixo_rateado + custo_deslocamento + reserva;

  // taxa de pagamento incide sobre o preço ideal
  // para calcular: preco = custo_base + lucro, taxa_absoluta = preco * taxa%
  // preco_ideal = (custo_base + lucro) / (1 - taxa_percentual/100)
  const taxa_pct = (input.taxa_pagamento_percentual ?? 0) / 100;
  const custo_taxa_pagamento_base = custo_base * taxa_pct; // aproximação para preço mínimo

  const custo_total = custo_base + custo_taxa_pagamento_base;
  const preco_minimo = custo_total;

  // Preço ideal considera taxa sobre o total com lucro
  const preco_ideal_raw = taxa_pct < 1
    ? (custo_base + lucro_desejado) / (1 - taxa_pct)
    : custo_base + lucro_desejado;

  const custo_taxa_pagamento = preco_ideal_raw * taxa_pct;
  const preco_ideal = preco_ideal_raw;
  const lucro_por_atendimento = preco_ideal - custo_base - custo_taxa_pagamento;

  return {
    custo_variavel,
    custo_fixo_rateado,
    custo_deslocamento,
    custo_taxa_pagamento: custo_taxa_pagamento_base,
    custo_reserva_reposicao: reserva,
    custo_total,
    preco_minimo,
    preco_ideal,
    lucro_por_atendimento: Math.max(0, lucro_por_atendimento),
  };
}

/** Atendimentos necessários para bater a meta */
export function calcAtendimentosNecessarios(
  meta_mensal: number,
  lucro_por_atendimento: number
): number {
  if (!lucro_por_atendimento || lucro_por_atendimento <= 0) return 0;
  return Math.ceil(meta_mensal / lucro_por_atendimento);
}

/** Formata valor em BRL */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

/** Formata número simples */
export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
