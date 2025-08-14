import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query para buscar todas as notas DO USUÁRIO LOGADO
export const getNotes = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Query para buscar uma nota específica DO USUÁRIO
export const getNote = query({
  args: { id: v.id("notes"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.id);
    // Verificar se a nota pertence ao usuário (only if note has userId)
    if (!note || (note.userId && note.userId !== args.userId)) {
      return null;
    }
    return note;
  },
});

// Mutation para criar uma nota
export const createNote = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("notes", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Mutation para atualizar uma nota
export const updateNote = mutation({
  args: {
    id: v.id("notes"),
    title: v.string(),
    content: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { id, userId, ...updates } = args;
    
    // Verificar se a nota pertence ao usuário (only if note has userId)
    const note = await ctx.db.get(id);
    if (!note || (note.userId && note.userId !== userId)) {
      throw new Error("Acesso negado: você não pode editar esta nota");
    }
    
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Mutation para deletar uma nota
export const deleteNote = mutation({
  args: { id: v.id("notes"), userId: v.id("users") },
  handler: async (ctx, args) => {
    // Verificar se a nota pertence ao usuário (only if note has userId)
    const note = await ctx.db.get(args.id);
    if (!note || (note.userId && note.userId !== args.userId)) {
      throw new Error("Acesso negado: você não pode deletar esta nota");
    }
    
    return await ctx.db.delete(args.id);
  },
});
