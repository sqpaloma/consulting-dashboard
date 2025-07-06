"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Save,
  Trash2,
  Printer,
  MoreVertical,
  FileSpreadsheet,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface DashboardUploadProps {
  dashboardData: any;
  saveStatus: "idle" | "saving" | "saved" | "error";
  uploadedData: any[];
  isLoading: boolean;
  onUploadClick: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveData: () => void;
  onPrint: () => void;
  onClearData: () => void;
  fileName: string;
}

export function DashboardUpload({
  dashboardData,
  saveStatus,
  uploadedData,
  isLoading,
  onUploadClick,
  onFileUpload,
  onSaveData,
  onPrint,
  onClearData,
  fileName,
}: DashboardUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center space-x-4 flex-wrap gap-2">
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              title="Mais opções"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onUploadClick}>
              <Upload className="h-4 w-4 mr-2" /> Upload Excel
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={onSaveData}
              disabled={
                dashboardData.totalItens === 0 || saveStatus === "saving"
              }
            >
              <Save className="h-4 w-4 mr-2" /> Salvar & Compartilhar
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onPrint}>
              <Printer className="h-4 w-4 mr-2" /> Imprimir
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onClearData} disabled={isLoading}>
              <Trash2 className="h-4 w-4 mr-2" /> Limpar Dados
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={onFileUpload}
          className="hidden"
        />
        {fileName && (
          <div className="flex items-center space-x-1 text-white/80 text-sm">
            <FileSpreadsheet className="h-4 w-4" />
            <span>{fileName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
