import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCallback, useEffect, useState } from "react";

// Hook para buscar conversas do usuário
export function useConversations(userId: Id<"users"> | undefined) {
  const conversations = useQuery(
    api.chat.getUserConversations,
    userId ? { userId } : "skip"
  );
  const searchUsers = useQuery(
    api.chat.searchUsers,
    userId ? { query: "", currentUserId: userId } : "skip"
  );
  const createDirectConversation = useMutation(
    api.chat.createDirectConversation
  );

  // Criar conversas automaticamente se não existirem
  useEffect(() => {
    if (
      userId &&
      conversations &&
      conversations.length === 0 &&
      searchUsers &&
      searchUsers.length > 0
    ) {
      // Criar conversa com cada usuário encontrado
      searchUsers.forEach(async (user) => {
        try {
          await createDirectConversation({ userId1: userId, userId2: user.id });
        } catch (error) {
          console.error("Erro ao criar conversa automática:", error);
        }
      });
    }
  }, [userId, conversations, searchUsers, createDirectConversation]);

  return conversations;
}

// Hook para buscar mensagens de uma conversa
export function useMessages(
  conversationId: Id<"conversations"> | undefined,
  userId: Id<"users"> | undefined
) {
  return useQuery(
    api.chat.getConversationMessages,
    conversationId && userId ? { conversationId, userId } : "skip"
  );
}

// Hook para buscar informações de uma conversa
export function useConversationInfo(
  conversationId: Id<"conversations"> | undefined,
  userId: Id<"users"> | undefined
) {
  return useQuery(
    api.chat.getConversationInfo,
    conversationId && userId ? { conversationId, userId } : "skip"
  );
}

// Hook para buscar usuários
export function useSearchUsers(
  query: string,
  currentUserId: Id<"users"> | undefined,
  limit?: number
) {
  return useQuery(
    api.chat.searchUsers,
    query && currentUserId ? { query, currentUserId, limit } : "skip"
  );
}

// Hook para operações de chat
export function useChat(userId: Id<"users"> | undefined) {
  const sendMessage = useMutation(api.chat.sendMessage);
  const createDirectConversation = useMutation(
    api.chat.createDirectConversation
  );
  const markAsRead = useMutation(api.chat.markAsRead);

  // Enviar mensagem
  const handleSendMessage = useCallback(
    async (
      conversationId: Id<"conversations">,
      content: string,
      messageType?: string
    ) => {
      if (!userId) return;

      return await sendMessage({
        conversationId,
        senderId: userId,
        content,
        messageType,
      });
    },
    [sendMessage, userId]
  );

  // Criar conversa direta
  const handleCreateDirectConversation = useCallback(
    async (otherUserId: Id<"users">) => {
      if (!userId) return;

      return await createDirectConversation({
        userId1: userId,
        userId2: otherUserId,
      });
    },
    [createDirectConversation, userId]
  );

  // Marcar como lido
  const handleMarkAsRead = useCallback(
    async (conversationId: Id<"conversations">) => {
      if (!userId) return;

      return await markAsRead({
        conversationId,
        userId,
      });
    },
    [markAsRead, userId]
  );

  return {
    sendMessage: handleSendMessage,
    createDirectConversation: handleCreateDirectConversation,
    markAsRead: handleMarkAsRead,
  };
}

// Hook para estado local do chat
export function useChatState() {
  const [selectedConversation, setSelectedConversation] =
    useState<Id<"conversations"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);

  return {
    selectedConversation,
    setSelectedConversation,
    searchQuery,
    setSearchQuery,
    showUserSearch,
    setShowUserSearch,
  };
}

// Hook para formatação de tempo
export function useTimeFormat() {
  const formatTime = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    if (date.toDateString() === today.toDateString()) {
      return "Hoje";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem";
    } else {
      return date.toLocaleDateString("pt-BR");
    }
  }, []);

  return {
    formatTime,
    formatDate,
  };
}

// Hook para verificar se o usuário está logado (usa o mesmo padrão do useAuth)
export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState<{
    id: Id<"users">;
    name: string;
    email: string;
    avatarUrl?: string;
  } | null>(null);

  useEffect(() => {
    // Buscar informações do usuário atual do localStorage
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        // Converter userId para id para compatibilidade
        if (userData.userId) {
          setCurrentUser({
            id: userData.userId,
            name: userData.name,
            email: userData.email,
            avatarUrl: userData.avatarUrl,
          });
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  return currentUser;
}

// Hook useAuth foi removido - use o hook original de @/hooks/use-auth

// Hook para notificações
export function useNotifications() {
  const [notifications, setNotifications] = useState<string[]>([]);

  const addNotification = useCallback((message: string) => {
    setNotifications((prev) => [...prev, message]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n !== message));
    }, 3000);
  }, []);

  return {
    notifications,
    addNotification,
  };
}
