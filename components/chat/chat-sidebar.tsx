"use client";

import { Search, Plus, X, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTimeFormat } from "@/hooks/use-chat";
import { Id } from "@/convex/_generated/dataModel";

interface ChatSidebarProps {
  conversations: any[];
  searchResults: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showUserSearch: boolean;
  setShowUserSearch: (show: boolean) => void;
  selectedConversation: string | null;
  setSelectedConversation: (id: string) => void;
  onCreateConversation: (userId: Id<"users">) => void;
  onDeleteConversation: (id: string) => void;
}

export function ChatSidebar({
  conversations,
  searchResults,
  searchQuery,
  setSearchQuery,
  showUserSearch,
  setShowUserSearch,
  selectedConversation,
  setSelectedConversation,
  onCreateConversation,
  onDeleteConversation,
}: ChatSidebarProps) {
  const { formatTime } = useTimeFormat();

  const isPinned = (c: any) =>
    c?.isGroup && (c?.name || "").toLowerCase() === "geral";

  const sortedConversations = [...(conversations || [])].sort(
    (a, b) => (b?.lastMessageAt || 0) - (a?.lastMessageAt || 0)
  );
  const pinned = sortedConversations.filter(isPinned);
  const others = sortedConversations.filter((c) => !isPinned(c));

  return (
    <Card className="bg-white/10 border-white/20 text-white h-full flex flex-col max-h-[700px] rounded-xl">
      <CardHeader className="sticky top-0 z-10 pb-3 flex-shrink-0 border-b border-white/10 bg-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">Conversas</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowUserSearch(!showUserSearch)}
            className="text-white hover:bg-white/10"
          >
            {showUserSearch ? (
              <X className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Search Input */}
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
          <Input
            placeholder={
              showUserSearch ? "Buscar usuários..." : "Buscar conversas..."
            }
            className="pl-10 bg-transparent text-white placeholder:text-white/60 border-white/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0">
        {showUserSearch ? (
          /* User Search Results */
          <div className="space-y-2 pt-4">
            {searchResults?.map((user: any) => (
              <div
                key={user.id}
                onClick={() => onCreateConversation(user.id)}
                className="p-3 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-white/70">
                      {user.position} - {user.department}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {searchQuery && searchResults?.length === 0 && (
              <div className="text-center py-4">
                <p className="text-white/70">Nenhum usuário encontrado</p>
              </div>
            )}
          </div>
        ) : (
          /* Conversations List */
          <div className="space-y-2 pt-4">
            {pinned.length > 0 && (
              <div className="px-3 py-1 text-xs uppercase tracking-wide text-white/70">
                Fixado
              </div>
            )}
            {pinned.map((conversation: any, idx: number) => (
              <div
                key={conversation.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                  selectedConversation === conversation.id
                    ? "bg-white/10 border-l-4 border-blue-400"
                    : "hover:bg-white/10"
                } ${idx === 0 ? "mt-2" : ""}`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversation.otherUser?.avatarUrl} />
                    <AvatarFallback>
                      {(conversation?.name || "G").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">
                        {conversation.name || "Grupo"}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-white/70">
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
                    <p className="text-sm text-white/80 truncate">
                      {conversation.lastMessage || "Sem mensagens"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conversation.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-200/20"
                    title="Deletar conversa"
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </button>
                </div>
              </div>
            ))}

            {others.length > 0 && (
              <div className="px-3 pt-3 pb-1 text-xs uppercase tracking-wide text-white/70">
                Conversas
              </div>
            )}
            {others.map((conversation: any) => (
              <div
                key={conversation.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                  selectedConversation === conversation.id
                    ? "bg-white/10 border-l-4 border-blue-400"
                    : "hover:bg-white/10"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversation.otherUser?.avatarUrl} />
                    <AvatarFallback>
                      {conversation.otherUser?.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">
                        {conversation.isGroup
                          ? conversation.name || "Grupo"
                          : conversation.otherUser?.name || "Conversa em grupo"}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-white/70">
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
                    <p className="text-sm text-white/80 truncate">
                      {conversation.lastMessage || "Sem mensagens"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conversation.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-200/20"
                    title="Deletar conversa"
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </button>
                </div>
              </div>
            ))}

            {pinned.length + others.length === 0 && (
              <div className="text-center py-4">
                <p className="text-white/70">Nenhuma conversa ainda</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
