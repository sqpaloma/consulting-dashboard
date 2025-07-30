"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
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
import { LoginPrompt } from "./login-prompt";

export function ChatPage() {
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  // Se não há usuário logado, mostrar tela de login
  if (!currentUser) {
    return <LoginPrompt />;
  }

  const selectedConversationData = conversations?.find(
    (c: any) => c.id === selectedConversation
  );

  return (
    <ResponsiveLayout title="Chat">
      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px] overflow-hidden">
        {/* Contacts Sidebar */}
        <div className="lg:col-span-1">
          <ChatSidebar
            conversations={conversations}
            searchResults={searchResults}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showUserSearch={showUserSearch}
            setShowUserSearch={setShowUserSearch}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
            onCreateConversation={handleCreateConversation}
            onDeleteConversation={(id: string) =>
              setDeleteConfirmation({
                type: "conversation",
                id,
                show: true,
              })
            }
          />
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <ChatArea
            selectedConversationData={selectedConversationData}
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSendMessage={handleSendMessage}
            onDeleteMessage={(id: string) =>
              setDeleteConfirmation({
                type: "message",
                id,
                show: true,
              })
            }
            onDeleteConversation={(id: string) =>
              setDeleteConfirmation({
                type: "conversation",
                id,
                show: true,
              })
            }
            onCreateTodoFromMessage={handleCreateTodoFromMessage}
            messagesEndRef={messagesEndRef}
          />
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {deleteConfirmation && (
        <DeleteConfirmationModal
          confirmation={deleteConfirmation}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmation(null)}
        />
      )}

      {/* Modal para criar todo */}
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

      {/* Notificações */}
      <NotificationToast notifications={notifications} />
    </ResponsiveLayout>
  );
}
