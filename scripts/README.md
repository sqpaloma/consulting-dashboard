# Scripts de Banco de Dados

## ⚠️ PROBLEMA ATIVO: Valores da Análise de Clientes Mudando

**Sintoma**: Os valores da análise de clientes ficam diferentes quando os dados são salvos e carregados do banco.

**Causa**: A tabela `analytics_raw_data` não existe, impedindo que os dados detalhados dos clientes sejam preservados.

## 🔧 SOLUÇÃO RÁPIDA

1. **Acesse o painel do Supabase**
2. **Vá para SQL Editor**
3. **Execute o script de migração:**

```sql
-- COPIE E COLE NO SQL EDITOR DO SUPABASE
-- Execute apenas uma vez

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
```

4. **Teste a solução:**
   - Faça upload de uma nova planilha
   - Salve os dados
   - Recarregue e verifique se os valores permanecem iguais

## 📋 Verificação da Solução

### 1. Teste se a migração funcionou:

```sql
-- Teste no SQL Editor - deve retornar sem erro
SELECT COUNT(*) FROM analytics_raw_data;
SELECT cliente FROM analytics_data LIMIT 1;
```

### 2. Verifique os logs no console (F12):

- Procure por mensagens com `[DEBUG]`
- Confirme que aparece: `Dados brutos inseridos com sucesso`
- Confirme que aparece: `Dados brutos carregados`

### 3. Teste funcional:

- Upload da planilha ➜ Anote os valores da análise de clientes
- Salvar dados ➜ Aguarde confirmação de sucesso
- Recarregar página ➜ Valores devem ser idênticos

## 📚 Informações Técnicas

### Migração Completa (`migrate-analytics-add-cliente.sql`):

- ✅ Adiciona coluna `cliente` na tabela existente
- ✅ Cria tabela `analytics_raw_data` para preservar dados brutos
- ✅ Análise de clientes funciona perfeitamente mesmo com dados salvos
- ✅ Funcionalidade completa de análise de clientes
- ⚠️ Requer mais espaço no banco de dados

### Migração Simples (`migrate-analytics-simple.sql`):

- ✅ Adiciona apenas a coluna `cliente` na tabela existente
- ✅ Corrige parcialmente o problema da análise de clientes
- ✅ Funciona imediatamente sem alterações complexas
- ❌ Não preserva dados brutos quando recarregados do banco

## 🐛 Resolução de Problemas

### Problema: "Tabela analytics_raw_data não existe"

**Solução**: Execute a migração completa acima

### Problema: "Nenhum dado bruto para inserir"

**Causa**: Planilha não tem coluna "Nome Parceiro (Parceiro)"
**Solução**: Verifique se a planilha contém essa coluna com dados

### Problema: Valores ainda estão diferentes

1. Abra o console (F12) e procure por erros
2. Execute as queries de verificação acima
3. Confirme que a migração foi aplicada corretamente

### Problema: Erro de permissão no Supabase

**Solução**: Verifique se você tem permissões de administrador no projeto

## ✅ Resultado Esperado

Após aplicar a migração:

- ✅ **Ranking por quantidade** de faturamentos (não por valor)
- ✅ **Valores consistentes** entre upload e dados salvos
- ✅ **Dados de cliente preservados** corretamente
- ✅ **Avisos claros** quando há limitações
- ✅ **Sem erros** no console

## 📞 Suporte

Se o problema persistir:

1. Verifique os logs no console do navegador
2. Execute as queries de verificação
3. Confirme que a migração foi aplicada
4. Forneça screenshots dos erros ou logs
