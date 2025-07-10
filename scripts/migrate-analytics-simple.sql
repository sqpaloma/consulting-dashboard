-- Migração simples - apenas adiciona coluna cliente (solução rápida)
-- Para funcionalidade completa, use: migrate-analytics-add-cliente.sql

-- Adicionar coluna cliente se não existir
ALTER TABLE analytics_data ADD COLUMN IF NOT EXISTS cliente VARCHAR(255);

-- Criar índice para a coluna cliente
CREATE INDEX IF NOT EXISTS idx_analytics_cliente ON analytics_data(cliente); 