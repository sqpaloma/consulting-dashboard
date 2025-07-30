"use client";

import { useState, useEffect } from "react";
import {
  Send,
  MessageSquare,
  MoreVertical,
  MessageSquareX,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";

interface ChatAreaProps {
  selectedConversationData: any;
  messages: any[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  onDeleteMessage: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onCreateTodoFromMessage: (messageId: string, content: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function ChatArea({
  selectedConversationData,
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  onDeleteMessage,
  onDeleteConversation,
  onCreateTodoFromMessage,
  messagesEndRef,
}: ChatAreaProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  if (!selectedConversationData) {
    return (
      <Card className="bg-white h-full flex flex-col max-h-[700px]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecione uma conversa
            </h3>
            <p className="text-gray-500">
              Escolha uma conversa na barra lateral para começar a conversar
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white h-full flex flex-col max-h-[700px]">
      {/* Chat Header */}
      <CardHeader className="pb-3 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={selectedConversationData.otherUser?.avatarUrl}
              />
              <AvatarFallback>
                {selectedConversationData.otherUser?.name.charAt(0) || "?"}
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteConversation(selectedConversationData.id)}
              title="Deletar conversa"
            >
              <MessageSquareX className="h-4 w-4 text-red-500" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <MessageList
        messages={messages}
        onDeleteMessage={onDeleteMessage}
        onCreateTodoFromMessage={onCreateTodoFromMessage}
        messagesEndRef={messagesEndRef}
      />

      {/* Message Input */}
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSendMessage={onSendMessage}
        onKeyPress={handleKeyPress}
      />
    </Card>
  );
}
