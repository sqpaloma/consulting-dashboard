# Sistema de Autenticação - Novak & Gouveia Dashboard

Este documento explica como usar o sistema de autenticação implementado no dashboard da Novak & Gouveia.

## Configuração

O sistema de autenticação foi implementado usando:

- **Convex**: Para backend e banco de dados
- **React Hooks**: Para gerenciar estado de autenticação
- **LocalStorage**: Para persistir sessão do usuário

## Primeiro Acesso

### Usuário Inicial - Paloma

Para facilitar o primeiro acesso, o sistema inclui a criação automática do usuário "Paloma":

- **Nome**: Paloma
- **Email**: paloma@novakgouveia.com
- **Senha**: 123456
- **Cargo**: Gerente
- **Departamento**: Administrativo

### Como Criar o Primeiro Usuário

1. Acesse o dashboard
2. Se não houver usuários, clique em "Criar Primeiro Usuário (Paloma)"
3. O formulário será preenchido automaticamente
4. Clique em "Criar Usuário"

## Funcionalidades

### Login

- Email e senha obrigatórios
- Validação de credenciais
- Mensagens de erro amigáveis
- Persistência de sessão

### Criação de Usuários

- Formulário completo com validações
- Campos obrigatórios: Nome, Email, Senha
- Campos opcionais: Cargo, Departamento
- Validação de formato de email
- Senha mínima de 6 caracteres

### Logout

- Botão de logout no cabeçalho
- Limpa sessão do localStorage
- Redireciona para tela de login

## Uso no Dashboard

### Informações do Usuário

- Nome do usuário no cabeçalho
- Email do usuário no cabeçalho
- Saudação personalizada na página inicial

### Proteção de Rotas

- Todas as páginas são protegidas por autenticação
- Redirecionamento automático para login se não autenticado

## Configuração do Convex

### Funções Disponíveis

#### Autenticação

- `api.auth.login`: Fazer login
- `api.auth.createInitialUser`: Criar usuário inicial
- `api.auth.hasUsers`: Verificar se existem usuários

#### Gerenciamento de Usuários

- `api.users.createOrUpdateUser`: Criar ou atualizar usuário
- `api.users.getUserByEmail`: Buscar usuário por email
- `api.users.getUserById`: Buscar usuário por ID

### Schema do Banco

```javascript
users: {
  name: string,
  email: string,
  phone?: string,
  position?: string,
  department?: string,
  location?: string,
  company?: string,
  avatarUrl?: string,
  hashedPassword?: string,
  lastLogin?: number,
  createdAt: number,
  updatedAt: number,
}
```

## Segurança

### Hash de Senhas

- Senhas são hasheadas usando SHA-256
- Senhas nunca são armazenadas em texto puro
- Verificação segura de credenciais

### Validações

- Formato de email válido
- Comprimento mínimo de senha
- Sanitização de dados de entrada

## Desenvolvimento

### Hook de Autenticação

```javascript
import { useAuth } from "@/hooks/use-auth";

const { user, isLoading, isAuthenticated, signIn, signOut, createUser } =
  useAuth();
```

### Componente de Proteção

```javascript
import { AuthLayout } from "@/components/auth";

<AuthLayout>
  <YourProtectedComponent />
</AuthLayout>;
```

## Troubleshooting

### Problemas Comuns

1. **Usuário não consegue fazer login**

   - Verificar se o email está correto
   - Verificar se a senha está correta
   - Verificar se o usuário existe no banco

2. **Sessão não persiste**

   - Verificar se o localStorage está funcionando
   - Verificar se não há erros no console

3. **Erro ao criar usuário**
   - Verificar se o email já existe
   - Verificar se todos os campos obrigatórios estão preenchidos
   - Verificar conexão com o Convex

### Logs

O sistema gera logs no console para debugging:

- Login attempts
- User creation
- Authentication errors

## Próximos Passos

- [ ] Implementar recuperação de senha
- [ ] Adicionar 2FA (autenticação de dois fatores)
- [ ] Implementar roles e permissões
- [ ] Adicionar auditoria de login
- [ ] Implementar rate limiting
