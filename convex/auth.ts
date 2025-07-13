import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Função para fazer login
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    if (!user.hashedPassword) {
      throw new Error("Usuário não possui senha configurada");
    }

    // Verificar senha
    const hashedPassword = await hashPassword(args.password);
    if (user.hashedPassword !== hashedPassword) {
      throw new Error("Senha incorreta");
    }

    // Atualizar último login
    await ctx.db.patch(user._id, {
      lastLogin: Date.now(),
    });

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      position: user.position,
      department: user.department,
      isAdmin: user.isAdmin || false,
    };
  },
});

// Função para criar usuário inicial
export const createInitialUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    position: v.optional(v.string()),
    department: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Verificar se o usuário já existe
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("Usuário já existe");
    }

    // Hash da senha
    const hashedPassword = await hashPassword(args.password);

    // Definir se é admin - Paloma é sempre admin
    const isAdmin =
      args.email === "paloma.silva@novakgouveia.com.br" ||
      args.isAdmin ||
      false;

    // Criar usuário
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      position: args.position,
      department: args.department,
      hashedPassword,
      isAdmin,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Criar configurações padrão
    await ctx.db.insert("userSettings", {
      userId: userId,
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
      updatedAt: Date.now(),
    });

    return {
      userId,
      name: args.name,
      email: args.email,
      position: args.position,
      department: args.department,
      isAdmin,
    };
  },
});

// Função para verificar se existe algum usuário
export const hasUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.length > 0;
  },
});

// Função para verificar se deve permitir criação de novos usuários
export const allowNewUsers = query({
  handler: async (ctx) => {
    // Sempre permitir criação de novos usuários
    return true;
  },
});

// Verificar se uma senha está correta
export const verifyPassword = mutation({
  args: {
    userId: v.id("users"),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return false;
    }

    // Implementação simples para demonstração
    // Em produção, use bcrypt ou outra biblioteca de hash
    const hashedPassword = await hashPassword(args.password);
    return user.hashedPassword === hashedPassword;
  },
});

// Hash simples para demonstração
async function hashPassword(password: string): Promise<string> {
  // Para demonstração, usamos um hash simples
  // Em produção, use bcrypt
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// Função para fazer hash da senha
export const hashUserPassword = mutation({
  args: {
    password: v.string(),
  },
  handler: async (ctx, args) => {
    return await hashPassword(args.password);
  },
});

// Alterar senha do usuário
export const changeUserPassword = mutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    if (!user.hashedPassword) {
      throw new Error("Usuário não possui senha configurada");
    }

    // Verificar senha atual
    const currentHashedPassword = await hashPassword(args.currentPassword);
    if (user.hashedPassword !== currentHashedPassword) {
      throw new Error("Senha atual incorreta");
    }

    // Gerar hash da nova senha
    const newHashedPassword = await hashPassword(args.newPassword);

    // Atualizar senha
    await ctx.db.patch(args.userId, {
      hashedPassword: newHashedPassword,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Função para criar usuário por administrador
export const createUserByAdmin = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    position: v.optional(v.string()),
    department: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
    createdByUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verificar se o usuário que está criando é admin
    const createdBy = await ctx.db.get(args.createdByUserId);
    if (
      !createdBy ||
      (!createdBy.isAdmin &&
        createdBy.email !== "paloma.silva@novakgouveia.com.br")
    ) {
      throw new Error("Apenas administradores podem criar novos usuários");
    }

    // Verificar se o usuário já existe
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("Usuário já existe");
    }

    // Hash da senha
    const hashedPassword = await hashPassword(args.password);

    // Definir se é admin - Paloma é sempre admin
    const isAdmin =
      args.email === "paloma.silva@novakgouveia.com.br" ||
      args.isAdmin ||
      false;

    // Criar usuário
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      position: args.position,
      department: args.department,
      hashedPassword,
      isAdmin,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Criar configurações padrão
    await ctx.db.insert("userSettings", {
      userId: userId,
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
      updatedAt: Date.now(),
    });

    return {
      userId,
      name: args.name,
      email: args.email,
      position: args.position,
      department: args.department,
      isAdmin,
    };
  },
});

// Função para validar critérios de senha
export const validatePassword = mutation({
  args: {
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const password = args.password;
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    return {
      isValid:
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers,
      criteria: {
        minLength: password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
      },
    };
  },
});

// Função para configurar administrador
export const setupAdmin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Verificar se o usuário já existe
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      // Atualizar usuário existente para ser admin e redefinir senha
      const hashedPassword = await hashPassword(args.password);
      await ctx.db.patch(existingUser._id, {
        isAdmin: true,
        hashedPassword,
        updatedAt: Date.now(),
      });

      return {
        success: true,
        message: "Usuário atualizado como administrador",
        userId: existingUser._id,
      };
    } else {
      // Criar novo usuário admin
      const hashedPassword = await hashPassword(args.password);

      const userId = await ctx.db.insert("users", {
        name: "Paloma Queiroz",
        email: args.email,
        position: "Administradora",
        department: "Administrativo",
        hashedPassword,
        isAdmin: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Criar configurações padrão
      await ctx.db.insert("userSettings", {
        userId: userId,
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
        updatedAt: Date.now(),
      });

      return {
        success: true,
        message: "Usuário criado como administrador",
        userId,
      };
    }
  },
});
