import { internalMutation, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Função para criar conversas automaticamente entre todos os usuários
export const createAutoConversations = internalMutation({
  handler: async (ctx) => {
    console.log("Criando conversas automáticas...");

    // Buscar todos os usuários reais
    const users = await ctx.db.query("users").collect();
    const realUsers = users.filter(
      (user) =>
        user.email.includes("@novakgouveia.com") ||
        user.email.includes("@novakgouveia.com.br")
    );

    console.log(`Encontrados ${realUsers.length} usuários reais`);

    if (realUsers.length < 2) {
      console.log("Não há usuários suficientes para criar conversas");
      return { message: "Não há usuários suficientes" };
    }

    const now = Date.now();
    let conversationsCreated = 0;

    // Criar conversas entre todos os pares de usuários
    for (let i = 0; i < realUsers.length; i++) {
      for (let j = i + 1; j < realUsers.length; j++) {
        const user1 = realUsers[i];
        const user2 = realUsers[j];

        // Verificar se já existe conversa entre estes usuários
        const existingConversations = await ctx.db
          .query("conversationParticipants")
          .withIndex("by_user", (q) => q.eq("userId", user1._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        let conversationExists = false;
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
                  q.neq(q.field("userId"), user1._id)
                )
              )
              .first();

            if (otherParticipant && otherParticipant.userId === user2._id) {
              conversationExists = true;
              break;
            }
          }
        }

        if (!conversationExists) {
          // Criar nova conversa
          const conversationId = await ctx.db.insert("conversations", {
            type: "direct",
            isGroup: false,
            createdBy: user1._id,
            lastMessage: `Conversa iniciada entre ${user1.name} e ${user2.name}`,
            lastMessageAt: now,
            createdAt: now,
            updatedAt: now,
          });

          // Adicionar participantes
          await ctx.db.insert("conversationParticipants", {
            conversationId,
            userId: user1._id,
            joinedAt: now,
            lastReadAt: now,
            isActive: true,
          });

          await ctx.db.insert("conversationParticipants", {
            conversationId,
            userId: user2._id,
            joinedAt: now,
            lastReadAt: now,
            isActive: true,
          });

          // Criar mensagem de boas-vindas
          await ctx.db.insert("messages", {
            conversationId,
            senderId: user1._id,
            content: `Olá ${user2.name}! Esta conversa foi criada automaticamente para facilitar a comunicação entre a equipe.`,
            messageType: "text",
            isEdited: false,
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
          });

          conversationsCreated++;
          console.log(`Conversa criada entre ${user1.name} e ${user2.name}`);
        }
      }
    }

    console.log(`Criadas ${conversationsCreated} conversas automáticas`);

    return {
      usersFound: realUsers.length,
      conversationsCreated,
      message: `Criadas ${conversationsCreated} conversas automáticas entre ${realUsers.length} usuários`,
    };
  },
});

// Função pública para verificar e criar conversas se necessário
export const ensureUserConversations = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Verificar se o usuário tem conversas
    const userConversations = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (userConversations.length === 0) {
      // Se não tem conversas, criar automaticamente
      // Buscar todos os usuários reais
      const users = await ctx.db.query("users").collect();
      const realUsers = users.filter(
        (user) =>
          user.email.includes("@novakgouveia.com") ||
          user.email.includes("@novakgouveia.com.br")
      );

      if (realUsers.length < 2) {
        return { created: false, message: "Não há usuários suficientes" };
      }

      const now = Date.now();
      let conversationsCreated = 0;
      const currentUser = realUsers.find((u) => u._id === args.userId);

      if (currentUser) {
        // Criar conversas entre o usuário atual e todos os outros usuários
        for (const otherUser of realUsers) {
          if (otherUser._id !== args.userId) {
            // Criar conversa
            const conversationId = await ctx.db.insert("conversations", {
              type: "direct",
              isGroup: false,
              createdBy: args.userId,
              lastMessage: `Conversa iniciada automaticamente`,
              lastMessageAt: now,
              createdAt: now,
              updatedAt: now,
            });

            // Adicionar participantes
            await ctx.db.insert("conversationParticipants", {
              conversationId,
              userId: args.userId,
              joinedAt: now,
              lastReadAt: now,
              isActive: true,
            });

            await ctx.db.insert("conversationParticipants", {
              conversationId,
              userId: otherUser._id,
              joinedAt: now,
              lastReadAt: now,
              isActive: true,
            });

            conversationsCreated++;
          }
        }
      }

      return {
        created: true,
        message: `Criadas ${conversationsCreated} conversas automáticas`,
      };
    }

    return { created: false, message: "Usuário já tem conversas" };
  },
});
