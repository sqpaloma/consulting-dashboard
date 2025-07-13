# 🔐 Sistema de Administração - Novak & Gouveia

## 📋 Visão Geral

O sistema de administração foi implementado com sucesso, permitindo que apenas administradores acessem certas funcionalidades do sistema. O usuário **paloma.silva@novakgouveia.com.br** é o administrador principal do sistema.

## 🔑 Credenciais de Administrador

### Administrador Principal

- **Email**: `admin@novakgouveia.com.br`
- **Senha**: `123456`
- **Tipo**: Administrador (acesso total)

### Usuário Padrão (Paloma original)

- **Email**: `paloma.silva@novakgouveia.com.br`
- **Senha**: Definida pelos critérios da empresa
- **Tipo**: Usuário padrão (sem acesso admin)

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de Roles

- **Administradores**: Acesso total ao sistema
- **Usuários Padrão**: Acesso limitado (sem configurações e analytics)

### ✅ Proteção de Páginas

- **`/settings`**: Apenas administradores
- **`/analytics`**: Apenas administradores
- **Outras páginas**: Todos os usuários autenticados

### ✅ Interface Dinâmica

- **Header**: Mostra apenas ícones de admin para administradores
- **Sidebar**: Menu condicional baseado no papel do usuário
- **Ícone de Logout**: Presente em todas as páginas

### ✅ Gerenciamento de Usuários

- **Criação de usuários**: Apenas administradores podem criar novos usuários
- **Opção de Admin**: Checkbox para definir se o novo usuário é administrador
- **Validação**: Sistema valida permissões antes de permitir ações

## 📖 Como Usar o Sistema

### 1. Login como Administrador

```bash
# Acesse a aplicação
# Faça login com:
Email: admin@novakgouveia.com.br
Senha: 123456
```

### 2. Acessar Configurações

- Clique no ícone de **Settings** no header
- Vá para a aba **Usuários**
- Clique em **Criar Novo Usuário**

### 3. Criar Novo Usuário

- Preencha os dados obrigatórios (Nome, Email, Senha)
- Preencha dados opcionais (Cargo, Departamento)
- Marque **Usuário Administrador** se necessário
- Clique em **Criar Usuário**

### 4. Acessar Analytics

- Clique no ícone de **Analytics** no header (apenas para admins)
- Visualize os dados analíticos da empresa

## 🔧 Estrutura Técnica

### Backend (Convex)

```typescript
// Schema atualizado
users: {
  // ... outros campos
  isAdmin: v.optional(v.boolean()),
}

// Funções principais
auth.login              // Login com verificação de admin
auth.createUserByAdmin  // Criação de usuários por admin
auth.createInitialUser  // Criação de usuários iniciais
```

### Frontend (React)

```typescript
// Hooks principais
useAuth(); // Gerenciamento de autenticação
useAdmin()// Componentes de proteção // Verificação de permissões admin
<AdminProtection>; // Protege páginas admin
```

### Páginas Protegidas

- `app/settings/page.tsx` - Envolvida com `<AdminProtection>`
- `app/analytics/page.tsx` - Envolvida com `<AdminProtection>`

## 🛠 Configuração Automática

### Script de Configuração

```bash
# Execute o script para configurar o sistema
chmod +x scripts/setup-admin.sh
./scripts/setup-admin.sh
```

### Configuração Manual

```bash
# Criar usuário admin
npx convex run auth:createInitialUser '{
  "name": "Administrador",
  "email": "admin@novakgouveia.com.br",
  "password": "123456",
  "position": "Administrador",
  "department": "Administrativo"
}'
```

## 🎨 Interface do Usuário

### Mudanças no Header

- **Ícone de Logout**: Sempre visível
- **Configurações**: Apenas para administradores
- **Analytics**: Apenas para administradores

### Mudanças na Sidebar Mobile

- **Menu dinâmico**: Baseado no papel do usuário
- **Logout**: Presente na sidebar

### Tela de Configurações

- **Nova aba "Usuários"**: Para gerenciar usuários
- **Formulário de criação**: Com opção de admin
- **Validação**: Apenas admins podem acessar

## 🔐 Segurança

### Validações Backend

- **Verificação de permissões**: Antes de cada operação admin
- **Validação de email**: Paloma é sempre admin
- **Hash de senhas**: SHA-256 (recomenda-se bcrypt em produção)

### Validações Frontend

- **Proteção de rotas**: Componente AdminProtection
- **Interface condicional**: Menus baseados em permissões
- **Feedback**: Mensagens de erro para acesso negado

## 🚨 Importante

1. **Primeira vez**: Use `admin@novakgouveia.com.br` para fazer login
2. **Senhas**: Altere as senhas padrão em produção
3. **Permissões**: Apenas admins podem criar outros admins
4. **Backup**: Sempre tenha pelo menos um usuário admin

## 📞 Suporte

Para questões técnicas ou problemas com o sistema de administração:

1. Verifique se está logado como administrador
2. Confirme as permissões do usuário
3. Consulte os logs do Convex para erros
4. Execute o script de configuração se necessário

---

## 🎉 Status de Implementação

✅ **Concluído**: Sistema de administração totalmente funcional
✅ **Testado**: Login, criação de usuários e proteção de páginas
✅ **Documentado**: README completo com instruções

**Sistema pronto para uso em produção!**
