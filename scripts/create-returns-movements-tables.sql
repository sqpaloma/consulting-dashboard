-- Criar tabela para armazenar dados de devoluções
CREATE TABLE IF NOT EXISTS devolucoes_data (
  id SERIAL PRIMARY KEY,
  total INTEGER DEFAULT 0,
  pendentes INTEGER DEFAULT 0,
  concluidas INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para armazenar itens individuais de devoluções
CREATE TABLE IF NOT EXISTS devolucoes_itens (
  id SERIAL PRIMARY KEY,
  os VARCHAR(255),
  cliente VARCHAR(255),
  produto VARCHAR(255),
  motivo VARCHAR(255),
  status VARCHAR(255),
  data_devolucao DATE,
  data_resolucao DATE,
  responsavel VARCHAR(255),
  valor DECIMAL(15,2),
  observacoes TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para controle de uploads de devoluções
CREATE TABLE IF NOT EXISTS devolucoes_uploads (
  id SERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  uploaded_by VARCHAR(255),
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_records INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'completed'
);

-- Criar tabela para armazenar dados de movimentações
CREATE TABLE IF NOT EXISTS movimentacoes_data (
  id SERIAL PRIMARY KEY,
  total INTEGER DEFAULT 0,
  entrada INTEGER DEFAULT 0,
  saida INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para armazenar itens individuais de movimentações
CREATE TABLE IF NOT EXISTS movimentacoes_itens (
  id SERIAL PRIMARY KEY,
  os VARCHAR(255),
  tipo VARCHAR(255), -- 'entrada' ou 'saida'
  produto VARCHAR(255),
  quantidade INTEGER,
  valor_unitario DECIMAL(15,2),
  valor_total DECIMAL(15,2),
  data_movimentacao DATE,
  origem VARCHAR(255),
  destino VARCHAR(255),
  responsavel VARCHAR(255),
  observacoes TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para controle de uploads de movimentações
CREATE TABLE IF NOT EXISTS movimentacoes_uploads (
  id SERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  uploaded_by VARCHAR(255),
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_records INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'completed'
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_devolucoes_itens_status ON devolucoes_itens(status);
CREATE INDEX IF NOT EXISTS idx_devolucoes_itens_os ON devolucoes_itens(os);
CREATE INDEX IF NOT EXISTS idx_devolucoes_itens_responsavel ON devolucoes_itens(responsavel);
CREATE INDEX IF NOT EXISTS idx_devolucoes_itens_data_devolucao ON devolucoes_itens(data_devolucao);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_itens_tipo ON movimentacoes_itens(tipo);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_itens_os ON movimentacoes_itens(os);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_itens_responsavel ON movimentacoes_itens(responsavel);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_itens_data_movimentacao ON movimentacoes_itens(data_movimentacao);

-- Função para atualizar timestamp (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar automaticamente o updated_at
-- Devoluções
DROP TRIGGER IF EXISTS update_devolucoes_data_updated_at ON devolucoes_data;
CREATE TRIGGER update_devolucoes_data_updated_at 
    BEFORE UPDATE ON devolucoes_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_devolucoes_itens_updated_at ON devolucoes_itens;
CREATE TRIGGER update_devolucoes_itens_updated_at 
    BEFORE UPDATE ON devolucoes_itens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Movimentações
DROP TRIGGER IF EXISTS update_movimentacoes_data_updated_at ON movimentacoes_data;
CREATE TRIGGER update_movimentacoes_data_updated_at 
    BEFORE UPDATE ON movimentacoes_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_movimentacoes_itens_updated_at ON movimentacoes_itens;
CREATE TRIGGER update_movimentacoes_itens_updated_at 
    BEFORE UPDATE ON movimentacoes_itens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar se as tabelas foram criadas com sucesso
SELECT 'Tabelas de devoluções e movimentações criadas com sucesso!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('devolucoes_data', 'devolucoes_itens', 'devolucoes_uploads', 
                   'movimentacoes_data', 'movimentacoes_itens', 'movimentacoes_uploads'); 