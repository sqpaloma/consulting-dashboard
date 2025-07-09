# 🔧 Fix para Login no Deploy

## Problema

No deploy, não está aparecendo a opção "Criar Novo Usuário" na tela de login. Isso acontece porque o botão só aparece quando `hasUsers` é `false`, mas no deploy já existem usuários no banco.

## Solução

### 1. Correção Automática

Execute o script de correção:

```bash
chmod +x scripts/fix-deploy-login.sh
./scripts/fix-deploy-login.sh
```

### 2. Correção Manual

Se preferir fazer manualmente, execute os seguintes comandos:

```bash
# 1. Verificar status atual
npx convex run diagnose_login:diagnoseLogin

# 2. Corrigir problemas
npx convex run diagnose_login:fixLoginIssues

# 3. Testar login
npx convex run diagnose_login:testLogin '{"email":"giovanni.gamero@novakgouveia.com.br","password":"123456"}'
```

### 3. Para Produção

Se você estiver fazendo deploy em produção, adicione `--prod` aos comandos:

```bash
npx convex run diagnose_login:fixLoginIssues --prod
```

## O que Foi Corrigido

1. **Modificado o sistema de autenticação**: Agora o botão "Criar Novo Usuário" sempre aparece
2. **Criado usuário Giovanni**: Email `giovanni.gamero@novakgouveia.com.br`, senha `123456`
3. **Criado usuário Paloma**: Email `paloma@novakgouveia.com`, senha `123456`
4. **Adicionada função `allowNewUsers`**: Permite criar usuários mesmo quando já existem outros

## Credenciais Disponíveis

Após executar a correção, você pode usar:

### Giovanni Gamero

- **Email**: `giovanni.gamero@novakgouveia.com.br`
- **Senha**: `123456`
- **Cargo**: Consultor
- **Departamento**: Consultoria

### Paloma

- **Email**: `paloma@novakgouveia.com`
- **Senha**: `123456`
- **Cargo**: Gerente
- **Departamento**: Administrativo

## Como Criar Novos Usuários

Agora você pode criar novos usuários de duas formas:

### 1. Pela Interface Web

1. Acesse o dashboard
2. Clique em "Criar Novo Usuário" (agora sempre visível)
3. Preencha o formulário
4. Clique em "Criar Usuário"

### 2. Via Convex

```bash
npx convex run auth:createInitialUser '{
  "name": "Nome do Usuário",
  "email": "email@novakgouveia.com",
  "password": "senhaSegura",
  "position": "Cargo",
  "department": "Departamento"
}'
```

## Verificação

Para verificar se tudo está funcionando:

```bash
# Verificar usuários existentes
npx convex run diagnose_login:diagnoseLogin

# Verificar se pode criar novos usuários
npx convex run auth:allowNewUsers

# Testar login
npx convex run diagnose_login:testLogin '{"email":"SEU_EMAIL","password":"SUA_SENHA"}'
```

## Arquivos Modificados

- ✅ `convex/auth.ts` - Adicionada função `allowNewUsers`
- ✅ `hooks/use-auth.ts` - Incluída nova função
- ✅ `components/auth/login-page.tsx` - Botão sempre visível
- ✅ `scripts/fix-deploy-login.sh` - Script de correção

## Segurança

⚠️ **IMPORTANTE**: Após fazer login pela primeira vez:

1. Altere as senhas padrão (`123456`)
2. Configure senhas mais seguras
3. Adicione mais usuários conforme necessário

## Problemas Comuns

### "Cannot connect to Convex"

- Verifique se o Convex está configurado corretamente
- Certifique-se de que `NEXT_PUBLIC_CONVEX_URL` está definida
- Execute `npx convex dev` para desenvolvimento

### "Function not found"

- Execute `npx convex dev` para sincronizar as funções
- Em produção, execute `npx convex deploy`

### "User already exists"

- Isso é normal, significa que os usuários já foram criados

## Suporte

Se o problema persistir:

1. Verifique os logs do Convex: `npx convex logs`
2. Verifique a configuração do ambiente
3. Execute o diagnóstico: `npx convex run diagnose_login:diagnoseLogin`

## Comandos Úteis

```bash
# Diagnóstico completo
npx convex run diagnose_login:diagnoseLogin

# Correção automática
npx convex run diagnose_login:fixLoginIssues

# Testar login específico
npx convex run diagnose_login:testLogin '{"email":"SEU_EMAIL","password":"SUA_SENHA"}'

# Verificar se pode criar novos usuários
npx convex run auth:allowNewUsers

# Verificar se há usuários
npx convex run auth:hasUsers
```

---

✅ **Agora o botão "Criar Novo Usuário" deve aparecer sempre na tela de login!**
