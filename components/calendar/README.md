# Componentes de Calendário

Esta pasta contém todos os componentes relacionados ao calendário e gerenciamento de tarefas.

## Componentes Disponíveis

### 📅 Principais

- **`CalendarMain`** - Componente principal com calendário completo e integração com tarefas
- **`CalendarSimple`** - Versão simplificada do calendário, apenas com eventos

### 🧩 Componentes Auxiliares

- **`CalendarEvent`** - Componente para exibir eventos individuais
- **`CalendarTodo`** - Componente para exibir tarefas individuais
- **`CalendarGrid`** - Grade do calendário com interatividade
- **`CalendarSidebar`** - Sidebar com detalhes da data selecionada
- **`CalendarTodoList`** - Lista completa de tarefas com filtros e estatísticas

### 📝 Formulários

- **`EventForm`** - Formulário para criar/editar eventos
- **`TodoForm`** - Formulário para criar/editar tarefas

## Uso

```tsx
// Importar componentes individuais
import {
  CalendarMain,
  CalendarSimple,
  CalendarTodoList,
} from "@/components/calendar";

// Ou importar todos
import * as Calendar from "@/components/calendar";

// Exemplo de uso do CalendarTodoList
function MyPage() {
  return (
    <div>
      <CalendarTodoList />
      {/* ou com data específica */}
      <CalendarTodoList selectedDate="2025-01-15" />
    </div>
  );
}
```

## Estrutura de Funcionalidades

### CalendarMain

- ✅ Calendário interativo
- ✅ Gerenciamento de eventos
- ✅ Gerenciamento de tarefas
- ✅ Integração com Convex
- ✅ Tabs para alternar entre calendário e tarefas

### CalendarSimple

- ✅ Calendário básico
- ✅ Exibição de eventos
- ✅ Navegação por mês
- ✅ Dados estáticos (para demonstração)

### Componentes Auxiliares

- ✅ Props tipadas
- ✅ Modo compacto/expandido
- ✅ Callbacks para ações
- ✅ Estilização consistente

### CalendarTodoList

- ✅ Lista completa de tarefas
- ✅ Filtros por data
- ✅ Estatísticas de pendentes/concluídas
- ✅ Formulário integrado para criar tarefas
- ✅ Gerenciamento de prioridades e categorias

## Integração com Backend

Os componentes principais utilizam o Convex para:

- Buscar eventos por mês
- Gerenciar tarefas (CRUD)
- Sincronização em tempo real

## Personalização

Todos os componentes seguem o design system do projeto:

- Cores consistentes
- Tipografia padronizada
- Espaçamentos uniformes
- Responsividade
