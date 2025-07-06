"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  Save,
  History,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import type { DashboardUpload as DashboardUploadType } from "@/lib/dashboard-supabase";

interface DashboardData {
  totalItens: number;
  aguardandoAprovacao: number;
  analises: number;
  orcamentos: number;
  emExecucao: number;
}

interface DashboardUploadProps {
  dashboardData: DashboardData;
  setDashboardData: (data: DashboardData) => void;
  setProcessedItems: (items: any[]) => void;
  dashboardUploadHistory: DashboardUploadType[];
  setHistoryDropdownOpen: (open: boolean) => void;
  historyDropdownOpen: boolean;
  dashboardSaveStatus: "idle" | "saving" | "saved" | "error";
  handleSaveDashboardData: () => void;
  handleClearDashboardData: () => void;
  isDashboardLoading: boolean;
  fileName: string;
  setFileName: (name: string) => void;
}

export function DashboardUpload({
  dashboardData,
  setDashboardData,
  setProcessedItems,
  dashboardUploadHistory,
  setHistoryDropdownOpen,
  historyDropdownOpen,
  dashboardSaveStatus,
  handleSaveDashboardData,
  handleClearDashboardData,
  isDashboardLoading,
  fileName,
  setFileName,
}: DashboardUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Pega a primeira planilha
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Converte para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          alert(
            "Planilha deve conter pelo menos uma linha de cabeçalho e uma linha de dados."
          );
          return;
        }

        // Primeira linha são os cabeçalhos
        const headers = jsonData[0] as string[];

        // Encontra os índices das colunas importantes
        const statusIndex = headers.findIndex(
          (header) => header && header.toLowerCase().includes("status")
        );
        const osIndex = headers.findIndex(
          (header) =>
            header &&
            (header.toLowerCase().includes("os") ||
              header.toLowerCase().includes("ordem"))
        );
        const prazoIndex = headers.findIndex(
          (header) => header && header.toLowerCase().includes("prazo")
        );

        if (statusIndex === -1) {
          alert("Coluna 'status' não encontrada na planilha.");
          return;
        }

        // Processa os dados
        const processedData = {
          totalItens: 0,
          aguardandoAprovacao: 0,
          analises: 0,
          orcamentos: 0,
          emExecucao: 0,
          items: [] as any[],
        };

        // Processa cada linha de dados (pula o cabeçalho)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue;

          const status = row[statusIndex]?.toString().toLowerCase().trim();
          const os = osIndex !== -1 ? row[osIndex]?.toString() : `OS-${i}`;

          // Cria o item
          const item = {
            id: os,
            os: os,
            status: row[statusIndex]?.toString() || "Não definido",
            titulo: row[1] || `Item ${i}`, // Assume que a segunda coluna é o título
            cliente: row[2] || "Cliente não informado", // Assume que a terceira coluna é o cliente
            data: new Date().toLocaleDateString("pt-BR"),
            prazo: prazoIndex !== -1 ? row[prazoIndex]?.toString() : null,
            valor: row[3]
              ? `R$ ${Number.parseFloat(row[3]).toLocaleString("pt-BR")}`
              : "Valor não informado",
            rawData: row,
          };

          processedData.items.push(item);
          processedData.totalItens++;

          // Categoriza baseado no status
          if (
            status.includes("aguardando") ||
            status.includes("pendente") ||
            status.includes("aprovação")
          ) {
            processedData.aguardandoAprovacao++;
          } else if (
            status.includes("análise") ||
            status.includes("analise") ||
            status.includes("revisão") ||
            status.includes("revisao")
          ) {
            processedData.analises++;
          } else if (
            status.includes("orçamento") ||
            status.includes("orcamento") ||
            status.includes("cotação") ||
            status.includes("cotacao")
          ) {
            processedData.orcamentos++;
          } else if (
            status.includes("execução") ||
            status.includes("execucao") ||
            status.includes("andamento") ||
            status.includes("progresso")
          ) {
            processedData.emExecucao++;
          }
        }

        // Atualiza o estado
        setDashboardData({
          totalItens: processedData.totalItens,
          aguardandoAprovacao: processedData.aguardandoAprovacao,
          analises: processedData.analises,
          orcamentos: processedData.orcamentos,
          emExecucao: processedData.emExecucao,
        });

        // Armazena os itens processados para uso nos modais
        setProcessedItems(processedData.items);

        alert(
          `Planilha carregada com sucesso! ${processedData.totalItens} itens processados.`
        );
      } catch (error) {
        console.error("Erro ao processar planilha:", error);
        alert(
          "Erro ao processar a planilha. Verifique se o arquivo está no formato correto (.xlsx ou .xls)."
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {dashboardUploadHistory.length > 0 && (
        <Card className="bg-white border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-800">
                    Dados compartilhados disponíveis
                  </p>
                  <p className="text-sm text-gray-600">
                    Último upload: {dashboardUploadHistory[0]?.file_name} por{" "}
                    {dashboardUploadHistory[0]?.uploaded_by}
                  </p>
                </div>
              </div>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHistoryDropdownOpen(!historyDropdownOpen)}
                  className="bg-transparent"
                >
                  <History className="h-4 w-4 mr-2" />
                  Histórico
                </Button>
                {historyDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
                    {dashboardUploadHistory.map((upload) => (
                      <div
                        key={upload.id}
                        className="p-3 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-sm text-gray-800">
                          {upload.file_name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {upload.uploaded_by} • {upload.total_records}{" "}
                          registros
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(upload.upload_date || "").toLocaleString(
                            "pt-BR"
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      <div className="flex justify-end">
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleUploadClick}
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <Upload className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleSaveDashboardData}
            disabled={
              dashboardData.totalItens === 0 || dashboardSaveStatus === "saving"
            }
            variant="outline"
            size="icon"
            className={`bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm ${
              dashboardSaveStatus === "saved"
                ? "border-green-400 text-green-300"
                : dashboardSaveStatus === "error"
                ? "border-red-400 text-red-300"
                : ""
            }`}
            title="Salvar & Compartilhar"
          >
            {dashboardSaveStatus === "saving" ? (
              <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
            ) : dashboardSaveStatus === "saved" ? (
              <CheckCircle className="h-4 w-4" />
            ) : dashboardSaveStatus === "error" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </Button>

          <Button
            onClick={handleClearDashboardData}
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            disabled={isDashboardLoading}
            title="Limpar Dados"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          {fileName && (
            <div className="flex items-center space-x-1 text-white/80 text-sm">
              <FileSpreadsheet className="h-4 w-4" />
              <span>{fileName.substring(0, 5)}...xls</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
