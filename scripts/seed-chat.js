#!/usr/bin/env node

const { exec } = require("child_process");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🚀 Script de Seed do Chat");
console.log("========================");
console.log("Este script irá criar dados de exemplo para o chat.");
console.log("Certifique-se de que o Convex está rodando (npx convex dev).");
console.log("");

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function runConvexCommand(command, description) {
  console.log(`\n📝 ${description}...`);

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erro: ${error.message}`);
        reject(error);
        return;
      }

      if (stderr) {
        console.error(`⚠️  Aviso: ${stderr}`);
      }

      console.log(`✅ ${description} concluído!`);
      console.log(stdout);
      resolve(stdout);
    });
  });
}

async function main() {
  try {
    console.log("Verificando se o Convex está rodando...");

    // Perguntar se deve continuar
    const continuar = await askQuestion("Deseja continuar com o seed? (s/n): ");

    if (continuar.toLowerCase() !== "s" && continuar.toLowerCase() !== "sim") {
      console.log("❌ Seed cancelado pelo usuário.");
      rl.close();
      return;
    }

    // Executar os comandos de seed
    console.log("\n🔄 Iniciando processo de seed...");

    // Criar usuários
    await runConvexCommand(
      "npx convex run seed_chat:seedUsers",
      "Criando usuários de exemplo"
    );

    // Aguardar um pouco
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Criar conversas
    await runConvexCommand(
      "npx convex run seed_chat:seedConversations",
      "Criando conversas de exemplo"
    );

    // Aguardar um pouco
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Criar mensagens
    await runConvexCommand(
      "npx convex run seed_chat:seedMessages",
      "Criando mensagens de exemplo"
    );

    console.log("\n🎉 Seed concluído com sucesso!");
    console.log("");
    console.log("Usuários criados (senha: 123456):");
    console.log("- Paloma Santos - paloma@empresa.com");
    console.log("- João Silva - joao@empresa.com");
    console.log("- Maria Costa - maria@empresa.com");
    console.log("- Pedro Oliveira - pedro@empresa.com");
    console.log("");
    console.log("Agora você pode:");
    console.log("1. Acessar /auth para fazer login");
    console.log("2. Ir para /chat para usar o chat");
    console.log("3. Testar as funcionalidades do chat");
  } catch (error) {
    console.error("\n❌ Erro durante o seed:", error.message);
    console.log("\nVerifique se:");
    console.log("1. O Convex está rodando (npx convex dev)");
    console.log("2. Você está no diretório correto do projeto");
    console.log("3. As dependências estão instaladas");
  } finally {
    rl.close();
  }
}

// Executar o script
main().catch(console.error);
