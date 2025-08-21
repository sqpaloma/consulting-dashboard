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
    userId: v.optional(v.id("users")), // NOVO: isolamento por usuário (optional for backward compatibility)
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  notes: defineTable({
    title: v.string(),
    content: v.string(),
    userId: v.optional(v.id("users")), // NOVO: isolamento por usuário (optional for backward compatibility)
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

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
    // Attachment fields
    attachments: v.optional(v.array(v.object({
      id: v.string(),
      fileName: v.string(),
      fileSize: v.number(),
      mimeType: v.string(),
      storageId: v.optional(v.id("_storage")), // Convex file storage ID
      url: v.optional(v.string()), // Fallback URL for external storage
    }))),
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

  // ===== TABELAS DO DASHBOARD =====
  dashboardData: defineTable({
    totalItens: v.number(),
    aguardandoAprovacao: v.number(),
    analises: v.number(),
    orcamentos: v.number(),
    emExecucao: v.number(),
    pronto: v.number(),
    devolucoes: v.number(),
    movimentacoes: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  dashboardItens: defineTable({
    os: v.string(),
    titulo: v.optional(v.string()),
    cliente: v.optional(v.string()),
    responsavel: v.optional(v.string()),
    status: v.string(),
    dataRegistro: v.optional(v.string()),
    rawData: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_responsavel", ["responsavel"])
    .index("by_status", ["status"]),

  dashboardUploads: defineTable({
    fileName: v.string(),
    uploadedBy: v.optional(v.string()),
    uploadDate: v.optional(v.string()),
    totalRecords: v.number(),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // ===== TABELAS DE ANALYTICS =====
  analyticsData: defineTable({
    engenheiro: v.string(),
    ano: v.number(),
    mes: v.number(),
    registros: v.number(),
    servicos: v.number(),
    pecas: v.number(),
    valorTotal: v.number(),
    valorPecas: v.number(),
    valorServicos: v.number(),
    valorOrcamentos: v.number(),
    projetos: v.number(),
    quantidade: v.number(),
    cliente: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_engenheiro", ["engenheiro"])
    .index("by_ano_mes", ["ano", "mes"]),

  analyticsRawData: defineTable({
    responsavel: v.string(),
    cliente: v.string(),
    ano: v.number(),
    mes: v.number(),
    valor: v.number(),
    descricao: v.string(),
    orcamentoId: v.optional(v.string()),
    isOrcamento: v.boolean(),
    isVendaNormal: v.boolean(),
    isVendaServicos: v.boolean(),
    uploadId: v.optional(v.id("analyticsUploads")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_responsavel", ["responsavel"])
    .index("by_upload", ["uploadId"])
    .index("by_ano_mes", ["ano", "mes"]),

  analyticsUploads: defineTable({
    fileName: v.string(),
    uploadedBy: v.string(),
    uploadDate: v.string(),
    totalRecords: v.number(),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // ===== TABELAS DE DEVOLUÇÕES =====
  devolucoesData: defineTable({
    total: v.number(),
    pendentes: v.number(),
    concluidas: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  devolucoesItens: defineTable({
    os: v.string(),
    cliente: v.optional(v.string()),
    produto: v.optional(v.string()),
    motivo: v.optional(v.string()),
    status: v.string(),
    dataDevolucao: v.optional(v.string()),
    dataResolucao: v.optional(v.string()),
    responsavel: v.optional(v.string()),
    valor: v.optional(v.number()),
    observacoes: v.optional(v.string()),
    rawData: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_responsavel", ["responsavel"]),

  devolucoesUploads: defineTable({
    fileName: v.string(),
    uploadedBy: v.optional(v.string()),
    uploadDate: v.optional(v.string()),
    totalRecords: v.number(),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // ===== TABELAS DE MOVIMENTAÇÕES =====
  movimentacoesData: defineTable({
    total: v.number(),
    entrada: v.number(),
    saida: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  movimentacoesItens: defineTable({
    os: v.string(),
    tipo: v.string(), // 'entrada' ou 'saida'
    produto: v.optional(v.string()),
    quantidade: v.optional(v.number()),
    valorUnitario: v.optional(v.number()),
    valorTotal: v.optional(v.number()),
    dataMovimentacao: v.optional(v.string()),
    origem: v.optional(v.string()),
    destino: v.optional(v.string()),
    responsavel: v.optional(v.string()),
    observacoes: v.optional(v.string()),
    rawData: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tipo", ["tipo"])
    .index("by_responsavel", ["responsavel"]),

  movimentacoesUploads: defineTable({
    fileName: v.string(),
    uploadedBy: v.optional(v.string()),
    uploadDate: v.optional(v.string()),
    totalRecords: v.number(),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // ===== TABELAS DE INDICADORES =====
  indicadoresSession: defineTable({
    sessionId: v.string(),
    filters: v.object({
      executante: v.string(),
      setor: v.string(),
      orcamento: v.string(),
    }),
    filesInfo: v.object({
      desmontagens: v.optional(v.object({
        name: v.string(),
        size: v.number(),
        lastModified: v.number(),
      })),
      montagens: v.optional(v.object({
        name: v.string(),
        size: v.number(),
        lastModified: v.number(),
      })),
      testesAprovados: v.optional(v.object({
        name: v.string(),
        size: v.number(),
        lastModified: v.number(),
      })),
    }),
    uploadedBy: v.string(),
    uploadedAt: v.string(),
    totalRecords: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  indicadoresData: defineTable({
    sessionId: v.string(),
    dataType: v.string(), // "montagens", "desmontagens", "testes"
    data: v.array(v.any()),
    chunkIndex: v.number(),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]).index("by_session_type", ["sessionId", "dataType"]),
});
