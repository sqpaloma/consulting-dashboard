import { internalMutation } from "./_generated/server";

// Função para limpar dados de teste do chat
export const cleanupTestData = internalMutation({
  handler: async (ctx) => {
    console.log("Limpando dados de teste...");

    // Limpar mensagens
    const messages = await ctx.db.query("messages").collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    console.log(`Removidas ${messages.length} mensagens`);

    // Limpar participantes de conversas
    const participants = await ctx.db
      .query("conversationParticipants")
      .collect();
    for (const participant of participants) {
      await ctx.db.delete(participant._id);
    }
    console.log(`Removidos ${participants.length} participantes`);

    // Limpar conversas
    const conversations = await ctx.db.query("conversations").collect();
    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }
    console.log(`Removidas ${conversations.length} conversas`);

    // Remover usuários de teste (manter apenas os reais)
    const users = await ctx.db.query("users").collect();
    const realUsers = users.filter(
      (user) =>
        user.email.includes("@novakgouveia.com") ||
        user.email.includes("@novakgouveia.com.br")
    );

    const testUsers = users.filter(
      (user) =>
        !user.email.includes("@novakgouveia.com") &&
        !user.email.includes("@novakgouveia.com.br")
    );

    for (const testUser of testUsers) {
      await ctx.db.delete(testUser._id);
    }
    console.log(`Removidos ${testUsers.length} usuários de teste`);
    console.log(`Mantidos ${realUsers.length} usuários reais`);

    // Limpar configurações de usuários de teste
    const settings = await ctx.db.query("userSettings").collect();
    const realUserIds = realUsers.map((u) => u._id);
    const testSettings = settings.filter(
      (s) => !realUserIds.includes(s.userId)
    );

    for (const testSetting of testSettings) {
      await ctx.db.delete(testSetting._id);
    }
    console.log(
      `Removidas ${testSettings.length} configurações de usuários de teste`
    );

    console.log("Limpeza concluída!");

    return {
      messagesRemoved: messages.length,
      participantsRemoved: participants.length,
      conversationsRemoved: conversations.length,
      testUsersRemoved: testUsers.length,
      realUsersKept: realUsers.length,
      testSettingsRemoved: testSettings.length,
    };
  },
});
