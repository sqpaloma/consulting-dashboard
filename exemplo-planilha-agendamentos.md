# Exemplo de Planilha para Agendamentos

Para que o calendário funcione corretamente e mostre os agendamentos, sua planilha deve ter a seguinte estrutura:

## Estrutura da Planilha

| Título                        | Cliente         | Status               | Prazo      | Valor | OS     |
| ----------------------------- | --------------- | -------------------- | ---------- | ----- | ------ |
| Análise Estrutural Edifício A | Construtora ABC | Em andamento         | 15/01/2025 | 15000 | OS-001 |
| Projeto Residencial Casa B    | Cliente XYZ     | Aguardando aprovação | 20/01/2025 | 25000 | OS-002 |
| Laudo Técnico Galpão C        | Empresa DEF     | Concluído            | 10/01/2025 | 8000  | OS-003 |
| Orçamento Reforma D           | Cliente GHI     | Pendente             | 25/01/2025 | 12000 | OS-004 |

## Colunas Obrigatórias

1. **Status** - Deve conter uma das seguintes palavras:

   - "aguardando" ou "pendente" ou "aprovação"
   - "análise" ou "analise" ou "revisão" ou "revisao"
   - "orçamento" ou "orcamento" ou "cotação" ou "cotacao"
   - "execução" ou "execucao" ou "andamento" ou "progresso"

2. **Prazo** - Data do agendamento (formato: dd/mm/yyyy, dd-mm-yyyy, ou yyyy-mm-dd)

## Colunas Opcionais

- **Título** - Nome do projeto/trabalho
- **Cliente** - Nome do cliente
- **Valor** - Valor do projeto
- **OS** - Número da ordem de serviço

## Como Funciona

1. **Upload da Planilha**: Faça upload da planilha no dashboard
2. **Processamento**: O sistema detecta automaticamente a coluna "prazo"
3. **Calendário**: Os agendamentos aparecem no calendário com indicadores visuais
4. **Clique na Data**: Clique em qualquer data com agendamentos para ver os detalhes

## Formatos de Data Suportados

- dd/mm/yyyy (ex: 15/01/2025)
- dd-mm-yyyy (ex: 15-01-2025)
- yyyy-mm-dd (ex: 2025-01-15)
- dd/mm/yy (ex: 15/01/25)
- Datas do Excel (números)

## Indicadores Visuais no Calendário

- 🔴 **Ponto vermelho**: Indica quantos agendamentos existem na data
- 🔵 **Fundo azul**: Data com agendamentos
- 🟢 **Fundo verde**: Data atual (hoje)

## Dicas

1. Certifique-se de que a coluna "Status" contenha pelo menos uma das palavras-chave mencionadas
2. Use datas válidas na coluna "Prazo"
3. O sistema é flexível com formatos de data
4. Você pode ter múltiplos agendamentos na mesma data
