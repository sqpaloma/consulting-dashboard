#!/bin/bash

# Script para corrigir problemas de login no deploy
# Execute este script após o deploy para garantir que o login funcione corretamente

echo "🔧 Corrigindo problemas de login no deploy..."
echo "============================================"

# Verificar se o Convex está configurado
if ! command -v npx &> /dev/null; then
    echo "❌ NPX não encontrado. Instale o Node.js primeiro."
    exit 1
fi

# Verificar status atual
echo "📊 Verificando status atual..."
npx convex run diagnose_login:diagnoseLogin

# Corrigir problemas de login
echo "🔄 Corrigindo problemas de login..."
npx convex run diagnose_login:fixLoginIssues

# Testar login do Giovanni
echo "🧪 Testando login do Giovanni..."
npx convex run diagnose_login:testLogin '{"email":"giovanni.gamero@novakgouveia.com.br","password":"123456"}'

# Testar login da Paloma
echo "🧪 Testando login da Paloma..."
npx convex run diagnose_login:testLogin '{"email":"paloma@novakgouveia.com","password":"123456"}'

echo "✅ Correção concluída!"
echo ""
echo "🎉 Agora você pode:"
echo "1. Fazer login com:"
echo "   - Email: giovanni.gamero@novakgouveia.com.br"
echo "   - Senha: 123456"
echo ""
echo "2. Ou criar um novo usuário usando o botão 'Criar Novo Usuário'"
echo ""
echo "3. Ou usar o usuário padrão:"
echo "   - Email: paloma@novakgouveia.com"
echo "   - Senha: 123456"
echo ""
echo "⚠️  IMPORTANTE: Altere as senhas padrão após o primeiro login!" 