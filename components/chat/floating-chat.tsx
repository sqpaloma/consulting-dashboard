"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { usePathname, useSearchParams } from "next/navigation";
import { useConversations, useCurrentUser } from "@/hooks/use-chat";

export function FloatingChat() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab");

  const currentUser = useCurrentUser();
  const conversations = useConversations(currentUser?.id);

  const totalUnread = useMemo(() => {
    if (!Array.isArray(conversations)) return 0;
    return conversations.reduce(
      (sum: number, c: any) => sum + (c?.unreadCount || 0),
      0
    );
  }, [conversations]);

  // Esconde quando já está na aba de Chat da página Organize
  const isOnChatTab = pathname === "/organize" && tab === "chat";
  if (isOnChatTab) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in-0 zoom-in-95 max-[359px]:hidden">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/organize?tab=chat"
              aria-label="Abrir chat"
              className="relative inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/70 backdrop-blur-sm text-blue-600 hover:bg-white/80 border border-white/60 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-0 transition-transform hover:scale-105"
            >
              <MessageSquare className="h-6 w-6" />

              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center">
                  <span className="absolute inline-flex h-5 w-5 rounded-full bg-red-500 opacity-60 animate-ping"></span>
                  <span className="relative inline-flex min-w-[1.25rem] h-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium text-white">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                </span>
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            className="animate-in fade-in-0 zoom-in-95"
          >
            {totalUnread > 0
              ? `${totalUnread} não lida${totalUnread > 1 ? "s" : ""}`
              : "Abrir chat"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
