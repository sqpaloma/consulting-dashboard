import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tabela de usuários
  users: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    position: v.optional(v.string()),
    department: v.optional(v.string()),
    location: v.optional(v.string()),
    company: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    hashedPassword: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  // Tabela de configurações dos usuários
  userSettings: defineTable({
    userId: v.id("users"),
    // Notifications
    emailNotifications: v.boolean(),
    pushNotifications: v.boolean(),
    calendarReminders: v.boolean(),
    projectUpdates: v.boolean(),
    weeklyReports: v.boolean(),
    // Privacy
    profileVisibility: v.string(),
    dataSharing: v.boolean(),
    analyticsTracking: v.boolean(),
    // Appearance
    theme: v.string(),
    language: v.string(),
    timezone: v.string(),
    dateFormat: v.string(),
    timeFormat: v.string(),
    // System
    autoSave: v.boolean(),
    backupFrequency: v.string(),
    sessionTimeout: v.string(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

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
