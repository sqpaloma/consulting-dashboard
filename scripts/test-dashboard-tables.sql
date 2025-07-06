-- Script para testar se as tabelas do dashboard existem e estão funcionando

-- Verificar se as tabelas existem
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('dashboard_data', 'dashboard_items', 'dashboard_uploads', 'analytics_data', 'analytics_uploads')
ORDER BY table_name;

-- Testar inserção na tabela dashboard_uploads
INSERT INTO dashboard_uploads (file_name, uploaded_by, total_records, status)
VALUES ('teste.sql', 'Teste', 0, 'completed')
ON CONFLICT DO NOTHING;

-- Verificar se a inserção funcionou
SELECT * FROM dashboard_uploads WHERE file_name = 'teste.sql';

-- Limpar o teste
DELETE FROM dashboard_uploads WHERE file_name = 'teste.sql';

-- Verificar estrutura das tabelas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('dashboard_data', 'dashboard_items', 'dashboard_uploads')
ORDER BY table_name, ordinal_position; 