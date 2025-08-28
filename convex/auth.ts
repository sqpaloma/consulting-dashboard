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

    const isGiovanni =
      (user.email || "").toLowerCase() ===
      "giovanni.gamero@novakgouveia.com.br";
    const isGabriel =
      (user.email || "").toLowerCase() === "gabriel.novaes@novakgouveia.com.br";
    const isPauloSergio =
      (user.email || "").toLowerCase() === "paulo.sergio@novakgouveia.com.br";

    const derivedRole = isGiovanni
      ? "gerente"
      : isGabriel || isPauloSergio
        ? "qualidade_pcp"
        : user.role || (user.isAdmin ? "admin" : "consultor");

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      position: user.position,
      department: user.department,
      isAdmin: user.isAdmin || false,
      role: derivedRole,
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
    role: v.optional(v.string()),
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

    // Definir papel e admin - Paloma é sempre admin
    const isPaloma = args.email === "paloma.silva@novakgouveia.com.br";
    const isGiovanni = args.email === "giovanni.gamero@novakgouveia.com.br";
    const isGabriel = args.email === "gabriel.novaes@novakgouveia.com.br";
    const isPauloSergio = args.email === "paulo.sergio@novakgouveia.com.br";

    const role =
      args.role ||
      (isPaloma
        ? "admin"
        : isGiovanni
          ? "gerente"
          : isGabriel || isPauloSergio
            ? "qualidade_pcp"
            : "consultor");
    const isAdmin = isPaloma || role === "admin" || args.isAdmin || false;

    // Criar usuário
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      position: args.position,
      department: args.department,
      hashedPassword,
      isAdmin,
      role,
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
      role,
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
    role: v.optional(v.string()),
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

    // Definir papel e admin - Paloma é sempre admin
    const isPaloma = args.email === "paloma.silva@novakgouveia.com.br";
    const isGiovanni = args.email === "giovanni.gamero@novakgouveia.com.br";
    const isGabriel = args.email === "gabriel.novaes@novakgouveia.com.br";
    const isPauloSergio = args.email === "paulo.sergio@novakgouveia.com.br";

    const role =
      args.role ||
      (args.isAdmin
        ? "admin"
        : isGiovanni
          ? "gerente"
          : isGabriel || isPauloSergio
            ? "qualidade_pcp"
            : "consultor");
    const isAdmin = isPaloma || role === "admin" || args.isAdmin || false;

    // Criar usuário
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      position: args.position,
      department: args.department,
      hashedPassword,
      isAdmin,
      role,
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
      role,
    };
  },
});

// CRUD de permissões por papel
export const getRolePermissions = query({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("rolePermissions")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .first();
    return row || null;
  },
});

export const listRolePermissions = query({
  handler: async (ctx) => {
    return await ctx.db.query("rolePermissions").collect();
  },
});

export const upsertRolePermissions = mutation({
  args: {
    role: v.string(),
    accessDashboard: v.boolean(),
    accessChat: v.boolean(),
    accessManual: v.boolean(),
    accessIndicadores: v.boolean(),
    accessAnalise: v.boolean(),
    accessSettings: v.boolean(),
    dashboardDataScope: v.string(),
    dashboardFilterVisible: v.boolean(),
    chatDataScope: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rolePermissions")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .first();

    const payload = { ...args, updatedAt: Date.now() } as any;

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    } else {
      return await ctx.db.insert("rolePermissions", payload);
    }
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
        role: "admin",
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
        role: "admin",
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

// Função para inicializar permissões padrão do role qualidade_pcp
export const initializeQualidadePcpPermissions = mutation({
  handler: async (ctx) => {
    // Verificar se já existe permissão para qualidade_pcp
    const existing = await ctx.db
      .query("rolePermissions")
      .withIndex("by_role", (q) => q.eq("role", "qualidade_pcp"))
      .first();

    if (!existing) {
      // Criar permissões para qualidade_pcp
      await ctx.db.insert("rolePermissions", {
        role: "qualidade_pcp",
        // Páginas
        accessDashboard: true,
        accessChat: true,
        accessManual: true,
        accessIndicadores: true, // Acesso à página de indicadores
        accessAnalise: true,
        accessSettings: false, // Sem acesso às configurações
        // Regras de visualização
        dashboardDataScope: "all", // Pode ver todos os dados
        dashboardFilterVisible: true,
        chatDataScope: "all",
        // Metadados
        updatedAt: Date.now(),
      });

      console.log("Permissões inicializadas para role qualidade_pcp");
      return {
        success: true,
        message: "Permissões criadas para qualidade_pcp",
      };
    } else {
      console.log("Permissões já existem para role qualidade_pcp");
      return { success: false, message: "Permissões já existem" };
    }
  },
});

// Função para criar usuários Gabriel e Paulo Sergio com role qualidade_pcp
export const createQualidadePcpUsers = mutation({
  handler: async (ctx) => {
    const users = [
      {
        name: "Gabriel Novaes",
        email: "gabriel.novaes@novakgouveia.com.br",
        password: "Gabriel@2024", // Senha temporária - deve ser alterada no primeiro login
        position: "Analista de Qualidade e PCP",
        department: "qualidade",
        role: "qualidade_pcp",
      },
      {
        name: "Paulo Sergio",
        email: "paulo.sergio@novakgouveia.com.br",
        password: "Paulo@2024", // Senha temporária - deve ser alterada no primeiro login
        position: "Analista de Qualidade e PCP",
        department: "qualidade",
        role: "qualidade_pcp",
      },
    ];

    const results = [];

    for (const userData of users) {
      // Verificar se o usuário já existe
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", userData.email))
        .first();

      if (existingUser) {
        console.log(`Usuário ${userData.email} já existe`);
        results.push({
          email: userData.email,
          status: "already_exists",
          message: "Usuário já existe",
        });
        continue;
      }

      // Hash da senha
      const hashedPassword = await hashPassword(userData.password);

      // Criar usuário
      const userId = await ctx.db.insert("users", {
        name: userData.name,
        email: userData.email,
        position: userData.position,
        department: userData.department,
        hashedPassword,
        isAdmin: false,
        role: userData.role,
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

      console.log(`Usuário ${userData.email} criado com sucesso`);
      results.push({
        email: userData.email,
        status: "created",
        message: "Usuário criado com sucesso",
        tempPassword: userData.password,
      });
    }

    return {
      success: true,
      results: results,
    };
  },
});

// Função para atualizar o role dos usuários Gabriel e Paulo Sergio para qualidade_pcp
export const updateQualidadePcpUsersRole = mutation({
  handler: async (ctx) => {
    const emails = [
      "gabriel.novaes@novakgouveia.com.br",
      "paulo.sergio@novakgouveia.com.br",
    ];

    const results = [];

    for (const email of emails) {
      // Buscar o usuário
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      if (!user) {
        results.push({
          email: email,
          status: "not_found",
          message: "Usuário não encontrado",
        });
        continue;
      }

      // Atualizar o role se necessário
      if (user.role !== "qualidade_pcp") {
        await ctx.db.patch(user._id, {
          role: "qualidade_pcp",
          updatedAt: Date.now(),
        });

        console.log(`Role do usuário ${email} atualizado para qualidade_pcp`);
        results.push({
          email: email,
          status: "updated",
          message: `Role atualizado de ${user.role || "undefined"} para qualidade_pcp`,
          previousRole: user.role,
        });
      } else {
        console.log(`Usuário ${email} já possui role qualidade_pcp`);
        results.push({
          email: email,
          status: "already_correct",
          message: "Usuário já possui role qualidade_pcp",
        });
      }
    }

    return {
      success: true,
      results: results,
    };
  },
});

export const initializeGerentePermissions = mutation({
  handler: async (ctx) => {
    // Verificar se já existe permissão para gerente
    const existing = await ctx.db
      .query("rolePermissions")
      .withIndex("by_role", (q) => q.eq("role", "gerente"))
      .first();

    if (!existing) {
      // Criar permissões para gerente
      await ctx.db.insert("rolePermissions", {
        role: "gerente",
        // Páginas
        accessDashboard: true,
        accessChat: true,
        accessManual: true,
        accessIndicadores: true, // Acesso à página de indicadores
        accessAnalise: true,
        accessSettings: true, // Gerente tem acesso às configurações
        // Regras de visualização
        dashboardDataScope: "all", // Pode ver todos os dados
        dashboardFilterVisible: true, // IMPORTANTE: Acesso aos filtros
        chatDataScope: "all",
        // Metadados
        updatedAt: Date.now(),
      });

      console.log("Permissões inicializadas para role gerente");
      return {
        success: true,
        message: "Permissões criadas para gerente",
      };
    } else {
      console.log("Permissões já existem para role gerente");
      return {
        success: false,
        message: "Permissões já existem para gerente",
      };
    }
  },
});

export const updateGiovanniRole = mutation({
  handler: async (ctx) => {
    // Buscar o usuário do Giovanni
    const giovanni = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "giovanni.gamero@novakgouveia.com.br"))
      .first();

    if (!giovanni) {
      throw new Error("Usuário Giovanni não encontrado");
    }

    // Atualizar o role para "gerente"
    await ctx.db.patch(giovanni._id, {
      role: "gerente",
      updatedAt: Date.now(),
    });

    console.log("Role do Giovanni atualizado para 'gerente'");
    return {
      success: true,
      message: "Role do Giovanni atualizado para gerente",
      userId: giovanni._id,
    };
  },
});
