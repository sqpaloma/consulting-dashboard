"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { ResponsiveLayout } from "@/components/responsive-layout";
import {
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Smile,
  Paperclip,
  MessageSquare,
  Plus,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useConversations,
  useMessages,
  useChat,
  useChatState,
  useCurrentUser,
  useSearchUsers,
  useTimeFormat,
  useNotifications,
} from "@/hooks/use-chat";
import { Id } from "@/convex/_generated/dataModel";

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
  const { formatTime, formatDate } = useTimeFormat();
  const { addNotification } = useNotifications();

  const [newMessage, setNewMessage] = useState("");
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
        console.error(error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
      console.error(error);
    }
  };

  // Se não há usuário logado, mostrar tela de login
  if (!currentUser) {
    return (
      <ResponsiveLayout title="Chat">
        <div className="flex items-center justify-center h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">
                Faça login para usar o chat
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Você precisa estar logado para acessar o chat
              </p>
              <Button onClick={() => (window.location.href = "/auth")}>
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    );
  }

  const selectedConversationData = conversations?.find(
    (c: any) => c.id === selectedConversation
  );

  return (
    <ResponsiveLayout title="Chat">
      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Contacts Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-white h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-800">
                  Conversas
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowUserSearch(!showUserSearch)}
                >
                  {showUserSearch ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={
                    showUserSearch
                      ? "Buscar usuários..."
                      : "Buscar conversas..."
                  }
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto">
              {showUserSearch ? (
                /* User Search Results */
                <div className="space-y-2">
                  {searchResults?.map((user: any) => (
                    <div
                      key={user.id}
                      onClick={() => handleCreateConversation(user.id)}
                      className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.position} - {user.department}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {searchQuery && searchResults?.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Nenhum usuário encontrado</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Conversations List */
                <div className="space-y-2">
                  {conversations?.map((conversation: any) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation === conversation.id
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={conversation.otherUser?.avatarUrl}
                          />
                          <AvatarFallback>
                            {conversation.otherUser?.name.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {conversation.otherUser?.name ||
                                "Conversa em grupo"}
                            </p>
                            <div className="flex items-center space-x-2">
                              <p className="text-xs text-gray-500">
                                {conversation.lastMessageAt &&
                                  formatTime(conversation.lastMessageAt)}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage || "Sem mensagens"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {conversations?.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Nenhuma conversa ainda</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="bg-white h-full flex flex-col">
            {selectedConversationData ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={selectedConversationData.otherUser?.avatarUrl}
                        />
                        <AvatarFallback>
                          {selectedConversationData.otherUser?.name.charAt(0) ||
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {selectedConversationData.otherUser?.name ||
                            "Conversa em grupo"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedConversationData.otherUser?.isOnline
                            ? "Online"
                            : "Offline"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages Area */}
                <CardContent className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {messages?.map((message: any) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.isOwn ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isOwn
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.isOwn ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <Input
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                    </div>
                    <Button onClick={handleSendMessage} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecione uma conversa
                  </h3>
                  <p className="text-gray-500">
                    Escolha uma conversa na barra lateral para começar a
                    conversar
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
