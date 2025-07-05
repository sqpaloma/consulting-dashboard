"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { useAnalyticsData } from "../hooks/use-analytics-data";
import { AnalyticsHeader } from "./analytics-header";
import { AnalyticsStatusCard } from "./analytics-status-card";
import { AnalyticsUploadSection } from "./analytics-upload-section";
import { AnalyticsLossAnalysis } from "./analytics-loss-analysis";
import { AnalyticsAdminData } from "./analytics-admin-data";
import { AnalyticsMetrics } from "./analytics-metrics";
import { AnalyticsCharts } from "./analytics-charts";
import { AnalyticsRanking } from "./analytics-ranking";

export function AnalyticsPage() {
  const {
    uploadedData,
    fileName,
    uploadHistory,
    isLoading,
    saveStatus,
    lossAnalysis,
    showLossAnalysis,
    setShowLossAnalysis,
    loadSavedData,
    loadUploadHistory,
    handleFileUpload,
    handleSaveData,
    handleClearData,
    generateDetailedReport,
    generateLossAnalysis,
  } = useAnalyticsData();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtros levantados para cá
  const [selectedDepartment, setSelectedDepartment] = useState("todos");
  const [selectedEngineer, setSelectedEngineer] = useState("todos");
  const [selectedYear, setSelectedYear] = useState("todos");
  const [selectedMonth, setSelectedMonth] = useState("todos");
  const [topEngineersFilter, setTopEngineersFilter] = useState("orcamento");

  // Função para normalizar nomes (igual do filtro)
  function normalizeName(name: string) {
    return name?.toLowerCase().replace(/\s+/g, "").trim();
  }

  // Mapeamento dos departamentos e colaboradores (igual do filtro)
  const departmentMap = {
    vendas: {
      gerente: "Sobrinho",
      colaboradores: [
        "Sobrinho",
        "Mamede",
        "Giovana",
        "Rafael Massa",
        "LENILTON",
      ],
    },
    servicos: {
      gerente: "Giovanni",
      colaboradores: ["Giovanni", "Paloma", "Lucas", "Marcelo M", "Raquel"],
    },
  };

  // Filtragem dos dados conforme os filtros selecionados
  let filteredData = uploadedData;
  if (selectedDepartment !== "todos") {
    if (selectedDepartment === "vendas" || selectedDepartment === "servicos") {
      const colabs =
        departmentMap[selectedDepartment].colaboradores.map(normalizeName);
      filteredData = filteredData.filter((row) =>
        colabs.includes(normalizeName(row.engenheiro))
      );
    } else if (selectedDepartment === "outros") {
      const allColabs = [
        ...departmentMap.vendas.colaboradores,
        ...departmentMap.servicos.colaboradores,
      ].map(normalizeName);
      filteredData = filteredData.filter(
        (row) => !allColabs.includes(normalizeName(row.engenheiro))
      );
    }
  }
  if (selectedEngineer !== "todos") {
    filteredData = filteredData.filter(
      (row) => normalizeName(row.engenheiro) === selectedEngineer
    );
  }
  if (selectedYear !== "todos") {
    filteredData = filteredData.filter(
      (row) => row.ano?.toString() === selectedYear
    );
  }
  if (selectedMonth !== "todos") {
    filteredData = filteredData.filter(
      (row) => row.mes?.toString().padStart(2, "0") === selectedMonth
    );
  }

  // Carregar dados salvos ao inicializar
  useEffect(() => {
    loadSavedData();
    loadUploadHistory();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <AnalyticsHeader />

        {/* Status Card */}
        {uploadHistory.length > 0 && (
          <AnalyticsStatusCard uploadHistory={uploadHistory} />
        )}

        {/* Filters and Upload */}
        <AnalyticsUploadSection
          fileInputRef={fileInputRef}
          fileName={fileName}
          saveStatus={saveStatus}
          uploadedData={uploadedData}
          isLoading={isLoading}
          onUploadClick={handleUploadClick}
          onFileUpload={handleFileUpload}
          onSaveData={handleSaveData}
          onPrint={handlePrint}
          onGenerateReport={generateDetailedReport}
          onGenerateLossAnalysis={generateLossAnalysis}
          onClearData={handleClearData}
          // Passar filtros e setters
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

        {/* Loading State */}
        {isLoading && (
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-700 font-medium">Carregando dados...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Highlight Card */}
        {uploadedData.length === 0 && !isLoading && (
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="text-center">
                <BarChart3 className="h-10 w-10 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">
                  Nenhum dado carregado. Por favor, faça upload de uma planilha
                  Excel para visualizar as análises.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Os dados serão salvos automaticamente e ficarão disponíveis
                  para toda a equipe.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics Cards */}
        <AnalyticsMetrics uploadedData={filteredData} />

        {/* Charts Section */}
        <AnalyticsCharts uploadedData={filteredData} />

        {/* Ranking Section */}
        <AnalyticsRanking uploadedData={filteredData} />

        {/* Administrative Data */}
        <AnalyticsAdminData uploadedData={filteredData} />

        {/* Loss Analysis Modal/Card */}
        {showLossAnalysis && lossAnalysis && (
          <AnalyticsLossAnalysis
            lossAnalysis={lossAnalysis}
            onClose={() => setShowLossAnalysis(false)}
          />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}
