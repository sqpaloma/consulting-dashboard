import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

    // Verificar senha atual
    const currentHashedPassword = await hashPassword(args.currentPassword);
    if (user.hashedPassword && user.hashedPassword !== currentHashedPassword) {
      throw new Error("Senha atual incorreta");
    }

    // Hash da nova senha
    const newHashedPassword = await hashPassword(args.newPassword);

    // Atualizar senha
    await ctx.db.patch(args.userId, {
      hashedPassword: newHashedPassword,
      updatedAt: Date.now(),
    });

    return true;
  },
});

// Função para validar senha
export const validatePassword = query({
  args: {
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const password = args.password;

    // Validações básicas
    if (password.length < 8) {
      return {
        valid: false,
        error: "A senha deve ter pelo menos 8 caracteres",
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        valid: false,
        error: "A senha deve conter pelo menos uma letra maiúscula",
      };
    }

    if (!/[a-z]/.test(password)) {
      return {
        valid: false,
        error: "A senha deve conter pelo menos uma letra minúscula",
      };
    }

    if (!/[0-9]/.test(password)) {
      return {
        valid: false,
        error: "A senha deve conter pelo menos um número",
      };
    }

    return { valid: true };
  },
});
