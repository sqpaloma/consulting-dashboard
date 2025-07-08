import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(), // formato: YYYY-MM-DD
    time: v.string(),
    duration: v.string(),
    location: v.string(),
    participants: v.array(v.string()),
    color: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  todos: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
    priority: v.string(), // "low", "medium", "high"
    dueDate: v.optional(v.string()), // formato: YYYY-MM-DD
    category: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});
