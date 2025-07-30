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
      .filter((q) => q.eq(q.field("status"), "todo"))
      .collect();
  },
});

// Query para buscar tarefas em progresso
export const getInProgressTodos = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("status"), "in-progress"))
      .collect();
  },
});

// Query para buscar tarefas concluídas
export const getCompletedTodos = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();
  },
});

// Mutation para migrar tarefas existentes
export const migrateTodos = mutation({
  args: {},
  handler: async (ctx) => {
    const todos = await ctx.db.query("todos").collect();
    let updated = 0;

    for (const todo of todos) {
      if (!todo.status) {
        const status = todo.completed ? "completed" : "todo";
        await ctx.db.patch(todo._id, {
          status: status,
          updatedAt: Date.now(),
        });
        updated++;
      }
    }

    return { updated };
  },
});

// Mutation para criar uma tarefa
export const createTodo = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.string(),
    dueDate: v.optional(v.string()),
    scheduledDate: v.optional(v.string()),
    responsible: v.optional(v.string()),
    category: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("todos", {
      ...args,
      status: args.status || "todo",
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
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    scheduledDate: v.optional(v.string()),
    responsible: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Se o status foi atualizado, também atualiza o completed
    if (updates.status) {
      updates.completed = updates.status === "completed";
    }

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

    const newStatus = todo.completed ? "todo" : "completed";

    return await ctx.db.patch(args.id, {
      completed: !todo.completed,
      status: newStatus,
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

// Mutation para limpar todas as tarefas concluídas
export const clearCompletedTodos = mutation({
  args: {},
  handler: async (ctx) => {
    const allTodos = await ctx.db.query("todos").collect();

    let deleted = 0;
    for (const todo of allTodos) {
      // Verifica se a tarefa está concluída (por status ou campo completed)
      const isCompleted =
        todo.status === "completed" ||
        (todo.completed === true && !todo.status);

      if (isCompleted) {
        await ctx.db.delete(todo._id);
        deleted++;
      }
    }

    return { deleted };
  },
});
