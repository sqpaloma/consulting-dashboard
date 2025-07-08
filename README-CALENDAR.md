# Calendário com To-Do List usando Convex

Este projeto integra um calendário funcional com uma lista de tarefas (to-do list) usando o Convex como backend.

## Funcionalidades

### Calendário

- Visualização mensal com navegação entre meses
- Criação de eventos com data, hora, local e participantes
- Visualização de eventos por dia
- Eventos exibidos diretamente no calendário

### To-Do List

- Criação de tarefas com título, descrição, prioridade e data de vencimento
- Marcação de tarefas como concluídas
- Filtragem por data de vencimento
- Categorização por prioridade (Alta, Média, Baixa)
- Estatísticas de tarefas pendentes e concluídas

### Integração

- Visualização integrada: eventos e tarefas aparecem no mesmo calendário
- Sidebar com detalhes do dia selecionado
- Abas para alternar entre vista de calendário e lista de tarefas

## Configuração

### 1. Configurar o Convex

```bash
# Instalar dependências (já feito)
npm install convex

# Configurar o Convex
npx convex dev --configure
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` baseado no `convex-env.example`:

```env
NEXT_PUBLIC_CONVEX_URL=https://localhost:3210
CONVEX_DEPLOY_KEY=your-deploy-key-here
```

### 3. Inicializar o Banco de Dados

O Convex criará automaticamente as tabelas baseadas no schema definido em `convex/schema.ts`:

- `events`: Armazena eventos do calendário
- `todos`: Armazena tarefas da to-do list

## Estrutura de Arquivos

```
convex/
├── schema.ts          # Schema do banco de dados
├── events.ts          # Queries e mutations para eventos
└── todos.ts           # Queries e mutations para tarefas

components/
├── calendar/              # Pasta organizada com componentes de calendário
│   ├── calendar-main.tsx  # Componente principal (era calendar-with-todo)
│   ├── calendar-simple.tsx # Calendário simples (era calendar-page)
│   ├── calendar-todo-list.tsx # Lista de tarefas (era todo-list)
│   ├── calendar-event.tsx # Componente de eventos
│   ├── calendar-todo.tsx  # Componente de tarefas
│   ├── calendar-grid.tsx  # Grade do calendário
│   ├── calendar-sidebar.tsx # Sidebar com detalhes
│   ├── calendar-forms.tsx # Formulários de evento/tarefa
│   ├── index.tsx          # Exportações centralizadas
│   └── README.md          # Documentação dos componentes
└── outros componentes...

lib/
└── convex-provider.tsx    # Provider do Convex para React
```

## Como Usar

### Acesso

Acesse `/calendar` para ver o calendário com to-do list integrado.

**Nota**: Os componentes foram reorganizados na pasta `components/calendar/` seguindo uma estrutura mais modular e organizanda. Use as novas importações:

```tsx
// Nova forma de importar
import {
  CalendarMain,
  CalendarSimple,
  CalendarTodoList,
} from "@/components/calendar";
```

### Criar Eventos

1. Clique em "Novo Evento"
2. Preencha os dados do evento
3. Selecione a data e hora
4. Clique em "Criar Evento"

### Criar Tarefas

1. Vá para a aba "Tarefas" ou clique em "Nova Tarefa"
2. Preencha o título (obrigatório)
3. Defina a prioridade e data de vencimento
4. Clique em "Criar Tarefa"

### Visualizar por Data

1. Clique em qualquer dia do calendário
2. Veja os eventos e tarefas do dia na sidebar
3. Marque tarefas como concluídas diretamente

## Banco de Dados

### Tabela Events

- `title`: Título do evento
- `description`: Descrição opcional
- `date`: Data no formato YYYY-MM-DD
- `time`: Hora do evento
- `duration`: Duração (ex: "1h", "30min")
- `location`: Local do evento
- `participants`: Lista de participantes
- `color`: Cor do evento no calendário

### Tabela Todos

- `title`: Título da tarefa
- `description`: Descrição opcional
- `completed`: Status de conclusão
- `priority`: Prioridade (low, medium, high)
- `dueDate`: Data de vencimento
- `category`: Categoria opcional

## Desenvolvimento

### Executar em Desenvolvimento

```bash
# Terminal 1: Iniciar Convex
npx convex dev

# Terminal 2: Iniciar Next.js
npm run dev
```

### Funcionalidades Implementadas

- ✅ Calendário visual com navegação
- ✅ CRUD completo para eventos
- ✅ CRUD completo para tarefas
- ✅ Integração visual entre calendário e tarefas
- ✅ Filtros por data
- ✅ Estatísticas de tarefas
- ✅ Interface responsiva
- ✅ Persistência em tempo real com Convex

### Possíveis Melhorias

- [ ] Arrastar e soltar eventos
- [ ] Notificações para tarefas vencidas
- [ ] Recorrência de eventos
- [ ] Compartilhamento de calendários
- [ ] Exportação para outros formatos
- [ ] Integração com calendários externos

## Tecnologias Usadas

- **Next.js 15**: Framework React
- **Convex**: Backend-as-a-Service
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **Radix UI**: Componentes de UI
- **Lucide React**: Ícones
