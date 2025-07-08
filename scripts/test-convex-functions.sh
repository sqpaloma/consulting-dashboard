#!/bin/bash

# Script para testar as funções do Convex
# Certifique-se de que o Convex está rodando com: npm run convex:dev

echo "🧪 Testando Funções do Convex"
echo "=============================="

# 1. Criar usuário
echo "📝 Criando usuário de teste..."
USER_ID=$(npx convex run users:createOrUpdateUser '{
  "name": "João Silva",
  "email": "joao.silva@example.com",
  "phone": "+55 (11) 99999-8888",
  "position": "Desenvolvedor",
  "department": "Tecnologia",
  "location": "Rio de Janeiro, RJ",
  "company": "Empresa Teste"
}')

echo "✅ Usuário criado com ID: $USER_ID"

# 2. Buscar usuário por email
echo "📋 Buscando usuário por email..."
npx convex run users:getUserByEmail '{"email": "joao.silva@example.com"}'

# 3. Listar todos os usuários
echo "👥 Listando todos os usuários..."
npx convex run users:listUsers

# 4. Alterar senha do usuário
echo "🔒 Testando alteração de senha..."
npx convex run auth:changeUserPassword '{
  "userId": "'$USER_ID'",
  "currentPassword": "",
  "newPassword": "NovaSenh@123"
}'

# 5. Validar senha
echo "✅ Validando senha..."
npx convex run auth:validatePassword '{"password": "NovaSenh@123"}'

# 6. Testar senha inválida
echo "❌ Testando senha inválida..."
npx convex run auth:validatePassword '{"password": "123"}'

echo "🎉 Teste concluído!"
echo "Agora você pode acessar http://localhost:3000/settings para ver o formulário funcionando" 