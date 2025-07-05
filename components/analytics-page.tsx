"use client";

import type React from "react";
import { useRef, useEffect } from "react";
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
    setUploadedData,
    fileName,
    setFileName,
    uploadHistory,
    setUploadHistory,
    isLoading,
    setIsLoading,
    saveStatus,
    setSaveStatus,
    processingSummary,
    setProcessingSummary,
    lossAnalysis,
    setLossAnalysis,
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
        <AnalyticsMetrics uploadedData={uploadedData} />

        {/* Charts Section */}
        <AnalyticsCharts uploadedData={uploadedData} />

        {/* Ranking Section */}
        <AnalyticsRanking uploadedData={uploadedData} />

        {/* Administrative Data */}
        <AnalyticsAdminData uploadedData={uploadedData} />

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
