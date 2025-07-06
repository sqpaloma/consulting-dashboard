"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import {
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Smile,
  Paperclip,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

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
  lastMessage: string;
  timestamp: string;
  online: boolean;
  unread: number;
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
      lastMessage: "Perfeito! Precisa de ajuda com alguma coisa?",
      timestamp: "14:33",
      online: true,
      unread: 0,
    },
    {
      id: 2,
      name: "Sarah Costa",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Vamos marcar a reunião para amanhã?",
      timestamp: "13:45",
      online: true,
      unread: 2,
    },
    {
      id: 3,
      name: "Miguel Oliveira",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Obrigado pelas informações!",
      timestamp: "12:20",
      online: false,
      unread: 0,
    },
    {
      id: 4,
      name: "Lisa Ferreira",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Pode me enviar os dados do relatório?",
      timestamp: "11:15",
      online: true,
      unread: 1,
    },
    {
      id: 5,
      name: "Carlos Silva",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Ótimo trabalho na apresentação!",
      timestamp: "10:30",
      online: false,
      unread: 0,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Header title="Chat" />

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
              <CardContent className="p-0">
                <div className="space-y-1">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContact(contact.id)}
                      className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedContact === contact.id
                          ? "bg-blue-50 border-r-2 border-blue-500"
                          : ""
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={contact.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {contact.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {contact.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-800 truncate">
                            {contact.name}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {contact.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {contact.lastMessage}
                        </p>
                      </div>
                      {contact.unread > 0 && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-medium">
                            {contact.unread}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="bg-white h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={
                            selectedContactData?.avatar || "/placeholder.svg"
                          }
                        />
                        <AvatarFallback>
                          {selectedContactData?.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {selectedContactData?.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {selectedContactData?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedContactData?.online ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" disabled>
                      <Phone className="h-4 w-4 text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="icon" disabled>
                      <Video className="h-4 w-4 text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-end space-x-2 max-w-xs lg:max-w-md`}
                    >
                      {!message.isOwn && (
                        <Avatar className="w-6 h-6">
                          <AvatarImage src="/placeholder.svg?height=24&width=24" />
                          <AvatarFallback className="text-xs">
                            {message.sender
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          message.isOwn
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-gray-100 text-gray-800 rounded-bl-none"
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
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" disabled>
                    <Paperclip className="h-4 w-4 text-gray-400" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua mensagem..."
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2"
                      disabled
                    >
                      <Smile className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
