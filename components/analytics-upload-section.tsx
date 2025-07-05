import React from "react";
import {
  Upload,
  FileSpreadsheet,
  Trash2,
  Printer,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsFilters } from "./analytics-filters";

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
  onGenerateLossAnalysis: () => void;
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
  onGenerateLossAnalysis,
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
        <Button
          onClick={onUploadClick}
          variant="outline"
          size="icon"
          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          title="Upload Excel"
        >
          <Upload className="h-4 w-4" />
        </Button>

        <Button
          onClick={onSaveData}
          disabled={uploadedData.length === 0 || saveStatus === "saving"}
          variant="outline"
          size="icon"
          className={`bg-white border-gray-300 text-gray-700 hover:bg-gray-50 ${
            saveStatus === "saved"
              ? "border-green-500 text-green-700"
              : saveStatus === "error"
              ? "border-red-500 text-red-700"
              : ""
          }`}
          title="Salvar & Compartilhar"
        >
          {saveStatus === "saving" ? (
            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
          ) : saveStatus === "saved" ? (
            <CheckCircle className="h-4 w-4" />
          ) : saveStatus === "error" ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>

        <Button
          onClick={onPrint}
          variant="outline"
          size="icon"
          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          title="Imprimir"
        >
          <Printer className="h-4 w-4" />
        </Button>

        <Button
          onClick={onGenerateReport}
          disabled={uploadedData.length === 0}
          variant="outline"
          size="icon"
          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          title="Baixar Relatório Detalhado"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </Button>

        <Button
          onClick={onGenerateLossAnalysis}
          disabled={uploadedData.length === 0}
          variant="outline"
          size="icon"
          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          title="Análise de Motivos de Perda"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </Button>

        <Button
          onClick={onClearData}
          variant="outline"
          size="icon"
          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          disabled={isLoading}
          title="Limpar Dados"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

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
