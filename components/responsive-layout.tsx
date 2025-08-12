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
  Calendar,
  BarChart3,
  BookOpen,
  Settings,
  Bell,
  Menu,
  LogOut,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { NotificationsPanel } from "@/components/notifications/notifications-panel";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
}

const baseMenuItems = [
  {
    icon: Grid3X3,
    label: "Dashboard",
    href: "/",
  },
  {
    icon: Calendar,
    label: "Calendário",
    href: "/calendar",
  },
  // NOVO: Follow-up por Cliente
  {
    icon: BookOpen,
    label: "Follow-up",
    href: "/follow-up",
  },

  {
    icon: BookOpen,
    label: "Manual",
    href: "/manual",
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
      className="!text-white !hover:bg-blue-700 p-2 rounded-md h-10 w-10"
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
  const { signOut } = useAuth();
  const { isAdmin, user } = useAdmin();

  // Treat everything below Tailwind's xl (1280px) as mobile/tablet layout
  const [isNarrowScreen, setIsNarrowScreen] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 1279px)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      // Support initial set via MediaQueryList as well
      // @ts-expect-error - Event vs List typing
      const matches = "matches" in e ? e.matches : e.currentTarget?.matches;
      setIsNarrowScreen(Boolean(matches));
    };
    // Initial value
    setIsNarrowScreen(mql.matches);
    // Subscribe to changes
    const listener = (ev: MediaQueryListEvent) => handleChange(ev);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);

  const handleLogout = () => {
    signOut();
    window.location.href = "/";
  };

  const canSeeAnalytics = isAdmin || user?.role === "diretor";
  const isConsultor = user?.role === "consultor" && !isAdmin;

  const extendedMenuItems = [
    ...baseMenuItems,
    ...(!isConsultor
      ? [
          {
            icon: TrendingUp,
            label: "Indicadores",
            href: "/indicadores",
          },
        ]
      : []),
    ...(canSeeAnalytics
      ? [
          {
            icon: BarChart3,
            label: "Análises",
            href: "/analytics",
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            icon: Settings,
            label: "Configurações",
            href: "/settings",
          },
        ]
      : []),
  ];

  // Use the mobile-friendly sidebar layout on mobile and tablets
  if (isMobile || isNarrowScreen) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex w-full">
          <Sidebar
            side="left"
            variant="floating"
            className="bg-transparent border-0 [&>div]:bg-gradient-to-br [&>div]:from-blue-900 [&>div]:to-blue-800"
          >
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 h-full border-0">
              <SidebarHeader className="p-4 pb-8">
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
                  {extendedMenuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        className={`!text-white !hover:bg-white/10 ${
                          pathname === item.href
                            ? "!bg-white/10 !hover:bg-white/10"
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
                  {/* Notifications */}
                  <SidebarMenuItem>
                    <SidebarMenuButton className="!text-white !hover:bg-white/10">
                      <NotificationsPanel>
                        <div className="flex items-center space-x-2">
                          <Bell className="h-5 w-5" />
                          <span>Notificações</span>
                        </div>
                      </NotificationsPanel>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Logout button */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={handleLogout}
                      className="!text-white !hover:bg-white/10"
                    >
                      <LogOut className="h-5 w-5" />
                      Sair
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
            </div>
          </Sidebar>

          <SidebarInset className="flex-1 bg-transparent">
            <div className="p-4">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Header simplificado para mobile/tablet - hamburger + logo */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {showBack && (
                      <Link href={backHref} className="hover:opacity-80">
                        <ArrowLeft className="h-5 w-5 text-white" />
                      </Link>
                    )}
                    {/* Botão hamburger para mobile/tablet */}
                    <HamburgerMenuButton />
                    {/* Logo */}
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
                    <div className="flex items-center space-x-1">
                      <span className="text-2xl font-bold text-white">
                        novak
                      </span>
                      <span className="text-2xl font-light text-green-400">
                        gouveia
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title Section */}
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-white">{title}</h1>
                  {subtitle && (
                    <h2 className="text-3xl font-light text-gray-100">
                      {subtitle}
                    </h2>
                  )}
                </div>

                {children}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 px-12 py-6">
      <div className="max-w-none mx-auto space-y-4">
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
