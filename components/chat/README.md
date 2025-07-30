# Chat Components

Esta pasta contém os componentes refatorados do sistema de chat, divididos em módulos menores para melhor manutenibilidade e legibilidade.

## Estrutura dos Componentes

### Componentes Principais

- **`chat-page.tsx`** (258 linhas) - Componente principal que orquestra toda a funcionalidade do chat
- **`chat-sidebar.tsx`** (168 linhas) - Barra lateral com lista de conversas e busca de usuários
- **`chat-area.tsx`** (126 linhas) - Área principal do chat com mensagens e input

### Componentes de Mensagens

- **`message-list.tsx`** (36 linhas) - Lista de mensagens
- **`message-item.tsx`** (78 linhas) - Item individual de mensagem
- **`message-input.tsx`** (73 linhas) - Input para digitar mensagens com emoji picker

### Componentes de Interface

- **`emoji-picker.tsx`** (123 linhas) - Seletor de emojis
- **`delete-confirmation-modal.tsx`** (58 linhas) - Modal de confirmação de exclusão
- **`todo-modal.tsx`** (185 linhas) - Modal para criar todos a partir de mensagens
- **`notification-toast.tsx`** (22 linhas) - Sistema de notificações
- **`login-prompt.tsx`** (29 linhas) - Tela de login quando usuário não está autenticado

## Benefícios da Refatoração

1. **Manutenibilidade**: Cada componente tem uma responsabilidade específica
2. **Reutilização**: Componentes menores podem ser reutilizados em outros contextos
3. **Testabilidade**: É mais fácil testar componentes isolados
4. **Legibilidade**: Código mais organizado e fácil de entender
5. **Limite de Linhas**: Todos os componentes respeitam o limite de 300 linhas

## Como Usar

```tsx
import { ChatPage } from "@/components/chat";

// Use o componente principal
<ChatPage />;
```

Ou importe componentes específicos:

```tsx
import { ChatSidebar, ChatArea } from "@/components/chat";
```

## Fluxo de Dados

1. `ChatPage` gerencia o estado global e orquestra os subcomponentes
2. `ChatSidebar` gerencia conversas e busca de usuários
3. `ChatArea` gerencia a área de mensagens e input
4. Componentes menores (`MessageList`, `MessageItem`, etc.) são responsáveis por renderização específica
5. Modais (`DeleteConfirmationModal`, `TodoModal`) são componentes independentes para ações específicas
