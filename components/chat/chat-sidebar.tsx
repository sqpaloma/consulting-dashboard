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

  return (
    <Card className="bg-white h-full flex flex-col max-h-[700px]">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-gray-800">Conversas</CardTitle>
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
              showUserSearch ? "Buscar usuários..." : "Buscar conversas..."
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
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {searchResults?.map((user: any) => (
              <div
                key={user.id}
                onClick={() => onCreateConversation(user.id)}
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
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {conversations?.map((conversation: any) => (
              <div
                key={conversation.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                  selectedConversation === conversation.id
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversation.otherUser?.avatarUrl} />
                    <AvatarFallback>
                      {conversation.otherUser?.name.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {conversation.otherUser?.name || "Conversa em grupo"}
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conversation.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-100"
                    title="Deletar conversa"
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </button>
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
  );
}
