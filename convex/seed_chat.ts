import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Função para criar usuários de exemplo
export const seedUsers = internalMutation({
  handler: async (ctx) => {
    // Verificar se já existem usuários
    const existingUsers = await ctx.db.query("users").collect();
    if (existingUsers.length > 0) {
      console.log("Usuários já existem, pulando seed");
      return;
    }

    // Hash simples para demonstração
    const simpleHash = async (password: string) => {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    };

    const now = Date.now();
    const hashedPassword = await simpleHash("123456");

    // Criar usuários de exemplo
    const users = [
      {
        name: "Paloma Santos",
        email: "paloma@empresa.com",
        position: "Consultora Senior",
        department: "Consultoria",
        avatarUrl: "/placeholder.svg?height=40&width=40",
        hashedPassword,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "João Silva",
        email: "joao@empresa.com",
        position: "Desenvolvedor",
        department: "Tecnologia",
        avatarUrl: "/placeholder.svg?height=40&width=40",
        hashedPassword,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Maria Costa",
        email: "maria@empresa.com",
        position: "Gerente de Projetos",
        department: "Gestão",
        avatarUrl: "/placeholder.svg?height=40&width=40",
        hashedPassword,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Pedro Oliveira",
        email: "pedro@empresa.com",
        position: "Analista",
        department: "Análise",
        avatarUrl: "/placeholder.svg?height=40&width=40",
        hashedPassword,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const userIds: Id<"users">[] = [];
    for (const user of users) {
      const userId = await ctx.db.insert("users", user);
      userIds.push(userId);

      // Criar configurações padrão
      await ctx.db.insert("userSettings", {
        userId,
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
        updatedAt: now,
      });
    }

    console.log(`Criados ${userIds.length} usuários`);
    return userIds;
  },
});

// Função para criar conversas de exemplo
export const seedConversations = internalMutation({
  handler: async (ctx) => {
    // Verificar se já existem conversas
    const existingConversations = await ctx.db.query("conversations").collect();
    if (existingConversations.length > 0) {
      console.log("Conversas já existem, pulando seed");
      return;
    }

    // Buscar usuários
    const users = await ctx.db.query("users").collect();
    if (users.length < 2) {
      console.log("Não há usuários suficientes para criar conversas");
      return;
    }

    const now = Date.now();
    const conversationIds: Id<"conversations">[] = [];

    // Criar conversas entre usuários
    for (let i = 0; i < users.length - 1; i++) {
      const user1 = users[i];
      const user2 = users[i + 1];

      // Criar conversa
      const conversationId = await ctx.db.insert("conversations", {
        type: "direct",
        isGroup: false,
        createdBy: user1._id,
        lastMessage: `Olá ${user2.name}! Como está?`,
        lastMessageAt: now - Math.random() * 86400000, // Último dia
        createdAt: now - Math.random() * 86400000,
        updatedAt: now - Math.random() * 86400000,
      });

      // Adicionar participantes
      await ctx.db.insert("conversationParticipants", {
        conversationId,
        userId: user1._id,
        joinedAt: now - Math.random() * 86400000,
        lastReadAt: now - Math.random() * 3600000, // Última hora
        isActive: true,
      });

      await ctx.db.insert("conversationParticipants", {
        conversationId,
        userId: user2._id,
        joinedAt: now - Math.random() * 86400000,
        lastReadAt: now - Math.random() * 3600000,
        isActive: true,
      });

      conversationIds.push(conversationId);
    }

    console.log(`Criadas ${conversationIds.length} conversas`);
    return conversationIds;
  },
});

// Função para criar mensagens de exemplo
export const seedMessages = internalMutation({
  handler: async (ctx) => {
    // Verificar se já existem mensagens
    const existingMessages = await ctx.db.query("messages").collect();
    if (existingMessages.length > 0) {
      console.log("Mensagens já existem, pulando seed");
      return;
    }

    // Buscar conversas
    const conversations = await ctx.db.query("conversations").collect();
    if (conversations.length === 0) {
      console.log("Não há conversas para criar mensagens");
      return;
    }

    const now = Date.now();
    const messageIds: Id<"messages">[] = [];

    // Mensagens de exemplo
    const sampleMessages = [
      "Olá! Como está o projeto?",
      "Está indo bem, obrigado!",
      "Precisa de ajuda com alguma coisa?",
      "Por enquanto está tudo ok, obrigado!",
      "Vamos marcar uma reunião para amanhã?",
      "Pode ser, que horas?",
      "Que tal às 14h?",
      "Perfeito! Até amanhã.",
      "Obrigado pelas informações!",
      "Disponha sempre!",
    ];

    for (const conversation of conversations) {
      // Buscar participantes da conversa
      const participants = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", conversation._id)
        )
        .collect();

      if (participants.length >= 2) {
        // Criar algumas mensagens para cada conversa
        const numMessages = Math.floor(Math.random() * 5) + 3; // 3 a 7 mensagens

        for (let i = 0; i < numMessages; i++) {
          const sender = participants[i % participants.length];
          const messageTime = now - Math.random() * 86400000; // Último dia

          const messageId = await ctx.db.insert("messages", {
            conversationId: conversation._id,
            senderId: sender.userId,
            content:
              sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
            messageType: "text",
            isEdited: false,
            isDeleted: false,
            createdAt: messageTime,
            updatedAt: messageTime,
          });

          messageIds.push(messageId);
        }
      }
    }

    console.log(`Criadas ${messageIds.length} mensagens`);
    return messageIds;
  },
});

// Função principal para fazer seed completo
// Execute as funções seedUsers, seedConversations e seedMessages separadamente
export const seedChatData = internalMutation({
  handler: async (ctx) => {
    console.log("Iniciando seed do chat...");
    console.log(
      "Execute as funções seedUsers, seedConversations e seedMessages separadamente"
    );

    return {
      message: "Execute as funções de seed separadamente",
    };
  },
});
