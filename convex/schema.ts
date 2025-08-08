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
    isAdmin: v.optional(v.boolean()),
    role: v.optional(v.string()),
    lastLogin: v.optional(v.number()),
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

  // Permissões por papel (perfil)
  rolePermissions: defineTable({
    role: v.string(),
    // Páginas
    accessDashboard: v.boolean(),
    accessChat: v.boolean(),
    accessManual: v.boolean(),
    accessIndicadores: v.boolean(),
    accessAnalise: v.boolean(),
    accessSettings: v.boolean(),
    // Regras de visualização
    dashboardDataScope: v.string(), // "own" | "all"
    dashboardFilterVisible: v.boolean(),
    chatDataScope: v.string(), // "own" | "all"
    // Metadados
    updatedAt: v.number(),
  }).index("by_role", ["role"]),

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
    status: v.optional(v.string()), // "todo", "in-progress", "completed"
    priority: v.string(), // "low", "medium", "high"
    dueDate: v.optional(v.string()), // formato: YYYY-MM-DD
    scheduledDate: v.optional(v.string()), // formato: YYYY-MM-DD
    responsible: v.optional(v.string()), // nome do responsável
    category: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  notes: defineTable({
    title: v.string(),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Tabela de conversas
  conversations: defineTable({
    name: v.optional(v.string()), // Nome da conversa (pode ser null para conversas 1:1)
    type: v.string(), // "direct" ou "group"
    isGroup: v.boolean(),
    createdBy: v.id("users"),
    lastMessage: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Tabela de participantes das conversas
  conversationParticipants: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    joinedAt: v.number(),
    lastReadAt: v.optional(v.number()),
    isActive: v.boolean(),
    leftAt: v.optional(v.number()),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_user", ["userId"])
    .index("by_conversation_user", ["conversationId", "userId"]),

  // Tabela de mensagens
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    messageType: v.string(), // "text", "image", "file", "system"
    isEdited: v.boolean(),
    editedAt: v.optional(v.number()),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_sender", ["senderId"])
    .index("by_conversation_created", ["conversationId", "createdAt"]),
});
