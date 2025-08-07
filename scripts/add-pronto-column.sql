-- Adicionar coluna 'pronto' à tabela dashboard_data se ela não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='dashboard_data' AND column_name='pronto') THEN
        ALTER TABLE dashboard_data ADD COLUMN pronto INTEGER DEFAULT 0;
    END IF;
END $$;

-- Verificar se a coluna foi criada com sucesso
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'dashboard_data' 
AND column_name = 'pronto';