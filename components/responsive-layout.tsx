"use client";

import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Header } from "@/components/Header";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Grid3X3,
  MessageSquare,
  Calendar,
  BarChart3,
  BookOpen,
  Settings,
  Bell,
  Menu,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { NotificationsPanel } from "@/components/notifications/notifications-panel";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
}

const menuItems = [
  {
    icon: Grid3X3,
    label: "Dashboard",
    href: "/",
  },
  {
    icon: MessageSquare,
    label: "Chat",
    href: "/chat",
  },
  {
    icon: Calendar,
    label: "Calendário",
    href: "/calendar",
  },
  {
    icon: BarChart3,
    label: "Análises",
    href: "/analytics",
  },
  {
    icon: BookOpen,
    label: "Manual",
    href: "/manual",
  },
  {
    icon: Settings,
    label: "Configurações",
    href: "/settings",
  },
];

// Componente para o botão hamburger customizado
function HamburgerMenuButton() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      onClick={toggleSidebar}
      variant="ghost"
      size="icon"
      className="text-white hover:bg-blue-700 p-2 rounded-md h-10 w-10"
    >
      <Menu className="h-6 w-6" />
      <span className="sr-only">Abrir menu</span>
    </Button>
  );
}

export function ResponsiveLayout({
  children,
  title = "",
  subtitle,
  showBack = false,
  backHref = "/",
}: ResponsiveLayoutProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  if (isMobile) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex w-full">
          <Sidebar
            side="left"
            variant="floating"
            className="bg-transparent border-0"
          >
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 h-full rounded-lg">
              <SidebarHeader className="p-4">
                <div className="flex items-center space-x-3">
                  {/* Logo igual ao header original */}
                  <div className="w-12 h-12 flex items-center justify-center relative">
                    <Image
                      src="/logo.png"
                      alt="Logo Novak & Gouveia"
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-green-400 bg-blue-700 object-cover"
                      priority
                    />
                  </div>
                  {/* Nome da empresa igual ao header original */}
                  <div className="flex items-center space-x-1">
                    <span className="text-2xl font-bold text-white">novak</span>
                    <span className="text-2xl font-light text-green-400">
                      gouveia
                    </span>
                  </div>
                </div>
              </SidebarHeader>

              <SidebarContent className="px-2">
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        className="text-white hover:bg-blue-700 data-[active=true]:bg-blue-700 data-[active=true]:text-white p-3 my-1"
                      >
                        <Link
                          href={item.href}
                          className="flex items-center space-x-3"
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="text-base">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
            </div>
          </Sidebar>

          <SidebarInset className="flex-1 overflow-hidden bg-transparent">
            <div className="flex flex-col h-full">
              {/* Header mobile com notificações e hamburger no lado direito */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  {title && (
                    <div className="space-y-1">
                      <h1 className="text-4xl font-bold text-white">{title}</h1>
                      {subtitle && (
                        <h2 className="text-3xl font-light text-gray-100">
                          {subtitle}
                        </h2>
                      )}
                    </div>
                  )}
                </div>
                {/* Botões no lado direito: Notificações + Hamburger */}
                <div className="flex items-center space-x-2">
                  <NotificationsPanel>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-blue-700 p-2 rounded-md h-10 w-10"
                    >
                      <Bell className="h-5 w-5" />
                      <span className="sr-only">Notificações</span>
                    </Button>
                  </NotificationsPanel>
                  <HamburgerMenuButton />
                </div>
              </div>
              {/* Conteúdo com mesmo padding do desktop */}
              <div className="flex-1 overflow-auto p-6">
                <div className="max-w-7xl mx-auto space-y-6">{children}</div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  // Desktop layout - mantém o header atual
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header
          title={title}
          subtitle={subtitle}
          showBack={showBack}
          backHref={backHref}
        />
        {children}
      </div>
    </div>
  );
}
