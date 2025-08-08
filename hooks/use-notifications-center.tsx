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
  read: boolean;
  urgent: boolean;
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  add: (
    input: Omit<AppNotification, "id" | "timestamp" | "read"> & {
      timestamp?: string;
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

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
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
      },
      ...prev,
    ]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const value: NotificationsContextValue = useMemo(
    () => ({
      notifications,
      unreadCount,
      add,
      markAsRead,
      markAllAsRead,
      remove,
    }),
    [notifications, unreadCount, add, markAsRead, markAllAsRead, remove]
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
