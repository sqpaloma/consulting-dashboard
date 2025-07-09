# Chat Integrado com Convex

Este projeto inclui um sistema de chat completo integrado com o Convex, permitindo conversas em tempo real entre usuários.

## Estrutura do Chat

### Tabelas no Convex

1. **conversations**: Armazena as conversas
2. **conversationParticipants**: Participantes das conversas
3. **messages**: Mensagens enviadas nas conversas

### Componentes

- `ChatPage`: Componente principal do chat
- `LoginForm`: Formulário de login/cadastro
- `use-chat.ts`: Hooks customizados para o chat

## Configuração

### 1. Iniciar o Convex

```bash
npx convex dev
```

### 2. Criar Dados de Exemplo

Execute no terminal do Convex:

```javascript
// Criar usuários de exemplo
ctx.runMutation(api.internal.seedUsers);

// Criar conversas de exemplo
ctx.runMutation(api.internal.seedConversations);

// Criar mensagens de exemplo
ctx.runMutation(api.internal.seedMessages);
```

### 3. Usuários de Exemplo

Os seguintes usuários são criados automaticamente (senha: `123456`):

- **Paloma Santos** - paloma@empresa.com
- **João Silva** - joao@empresa.com
- **Maria Costa** - maria@empresa.com
- **Pedro Oliveira** - pedro@empresa.com

## Como Usar

### 1. Autenticação

- Acesse `/auth` para fazer login ou criar uma conta
- Use os usuários de exemplo ou crie novos

### 2. Funcionalidades do Chat

#### Conversas

- Visualize suas conversas existentes na barra lateral
- Veja quantas mensagens não lidas você tem
- Clique em uma conversa para abrir

#### Iniciar Nova Conversa

- Clique no botão "+" na barra lateral
- Pesquise por usuários
- Clique em um usuário para iniciar uma conversa

#### Enviar Mensagens

- Digite sua mensagem na caixa de texto
- Pressione Enter ou clique no botão de enviar
- As mensagens são enviadas em tempo real

#### Mensagens

- Visualize o histórico de mensagens
- Mensagens próprias aparecem à direita (azul)
- Mensagens de outros aparecem à esquerda (cinza)
- Timestamp é exibido em cada mensagem

## Estrutura de Dados

### Usuários

```typescript
{
  name: string;
  email: string;
  position?: string;
  department?: string;
  avatarUrl?: string;
  hashedPassword?: string;
}
```

### Conversas

```typescript
{
  type: "direct" | "group";
  isGroup: boolean;
  createdBy: Id<"users">;
  lastMessage?: string;
  lastMessageAt?: number;
}
```

### Mensagens

```typescript
{
  conversationId: Id<"conversations">;
  senderId: Id<"users">;
  content: string;
  messageType: "text" | "image" | "file" | "system";
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: number;
}
```

## Hooks Disponíveis

### `useConversations(userId)`

Busca todas as conversas do usuário.

### `useMessages(conversationId, userId)`

Busca mensagens de uma conversa específica.

### `useChat(userId)`

Fornece funções para:

- `sendMessage(conversationId, content)`
- `createDirectConversation(otherUserId)`
- `markAsRead(conversationId)`

### `useCurrentUser()`

Obtém informações do usuário logado.

### `useSearchUsers(query, currentUserId)`

Busca usuários para iniciar conversas.

## Funcionalidades Implementadas

- ✅ Autenticação de usuários
- ✅ Conversas diretas entre usuários
- ✅ Envio de mensagens em tempo real
- ✅ Histórico de mensagens
- ✅ Indicadores de mensagens não lidas
- ✅ Busca de usuários
- ✅ Interface responsiva

## Funcionalidades Futuras

- 🔄 Grupos/conversas múltiplas
- 🔄 Notificações push
- 🔄 Status online/offline
- 🔄 Compartilhamento de arquivos
- 🔄 Emojis e reações
- 🔄 Edição/exclusão de mensagens
- 🔄 Pesquisa em mensagens

## Desenvolvimento

### Adicionar Novos Recursos

1. Atualizar o schema em `convex/schema.ts`
2. Criar/atualizar funções em `convex/chat.ts`
3. Atualizar hooks em `hooks/use-chat.ts`
4. Modificar componentes conforme necessário

### Debugging

- Use `console.log` nas funções do Convex para debug
- Verifique o painel do Convex para logs
- Use React DevTools para estado do componente

## Segurança

- Todas as operações verificam permissões do usuário
- Senhas são hasheadas com SHA-256 (use bcrypt em produção)
- Usuários só podem ver conversas das quais participam
- Validação de entrada em todas as funções

## Performance

- Mensagens são paginadas (50 por vez)
- Conversas são ordenadas por última mensagem
- Índices otimizados para queries frequentes
- Dados são buscados apenas quando necessário

---

Para mais informações sobre o Convex, consulte a [documentação oficial](https://docs.convex.dev/).
