#!/bin/bash

echo "🔧 Configurando sistema de administração..."
echo ""

# Executar o script de configuração do admin
echo "📋 Configurando Paloma como administradora..."
npx convex run setup_admin:setupPalomaAsAdmin

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "🔑 Credenciais de administrador:"
echo "   Email: paloma.silva@novakgouveia.com.br"
echo "   Senha: 123456"
echo ""
echo "🎯 Funcionalidades implementadas:"
echo "   ✅ Sistema de administração"
echo "   ✅ Proteção de páginas /settings e /analytics"
echo "   ✅ Criação de usuários por administradores"
echo "   ✅ Ícone de logout no header"
echo "   ✅ Menus condicionais para admins"
echo ""
echo "📖 Para usar o sistema:"
echo "   1. Faça login com o usuário paloma.silva@novakgouveia.com.br"
echo "   2. Acesse /settings para criar novos usuários"
echo "   3. Acesse /analytics para ver os dados (apenas admins)"
echo "" 