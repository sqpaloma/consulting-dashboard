"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  Save,
  Trash2,
  FileSpreadsheet,
  History,
  Database,
  Users,
} from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function SettingsDataManagement() {
  const {
    dashboardData,
    fileName,
    uploadHistory,
    isLoading,
    saveStatus,
    loadSavedData,
    loadUploadHistory,
    handleFileUpload,
    handleSaveData,
    handleClearData,
  } = useDashboardData();


  const fileInputRefConsultores = useRef<HTMLInputElement>(null);

  const [historyDropdownOpen, setHistoryDropdownOpen] = useState({
    consultores: false,
  });

  useEffect(() => {
    loadSavedData();
    loadUploadHistory();
  }, [
    loadSavedData,
    loadUploadHistory,
  ]);

  const handleUploadClick = (type: "consultores") => {
    if (type === "consultores") {
      fileInputRefConsultores.current?.click();
    }
  };

  const getSaveButtonText = (saveStatus: string) => {
    switch (saveStatus) {
      case "saving":
        return "Salvando...";
      case "saved":
        return "Salvo ✓";
      case "error":
        return "Erro";
      default:
        return "Salvar & Compartilhar";
    }
  };

  const toggleHistoryDropdown = (type: "consultores") => {
    setHistoryDropdownOpen((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Gerenciamento de Dados do Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <div className="bg-white/20 mb-6 p-1 rounded-lg">
            <div className="text-white bg-white/20 px-3 py-2 rounded-md flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Consultores
            </div>
          </div>

          {/* Seção Consultores */}
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white text-base font-medium">
                  Upload de Planilha - Dashboard dos Consultores
                </Label>
                <Button
                  variant="outline"
                  onClick={() => handleUploadClick("consultores")}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload
                </Button>
              </div>

              <input
                ref={fileInputRefConsultores}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />

              {fileName && (
                <div className="flex items-center space-x-2 text-white/80 text-sm bg-white/5 p-2 rounded">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Arquivo atual: {fileName}</span>
                </div>
              )}

              <p className="text-sm text-gray-300">
                Faça upload de uma planilha Excel (.xlsx ou .xls) para atualizar
                os dados do dashboard dos consultores.
              </p>
            </div>

            <Separator className="bg-white/20" />

            {/* Current Data Info */}
            <div className="space-y-4">
              <Label className="text-white text-base font-medium">
                Dados Atuais do Dashboard dos Consultores
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 p-3 rounded">
                  <div className="text-xs text-gray-300">Total</div>
                  <div className="text-lg font-semibold text-white">
                    {dashboardData.totalItens}
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded">
                  <div className="text-xs text-gray-300">Aguardando</div>
                  <div className="text-lg font-semibold text-white">
                    {dashboardData.aguardandoAprovacao}
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded">
                  <div className="text-xs text-gray-300">Análises</div>
                  <div className="text-lg font-semibold text-white">
                    {dashboardData.analises}
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded">
                  <div className="text-xs text-gray-300">Em Execução</div>
                  <div className="text-lg font-semibold text-white">
                    {dashboardData.emExecucao}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-white/20" />

            {/* Actions */}
            <div className="space-y-4">
              <Label className="text-white text-base font-medium">Ações</Label>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={handleSaveData}
                  disabled={
                    dashboardData.totalItens === 0 || saveStatus === "saving"
                  }
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {getSaveButtonText(saveStatus)}
                </Button>

                <Button
                  onClick={handleClearData}
                  disabled={isLoading}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Dados
                </Button>
              </div>
              <p className="text-sm text-gray-300">
                Salve para compartilhar os dados com outros usuários do
                dashboard.
              </p>
            </div>

            <Separator className="bg-white/20" />

            {/* Upload History */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white text-base font-medium">
                  Histórico de Uploads
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleHistoryDropdown("consultores")}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <History className="h-4 w-4 mr-2" />
                  Ver Histórico
                </Button>
              </div>

              {historyDropdownOpen.consultores && uploadHistory.length > 0 && (
                <div className="bg-white/5 border border-white/20 rounded-md p-4 max-h-60 overflow-auto">
                  <div className="space-y-3">
                    {uploadHistory.map((upload) => (
                      <div
                        key={upload.id}
                        className="p-3 bg-white/5 rounded border-l-4 border-l-blue-500"
                      >
                        <div className="font-medium text-sm text-white">
                          {upload.file_name}
                        </div>
                        <div className="text-xs text-gray-300">
                          {upload.uploaded_by} • {upload.total_records}{" "}
                          registros
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(upload.upload_date || "").toLocaleString(
                            "pt-BR"
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadHistory.length === 0 && (
                <p className="text-sm text-gray-400">
                  Nenhum upload realizado ainda.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
