"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  useConversations,
  useMessages,
  useChat,
  useChatState,
  useCurrentUser,
  useSearchUsers,
  useNotifications,
} from "@/hooks/use-chat";
import { Id } from "@/convex/_generated/dataModel";
import { ChatSidebar } from "./chat-sidebar";
import { ChatArea } from "./chat-area";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";
import { TodoModal } from "./todo-modal";
import { NotificationToast } from "./notification-toast";

export function ChatEmbedded() {
  const currentUser = useCurrentUser();
  const {
    selectedConversation,
    setSelectedConversation,
    searchQuery,
    setSearchQuery,
    showUserSearch,
    setShowUserSearch,
  } = useChatState();
  const { addNotification, notifications } = useNotifications();

  const [newMessage, setNewMessage] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: "message" | "conversation";
    id: string;
    show: boolean;
  } | null>(null);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [selectedMessageForTodo, setSelectedMessageForTodo] = useState<{
    id: string;
    content: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Buscar conversas do usuário
  const conversations = useConversations(currentUser?.id);

  // Criar/garantir conversa global "Geral"
  const getOrCreateGlobal = useMutation(api.chat.getOrCreateGlobalConversation);

  useEffect(() => {
    const ensureGlobal = async () => {
      if (!currentUser?.id) return;
      try {
        const convId = await getOrCreateGlobal({ userId: currentUser.id });
        // Seleciona "Geral" ao entrar na página (e quando ainda não há seleção)
        if (!selectedConversation) {
          setSelectedConversation(convId);
        }
      } catch (e) {
        // noop
      }
    };
    ensureGlobal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  // Buscar mensagens da conversa selecionada
  const messages = useMessages(
    selectedConversation || undefined,
    currentUser?.id
  );

  // Buscar usuários para nova conversa
  const searchResults = useSearchUsers(searchQuery, currentUser?.id, 10);

  // Hooks para operações de chat
  const { sendMessage, createDirectConversation, markAsRead } = useChat(
    currentUser?.id
  );

  // Mutations para deletar
  const deleteMessage = useMutation(api.chat.deleteMessage);
  const deleteConversation = useMutation(api.chat.deleteConversation);

  const scrollToBottom = () => {
    const endEl = messagesEndRef.current as HTMLElement | null;
    const container = endEl?.parentElement?.parentElement as HTMLElement | null; // .space-y-4 -> overflow container
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    } else {
      endEl?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Marcar mensagens como lidas quando seleciona uma conversa
  useEffect(() => {
    if (selectedConversation && currentUser?.id) {
      markAsRead(selectedConversation);
    }
  }, [selectedConversation, currentUser?.id, markAsRead]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation && currentUser?.id) {
      try {
        await sendMessage(selectedConversation, newMessage.trim());
        setNewMessage("");
        addNotification("Mensagem enviada");
      } catch (error) {
        addNotification("Erro ao enviar mensagem");
      }
    }
  };

  const handleCreateConversation = async (otherUserId: Id<"users">) => {
    if (!currentUser?.id) return;

    try {
      const conversationId = await createDirectConversation(otherUserId);
      if (conversationId) {
        setSelectedConversation(conversationId);
        setShowUserSearch(false);
        setSearchQuery("");
        addNotification("Conversa criada");
      }
    } catch (error) {
      addNotification("Erro ao criar conversa");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!currentUser?.id) return;

    try {
      await deleteMessage({
        messageId: messageId as Id<"messages">,
        userId: currentUser.id,
      });
      addNotification("Mensagem deletada com sucesso");
      setDeleteConfirmation(null);
    } catch (error) {
      addNotification("Erro ao deletar mensagem");
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!currentUser?.id) return;

    try {
      await deleteConversation({
        conversationId: conversationId as Id<"conversations">,
        userId: currentUser.id,
      });
      addNotification("Conversa deletada com sucesso");
      setSelectedConversation(null);
      setDeleteConfirmation(null);
    } catch (error) {
      addNotification("Erro ao deletar conversa");
    }
  };

  const confirmDelete = () => {
    if (!deleteConfirmation) return;
    if (deleteConfirmation.type === "message") {
      handleDeleteMessage(deleteConfirmation.id);
    } else {
      handleDeleteConversation(deleteConfirmation.id);
    }
  };

  const handleCreateTodoFromMessage = (messageId: string, content: string) => {
    setSelectedMessageForTodo({ id: messageId, content });
    setShowTodoModal(true);
  };

  const handleTodoModalClose = () => {
    setShowTodoModal(false);
    setSelectedMessageForTodo(null);
  };

  if (!currentUser) return null;

  const selectedConversationData = conversations?.find(
    (c: any) => c.id === selectedConversation
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full overflow-hidden">
      <div className="lg:col-span-1">
        <ChatSidebar
          conversations={(conversations as any[]) || []}
          searchResults={(searchResults as any[]) || []}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showUserSearch={showUserSearch}
          setShowUserSearch={setShowUserSearch}
          selectedConversation={selectedConversation}
          setSelectedConversation={(id: string) =>
            setSelectedConversation(id as any)
          }
          onCreateConversation={handleCreateConversation}
          onDeleteConversation={(id: string) =>
            setDeleteConfirmation({ type: "conversation", id, show: true })
          }
        />
      </div>
      <div className="lg:col-span-3">
        <div className="sticky top-0 z-10"></div>
        <ChatArea
          selectedConversationData={selectedConversationData}
          messages={(messages as any[]) || []}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
          onDeleteMessage={(id: string) =>
            setDeleteConfirmation({ type: "message", id, show: true })
          }
          onDeleteConversation={(id: string) =>
            setDeleteConfirmation({ type: "conversation", id, show: true })
          }
          onCreateTodoFromMessage={handleCreateTodoFromMessage}
          messagesEndRef={messagesEndRef}
        />
      </div>

      {deleteConfirmation && (
        <DeleteConfirmationModal
          confirmation={deleteConfirmation}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmation(null)}
        />
      )}

      {showTodoModal && (
        <TodoModal
          selectedMessage={selectedMessageForTodo}
          onClose={handleTodoModalClose}
          onSuccess={() => {
            addNotification("Todo criado com sucesso!");
            handleTodoModalClose();
          }}
          onError={() => addNotification("Erro ao criar todo")}
        />
      )}

      <NotificationToast notifications={notifications} />
    </div>
  );
}
