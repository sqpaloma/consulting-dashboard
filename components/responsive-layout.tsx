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
              <SidebarContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        className={`text-white hover:bg-blue-700 ${
                          pathname === item.href
                            ? "bg-blue-600 hover:bg-blue-600"
                            : ""
                        }`}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
            </div>
          </Sidebar>

          <SidebarInset className="flex-1">
            <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  {/* Logo e navigation mobile */}
                  <div className="flex items-center space-x-4">
                    <HamburgerMenuButton />
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 flex items-center justify-center relative">
                        <Image
                          src="/logo.png"
                          alt="Logo Novak & Gouveia"
                          width={32}
                          height={32}
                          className="rounded-full border-2 border-green-400 bg-blue-700 object-cover"
                          priority
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xl font-bold text-white">
                          novak
                        </span>
                        <span className="text-xl font-light text-green-400">
                          gouveia
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notifications */}
                  <NotificationsPanel>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-blue-700"
                    >
                      <Bell className="h-5 w-5" />
                    </Button>
                  </NotificationsPanel>
                </div>

                {/* Title and subtitle */}
                {(title || subtitle) && (
                  <div className="mt-4">
                    {title && (
                      <h1 className="text-2xl font-bold text-white">{title}</h1>
                    )}
                    {subtitle && (
                      <p className="text-blue-200 text-sm mt-1">{subtitle}</p>
                    )}
                  </div>
                )}
              </div>
            </header>

            <main className="flex-1 p-4 overflow-x-auto">
              <div className="max-w-7xl mx-auto">{children}</div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  // Desktop layout
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
