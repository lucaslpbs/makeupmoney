-- ============================================================
-- DFS — Supabase Database Migrations
-- Execute this entire script in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nome_profissional TEXT,
  cidade TEXT,
  tipo_atuacao TEXT,
  meta_mensal DECIMAL(10,2),
  atendimentos_mes INTEGER DEFAULT 20,
  role TEXT DEFAULT 'user', -- 'user' | 'admin'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  plano TEXT NOT NULL,
  status TEXT NOT NULL,
  gateway TEXT DEFAULT 'mercadopago',
  valor DECIMAL(10,2),
  periodicidade TEXT,
  inicio TIMESTAMPTZ,
  fim TIMESTAMPTZ,
  cancelado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. DFS LIBRARY PRODUCTS (admin-managed)
-- ============================================================
CREATE TABLE IF NOT EXISTS dfs_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  marca TEXT,
  categoria TEXT NOT NULL,
  volume DECIMAL(10,2),
  unidade TEXT,
  rendimento_medio DECIMAL(10,2),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. USER PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  marca TEXT,
  categoria TEXT NOT NULL,
  valor_pago DECIMAL(10,2) NOT NULL,
  volume DECIMAL(10,2) NOT NULL,
  unidade TEXT NOT NULL,
  rendimento_estimado DECIMAL(10,2) NOT NULL,
  custo_por_uso DECIMAL(10,4) GENERATED ALWAYS AS (valor_pago / NULLIF(rendimento_estimado, 0)) STORED,
  origem_dfs UUID REFERENCES dfs_products ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. FIXED COSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS fixed_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor_mensal DECIMAL(10,2) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. SERVICE TYPES
-- ============================================================
CREATE TABLE IF NOT EXISTS service_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  nome_servico TEXT NOT NULL,
  duracao_media INTEGER,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. SERVICE ITEMS (products used in a service type)
-- ============================================================
CREATE TABLE IF NOT EXISTS service_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type_id UUID REFERENCES service_types ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES user_products ON DELETE CASCADE NOT NULL,
  quantidade_uso DECIMAL(10,4) NOT NULL,
  custo_calculado DECIMAL(10,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. SIMULATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS simulations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  service_type_id UUID REFERENCES service_types ON DELETE SET NULL,
  nome_simulacao TEXT,
  custo_variavel DECIMAL(10,2),
  custo_fixo_rateado DECIMAL(10,2),
  deslocamento DECIMAL(10,2) DEFAULT 0,
  taxa_pagamento DECIMAL(10,2) DEFAULT 0,
  reserva_reposicao DECIMAL(10,2) DEFAULT 0,
  lucro_desejado DECIMAL(10,2) DEFAULT 0,
  preco_minimo DECIMAL(10,2),
  preco_ideal DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. CLIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  data_nascimento DATE,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. CLIENT APPOINTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS client_appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  service_type_id UUID REFERENCES service_types ON DELETE SET NULL,
  data_atendimento DATE NOT NULL,
  valor_cobrado DECIMAL(10,2),
  custo_total DECIMAL(10,2),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. APPOINTMENT PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS appointment_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES client_appointments ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES user_products ON DELETE CASCADE NOT NULL,
  quantidade_usada DECIMAL(10,4) NOT NULL,
  custo_calculado DECIMAL(10,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES auth.users ON DELETE SET NULL,
  acao TEXT NOT NULL,
  entidade TEXT NOT NULL,
  entidade_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE dfs_products ENABLE ROW LEVEL SECURITY;

-- Profiles: users see/edit only their own
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Subscriptions: users see only their own
CREATE POLICY "subscriptions_own" ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- User products: users manage only their own
CREATE POLICY "user_products_own" ON user_products FOR ALL USING (auth.uid() = user_id);

-- Fixed costs: users manage only their own
CREATE POLICY "fixed_costs_own" ON fixed_costs FOR ALL USING (auth.uid() = user_id);

-- Service types: users manage only their own
CREATE POLICY "service_types_own" ON service_types FOR ALL USING (auth.uid() = user_id);

-- Service items: users manage items for their own service types
CREATE POLICY "service_items_own" ON service_items FOR ALL
  USING (
    service_type_id IN (
      SELECT id FROM service_types WHERE user_id = auth.uid()
    )
  );

-- Simulations: users manage only their own
CREATE POLICY "simulations_own" ON simulations FOR ALL USING (auth.uid() = user_id);

-- Clients: users manage only their own
CREATE POLICY "clients_own" ON clients FOR ALL USING (auth.uid() = user_id);

-- Client appointments: users manage only their own
CREATE POLICY "client_appointments_own" ON client_appointments FOR ALL USING (auth.uid() = user_id);

-- Appointment products: users manage their own appointment products
CREATE POLICY "appointment_products_own" ON appointment_products FOR ALL
  USING (
    appointment_id IN (
      SELECT id FROM client_appointments WHERE user_id = auth.uid()
    )
  );

-- DFS products: all authenticated users can read; only admins can write
CREATE POLICY "dfs_products_read" ON dfs_products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "dfs_products_admin" ON dfs_products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_products_user_id ON user_products(user_id);
CREATE INDEX IF NOT EXISTS idx_fixed_costs_user_id ON fixed_costs(user_id);
CREATE INDEX IF NOT EXISTS idx_service_types_user_id ON service_types(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_user_id ON simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_client_appointments_client_id ON client_appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_client_appointments_user_id ON client_appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointment_products_appointment_id ON appointment_products(appointment_id);

-- ============================================================
-- SAMPLE DFS LIBRARY PRODUCTS
-- ============================================================
INSERT INTO dfs_products (nome, marca, categoria, volume, unidade, rendimento_medio) VALUES
  ('Base Líquida Studio Fix', 'MAC', 'Base', 30, 'ml', 60),
  ('Base Líquida Pro Longwear', 'MAC', 'Base', 30, 'ml', 60),
  ('Base Fotocrômica', 'Vult', 'Base', 30, 'ml', 50),
  ('Corretivo Fit Me', 'Maybelline', 'Corretivo', 6.8, 'ml', 40),
  ('Pó Compacto Translúcido', 'Laura Mercier', 'Pó', 29, 'g', 80),
  ('Pó Banana', 'NYX', 'Pó', 6, 'g', 50),
  ('Blush Sheer', 'NARS', 'Blush', 7.5, 'g', 90),
  ('Iluminador Highlighter', 'Anastasia Beverly Hills', 'Iluminador', 7, 'g', 80),
  ('Primer Poreless', 'NYX', 'Primer', 20, 'ml', 40),
  ('Paleta de Sombras Naked', 'Urban Decay', 'Sombra', 13.7, 'g', 120),
  ('Máscara de Cílios Voluminizante', 'L''Oréal', 'Máscara de cílios', 7, 'ml', 60),
  ('Delineador Líquido', 'Fenty Beauty', 'Delineador', 5, 'ml', 80),
  ('Batom Matte', 'MAC', 'Batom', 3, 'g', 50),
  ('Fixador de Maquiagem', 'Urban Decay', 'Fixador', 118, 'ml', 100),
  ('Spray Fixador', 'NYX', 'Fixador', 60, 'ml', 80)
ON CONFLICT DO NOTHING;
