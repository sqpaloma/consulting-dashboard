"use client";

import { Button } from "@/components/ui/button";
import {
  Grid3X3,
  MessageSquare,
  Calendar,
  BarChart3,
  BookOpen,
  Settings,
} from "lucide-react";
import Link from "next/link";

export function DashboardHeader() {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-700 rounded-full border-2 border-green-400 flex items-center justify-center relative">
              <span className="text-white font-bold text-lg">ng</span>
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
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-blue-700"
          >
            <Grid3X3 className="h-5 w-5" />
          </Button>
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
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-blue-700"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">Olá!</h1>
        <h2 className="text-3xl font-light text-gray-100">
          Bom dia, <span className="text-green-400">Paloma</span>
        </h2>
        <p className="text-gray-300">
          Vamos tornar hoje produtivo. Aqui está sua visão geral.
        </p>
      </div>
    </>
  );
}
