-- Criar tabela para armazenar dados do dashboard principal
CREATE TABLE IF NOT EXISTS dashboard_data (
  id SERIAL PRIMARY KEY,
  total_itens INTEGER,
  aguardando_aprovacao INTEGER,
  analises INTEGER,
  orcamentos INTEGER,
  em_execucao INTEGER,
  pronto INTEGER,
  devolucoes INTEGER,
  movimentacoes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para armazenar itens individuais do dashboard
CREATE TABLE IF NOT EXISTS dashboard_itens (
  id SERIAL PRIMARY KEY,
  os VARCHAR(255),
  titulo VARCHAR(500),
  cliente VARCHAR(255),
  responsavel VARCHAR(255),
  status VARCHAR(255),
  data_registro DATE,
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
CREATE INDEX IF NOT EXISTS idx_dashboard_itens_status ON dashboard_itens(status);
CREATE INDEX IF NOT EXISTS idx_dashboard_itens_os ON dashboard_itens(os);
CREATE INDEX IF NOT EXISTS idx_dashboard_itens_responsavel ON dashboard_itens(responsavel);
CREATE INDEX IF NOT EXISTS idx_dashboard_itens_created_at ON dashboard_itens(created_at);

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

DROP TRIGGER IF EXISTS update_dashboard_itens_updated_at ON dashboard_itens;
CREATE TRIGGER update_dashboard_itens_updated_at 
    BEFORE UPDATE ON dashboard_itens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar se as tabelas foram criadas com sucesso
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('dashboard_data', 'dashboard_itens', 'dashboard_uploads');
