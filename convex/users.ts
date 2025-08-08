import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Criar ou atualizar usuário
export const createOrUpdateUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    position: v.optional(v.string()),
    department: v.optional(v.string()),
    location: v.optional(v.string()),
    company: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verificar se o usuário já existe
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      // Atualizar usuário existente
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        phone: args.phone,
        position: args.position,
        department: args.department,
        location: args.location,
        company: args.company,
        avatarUrl: args.avatarUrl,
        updatedAt: now,
      });
      return existingUser._id;
    } else {
      // Criar novo usuário
      const userId = await ctx.db.insert("users", {
        name: args.name,
        email: args.email,
        phone: args.phone,
        position: args.position,
        department: args.department,
        location: args.location,
        company: args.company,
        avatarUrl: args.avatarUrl,
        createdAt: now,
        updatedAt: now,
      });

      // Criar configurações padrão para o usuário
      await ctx.db.insert("userSettings", {
        userId: userId,
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

      return userId;
    }
  },
});

// Buscar usuário por email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) return null;

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return {
      user,
      settings,
    };
  },
});

// Buscar usuário por ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) return null;

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return {
      user,
      settings,
    };
  },
});

// Atualizar configurações do usuário
export const updateUserSettings = mutation({
  args: {
    userId: v.id("users"),
    emailNotifications: v.optional(v.boolean()),
    pushNotifications: v.optional(v.boolean()),
    calendarReminders: v.optional(v.boolean()),
    projectUpdates: v.optional(v.boolean()),
    weeklyReports: v.optional(v.boolean()),
    profileVisibility: v.optional(v.string()),
    dataSharing: v.optional(v.boolean()),
    analyticsTracking: v.optional(v.boolean()),
    theme: v.optional(v.string()),
    language: v.optional(v.string()),
    timezone: v.optional(v.string()),
    dateFormat: v.optional(v.string()),
    timeFormat: v.optional(v.string()),
    autoSave: v.optional(v.boolean()),
    backupFrequency: v.optional(v.string()),
    sessionTimeout: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!settings) {
      throw new Error("Configurações do usuário não encontradas");
    }

    // Filtrar valores undefined
    const filteredUpdates = Object.entries(updates).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          (acc as any)[key] = value;
        }
        return acc;
      },
      {} as Record<string, any>
    );

    await ctx.db.patch(settings._id, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });

    return settings._id;
  },
});

// Alterar senha do usuário
export const updateUserPassword = mutation({
  args: {
    userId: v.id("users"),
    hashedPassword: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      hashedPassword: args.hashedPassword,
      updatedAt: Date.now(),
    });
  },
});

// Atualizar avatar do usuário
export const updateUserAvatar = mutation({
  args: {
    userId: v.id("users"),
    avatarUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      avatarUrl: args.avatarUrl,
      updatedAt: Date.now(),
    });
  },
});

// Listar todos os usuários
export const listUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Atualizar perfil do usuário (admin)
export const updateUserProfileByAdmin = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    position: v.optional(v.string()),
    department: v.optional(v.string()),
    location: v.optional(v.string()),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    // Filtrar valores undefined
    const filteredUpdates = Object.entries(updates).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          (acc as any)[key] = value;
        }
        return acc;
      },
      {} as Record<string, any>
    );

    await ctx.db.patch(userId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });

    return userId;
  },
});
