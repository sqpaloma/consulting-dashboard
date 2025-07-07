import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  Trash2,
  Printer,
  Save,
  MoreVertical,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsFilters } from "./analytics-filters";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { type AnalyticsUpload } from "@/lib/supabase-client";

interface AnalyticsUploadSectionProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  fileName: string;
  saveStatus: "idle" | "saving" | "saved" | "error";
  uploadedData: any[];
  uploadHistory: AnalyticsUpload[];
  isLoading: boolean;
  onUploadClick: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveData: () => void;
  onPrint: () => void;
  onGenerateReport: () => void;
  onClearData: () => void;
  selectedDepartment: string;
  setSelectedDepartment: (value: string) => void;
  selectedEngineer: string;
  setSelectedEngineer: (value: string) => void;
  selectedYear: string;
  setSelectedYear: (value: string) => void;
  selectedMonth: string;
  setSelectedMonth: (value: string) => void;
  topEngineersFilter: string;
  setTopEngineersFilter: (value: string) => void;
}

export function AnalyticsUploadSection({
  fileInputRef,
  fileName,
  saveStatus,
  uploadedData,
  uploadHistory,
  isLoading,
  onUploadClick,
  onFileUpload,
  onSaveData,
  onPrint,
  onClearData,
  selectedDepartment,
  setSelectedDepartment,
  selectedEngineer,
  setSelectedEngineer,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  topEngineersFilter,
  setTopEngineersFilter,
}: AnalyticsUploadSectionProps) {
  const [historyDropdownOpen, setHistoryDropdownOpen] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  const handleHistoryClick = () => {
    setHistoryDropdownOpen(!historyDropdownOpen);
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        historyRef.current &&
        !historyRef.current.contains(event.target as Node)
      ) {
        setHistoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center space-x-4 flex-wrap gap-2">
      <AnalyticsFilters
        uploadedData={uploadedData}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        selectedEngineer={selectedEngineer}
        setSelectedEngineer={setSelectedEngineer}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        topEngineersFilter={topEngineersFilter}
        setTopEngineersFilter={setTopEngineersFilter}
      />

      <div className="flex items-center space-x-2">
        <div className="relative" ref={historyRef}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
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
                disabled={uploadedData.length === 0 || saveStatus === "saving"}
              >
                <Save className="h-4 w-4 mr-2" /> Salvar & Compartilhar
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onPrint}>
                <Printer className="h-4 w-4 mr-2" /> Imprimir
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleHistoryClick}>
                <History className="h-4 w-4 mr-2" /> Histórico
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onClearData} disabled={isLoading}>
                <Trash2 className="h-4 w-4 mr-2" /> Limpar Dados
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* História Dropdown */}
          {historyDropdownOpen && uploadHistory.length > 0 && (
            <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-60 overflow-auto">
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <h3 className="font-medium text-gray-800">
                  Histórico de Uploads
                </h3>
              </div>
              {uploadHistory.map((upload, index) => (
                <div
                  key={upload.id}
                  className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                >
                  <div className="font-medium text-sm text-gray-800">
                    {upload.file_name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {upload.uploaded_by} • {upload.total_records} registros
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(upload.upload_date || "").toLocaleString("pt-BR")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={onFileUpload}
          className="hidden"
        />
        {fileName && (
          <div className="flex items-center space-x-1 text-white text-sm">
            <FileSpreadsheet className="h-4 w-4" />
            <span>{fileName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
