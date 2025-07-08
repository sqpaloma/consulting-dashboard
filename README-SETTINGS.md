# Sistema de Configurações - Novak & Gouveia

## Visão Geral

O sistema de configurações permite que os usuários gerenciem suas informações pessoais e preferências do sistema. Está totalmente integrado com o Convex para persistência de dados.

## Funcionalidades Implementadas

### 1. Perfil do Usuário

- ✅ Edição de informações pessoais (nome, email, telefone, cargo, departamento, localização)
- ✅ Salvamento automático no Convex
- ✅ Validação de dados
- ✅ Feedback visual com toast notifications

### 2. Alteração de Senha

- ✅ Validação da senha atual
- ✅ Validação de nova senha com critérios de segurança:
  - Mínimo 8 caracteres
  - Pelo menos uma letra maiúscula
  - Pelo menos uma letra minúscula
  - Pelo menos um número
- ✅ Confirmação de senha
- ✅ Hash seguro usando SHA-256 (substitua por bcrypt em produção)

### 3. Upload de Avatar

- 🚧 Funcionalidade em desenvolvimento (placeholder implementado)

## Estrutura do Banco de Dados

### Tabela `users`

```typescript
{
  name: string
  email: string
  phone?: string
  position?: string
  department?: string
  location?: string
  company?: string
  avatarUrl?: string
  hashedPassword?: string
  createdAt: number
  updatedAt: number
}
```

### Tabela `userSettings`

```typescript
{
  userId: Id<"users">;
  // Notificações
  emailNotifications: boolean;
  pushNotifications: boolean;
  calendarReminders: boolean;
  projectUpdates: boolean;
  weeklyReports: boolean;
  // Privacidade
  profileVisibility: string;
  dataSharing: boolean;
  analyticsTracking: boolean;
  // Aparência
  theme: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  // Sistema
  autoSave: boolean;
  backupFrequency: string;
  sessionTimeout: string;
  updatedAt: number;
}
```

## Como Usar

### 1. Executar o Convex

```bash
npm run convex:dev
```

### 2. Executar o Servidor de Desenvolvimento

```bash
npm run dev
```

### 3. Acessar as Configurações

- Navegue para `/settings` no navegador
- As configurações já estão populadas com dados do usuário exemplo

### 4. Criar um Novo Usuário

```bash
npx convex run users:createOrUpdateUser '{"name": "Seu Nome", "email": "seu@email.com", "phone": "+55 (11) 99999-9999", "position": "Seu Cargo", "department": "Seu Departamento", "location": "Sua Localização", "company": "Sua Empresa"}'
```

## Componentes Principais

### 1. `SettingsProfile`

- Localização: `components/settings/settings-profile.tsx`
- Gerencia as informações do perfil e alteração de senha
- Integrado com Convex para persistência

### 2. `SettingsTabs`

- Localização: `components/settings/settings-tabs.tsx`
- Container principal para todas as abas de configurações
- Passa o `userId` para os componentes filhos

### 3. `useCurrentUser`

- Localização: `hooks/useCurrentUser.ts`
- Hook personalizado para gerenciar o usuário atual
- Integrado com Convex queries

## Funções do Convex

### 1. `users.ts`

- `createOrUpdateUser`: Cria ou atualiza informações do usuário
- `getUserByEmail`: Busca usuário por email
- `getUserById`: Busca usuário por ID
- `updateUserSettings`: Atualiza configurações do usuário
- `updateUserPassword`: Atualiza senha do usuário
- `updateUserAvatar`: Atualiza avatar do usuário
- `listUsers`: Lista todos os usuários

### 2. `auth.ts`

- `changeUserPassword`: Altera senha com validação
- `validatePassword`: Valida critérios de senha
- `hashUserPassword`: Gera hash da senha

## Próximos Passos

1. **Upload de Avatar**: Implementar upload real de imagens
2. **Autenticação**: Implementar sistema de login/logout
3. **Permissões**: Adicionar controle de acesso
4. **Validação**: Melhorar validações do lado cliente
5. **Testes**: Adicionar testes unitários e de integração

## Problemas Conhecidos

1. **Hash de Senha**: Atualmente usando SHA-256, recomenda-se bcrypt para produção
2. **Usuário Fixo**: O sistema usa um email fixo para demonstração
3. **Sem Autenticação**: Não há sistema de login implementado

## Notas Técnicas

- O sistema usa Convex para persistência de dados
- As notificações são implementadas com Sonner
- A validação de senha é feita no frontend
- O estado é gerenciado com React hooks
- A UI é construída com Tailwind CSS e Radix UI

## Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Teste as funcionalidades
5. Crie um pull request

## Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
