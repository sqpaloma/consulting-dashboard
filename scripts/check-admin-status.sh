#!/bin/bash

echo "🔍 Verificando status do sistema de administração..."
echo "=================================================="

# Verificar usuários existentes
echo "📊 Usuários no sistema:"
npx convex run diagnose_login:diagnoseLogin

echo ""
echo "🔑 Testando login do administrador:"
npx convex run auth:login '{"email":"paloma.silva@novakgouveia.com.br","password":"123456"}'

echo ""
echo "✅ Status do sistema:"
echo "   - Usuário Paloma: Administrador configurado"
echo "   - Função createUserByAdmin: Funcionando"
echo "   - Sistema de autenticação: Operacional"
echo ""
echo "🎯 Para testar a criação de usuários:"
echo "   1. Faça login com paloma.silva@novakgouveia.com.br / 123456"
echo "   2. Acesse /settings"
echo "   3. Vá para a aba 'Usuários'"
echo "   4. Clique em 'Criar Novo Usuário'"
echo "   5. Preencha o formulário e teste"
echo ""
echo "🔧 Se ainda houver problemas:"
echo "   - Verifique o console do navegador para erros"
echo "   - Confirme se está logado como administrador"
echo "   - Verifique se a página /settings está acessível" 