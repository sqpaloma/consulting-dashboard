"use client";

import { useState, useEffect, useRef } from "react";
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

interface AttachedFile {
  file: File;
  id: string;
  type: 'image' | 'file';
  url: string;
}

interface ChatAreaProps {
  selectedConversationData: any;
  messages: any[];
  newMessage: string;
  setNewMessage: (message: string | ((prev: string) => string)) => void;
  onSendMessage: () => void;
  onSendAttachment: (files: AttachedFile[], message?: string) => void;
  onDeleteMessage: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onCreateTodoFromMessage: (messageId: string, content: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatArea({
  selectedConversationData,
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  onSendAttachment,
  onDeleteMessage,
  onDeleteConversation,
  onCreateTodoFromMessage,
  messagesEndRef,
}: ChatAreaProps) {
  const listRef = useRef<any>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const [listHeight, setListHeight] = useState(400);

  useEffect(() => {
    if (!listContainerRef.current) return;
    const update = () => setListHeight(listContainerRef.current!.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(listContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // Rolar para a última mensagem sempre que a lista mudar
  useEffect(() => {
    try {
      const itemCount = messages?.length || 0;
      if (itemCount > 0 && listRef.current?.scrollToItem) {
        listRef.current.scrollToItem(itemCount - 1, "end");
      }
    } catch {}
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  if (!selectedConversationData) {
    return (
      <Card className="bg-white/10 border-white/20 text-white h-full flex flex-col rounded-xl">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-white/70" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Selecione uma conversa
            </h3>
            <p className="text-white/70">
              Escolha uma conversa na barra lateral para começar a conversar
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 border-white/20 text-white h-full flex flex-col rounded-xl">
      {/* Chat Header fixo */}
      <CardHeader className="sticky top-0 z-10 pb-3 flex-shrink-0 border-b border-white/10 bg-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/10">
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
              <h3 className="font-medium text-white">
                {selectedConversationData.otherUser?.name ||
                  "Conversa em grupo"}
              </h3>
              <p className="text-sm text-white/70">
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
              className="text-white hover:bg-white/10"
            >
              <MessageSquareX className="h-4 w-4 text-red-400" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area - takes remaining height */}
      <div ref={listContainerRef} className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          onDeleteMessage={onDeleteMessage}
          onCreateTodoFromMessage={onCreateTodoFromMessage}
          listRef={listRef}
          height={listHeight}
        />
      </div>

      {/* Message Input */}
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSendMessage={onSendMessage}
        onSendAttachment={onSendAttachment}
        onKeyPress={handleKeyPress}
      />
    </Card>
  );
}
