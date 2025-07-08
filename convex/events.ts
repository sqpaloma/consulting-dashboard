import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query para buscar todos os eventos
export const getEvents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").collect();
  },
});

// Query para buscar eventos por data
export const getEventsByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("date"), args.date))
      .collect();
  },
});

// Query para buscar eventos por mês
export const getEventsByMonth = query({
  args: { year: v.number(), month: v.number() },
  handler: async (ctx, args) => {
    const startDate = `${args.year}-${String(args.month).padStart(2, "0")}-01`;
    const endDate = `${args.year}-${String(args.month).padStart(2, "0")}-31`;

    return await ctx.db
      .query("events")
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate)
        )
      )
      .collect();
  },
});

// Mutation para criar um evento
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(),
    time: v.string(),
    duration: v.string(),
    location: v.string(),
    participants: v.array(v.string()),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("events", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Mutation para atualizar um evento
export const updateEvent = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    duration: v.optional(v.string()),
    location: v.optional(v.string()),
    participants: v.optional(v.array(v.string())),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Mutation para deletar um evento
export const deleteEvent = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
