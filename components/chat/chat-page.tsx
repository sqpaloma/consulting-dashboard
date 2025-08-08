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
} from "@/hooks/use-chat";
import { useNotificationsCenter } from "@/hooks/use-notifications-center";
import { Id } from "@/convex/_generated/dataModel";
import { ChatSidebar } from "./chat-sidebar";
import { ChatArea } from "./chat-area";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";
import { TodoModal } from "./todo-modal";
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
  const { add } = useNotificationsCenter();

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

  // Notificar novas mensagens com base no aumento de unreadCount
  const unreadRef = useRef<Record<string, number>>({});
  useEffect(() => {
    (conversations as any[])?.forEach((c: any) => {
      const prev = unreadRef.current[c.id] || 0;
      const curr = c.unreadCount || 0;
      if (curr > prev) {
        const title = c.otherUser?.name
          ? `Nova mensagem de ${c.otherUser.name}`
          : "Nova mensagem";
        const snippet = c.lastMessage ? `\"${c.lastMessage}\"` : "";
        add({ type: "message", title, message: snippet, urgent: false });
      }
      unreadRef.current[c.id] = curr;
    });
  }, [conversations, add]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation && currentUser?.id) {
      try {
        await sendMessage(selectedConversation, newMessage.trim());
        setNewMessage("");
        add({
          type: "message",
          title: "Mensagem enviada",
          message: "Sua mensagem foi enviada",
          urgent: false,
        });
      } catch (error) {
        add({
          type: "system",
          title: "Erro",
          message: "Erro ao enviar mensagem",
          urgent: false,
        });
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
        add({
          type: "message",
          title: "Conversa criada",
          message: "Nova conversa iniciada",
          urgent: false,
        });
      }
    } catch (error) {
      add({
        type: "system",
        title: "Erro",
        message: "Erro ao criar conversa",
        urgent: false,
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!currentUser?.id) return;

    try {
      await deleteMessage({
        messageId: messageId as Id<"messages">,
        userId: currentUser.id,
      });
      add({
        type: "message",
        title: "Mensagem deletada",
        message: "Mensagem removida",
        urgent: false,
      });
      setDeleteConfirmation(null);
    } catch (error) {
      add({
        type: "system",
        title: "Erro",
        message: "Erro ao deletar mensagem",
        urgent: false,
      });
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!currentUser?.id) return;

    try {
      await deleteConversation({
        conversationId: conversationId as Id<"conversations">,
        userId: currentUser.id,
      });
      add({
        type: "message",
        title: "Conversa deletada",
        message: "Conversa removida",
        urgent: false,
      });
      setSelectedConversation(null);
      setDeleteConfirmation(null);
    } catch (error) {
      add({
        type: "system",
        title: "Erro",
        message: "Erro ao deletar conversa",
        urgent: false,
      });
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

  const selectedConversationData = (conversations as any[])?.find(
    (c: any) => c.id === selectedConversation
  );

  return (
    <ResponsiveLayout title="Chat">
      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px] overflow-hidden">
        {/* Contacts Sidebar */}
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
            messages={(messages as any[]) || []}
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
            add({
              type: "project",
              title: "Todo criado",
              message: "Tarefa criada com sucesso",
              urgent: false,
            });
            handleTodoModalClose();
          }}
          onError={() =>
            add({
              type: "system",
              title: "Erro",
              message: "Erro ao criar todo",
              urgent: false,
            })
          }
        />
      )}
    </ResponsiveLayout>
  );
}
