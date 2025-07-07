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
  RotateCcw,
  TrendingUp,
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

  // Estados para Devoluções
  const [devolucoes, setDevolucoes] = useState({
    data: { total: 0, pendentes: 0, concluidas: 0 },
    fileName: "",
    uploadHistory: [],
    isLoading: false,
    saveStatus: "idle" as "idle" | "saving" | "saved" | "error",
  });

  // Estados para Movimentações
  const [movimentacoes, setMovimentacoes] = useState({
    data: { total: 0, entrada: 0, saida: 0 },
    fileName: "",
    uploadHistory: [],
    isLoading: false,
    saveStatus: "idle" as "idle" | "saving" | "saved" | "error",
  });

  const fileInputRefConsultores = useRef<HTMLInputElement>(null);
  const fileInputRefDevolucoes = useRef<HTMLInputElement>(null);
  const fileInputRefMovimentacoes = useRef<HTMLInputElement>(null);

  const [historyDropdownOpen, setHistoryDropdownOpen] = useState({
    consultores: false,
    devolucoes: false,
    movimentacoes: false,
  });

  useEffect(() => {
    loadSavedData();
    loadUploadHistory();
  }, []);

  const handleUploadClick = (
    type: "consultores" | "devolucoes" | "movimentacoes"
  ) => {
    if (type === "consultores") {
      fileInputRefConsultores.current?.click();
    } else if (type === "devolucoes") {
      fileInputRefDevolucoes.current?.click();
    } else if (type === "movimentacoes") {
      fileInputRefMovimentacoes.current?.click();
    }
  };

  const handleFileUploadDevolucoes = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setDevolucoes((prev) => ({
      ...prev,
      fileName: file.name,
      isLoading: true,
    }));

    // Simular processamento por agora
    setTimeout(() => {
      setDevolucoes((prev) => ({
        ...prev,
        data: { total: 15, pendentes: 8, concluidas: 7 },
        isLoading: false,
      }));
      alert("Planilha de Devoluções carregada com sucesso!");
    }, 2000);
  };

  const handleFileUploadMovimentacoes = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMovimentacoes((prev) => ({
      ...prev,
      fileName: file.name,
      isLoading: true,
    }));

    // Simular processamento por agora
    setTimeout(() => {
      setMovimentacoes((prev) => ({
        ...prev,
        data: { total: 42, entrada: 25, saida: 17 },
        isLoading: false,
      }));
      alert("Planilha de Movimentações carregada com sucesso!");
    }, 2000);
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

  const handleSaveDevolucoes = async () => {
    if (devolucoes.data.total === 0) {
      alert("Nenhum dado para salvar. Faça upload de uma planilha primeiro.");
      return;
    }

    setDevolucoes((prev) => ({ ...prev, saveStatus: "saving" }));

    // Simular salvamento por agora
    setTimeout(() => {
      setDevolucoes((prev) => ({ ...prev, saveStatus: "saved" }));
      setTimeout(() => {
        setDevolucoes((prev) => ({ ...prev, saveStatus: "idle" }));
      }, 3000);
      alert("Dados de Devoluções salvos com sucesso!");
    }, 2000);
  };

  const handleSaveMovimentacoes = async () => {
    if (movimentacoes.data.total === 0) {
      alert("Nenhum dado para salvar. Faça upload de uma planilha primeiro.");
      return;
    }

    setMovimentacoes((prev) => ({ ...prev, saveStatus: "saving" }));

    // Simular salvamento por agora
    setTimeout(() => {
      setMovimentacoes((prev) => ({ ...prev, saveStatus: "saved" }));
      setTimeout(() => {
        setMovimentacoes((prev) => ({ ...prev, saveStatus: "idle" }));
      }, 3000);
      alert("Dados de Movimentações salvos com sucesso!");
    }, 2000);
  };

  const handleClearDevolucoes = () => {
    if (
      confirm("Tem certeza que deseja limpar todos os dados de Devoluções?")
    ) {
      setDevolucoes((prev) => ({
        ...prev,
        data: { total: 0, pendentes: 0, concluidas: 0 },
        fileName: "",
      }));
      alert("Dados de Devoluções limpos com sucesso!");
    }
  };

  const handleClearMovimentacoes = () => {
    if (
      confirm("Tem certeza que deseja limpar todos os dados de Movimentações?")
    ) {
      setMovimentacoes((prev) => ({
        ...prev,
        data: { total: 0, entrada: 0, saida: 0 },
        fileName: "",
      }));
      alert("Dados de Movimentações limpos com sucesso!");
    }
  };

  const toggleHistoryDropdown = (
    type: "consultores" | "devolucoes" | "movimentacoes"
  ) => {
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
        <Tabs defaultValue="consultores" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/20 mb-6">
            <TabsTrigger
              value="consultores"
              className="text-white data-[state=active]:bg-white/20"
            >
              <Users className="h-4 w-4 mr-2" />
              Consultores
            </TabsTrigger>
            <TabsTrigger
              value="devolucoes"
              className="text-white data-[state=active]:bg-white/20"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Devoluções
            </TabsTrigger>
            <TabsTrigger
              value="movimentacoes"
              className="text-white data-[state=active]:bg-white/20"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Movimentações
            </TabsTrigger>
          </TabsList>

          {/* Aba Consultores */}
          <TabsContent value="consultores" className="space-y-6">
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
          </TabsContent>

          {/* Aba Devoluções */}
          <TabsContent value="devolucoes" className="space-y-6">
            {/* Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white text-base font-medium">
                  Upload de Planilha - Devoluções
                </Label>
                <Button
                  variant="outline"
                  onClick={() => handleUploadClick("devolucoes")}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload
                </Button>
              </div>

              <input
                ref={fileInputRefDevolucoes}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUploadDevolucoes}
                className="hidden"
              />

              {devolucoes.fileName && (
                <div className="flex items-center space-x-2 text-white/80 text-sm bg-white/5 p-2 rounded">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Arquivo atual: {devolucoes.fileName}</span>
                </div>
              )}

              <p className="text-sm text-gray-300">
                Faça upload de uma planilha Excel (.xlsx ou .xls) para atualizar
                os dados de devoluções.
              </p>
            </div>

            <Separator className="bg-white/20" />

            {/* Current Data Info */}
            <div className="space-y-4">
              <Label className="text-white text-base font-medium">
                Dados Atuais das Devoluções
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white/5 p-3 rounded">
                  <div className="text-xs text-gray-300">Total</div>
                  <div className="text-lg font-semibold text-white">
                    {devolucoes.data.total}
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded">
                  <div className="text-xs text-gray-300">Pendentes</div>
                  <div className="text-lg font-semibold text-white">
                    {devolucoes.data.pendentes}
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded">
                  <div className="text-xs text-gray-300">Concluídas</div>
                  <div className="text-lg font-semibold text-white">
                    {devolucoes.data.concluidas}
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
                  onClick={handleSaveDevolucoes}
                  disabled={
                    devolucoes.data.total === 0 ||
                    devolucoes.saveStatus === "saving"
                  }
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {getSaveButtonText(devolucoes.saveStatus)}
                </Button>

                <Button
                  onClick={handleClearDevolucoes}
                  disabled={devolucoes.isLoading}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Dados
                </Button>
              </div>
              <p className="text-sm text-gray-300">
                Salve para compartilhar os dados de devoluções com outros
                usuários do dashboard.
              </p>
            </div>
          </TabsContent>

          {/* Aba Movimentações */}
          <TabsContent value="movimentacoes" className="space-y-6">
            {/* Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white text-base font-medium">
                  Upload de Planilha - Movimentações
                </Label>
                <Button
                  variant="outline"
                  onClick={() => handleUploadClick("movimentacoes")}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload
                </Button>
              </div>

              <input
                ref={fileInputRefMovimentacoes}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUploadMovimentacoes}
                className="hidden"
              />

              {movimentacoes.fileName && (
                <div className="flex items-center space-x-2 text-white/80 text-sm bg-white/5 p-2 rounded">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Arquivo atual: {movimentacoes.fileName}</span>
                </div>
              )}

              <p className="text-sm text-gray-300">
                Faça upload de uma planilha Excel (.xlsx ou .xls) para atualizar
                os dados de movimentações.
              </p>
            </div>

            <Separator className="bg-white/20" />

            {/* Current Data Info */}
            <div className="space-y-4">
              <Label className="text-white text-base font-medium">
                Dados Atuais das Movimentações
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white/5 p-3 rounded">
                  <div className="text-xs text-gray-300">Total</div>
                  <div className="text-lg font-semibold text-white">
                    {movimentacoes.data.total}
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded">
                  <div className="text-xs text-gray-300">Entrada</div>
                  <div className="text-lg font-semibold text-white">
                    {movimentacoes.data.entrada}
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded">
                  <div className="text-xs text-gray-300">Saída</div>
                  <div className="text-lg font-semibold text-white">
                    {movimentacoes.data.saida}
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
                  onClick={handleSaveMovimentacoes}
                  disabled={
                    movimentacoes.data.total === 0 ||
                    movimentacoes.saveStatus === "saving"
                  }
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {getSaveButtonText(movimentacoes.saveStatus)}
                </Button>

                <Button
                  onClick={handleClearMovimentacoes}
                  disabled={movimentacoes.isLoading}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Dados
                </Button>
              </div>
              <p className="text-sm text-gray-300">
                Salve para compartilhar os dados de movimentações com outros
                usuários do dashboard.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
