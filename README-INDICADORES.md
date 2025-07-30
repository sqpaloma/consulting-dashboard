# Dashboard de Indicadores - Produção

## Visão Geral

A página de **Indicadores** foi criada para fornecer um dashboard completo de produção com upload de planilhas, filtros avançados e visualizações detalhadas dos dados de produção.

## Funcionalidades Implementadas

### 1. Estrutura Inicial do Dashboard

- **Componente Principal**: `ProductionDashboard`
- **Upload de Planilhas**: Suporte para 4 tipos de dados:
  - Desmontagens
  - Montagens
  - Testes Aprovados
  - Testes Reprovados
- **Filtros Dinâmicos**:
  - Executante (filtrado por setor)
  - Setor (5 setores específicos)
  - Busca por Orçamento
- **Interface com Abas**:
  - Indicadores de Produção
  - Indicadores de Eficiência
  - Apontamentos

### 2. Agregação de Setores e Executantes

**Setores Implementados:**

- Setor 1 - Usinagem (Alexandre, Alexsandro, Kaua)
- Setor 2 - Montagem (João, Pedro, Carlos)
- Setor 3 - Pintura (Maria, Ana, Lucia)
- Setor 4 - Qualidade (Roberto, Fernando, Ricardo)
- Setor 5 - Expedição (Paulo, Marcos, André)

**Filtro Dinâmico**: O filtro de "Executante" é atualizado automaticamente baseado no setor selecionado.

### 3. Gráficos Detalhados

#### Indicadores de Produção (SetorCharts)

**Montagens Maio:**

- Gráficos de pizza por setor
- Distribuição de trabalho entre executantes
- Cores em tons de azul (#3B82F6, #1D4ED8, #1E40AF)

**Desmontagens Maio:**

- Gráficos de pizza por setor
- Dados específicos dos executantes
- Cores em tons de verde (#10B981, #059669, #047857)

**Testes Aprovados e Reprovados Maio:**

- Gráficos de barras horizontais
- Proporção de testes aprovados (verde) vs reprovados (laranja)
- Valores numéricos exatos por setor

#### Indicadores de Eficiência (EfficiencyCharts)

- **Eficiência por Setor**: Gráfico de barras comparando eficiência e produtividade
- **Evolução Semanal**: Gráfico de linha mostrando tendências ao longo do tempo
- **Distribuição de Eficiência**: Gráfico de pizza com categorias (Alta, Média, Baixa)
- **Tempo Médio por Setor**: Gráfico de barras com tempos de processamento

#### Apontamentos (ApontamentosCharts)

- **Apontamentos por Setor**: Gráfico de barras empilhadas (produtivas vs improdutivas)
- **Apontamentos Diários**: Gráfico de área mostrando horas por dia da semana
- **Distribuição de Tipos**: Gráfico de pizza com categorias (Produção, Manutenção, Setup, etc.)
- **Apontamentos por Executante**: Gráfico de barras duplas (horas vs eficiência)
- **Evolução dos Apontamentos**: Gráfico de linha com tendências semanais

## Paleta de Cores

A interface utiliza uma paleta "clean" baseada em tons de azul:

- **Azul Principal**: #3B82F6
- **Azul Escuro**: #1D4ED8, #1E40AF
- **Verde**: #10B981, #059669, #047857
- **Laranja**: #F59E0B
- **Vermelho**: #EF4444
- **Roxo**: #8B5CF6

## Tecnologias Utilizadas

- **React** com TypeScript
- **shadcn/ui** para componentes de interface
- **recharts** para visualizações de dados
- **Tailwind CSS** para estilização
- **Lucide React** para ícones

## Navegação

A página está acessível através do ícone de tendências (TrendingUp) na barra de navegação principal.

## Estrutura de Arquivos

```
app/indicadores/
├── page.tsx                    # Página principal

components/dashboard/
├── production-dashboard.tsx    # Componente principal
├── setor-charts.tsx           # Gráficos de produção
├── efficiency-charts.tsx      # Gráficos de eficiência
└── apontamentos-charts.tsx    # Gráficos de apontamentos
```

## Próximos Passos

1. **Integração com Backend**: Conectar com APIs para dados reais
2. **Processamento de Planilhas**: Implementar leitura de arquivos Excel/CSV
3. **Filtros Avançados**: Adicionar filtros por data, período, etc.
4. **Exportação de Dados**: Funcionalidade para exportar relatórios
5. **Notificações**: Alertas para indicadores fora do padrão
6. **Responsividade**: Otimização para dispositivos móveis

## Como Usar

1. Acesse a página através do ícone de tendências no header
2. Faça upload das planilhas de produção (opcional)
3. Use os filtros para refinar os dados
4. Clique em "Processar Dados" para visualizar os gráficos
5. Navegue entre as abas para diferentes tipos de indicadores
6. Interaja com os gráficos para ver detalhes específicos
