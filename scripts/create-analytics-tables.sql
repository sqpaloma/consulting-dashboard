-- Criar tabela para armazenar dados das planilhas
CREATE TABLE IF NOT EXISTS analytics_data (
  id SERIAL PRIMARY KEY,
  engenheiro VARCHAR(255) NOT NULL,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  registros INTEGER DEFAULT 0,
  servicos INTEGER DEFAULT 0,
  pecas INTEGER DEFAULT 0,
  valor_total DECIMAL(15,2) DEFAULT 0,
  valor_pecas DECIMAL(15,2) DEFAULT 0,
  valor_servicos DECIMAL(15,2) DEFAULT 0,
  valor_orcamentos DECIMAL(15,2) DEFAULT 0,
  projetos INTEGER DEFAULT 0,
  quantidade INTEGER DEFAULT 0,
  cliente VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para armazenar dados brutos (raw data) para análise de clientes
CREATE TABLE IF NOT EXISTS analytics_raw_data (
  id SERIAL PRIMARY KEY,
  responsavel VARCHAR(255),
  cliente VARCHAR(255),
  ano INTEGER,
  mes INTEGER,
  valor DECIMAL(15,2),
  descricao TEXT,
  orcamento_id VARCHAR(255),
  is_orcamento BOOLEAN DEFAULT FALSE,
  is_venda_normal BOOLEAN DEFAULT FALSE,
  is_venda_servicos BOOLEAN DEFAULT FALSE,
  upload_id INTEGER REFERENCES analytics_uploads(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para controle de uploads
CREATE TABLE IF NOT EXISTS analytics_uploads (
  id SERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  uploaded_by VARCHAR(255),
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_records INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'completed'
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_analytics_engenheiro ON analytics_data(engenheiro);
CREATE INDEX IF NOT EXISTS idx_analytics_ano_mes ON analytics_data(ano, mes);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_data(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_cliente ON analytics_data(cliente);

-- Índices para dados brutos
CREATE INDEX IF NOT EXISTS idx_analytics_raw_responsavel ON analytics_raw_data(responsavel);
CREATE INDEX IF NOT EXISTS idx_analytics_raw_cliente ON analytics_raw_data(cliente);
CREATE INDEX IF NOT EXISTS idx_analytics_raw_upload_id ON analytics_raw_data(upload_id);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar automaticamente o updated_at
CREATE TRIGGER update_analytics_data_updated_at 
    BEFORE UPDATE ON analytics_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
