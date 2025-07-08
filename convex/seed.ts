import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const seedUser = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Verificar se o usuário já existe
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) =>
        q.eq("email", "paloma.silva@novakgouveia.com")
      )
      .first();

    if (existingUser) {
      console.log("Usuário já existe");
      return existingUser._id;
    }

    // Criar usuário de exemplo
    const userId = await ctx.db.insert("users", {
      name: "Paloma Silva",
      email: "paloma.silva@novakgouveia.com",
      phone: "+55 (11) 99999-9999",
      position: "Consultora Senior",
      department: "Engenharia",
      location: "São Paulo, SP",
      company: "Novak & Gouveia",
      createdAt: now,
      updatedAt: now,
    });

    // Criar configurações padrão
    await ctx.db.insert("userSettings", {
      userId,
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

    console.log("Usuário criado com sucesso:", userId);
    return userId;
  },
});
