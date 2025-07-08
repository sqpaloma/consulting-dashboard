import { Button } from "@/components/ui/button";
import {
  Grid3X3,
  MessageSquare,
  Calendar,
  BarChart3,
  BookOpen,
  Settings,
  ArrowLeft,
  Bell,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { NotificationsPanel } from "@/components/notifications/notifications-panel";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
}

export function Header({
  title,
  subtitle,
  showBack = false,
  backHref = "/",
}: HeaderProps) {
  return (
    <>
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
              <span className="text-2xl  text-white">novak</span>
              <span className="text-2xl font-light text-green-400">
                gouveia
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-700"
            >
              <Grid3X3 className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/chat">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-700"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/calendar">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-700"
            >
              <Calendar className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/analytics">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-700"
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/manual">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-700"
            >
              <BookOpen className="h-5 w-5" />
            </Button>
          </Link>
          <NotificationsPanel>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-700"
            >
              <Bell className="h-5 w-5" />
            </Button>
          </NotificationsPanel>
          <Link href="/settings">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-700"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Title Section */}
      <div className="space-y-2">
        <h1 className="text-4xl text-white">{title}</h1>
        {subtitle && (
          <h2 className="text-3xl font-light text-gray-100">{subtitle}</h2>
        )}
      </div>
    </>
  );
}
