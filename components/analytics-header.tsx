import {
  Calendar,
  Settings,
  BarChart3,
  Grid3X3,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AnalyticsHeader() {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
            <div className="w-12 h-12 bg-blue-700 rounded-full border-2 border-green-400 flex items-center justify-center relative">
              <span className="text-white font-bold text-lg">ng</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-2xl font-bold text-white">novak</span>
              <span className="text-2xl font-light text-green-400">
                gouveia
              </span>
            </div>
          </Link>
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
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-blue-700 bg-blue-700"
          >
            <BarChart3 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-blue-700"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Page Title */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">Análises</h1>
      </div>
    </>
  );
}
