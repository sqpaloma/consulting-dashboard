import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCallback, useState, useEffect } from "react";

// Hook para buscar conversas do usuário
export function useConversations(userId: Id<"users"> | undefined) {
  const conversations = useQuery(
    api.chat.getUserConversations,
    userId ? { userId } : "skip"
  );

  // Adicionar função para buscar usuários
  const searchUsers = useQuery(api.chat.searchUsers, "skip");

  // Adicionar função para criar conversa direta
  const createDirectConversation = useMutation(
    api.chat.createDirectConversation
  );

  // Simular dados para demonstração se não há conversas
  useEffect(() => {
    if (!conversations && userId) {
      // Lógica para simular conversas se necessário
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

// Hook para formatação de tempo com configurações do usuário
export function useTimeFormat() {
  const currentUser = useCurrentUser();
  const userData = useQuery(
    api.users.getUserById,
    currentUser?.id ? { userId: currentUser.id } : "skip"
  );

  const formatTime = useCallback(
    (timestamp: number) => {
      const timezone = userData?.settings?.timezone || "America/Sao_Paulo";
      const timeFormat = userData?.settings?.timeFormat || "24h";

      const date = new Date(timestamp);

      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timezone,
        hour12: timeFormat === "12h",
      };

      return date.toLocaleTimeString("pt-BR", options);
    },
    [userData?.settings?.timezone, userData?.settings?.timeFormat]
  );

  const formatDate = useCallback(
    (timestamp: number) => {
      const timezone = userData?.settings?.timezone || "America/Sao_Paulo";
      const dateFormat = userData?.settings?.dateFormat || "DD/MM/YYYY";

      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      // Ajustar para o timezone do usuário
      const dateInUserTZ = new Date(
        date.toLocaleString("en-US", { timeZone: timezone })
      );
      const todayInUserTZ = new Date(
        today.toLocaleString("en-US", { timeZone: timezone })
      );
      const yesterdayInUserTZ = new Date(
        yesterday.toLocaleString("en-US", { timeZone: timezone })
      );

      if (dateInUserTZ.toDateString() === todayInUserTZ.toDateString()) {
        return "Hoje";
      } else if (
        dateInUserTZ.toDateString() === yesterdayInUserTZ.toDateString()
      ) {
        return "Ontem";
      } else {
        // Formatar de acordo com a preferência do usuário
        const options: Intl.DateTimeFormatOptions = {
          timeZone: timezone,
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        };

        if (dateFormat === "MM/DD/YYYY") {
          return date.toLocaleDateString("en-US", options);
        } else if (dateFormat === "YYYY-MM-DD") {
          return date.toLocaleDateString("sv-SE", options);
        } else {
          // DD/MM/YYYY (padrão brasileiro)
          return date.toLocaleDateString("pt-BR", options);
        }
      }
    },
    [userData?.settings?.timezone, userData?.settings?.dateFormat]
  );

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
