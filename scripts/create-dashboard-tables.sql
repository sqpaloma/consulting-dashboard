-- Criar tabela para armazenar dados do dashboard principal
CREATE TABLE IF NOT EXISTS dashboard_data (
  id SERIAL PRIMARY KEY,
  total_itens INTEGER DEFAULT 0,
  aguardando_aprovacao INTEGER DEFAULT 0,
  analises INTEGER DEFAULT 0,
  orcamentos INTEGER DEFAULT 0,
  em_execucao INTEGER DEFAULT 0,
  devolucoes INTEGER DEFAULT 0,
  movimentacoes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para armazenar itens individuais do dashboard
CREATE TABLE IF NOT EXISTS dashboard_items (
  id SERIAL PRIMARY KEY,
  os VARCHAR(255) NOT NULL,
  titulo VARCHAR(500),
  cliente VARCHAR(255),
  status VARCHAR(255),
  valor VARCHAR(100),
  data_registro DATE DEFAULT CURRENT_DATE,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para controle de uploads do dashboard
CREATE TABLE IF NOT EXISTS dashboard_uploads (
  id SERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  uploaded_by VARCHAR(255),
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_records INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'completed'
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_dashboard_items_status ON dashboard_items(status);
CREATE INDEX IF NOT EXISTS idx_dashboard_items_os ON dashboard_items(os);
CREATE INDEX IF NOT EXISTS idx_dashboard_items_created_at ON dashboard_items(created_at);

-- Função para atualizar timestamp (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar automaticamente o updated_at
DROP TRIGGER IF EXISTS update_dashboard_data_updated_at ON dashboard_data;
CREATE TRIGGER update_dashboard_data_updated_at 
    BEFORE UPDATE ON dashboard_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dashboard_items_updated_at ON dashboard_items;
CREATE TRIGGER update_dashboard_items_updated_at 
    BEFORE UPDATE ON dashboard_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar se as tabelas foram criadas com sucesso
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('dashboard_data', 'dashboard_items', 'dashboard_uploads');
