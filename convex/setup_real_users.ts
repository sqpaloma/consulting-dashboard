import { internalMutation } from "./_generated/server";

// Função para configurar usuários reais com configurações padrão
export const setupRealUsers = internalMutation({
  handler: async (ctx) => {
    console.log("Configurando usuários reais...");

    // Buscar todos os usuários reais
    const users = await ctx.db.query("users").collect();
    const realUsers = users.filter(
      (user) =>
        user.email.includes("@novakgouveia.com") ||
        user.email.includes("@novakgouveia.com.br")
    );

    console.log(`Encontrados ${realUsers.length} usuários reais`);

    const now = Date.now();

    for (const user of realUsers) {
      // Verificar se já tem configurações
      const existingSettings = await ctx.db
        .query("userSettings")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();

      if (!existingSettings) {
        // Criar configurações padrão
        await ctx.db.insert("userSettings", {
          userId: user._id,
          // Notifications
          emailNotifications: true,
          pushNotifications: true,
          calendarReminders: true,
          projectUpdates: true,
          weeklyReports: false,
          // Privacy
          profileVisibility: "public",
          dataSharing: false,
          analyticsTracking: true,
          // Appearance
          theme: "dark",
          language: "pt-BR",
          timezone: "America/Sao_Paulo",
          dateFormat: "DD/MM/YYYY",
          timeFormat: "24h",
          // System
          autoSave: true,
          backupFrequency: "daily",
          sessionTimeout: "30min",
          updatedAt: now,
        });

        console.log(`Configurações criadas para ${user.name}`);
      } else {
        console.log(`Configurações já existem para ${user.name}`);
      }
    }

    console.log("Configuração dos usuários reais concluída!");

    return {
      realUsersFound: realUsers.length,
      message: "Usuários reais configurados com sucesso!",
    };
  },
});
