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
} from "@/hooks/use-chat";
import { useNotificationsCenter } from "@/hooks/use-notifications-center";
import { Id } from "@/convex/_generated/dataModel";
import { ChatSidebar } from "./chat-sidebar";
import { ChatArea } from "./chat-area";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";
import { TodoModal } from "./todo-modal";
import { useSearchParams } from "next/navigation";

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
  const { add } = useNotificationsCenter();

  const searchParams = useSearchParams();
  const convParam = searchParams?.get("conv");

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
        // Seleciona "Geral" apenas se não houver conversa pré-selecionada via URL
        if (!selectedConversation && !convParam) {
          setSelectedConversation(convId);
        }
      } catch (e) {
        // noop
      }
    };
    ensureGlobal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, convParam, selectedConversation]);

  // Seleciona conversa a partir do parâmetro de URL (?conv=...)
  useEffect(() => {
    if (convParam) {
      setSelectedConversation(convParam as any);
      try {
        window.history.replaceState({}, "", "/organize");
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convParam]);

  // Buscar mensagens da conversa selecionada
  const messages = useMessages(
    selectedConversation || undefined,
    currentUser?.id
  );

  // Buscar usuários para nova conversa
  const searchResults = useSearchUsers(searchQuery, currentUser?.id, 10);

  // Hooks para operações de chat
  const { sendMessage, sendAttachment, createDirectConversation, markAsRead } = useChat(
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

  interface AttachedFile {
    file: File;
    id: string;
    type: 'image' | 'file';
    url: string;
  }

  const handleSendAttachment = async (files: AttachedFile[], message?: string) => {
    if (selectedConversation && currentUser?.id) {
      try {
        await sendAttachment(selectedConversation, files, message);
        setNewMessage("");
        add({
          type: "message",
          title: "Arquivo enviado",
          message: `${files.length} arquivo${files.length > 1 ? 's' : ''} enviado${files.length > 1 ? 's' : ''}`,
          urgent: false,
        });
      } catch (error) {
        console.error('Error sending attachment:', error);
        add({
          type: "system",
          title: "Erro",
          message: "Erro ao enviar arquivo",
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
          onSendAttachment={handleSendAttachment}
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
    </div>
  );
}
