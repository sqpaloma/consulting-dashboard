import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query para buscar todas as tarefas
export const getTodos = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("todos").collect();
  },
});

// Query para buscar tarefas por data de vencimento
export const getTodosByDueDate = query({
  args: { dueDate: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("dueDate"), args.dueDate))
      .collect();
  },
});

// Query para buscar tarefas pendentes
export const getPendingTodos = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("completed"), false))
      .collect();
  },
});

// Query para buscar tarefas concluídas
export const getCompletedTodos = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("completed"), true))
      .collect();
  },
});

// Mutation para criar uma tarefa
export const createTodo = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.string(),
    dueDate: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("todos", {
      ...args,
      completed: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Mutation para atualizar uma tarefa
export const updateTodo = mutation({
  args: {
    id: v.id("todos"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    priority: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Mutation para marcar tarefa como concluída
export const toggleTodoComplete = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.id);
    if (!todo) throw new Error("Tarefa não encontrada");

    return await ctx.db.patch(args.id, {
      completed: !todo.completed,
      updatedAt: Date.now(),
    });
  },
});

// Mutation para deletar uma tarefa
export const deleteTodo = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
