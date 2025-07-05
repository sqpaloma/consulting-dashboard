import React from "react";
import {
  Upload,
  FileSpreadsheet,
  Trash2,
  Printer,
  Save,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsFilters } from "./analytics-filters";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface AnalyticsUploadSectionProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  fileName: string;
  saveStatus: "idle" | "saving" | "saved" | "error";
  uploadedData: any[];
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
  isLoading,
  onUploadClick,
  onFileUpload,
  onSaveData,
  onPrint,
  onGenerateReport,
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
          <div className="flex items-center space-x-1 text-white text-sm">
            <FileSpreadsheet className="h-4 w-4" />
            <span>{fileName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
