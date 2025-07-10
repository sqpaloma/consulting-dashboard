-- Migração para adicionar coluna cliente e tabela de dados brutos

-- Adicionar coluna cliente se não existir
ALTER TABLE analytics_data ADD COLUMN IF NOT EXISTS cliente VARCHAR(255);

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

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_analytics_cliente ON analytics_data(cliente);
CREATE INDEX IF NOT EXISTS idx_analytics_raw_responsavel ON analytics_raw_data(responsavel);
CREATE INDEX IF NOT EXISTS idx_analytics_raw_cliente ON analytics_raw_data(cliente);
CREATE INDEX IF NOT EXISTS idx_analytics_raw_upload_id ON analytics_raw_data(upload_id); 