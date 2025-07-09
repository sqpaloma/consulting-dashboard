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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

interface Contact {
  id: number;
  name: string;
  avatar: string;
  lastMessage: {
    time: string;
    preview: string;
  };
  timestamp: string;
  online: boolean;
  unread: number;
  status: string;
}

export function ChatPage() {
  const [selectedContact, setSelectedContact] = useState<number>(1);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "João Santos",
      content: "Oi Paloma! Como está o projeto do cliente ABC?",
      timestamp: "14:30",
      isOwn: false,
    },
    {
      id: 2,
      sender: "Paloma",
      content:
        "Oi João! Está indo bem, já terminei a análise inicial. Vou enviar o relatório até amanhã.",
      timestamp: "14:32",
      isOwn: true,
    },
    {
      id: 3,
      sender: "João Santos",
      content: "Perfeito! Precisa de ajuda com alguma coisa?",
      timestamp: "14:33",
      isOwn: false,
    },
    {
      id: 4,
      sender: "Paloma",
      content: "Por enquanto está tudo ok. Se precisar de algo te aviso!",
      timestamp: "14:35",
      isOwn: true,
    },
  ]);

  const contacts: Contact[] = [
    {
      id: 1,
      name: "João Santos",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: {
        time: "14:33",
        preview: "Perfeito! Precisa de ajuda com alguma coisa?",
      },
      timestamp: "14:33",
      online: true,
      unread: 0,
      status: "Online",
    },
    {
      id: 2,
      name: "Sarah Costa",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: {
        time: "13:45",
        preview: "Vamos marcar a reunião para amanhã?",
      },
      timestamp: "13:45",
      online: true,
      unread: 2,
      status: "Online",
    },
    {
      id: 3,
      name: "Miguel Oliveira",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: {
        time: "12:20",
        preview: "Obrigado pelas informações!",
      },
      timestamp: "12:20",
      online: false,
      unread: 0,
      status: "Offline",
    },
    {
      id: 4,
      name: "Lisa Ferreira",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: {
        time: "11:15",
        preview: "Pode me enviar os dados do relatório?",
      },
      timestamp: "11:15",
      online: true,
      unread: 1,
      status: "Online",
    },
    {
      id: 5,
      name: "Carlos Silva",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: {
        time: "10:30",
        preview: "Ótimo trabalho na apresentação!",
      },
      timestamp: "10:30",
      online: false,
      unread: 0,
      status: "Offline",
    },
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: messages.length + 1,
        sender: "Paloma",
        content: newMessage,
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
      };
      setMessages([...messages, newMsg]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedContactData = contacts.find((c) => c.id === selectedContact);

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
                <Button variant="ghost" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Buscar conversas..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedContact === contact.id
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback>
                          {contact.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {contact.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {contact.lastMessage.time}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {contact.lastMessage.preview}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="bg-white h-full flex flex-col">
            {selectedContactData ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedContactData.avatar} />
                        <AvatarFallback>
                          {selectedContactData.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {selectedContactData.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedContactData.status}
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
                    {messages.map((message) => (
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
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
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
