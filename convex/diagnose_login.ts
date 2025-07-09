import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Hash function (same as used in auth.ts)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// Diagnóstico completo do sistema de autenticação
export const diagnoseLogin = query({
  handler: async (ctx) => {
    // 1. Verificar se existem usuários
    const allUsers = await ctx.db.query("users").collect();

    // 2. Verificar usuários reais (domínio novakgouveia.com)
    const realUsers = allUsers.filter(
      (user) =>
        user.email.includes("@novakgouveia.com") ||
        user.email.includes("@novakgouveia.com.br")
    );

    // 3. Verificar se existe o usuário do email mostrado no screenshot
    const giovanniUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) =>
        q.eq("email", "giovanni.gamero@novakgouveia.com.br")
      )
      .first();

    // 4. Verificar se existe o usuário padrão Paloma
    const palomaUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "paloma@novakgouveia.com"))
      .first();

    // 5. Verificar configurações de usuários
    const userSettings = await ctx.db.query("userSettings").collect();

    return {
      totalUsers: allUsers.length,
      realUsers: realUsers.length,
      realUsersEmails: realUsers.map((u) => u.email),
      giovanniExists: !!giovanniUser,
      giovanniHasPassword: giovanniUser?.hashedPassword ? true : false,
      palomaExists: !!palomaUser,
      palomaHasPassword: palomaUser?.hashedPassword ? true : false,
      usersWithoutPassword: allUsers.filter((u) => !u.hashedPassword).length,
      userSettingsCount: userSettings.length,
      diagnosis: {
        hasUsers: allUsers.length > 0,
        hasRealUsers: realUsers.length > 0,
        hasGiovanni: !!giovanniUser,
        hasPaloma: !!palomaUser,
        canLogin: realUsers.filter((u) => u.hashedPassword).length > 0,
      },
    };
  },
});

// Função para corrigir problemas de login
export const fixLoginIssues = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const fixes = [];

    // 1. Verificar se existe o usuário Giovanni
    const giovanniUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) =>
        q.eq("email", "giovanni.gamero@novakgouveia.com.br")
      )
      .first();

    if (!giovanniUser) {
      // Criar usuário Giovanni
      const hashedPassword = await hashPassword("123456");
      const userId = await ctx.db.insert("users", {
        name: "Giovanni Gamero",
        email: "giovanni.gamero@novakgouveia.com.br",
        position: "Consultor",
        department: "Consultoria",
        hashedPassword,
        createdAt: now,
        updatedAt: now,
      });

      // Criar configurações padrão
      await ctx.db.insert("userSettings", {
        userId,
        emailNotifications: true,
        pushNotifications: true,
        calendarReminders: true,
        projectUpdates: true,
        weeklyReports: false,
        profileVisibility: "public",
        dataSharing: false,
        analyticsTracking: true,
        theme: "dark",
        language: "pt-BR",
        timezone: "America/Sao_Paulo",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24h",
        autoSave: true,
        backupFrequency: "daily",
        sessionTimeout: "30min",
        updatedAt: now,
      });

      fixes.push("Usuário Giovanni criado com senha: 123456");
    } else if (!giovanniUser.hashedPassword) {
      // Adicionar senha ao usuário Giovanni
      const hashedPassword = await hashPassword("123456");
      await ctx.db.patch(giovanniUser._id, {
        hashedPassword,
        updatedAt: now,
      });
      fixes.push("Senha adicionada ao usuário Giovanni: 123456");
    }

    // 2. Verificar se existe o usuário Paloma
    const palomaUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "paloma@novakgouveia.com"))
      .first();

    if (!palomaUser) {
      // Criar usuário Paloma
      const hashedPassword = await hashPassword("123456");
      const userId = await ctx.db.insert("users", {
        name: "Paloma",
        email: "paloma@novakgouveia.com",
        position: "Gerente",
        department: "Administrativo",
        hashedPassword,
        createdAt: now,
        updatedAt: now,
      });

      // Criar configurações padrão
      await ctx.db.insert("userSettings", {
        userId,
        emailNotifications: true,
        pushNotifications: true,
        calendarReminders: true,
        projectUpdates: true,
        weeklyReports: false,
        profileVisibility: "public",
        dataSharing: false,
        analyticsTracking: true,
        theme: "dark",
        language: "pt-BR",
        timezone: "America/Sao_Paulo",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24h",
        autoSave: true,
        backupFrequency: "daily",
        sessionTimeout: "30min",
        updatedAt: now,
      });

      fixes.push("Usuário Paloma criado com senha: 123456");
    } else if (!palomaUser.hashedPassword) {
      // Adicionar senha ao usuário Paloma
      const hashedPassword = await hashPassword("123456");
      await ctx.db.patch(palomaUser._id, {
        hashedPassword,
        updatedAt: now,
      });
      fixes.push("Senha adicionada ao usuário Paloma: 123456");
    }

    // 3. Verificar usuários sem senha
    const usersWithoutPassword = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("hashedPassword"), undefined))
      .collect();

    for (const user of usersWithoutPassword) {
      if (
        user.email.includes("@novakgouveia.com") ||
        user.email.includes("@novakgouveia.com.br")
      ) {
        const hashedPassword = await hashPassword("123456");
        await ctx.db.patch(user._id, {
          hashedPassword,
          updatedAt: now,
        });
        fixes.push(
          `Senha adicionada ao usuário ${user.name} (${user.email}): 123456`
        );
      }
    }

    // 4. Verificar configurações dos usuários
    const allUsers = await ctx.db.query("users").collect();
    for (const user of allUsers) {
      const hasSettings = await ctx.db
        .query("userSettings")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();

      if (!hasSettings) {
        await ctx.db.insert("userSettings", {
          userId: user._id,
          emailNotifications: true,
          pushNotifications: true,
          calendarReminders: true,
          projectUpdates: true,
          weeklyReports: false,
          profileVisibility: "public",
          dataSharing: false,
          analyticsTracking: true,
          theme: "dark",
          language: "pt-BR",
          timezone: "America/Sao_Paulo",
          dateFormat: "DD/MM/YYYY",
          timeFormat: "24h",
          autoSave: true,
          backupFrequency: "daily",
          sessionTimeout: "30min",
          updatedAt: now,
        });
        fixes.push(`Configurações criadas para usuário ${user.name}`);
      }
    }

    return {
      success: true,
      fixes,
      totalFixes: fixes.length,
      message:
        fixes.length > 0
          ? "Problemas corrigidos com sucesso!"
          : "Nenhum problema encontrado",
    };
  },
});

// Função para testar login de um usuário específico
export const testLogin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Buscar usuário
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();

      if (!user) {
        return {
          success: false,
          error: "Usuário não encontrado",
          details: `Email ${args.email} não está cadastrado no sistema`,
        };
      }

      if (!user.hashedPassword) {
        return {
          success: false,
          error: "Usuário sem senha",
          details: `Usuário ${args.email} não possui senha configurada`,
        };
      }

      // Verificar senha
      const hashedPassword = await hashPassword(args.password);
      if (user.hashedPassword !== hashedPassword) {
        return {
          success: false,
          error: "Senha incorreta",
          details: `Senha fornecida não confere com a senha do usuário ${args.email}`,
        };
      }

      // Login bem-sucedido
      await ctx.db.patch(user._id, {
        lastLogin: Date.now(),
      });

      return {
        success: true,
        user: {
          userId: user._id,
          name: user.name,
          email: user.email,
          position: user.position,
          department: user.department,
        },
        message: "Login realizado com sucesso!",
      };
    } catch (error) {
      return {
        success: false,
        error: "Erro interno",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  },
});
