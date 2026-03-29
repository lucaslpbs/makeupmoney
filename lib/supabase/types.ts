export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nome_profissional: string | null;
          cidade: string | null;
          tipo_atuacao: string | null;
          meta_mensal: number | null;
          atendimentos_mes: number;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nome_profissional?: string | null;
          cidade?: string | null;
          tipo_atuacao?: string | null;
          meta_mensal?: number | null;
          atendimentos_mes?: number;
          role?: string;
        };
        Update: {
          nome_profissional?: string | null;
          cidade?: string | null;
          tipo_atuacao?: string | null;
          meta_mensal?: number | null;
          atendimentos_mes?: number;
          role?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plano: string;
          status: string;
          gateway: string | null;
          valor: number | null;
          periodicidade: string | null;
          inicio: string | null;
          fim: string | null;
          cancelado_em: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          plano: string;
          status: string;
          gateway?: string | null;
          valor?: number | null;
          periodicidade?: string | null;
          inicio?: string | null;
          fim?: string | null;
        };
        Update: {
          plano?: string;
          status?: string;
          valor?: number | null;
          fim?: string | null;
          cancelado_em?: string | null;
        };
      };
      user_products: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          marca: string | null;
          categoria: string;
          valor_pago: number;
          volume: number;
          unidade: string;
          rendimento_estimado: number;
          custo_por_uso: number;
          origem_dfs: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          nome: string;
          marca?: string | null;
          categoria: string;
          valor_pago: number;
          volume: number;
          unidade: string;
          rendimento_estimado: number;
          origem_dfs?: string | null;
          ativo?: boolean;
        };
        Update: {
          nome?: string;
          marca?: string | null;
          categoria?: string;
          valor_pago?: number;
          volume?: number;
          unidade?: string;
          rendimento_estimado?: number;
          ativo?: boolean;
          updated_at?: string;
        };
      };
      fixed_costs: {
        Row: {
          id: string;
          user_id: string;
          categoria: string;
          descricao: string;
          valor_mensal: number;
          ativo: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          categoria: string;
          descricao: string;
          valor_mensal: number;
          ativo?: boolean;
        };
        Update: {
          categoria?: string;
          descricao?: string;
          valor_mensal?: number;
          ativo?: boolean;
        };
      };
      service_types: {
        Row: {
          id: string;
          user_id: string;
          nome_servico: string;
          duracao_media: number | null;
          ativo: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          nome_servico: string;
          duracao_media?: number | null;
          ativo?: boolean;
        };
        Update: {
          nome_servico?: string;
          duracao_media?: number | null;
          ativo?: boolean;
        };
      };
      service_items: {
        Row: {
          id: string;
          service_type_id: string;
          product_id: string;
          quantidade_uso: number;
          custo_calculado: number | null;
          created_at: string;
        };
        Insert: {
          service_type_id: string;
          product_id: string;
          quantidade_uso: number;
          custo_calculado?: number | null;
        };
        Update: {
          quantidade_uso?: number;
          custo_calculado?: number | null;
        };
      };
      simulations: {
        Row: {
          id: string;
          user_id: string;
          service_type_id: string | null;
          nome_simulacao: string | null;
          custo_variavel: number | null;
          custo_fixo_rateado: number | null;
          deslocamento: number;
          taxa_pagamento: number;
          reserva_reposicao: number;
          lucro_desejado: number;
          preco_minimo: number | null;
          preco_ideal: number | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          service_type_id?: string | null;
          nome_simulacao?: string | null;
          custo_variavel?: number | null;
          custo_fixo_rateado?: number | null;
          deslocamento?: number;
          taxa_pagamento?: number;
          reserva_reposicao?: number;
          lucro_desejado?: number;
          preco_minimo?: number | null;
          preco_ideal?: number | null;
        };
        Update: {
          nome_simulacao?: string | null;
          preco_minimo?: number | null;
          preco_ideal?: number | null;
        };
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          telefone: string | null;
          email: string | null;
          data_nascimento: string | null;
          observacoes: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          nome: string;
          telefone?: string | null;
          email?: string | null;
          data_nascimento?: string | null;
          observacoes?: string | null;
          ativo?: boolean;
        };
        Update: {
          nome?: string;
          telefone?: string | null;
          email?: string | null;
          data_nascimento?: string | null;
          observacoes?: string | null;
          ativo?: boolean;
          updated_at?: string;
        };
      };
      client_appointments: {
        Row: {
          id: string;
          client_id: string;
          user_id: string;
          service_type_id: string | null;
          data_atendimento: string;
          valor_cobrado: number | null;
          custo_total: number | null;
          observacoes: string | null;
          created_at: string;
        };
        Insert: {
          client_id: string;
          user_id: string;
          service_type_id?: string | null;
          data_atendimento: string;
          valor_cobrado?: number | null;
          custo_total?: number | null;
          observacoes?: string | null;
        };
        Update: {
          data_atendimento?: string;
          valor_cobrado?: number | null;
          custo_total?: number | null;
          observacoes?: string | null;
        };
      };
      appointment_products: {
        Row: {
          id: string;
          appointment_id: string;
          product_id: string;
          quantidade_usada: number;
          custo_calculado: number | null;
          created_at: string;
        };
        Insert: {
          appointment_id: string;
          product_id: string;
          quantidade_usada: number;
          custo_calculado?: number | null;
        };
        Update: {
          quantidade_usada?: number;
          custo_calculado?: number | null;
        };
      };
      dfs_products: {
        Row: {
          id: string;
          nome: string;
          marca: string | null;
          categoria: string;
          volume: number | null;
          unidade: string | null;
          rendimento_medio: number | null;
          ativo: boolean;
          created_at: string;
        };
        Insert: {
          nome: string;
          marca?: string | null;
          categoria: string;
          volume?: number | null;
          unidade?: string | null;
          rendimento_medio?: number | null;
          ativo?: boolean;
        };
        Update: {
          nome?: string;
          marca?: string | null;
          categoria?: string;
          volume?: number | null;
          unidade?: string | null;
          rendimento_medio?: number | null;
          ativo?: boolean;
        };
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type UserProduct = Database["public"]["Tables"]["user_products"]["Row"];
export type FixedCost = Database["public"]["Tables"]["fixed_costs"]["Row"];
export type ServiceType = Database["public"]["Tables"]["service_types"]["Row"];
export type ServiceItem = Database["public"]["Tables"]["service_items"]["Row"];
export type Simulation = Database["public"]["Tables"]["simulations"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type ClientAppointment = Database["public"]["Tables"]["client_appointments"]["Row"];
export type AppointmentProduct = Database["public"]["Tables"]["appointment_products"]["Row"];
export type DfsProduct = Database["public"]["Tables"]["dfs_products"]["Row"];
