"use client";

import { AdminProtection } from "@/components/admin-protection";
import type React from "react";
import { useState, useRef, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAnalyticsData } from "@/hooks/use-analytics-data";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { AnalyticsUploadSection } from "../../components/analytics/analytics-upload-section";
import { AnalyticsAdminData } from "../../components/analytics/analytics-admin-data";
import { AnalyticsMetrics } from "../../components/analytics/analytics-metrics";
import { AnalyticsCharts } from "../../components/analytics/analytics-charts";
import { AnalyticsRanking } from "../../components/analytics/analytics-ranking";
import { AnalyticsClientAnalysis } from "../../components/analytics/analytics-client-analysis";

export function normalizeName(name: string | undefined): string {
  if (name == null) return "";
  return name.toLowerCase().replace(/\s+/g, "").trim();
}

export function aggregateEngineerData(data: any[]): any[] {
  const engineerMap = new Map<string, any>();
  data.forEach((row: any) => {
    const engineerName = row.engenheiro;
    if (engineerMap.has(engineerName)) {
      const existing = engineerMap.get(engineerName);
      engineerMap.set(engineerName, {
        ...existing,
        registros: existing.registros + row.registros,
        servicos: existing.servicos + row.servicos,
        pecas: existing.pecas + row.pecas,
        valorTotal: existing.valorTotal + row.valorTotal,
        valorPecas: existing.valorPecas + row.valorPecas,
        valorServicos: existing.valorServicos + row.valorServicos,
        valorOrcamentos: existing.valorOrcamentos + row.valorOrcamentos,
        projetos: existing.projetos + row.projetos,
        quantidade: existing.quantidade + row.quantidade,
        cliente: existing.cliente || row.cliente,
      });
    } else {
      engineerMap.set(engineerName, { ...row });
    }
  });
  return Array.from(engineerMap.values());
}

export function AnalyticsPage() {
  const {
    uploadedData,
    rawData,
    fileName,
    uploadHistory,
    isLoading,
    saveStatus,
    loadSavedData,
    loadUploadHistory,
    handleFileUpload,
    handleSaveData,
    handleClearData,
    generateDetailedReport,
  } = useAnalyticsData();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtros levantados para cá
  const [selectedDepartment, setSelectedDepartment] = useState("todos");
  const [selectedEngineer, setSelectedEngineer] = useState("todos");
  const [selectedYear, setSelectedYear] = useState("todos");
  const [selectedMonth, setSelectedMonth] = useState("todos");
  const [topEngineersFilter, setTopEngineersFilter] = useState("orcamento");

  // Mapeamento dos departamentos e colaboradores
  const departmentMap: any = {
    vendas: {
      gerente: "Sobrinho",
      colaboradores: [
        "Sobrinho",
        "Mamede",
        "Giovana",
        "LENILTON",
      ],
    },
    servicos: {
      gerente: "Giovanni",
      colaboradores: ["Giovanni", "Paloma", "Lucas", "Marcelo M", "Raquel", "Rafael Massa"],
    },
    engenhariaeassistencia: {
      gerente: "Carlinhos",
      colaboradores: ["Carlinhos", "Claudio", "Anderson"],
    },
    externos: {
      gerente: "Carvalho",
      colaboradores: ["RONAN NONATO", "Jefferson", "Edison", "Sandro"],
    },
  };

  // Filtragem dos dados conforme os filtros selecionados
  let filteredData = uploadedData;
  if (selectedDepartment !== "todos") {
    if (
      selectedDepartment === "vendas" ||
      selectedDepartment === "servicos" ||
      selectedDepartment === "engenhariaeassistencia" ||
      selectedDepartment === "externos"
    ) {
      const colabs =
        departmentMap[selectedDepartment].colaboradores.map(normalizeName);
      filteredData = filteredData.filter((row) =>
        colabs.includes(normalizeName(row.engenheiro))
      );
    } else if (selectedDepartment === "outros") {
      const allColabs = [
        ...departmentMap.vendas.colaboradores,
        ...departmentMap.servicos.colaboradores,
        ...departmentMap.engenhariaeassistencia.colaboradores,
        ...departmentMap.externos.colaboradores,
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

  // Filtrar dados brutos também
  let filteredRawData = rawData;
  if (selectedDepartment !== "todos") {
    if (
      selectedDepartment === "vendas" ||
      selectedDepartment === "servicos" ||
      selectedDepartment === "engenhariaeassistencia" ||
      selectedDepartment === "externos"
    ) {
      const colabs =
        departmentMap[selectedDepartment].colaboradores.map(normalizeName);
      filteredRawData = filteredRawData.filter((row) =>
        colabs.includes(normalizeName(row.responsavel))
      );
    } else if (selectedDepartment === "outros") {
      const allColabs = [
        ...departmentMap.vendas.colaboradores,
        ...departmentMap.servicos.colaboradores,
        ...departmentMap.engenhariaeassistencia.colaboradores,
        ...departmentMap.externos.colaboradores,
      ].map(normalizeName);
      filteredRawData = filteredRawData.filter(
        (row) => !allColabs.includes(normalizeName(row.responsavel))
      );
    }
  }
  if (selectedEngineer !== "todos") {
    filteredRawData = filteredRawData.filter(
      (row) => normalizeName(row.responsavel) === selectedEngineer
    );
  }
  if (selectedYear !== "todos") {
    filteredRawData = filteredRawData.filter(
      (row) => row.ano?.toString() === selectedYear
    );
  }
  if (selectedMonth !== "todos") {
    filteredRawData = filteredRawData.filter(
      (row) => row.mes?.toString().padStart(2, "0") === selectedMonth
    );
  }

  // Agregar dados dos engenheiros quando não há filtros específicos de mês/ano/engenheiro
  const shouldAggregate =
    selectedYear === "todos" &&
    selectedMonth === "todos" &&
    selectedEngineer === "todos";
  const displayData = shouldAggregate
    ? aggregateEngineerData(filteredData)
    : filteredData;

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
    <ResponsiveLayout title="Análises" fullWidth={true}>
      {/* Filters and Upload */}
      <AnalyticsUploadSection
        fileInputRef={fileInputRef}
        fileName={fileName}
        saveStatus={saveStatus}
        uploadedData={uploadedData}
        uploadHistory={uploadHistory}
        isLoading={isLoading}
        onUploadClick={handleUploadClick}
        onFileUpload={handleFileUpload}
        onSaveData={handleSaveData}
        onPrint={handlePrint}
        onGenerateReport={generateDetailedReport}
        onClearData={handleClearData}
        // Passar filtros e setters - usar dados originais para filtros
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
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Carregando dados...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Display */}
      {!isLoading && uploadedData && uploadedData.length > 0 && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <AnalyticsMetrics uploadedData={displayData} />

          {/* Charts Grid */}
          <AnalyticsCharts
            uploadedData={displayData}
            originalData={filteredData}
          />

          {/* Ranking */}
          <AnalyticsRanking uploadedData={displayData} />

          {/* Client Analysis */}
          <AnalyticsClientAnalysis
            uploadedData={displayData}
            rawData={filteredRawData}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            selectedEngineer={selectedEngineer}
          />

          {/* Admin Data Table */}
          <AnalyticsAdminData uploadedData={displayData} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!uploadedData || uploadedData.length === 0) && (
        <Card className="bg-white">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum dado carregado
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Faça o upload de um arquivo Excel para começar a análise
            </p>
          </CardContent>
        </Card>
      )}
    </ResponsiveLayout>
  );
}

export default function Analytics() {
  return (
    <AdminProtection allowedRoles={["diretor", "admin"]}>
      <AnalyticsPage />
    </AdminProtection>
  );
}
