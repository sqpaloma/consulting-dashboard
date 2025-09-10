import { Button } from "@/components/ui/button";
import {
  Grid3X3,
  MessageSquare,
  BarChart3,
  BookOpen,
  Settings,
  ArrowLeft,
  Bell,
  LogOut,
  TrendingUp,
  Mail,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { NotificationsPanel } from "@/components/notifications/notifications-panel";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  actions?: React.ReactNode; // NOVO: ações à direita do título
}

export function Header({
  title,
  subtitle,
  showBack = false,
  backHref = "/",
  actions,
}: HeaderProps) {
  const { signOut } = useAuth();
  const { isAdmin, user } = useAdmin();

  const handleLogout = () => {
    signOut();
    window.location.href = "/";
  };

  const canSeeAnalytics = isAdmin || user?.role === "diretor";
  const isConsultor = user?.role === "consultor" && !isAdmin;
  const canAccessDashboard = true; // Dashboard com acesso livre para PCP e qualidade

  return (
    <TooltipProvider>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3">
            {showBack && (
              <Link href={backHref} className="hover:opacity-80">
                <ArrowLeft className="h-5 w-5 text-white" />
              </Link>
            )}
            {/* Substituir o círculo azul e 'ng' pelo logo */}
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
              <span className="text-2xl font-bold text-white">novak</span>
              <span className="text-2xl font-light text-green-400">
                gouveia
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="!text-white hover:bg-blue-700/50 data-[state=open]:bg-transparent"
                >
                  <Grid3X3 className="h-5 w-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Dashboard</p>
            </TooltipContent>
          </Tooltip>
          {/* Chat removido: ícone suprimido */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/organize">
                <Button
                  variant="ghost"
                  size="icon"
                  className="!text-white hover:bg-blue-700/50 data-[state=open]:bg-transparent"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Kanban + Chat</p>
            </TooltipContent>
          </Tooltip>
          {canSeeAnalytics && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/analytics">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="!text-white hover:bg-blue-700/50 data-[state=open]:bg-transparent"
                  >
                    <BarChart3 className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Analytics</p>
              </TooltipContent>
            </Tooltip>
          )}
          {!isConsultor && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/indicadores">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="!text-white hover:bg-blue-700/50 data-[state=open]:bg-transparent"
                  >
                    <TrendingUp className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Indicadores</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/cotacoes">
                <Button
                  variant="ghost"
                  size="icon"
                  className="!text-white hover:bg-blue-700/50 data-[state=open]:bg-transparent"
                >
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cotação de Peças</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/follow-up">
                <Button
                  variant="ghost"
                  size="icon"
                  className="!text-white hover:bg-blue-700/50 data-[state=open]:bg-transparent"
                >
                  <Mail className="h-5 w-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Follow-up</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/manual">
                <Button
                  variant="ghost"
                  size="icon"
                  className="!text-white hover:bg-blue-700/50 data-[state=open]:bg-transparent"
                >
                  <BookOpen className="h-5 w-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Manual</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <NotificationsPanel>
                <Button
                  variant="ghost"
                  size="icon"
                  className="!text-white hover:bg-blue-700/50 data-[state=open]:bg-transparent"
                >
                  <Bell className="h-5 w-5" />
                </Button>
              </NotificationsPanel>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notificações</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className="!text-white hover:bg-blue-700/50 data-[state=open]:bg-transparent"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Configurações</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="!text-white hover:bg-blue-700/50 data-[state=open]:bg-transparent"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sair</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Title Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-4xl font-bold text-white">{title}</h1>
          {actions && (
            <div className="hidden xl:flex items-center">{actions}</div>
          )}
        </div>
        {subtitle && (
          <h2 className="text-3xl font-light text-gray-100">{subtitle}</h2>
        )}
      </div>
    </TooltipProvider>
  );
}
