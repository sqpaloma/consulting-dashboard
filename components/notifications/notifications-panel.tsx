"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Calendar,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";

interface Notification {
  id: string;
  type: "message" | "calendar" | "project" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  urgent: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "message",
    title: "Nova Mensagem",
    message:
      "Maria Santos enviou uma atualização sobre o projeto de automação industrial",
    timestamp: "2 min",
    read: false,
    urgent: false,
  },
  {
    id: "2",
    type: "calendar",
    title: "Reunião em 30 minutos",
    message:
      "Reunião de apresentação com cliente - Projeto Otimização de Processos",
    timestamp: "30 min",
    read: false,
    urgent: true,
  },
  {
    id: "3",
    type: "project",
    title: "Entrega Finalizada",
    message:
      "O relatório de consultoria do projeto Melhoria Contínua foi finalizado",
    timestamp: "1 hora",
    read: false,
    urgent: false,
  },
  {
    id: "4",
    type: "calendar",
    title: "Agendamento Confirmado",
    message:
      "Cliente confirmou reunião para análise de ROI - Terça-feira às 14h",
    timestamp: "2 horas",
    read: true,
    urgent: false,
  },
  {
    id: "5",
    type: "system",
    title: "Relatório Mensal Disponível",
    message: "Relatório de performance dos projetos de janeiro está disponível",
    timestamp: "3 horas",
    read: true,
    urgent: false,
  },
  {
    id: "6",
    type: "message",
    title: "Feedback do Cliente",
    message:
      "Cliente da IndústriaTech deixou feedback positivo sobre a consultoria",
    timestamp: "1 dia",
    read: true,
    urgent: false,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "message":
      return <MessageSquare className="h-4 w-4" />;
    case "calendar":
      return <Calendar className="h-4 w-4" />;
    case "project":
      return <AlertCircle className="h-4 w-4" />;
    case "system":
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "message":
      return "bg-blue-500";
    case "calendar":
      return "bg-green-500";
    case "project":
      return "bg-orange-500";
    case "system":
      return "bg-gray-500";
    default:
      return "bg-blue-500";
  }
};

interface NotificationsPanelProps {
  children: React.ReactNode;
}

export function NotificationsPanel({ children }: NotificationsPanelProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div className="relative touch-manipulation">
          {children}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-xs min-w-0"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 sm:w-96 max-w-[calc(100vw-2rem)] p-0 animate-in fade-in-0 zoom-in-95"
        align="end"
        side="bottom"
        sideOffset={5}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3 px-3 sm:px-6">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">Notificações</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 text-xs whitespace-nowrap touch-manipulation"
                >
                  <span className="hidden sm:inline">
                    Marcar todas como lidas
                  </span>
                  <span className="sm:hidden">Marcar todas</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-60 sm:h-80 max-h-[60vh]">
              {notifications.length === 0 ? (
                <div className="p-4 sm:p-6 text-center text-gray-500">
                  <Bell className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div
                          className={`p-1.5 sm:p-2 rounded-full ${getNotificationColor(
                            notification.type
                          )} text-white flex-shrink-0`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center flex-wrap gap-2">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {notification.title}
                                </h4>
                                {notification.urgent && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs shrink-0"
                                  >
                                    Urgente
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center mt-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1 shrink-0" />
                                <span className="truncate">
                                  {notification.timestamp}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="h-6 w-6 p-0 hover:bg-red-100 active:bg-red-200 shrink-0 touch-manipulation"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                            {notification.message}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
