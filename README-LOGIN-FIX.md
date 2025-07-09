# 🔧 Correção de Problemas de Login

## Problema Identificado

O sistema de login não está funcionando no deploy. Este guide vai ajudar a diagnosticar e corrigir o problema.

## Possíveis Causas

1. **Configuração do Convex**: URL não configurada corretamente para produção
2. **Usuário não existe**: O usuário `giovanni.gamero@novakgouveia.com.br` pode não estar cadastrado
3. **Senha não configurada**: Usuário existe mas não tem senha
4. **Conexão com banco**: Problemas de conectividade com o Convex

## Solução Rápida

### 1. Execute o diagnóstico

```bash
# Primeiro, execute o Convex em desenvolvimento
npx convex dev

# Em outro terminal, execute o diagnóstico
npx convex run diagnose_login:diagnoseLogin
```

### 2. Corrija automaticamente

```bash
# Execute a correção automática
npx convex run diagnose_login:fixLoginIssues
```

### 3. Teste o login

```bash
# Teste o login do Giovanni
npx convex run diagnose_login:testLogin '{"email":"giovanni.gamero@novakgouveia.com.br","password":"123456"}'

# Teste o login da Paloma
npx convex run diagnose_login:testLogin '{"email":"paloma@novakgouveia.com","password":"123456"}'
```

## Credenciais Padrão

Após executar a correção, os seguintes usuários estarão disponíveis:

### Giovanni Gamero

- **Email**: giovanni.gamero@novakgouveia.com.br
- **Senha**: 123456
- **Cargo**: Consultor
- **Departamento**: Consultoria

### Paloma

- **Email**: paloma@novakgouveia.com
- **Senha**: 123456
- **Cargo**: Gerente
- **Departamento**: Administrativo

## Para Produção (Deploy)

Se o problema está no deploy de produção, siga estes passos:

### 1. Verificar Configuração do Convex

Certifique-se de que a variável `NEXT_PUBLIC_CONVEX_URL` está configurada no Vercel:

1. Acesse o painel do Vercel
2. Vá em Settings > Environment Variables
3. Adicione `NEXT_PUBLIC_CONVEX_URL` com a URL do seu Convex de produção

### 2. Deploy do Convex

```bash
# Deploy das funções Convex para produção
npx convex deploy
```

### 3. Executar Correção em Produção

```bash
# Execute a correção no ambiente de produção
npx convex run diagnose_login:fixLoginIssues --prod
```

## Verificação Manual

Se preferir verificar manualmente:

### 1. Verificar se usuário existe

```bash
npx convex run users:getUserByEmail '{"email":"giovanni.gamero@novakgouveia.com.br"}'
```

### 2. Criar usuário manualmente

```bash
npx convex run auth:createInitialUser '{"name":"Giovanni Gamero","email":"giovanni.gamero@novakgouveia.com.br","password":"123456","position":"Consultor","department":"Consultoria"}'
```

### 3. Testar login

```bash
npx convex run auth:login '{"email":"giovanni.gamero@novakgouveia.com.br","password":"123456"}'
```

## Troubleshooting

### Erro: "Usuário não encontrado"

- Execute `npx convex run diagnose_login:fixLoginIssues`
- Isso criará os usuários necessários

### Erro: "Senha incorreta"

- A senha padrão é `123456`
- Se alterada, use a nova senha

### Erro: "Cannot connect to Convex"

- Verifique se `npx convex dev` está rodando
- Verifique a configuração da URL do Convex

### Erro: "Function not found"

- Execute `npx convex dev` para sincronizar as funções
- Em produção, execute `npx convex deploy`

## Configuração de Desenvolvimento

Para desenvolvimento local:

```bash
# 1. Instale as dependências
npm install

# 2. Configure o Convex
npx convex dev

# 3. Execute a correção
npx convex run diagnose_login:fixLoginIssues

# 4. Inicie o servidor Next.js
npm run dev
```

## Configuração de Produção

Para produção:

```bash
# 1. Deploy do Convex
npx convex deploy

# 2. Configure as variáveis de ambiente no Vercel
NEXT_PUBLIC_CONVEX_URL=https://your-convex-url

# 3. Execute a correção em produção
npx convex run diagnose_login:fixLoginIssues --prod

# 4. Deploy da aplicação
vercel --prod
```

## Logs e Debugging

Para verificar logs:

```bash
# Logs do Convex
npx convex logs

# Logs específicos da função de login
npx convex logs --function auth:login
```

## Segurança

⚠️ **IMPORTANTE**: Após corrigir o problema:

1. Altere as senhas padrão (`123456`)
2. Configure senhas mais seguras
3. Implemente recuperação de senha
4. Configure variáveis de ambiente adequadas

## Suporte

Se o problema persistir:

1. Verifique os logs do Convex
2. Verifique os logs do Vercel
3. Confirme que todas as variáveis de ambiente estão configuradas
4. Execute o diagnóstico completo novamente

## Scripts Úteis

```bash
# Executar script de ajuda
node scripts/fix-login.js

# Diagnóstico completo
npx convex run diagnose_login:diagnoseLogin

# Correção automática
npx convex run diagnose_login:fixLoginIssues

# Teste de login
npx convex run diagnose_login:testLogin '{"email":"SEU_EMAIL","password":"SUA_SENHA"}'
```
