import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Buscar todas as conversas do usuário
export const getUserConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Buscar todas as conversas onde o usuário participa
    const participations = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const conversations = await Promise.all(
      participations.map(async (participation) => {
        const conversation = await ctx.db.get(participation.conversationId);
        if (!conversation || conversation.isDeleted) return null;

        // Buscar outros participantes
        const otherParticipants = await ctx.db
          .query("conversationParticipants")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", participation.conversationId)
          )
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        // Buscar informações dos outros usuários
        const participants = await Promise.all(
          otherParticipants.map(async (p) => {
            const user = await ctx.db.get(p.userId);
            return {
              userId: p.userId,
              name: user?.name || "Usuário",
              avatarUrl: user?.avatarUrl || "/placeholder.svg",
              lastReadAt: p.lastReadAt,
              isOnline: true, // Implementar lógica de online/offline depois
            };
          })
        );

        // Para conversas diretas, buscar o outro usuário
        let otherUser = null;
        if (conversation.type === "direct") {
          const otherParticipant = otherParticipants.find(
            (p) => p.userId !== args.userId
          );
          if (otherParticipant) {
            const user = await ctx.db.get(otherParticipant.userId);
            otherUser = {
              userId: otherParticipant.userId,
              name: user?.name || "Usuário",
              avatarUrl: user?.avatarUrl || "/placeholder.svg",
              isOnline: true,
            };
          }
        }

        // Buscar mensagens não lidas
        const lastReadTime = participation.lastReadAt || 0;
        const unreadCount = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", participation.conversationId)
          )
          .filter((q) =>
            q.and(
              q.eq(q.field("isDeleted"), false),
              q.neq(q.field("senderId"), args.userId)
            )
          )
          .collect();

        // Filtrar mensagens não lidas
        const unreadMessages = unreadCount.filter(
          (msg) => msg.createdAt > lastReadTime
        );

        return {
          id: conversation._id,
          name: conversation.name,
          type: conversation.type,
          isGroup: conversation.isGroup,
          lastMessage: conversation.lastMessage,
          lastMessageAt: conversation.lastMessageAt,
          participants,
          otherUser,
          unreadCount: unreadMessages.length,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        };
      })
    );

    return conversations.filter((c) => c !== null);
  },
});

// Buscar mensagens de uma conversa
export const getConversationMessages = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    limit: v.optional(v.number()),
    before: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    // Verificar se o usuário participa da conversa
    const participation = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!participation) {
      throw new Error("Acesso negado a esta conversa");
    }

    // Buscar mensagens
    let query = ctx.db
      .query("messages")
      .withIndex("by_conversation_created", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc");

    if (args.before) {
      query = query.filter((q) => q.lt(q.field("createdAt"), args.before!));
    }

    const messages = await query.take(limit);

    // Buscar informações dos remetentes
    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        
        // Process attachments with URLs
        let attachments = message.attachments;
        if (attachments) {
          attachments = await Promise.all(
            attachments.map(async (attachment) => {
              let url = attachment.url;
              if (attachment.storageId && !url) {
                const storageUrl = await ctx.storage.getUrl(attachment.storageId);
                url = storageUrl || undefined;
              }
              return {
                ...attachment,
                url: url || undefined,
              };
            })
          );
        }

        return {
          id: message._id,
          content: message.content,
          senderId: message.senderId,
          senderName: sender?.name || "Usuário",
          senderAvatar: sender?.avatarUrl || "/placeholder.svg",
          messageType: message.messageType,
          attachments,
          isEdited: message.isEdited,
          editedAt: message.editedAt,
          isOwn: message.senderId === args.userId,
          timestamp: new Date(message.createdAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        };
      })
    );

    return messagesWithSenders.reverse();
  },
});

// Enviar mensagem
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    messageType: v.optional(v.string()),
    attachments: v.optional(v.array(v.object({
      id: v.string(),
      fileName: v.string(),
      fileSize: v.number(),
      mimeType: v.string(),
      storageId: v.optional(v.id("_storage")),
      url: v.optional(v.string()),
    }))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const messageType = args.messageType || "text";

    // Verificar se o usuário participa da conversa
    const participation = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.senderId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!participation) {
      throw new Error("Acesso negado a esta conversa");
    }

    // Criar mensagem
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      messageType,
      attachments: args.attachments,
      isEdited: false,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    // Determinar a última mensagem para a conversa
    let lastMessage = args.content;
    if (args.attachments && args.attachments.length > 0) {
      if (args.content.trim()) {
        lastMessage = `${args.content} (com ${args.attachments.length} anexo${args.attachments.length > 1 ? 's' : ''})`;
      } else {
        lastMessage = `Enviou ${args.attachments.length} anexo${args.attachments.length > 1 ? 's' : ''}`;
      }
    }

    // Atualizar conversa com a última mensagem
    await ctx.db.patch(args.conversationId, {
      lastMessage,
      lastMessageAt: now,
      updatedAt: now,
    });

    return messageId;
  },
});

// Upload file for messages
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Get file URL by storage ID
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Criar conversa direta entre dois usuários
export const createDirectConversation = mutation({
  args: {
    userId1: v.id("users"),
    userId2: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verificar se já existe uma conversa entre os dois usuários
    const existingConversations = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId1))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    for (const participation of existingConversations) {
      const conversation = await ctx.db.get(participation.conversationId);
      if (conversation && conversation.type === "direct") {
        const otherParticipant = await ctx.db
          .query("conversationParticipants")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", participation.conversationId)
          )
          .filter((q) =>
            q.and(
              q.eq(q.field("isActive"), true),
              q.neq(q.field("userId"), args.userId1)
            )
          )
          .first();

        if (otherParticipant && otherParticipant.userId === args.userId2) {
          return participation.conversationId;
        }
      }
    }

    // Criar nova conversa
    const now = Date.now();
    const conversationId = await ctx.db.insert("conversations", {
      type: "direct",
      isGroup: false,
      createdBy: args.userId1,
      createdAt: now,
      updatedAt: now,
    });

    // Adicionar participantes
    await ctx.db.insert("conversationParticipants", {
      conversationId,
      userId: args.userId1,
      joinedAt: now,
      isActive: true,
    });

    await ctx.db.insert("conversationParticipants", {
      conversationId,
      userId: args.userId2,
      joinedAt: now,
      isActive: true,
    });

    return conversationId;
  },
});

// Marcar mensagens como lidas
export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const participation = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!participation) {
      throw new Error("Acesso negado a esta conversa");
    }

    await ctx.db.patch(participation._id, {
      lastReadAt: Date.now(),
    });
  },
});

// Buscar usuários para iniciar conversa
export const searchUsers = query({
  args: {
    query: v.string(),
    currentUserId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const query = args.query.toLowerCase();

    const users = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("_id"), args.currentUserId))
      .collect();

    const filteredUsers = users
      .filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      )
      .slice(0, limit);

    return filteredUsers.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || "/placeholder.svg",
      position: user.position,
      department: user.department,
    }));
  },
});

// Buscar informações de uma conversa
export const getConversationInfo = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verificar se o usuário participa da conversa
    const participation = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!participation) {
      throw new Error("Acesso negado a esta conversa");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversa não encontrada");
    }

    // Buscar participantes
    const participants = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Buscar informações dos usuários
    const participantUsers = await Promise.all(
      participants.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return {
          userId: p.userId,
          name: user?.name || "Usuário",
          email: user?.email || "",
          avatarUrl: user?.avatarUrl || "/placeholder.svg",
          position: user?.position,
          department: user?.department,
          isOnline: true, // Implementar lógica depois
        };
      })
    );

    // Para conversas diretas, buscar o outro usuário
    let otherUser = null;
    if (conversation.type === "direct") {
      const otherParticipant = participants.find(
        (p) => p.userId !== args.userId
      );
      if (otherParticipant) {
        const user = await ctx.db.get(otherParticipant.userId);
        otherUser = {
          userId: otherParticipant.userId,
          name: user?.name || "Usuário",
          email: user?.email || "",
          avatarUrl: user?.avatarUrl || "/placeholder.svg",
          position: user?.position,
          department: user?.department,
          isOnline: true,
        };
      }
    }

    return {
      id: conversation._id,
      name: conversation.name,
      type: conversation.type,
      isGroup: conversation.isGroup,
      participants: participantUsers,
      otherUser,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  },
});

// Deletar mensagem
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Mensagem não encontrada");
    }

    // Verificar se o usuário participa da conversa
    const participation = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", message.conversationId).eq("userId", args.userId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!participation) {
      throw new Error(
        "Você não tem permissão para deletar mensagens nesta conversa"
      );
    }

    // Marcar como deletada ao invés de remover completamente
    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.messageId;
  },
});

// Deletar conversa
export const deleteConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verificar se o usuário participa da conversa
    const participation = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!participation) {
      throw new Error("Acesso negado a esta conversa");
    }

    // Marcar participação como inativa ao invés de deletar
    await ctx.db.patch(participation._id, {
      isActive: false,
      leftAt: Date.now(),
    });

    // Verificar se ainda há participantes ativos
    const activeParticipants = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Se não há mais participantes ativos, marcar conversa como deletada
    if (activeParticipants.length === 0) {
      await ctx.db.patch(args.conversationId, {
        isDeleted: true,
        deletedAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return args.conversationId;
  },
});

export const getOrCreateGlobalConversation = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Try to find an existing global group conversation named "Geral"
    const conversations = await ctx.db.query("conversations").collect();
    let global = conversations.find(
      (c: any) =>
        c.isGroup && c.type === "group" && c.name === "Geral" && !c.isDeleted
    );

    const now = Date.now();

    if (!global) {
      const conversationId = await ctx.db.insert("conversations", {
        name: "Geral",
        type: "group",
        isGroup: true,
        createdBy: args.userId,
        createdAt: now,
        updatedAt: now,
      } as any);
      const created = await ctx.db.get(conversationId);
      if (!created) throw new Error("Falha ao recuperar conversa criada");
      global = created as any;
    }

    if (!global) throw new Error("Falha ao criar conversa de grupo");

    // Ensure all users are participants
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      const existing = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_conversation_user", (q) =>
          q
            .eq("conversationId", global._id)
            .eq("userId", user._id as Id<"users">)
        )
        .first();

      if (!existing) {
        await ctx.db.insert("conversationParticipants", {
          conversationId: global._id,
          userId: user._id as Id<"users">,
          joinedAt: now,
          isActive: true,
        });
      } else if (!existing.isActive) {
        await ctx.db.patch(existing._id, { isActive: true });
      }
    }

    return global._id as Id<"conversations">;
  },
});
