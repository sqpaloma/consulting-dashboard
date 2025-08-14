"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

export type AppNotificationType = "message" | "calendar" | "project" | "system";

export interface AppNotification {
  id: string;
  type: AppNotificationType;
  title: string;
  message: string;
  timestamp: string; // human readable, e.g., "2 min"
  actualTime: string; // actual time, e.g., "14:30"
  createdAt: Date; // for sorting
  read: boolean;
  urgent: boolean;
  targetedToUser: boolean; // if notification is specifically for the user
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  add: (
    input: Omit<AppNotification, "id" | "timestamp" | "actualTime" | "createdAt" | "read"> & {
      timestamp?: string;
      targetedToUser?: boolean;
    }
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  remove: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
);

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "agora";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} h`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} d`;
}

function formatActualTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [hideReadAfterMarkAll, setHideReadAfterMarkAll] = useState<boolean>(false);
  const idCounterRef = useRef<number>(0);

  const add: NotificationsContextValue["add"] = useCallback((input) => {
    const createdAt = new Date();
    const id = `n_${createdAt.getTime()}_${idCounterRef.current++}`;

    setNotifications((prev) => [
      {
        id,
        type: input.type,
        title: input.title,
        message: input.message,
        urgent: Boolean(input.urgent),
        read: false,
        timestamp: input.timestamp || formatRelativeTime(createdAt),
        actualTime: formatActualTime(createdAt),
        createdAt,
        targetedToUser: input.targetedToUser ?? false,
      },
      ...prev,
    ]);
    setHideReadAfterMarkAll(false);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setHideReadAfterMarkAll(true);
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const filteredNotifications = useMemo(() => {
    let filtered = notifications
      // Filter only notifications targeted to user
      .filter((n) => n.targetedToUser)
      // Sort by creation time (most recent first)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Hide read notifications if "mark all as read" was used
    if (hideReadAfterMarkAll) {
      filtered = filtered.filter((n) => !n.read);
    }
    
    return filtered;
  }, [notifications, hideReadAfterMarkAll]);

  const unreadCount = useMemo(
    () => filteredNotifications.filter((n) => !n.read).length,
    [filteredNotifications]
  );

  const value: NotificationsContextValue = useMemo(
    () => ({
      notifications: filteredNotifications,
      unreadCount,
      add,
      markAsRead,
      markAllAsRead,
      remove,
    }),
    [filteredNotifications, unreadCount, add, markAsRead, markAllAsRead, remove]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsCenter(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotificationsCenter must be used within NotificationsProvider"
    );
  return ctx;
}
