import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  saveDevolucaoData,
  loadDevolucaoData,
  getDevolucaoUploadHistory,
  clearAllDevolucaoData,
  type DevolucaoData,
  type DevolucaoItem,
  type DevolucaoUpload,
} from "@/lib/returns-movements-supabase-client";

interface DevolucaoDataRow {
  total: number;
  pendentes: number;
  concluidas: number;
}

interface DevolucaoItemRow {
  id: string;
  os: string;
  cliente: string;
  produto: string;
  motivo: string;
  status: string;
  data_devolucao: string;
  data_resolucao: string;
  responsavel: string;
  valor: number;
  observacoes: string;
  rawData: any;
}

// Helper function para converter data BR para ISO
function parseDateBRtoISO(dataBR: string): string {
  if (!dataBR) return "";

  const parts = dataBR.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  return "";
}

// Helper function para formatar data ISO para BR
function formatDateToBR(dateISO: string): string {
  if (!dateISO) return "";

  const date = new Date(dateISO);
  return date.toLocaleDateString("pt-BR");
}

export function useReturnsData() {
  const [devolucaoData, setDevolucaoData] = useState<DevolucaoDataRow>({
    total: 0,
    pendentes: 0,
    concluidas: 0,
  });
  const [processedItems, setProcessedItems] = useState<DevolucaoItemRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [uploadHistory, setUploadHistory] = useState<DevolucaoUpload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const loadSavedData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { devolucaoData: savedData, items } = await loadDevolucaoData();
      if (savedData && items.length > 0) {
        setDevolucaoData({
          total: savedData.total,
          pendentes: savedData.pendentes,
          concluidas: savedData.concluidas,
        });
        setProcessedItems(
          items.map((item) => ({
            id: item.os,
            os: item.os,
            cliente: item.cliente || "Cliente não informado",
            produto: item.produto || "Produto não informado",
            motivo: item.motivo || "Motivo não informado",
            status: item.status,
            data_devolucao: item.data_devolucao
              ? formatDateToBR(item.data_devolucao)
              : "",
            data_resolucao: item.data_resolucao
              ? formatDateToBR(item.data_resolucao)
              : "",
            responsavel: item.responsavel || "Não informado",
            valor: item.valor || 0,
            observacoes: item.observacoes || "",
            rawData: item.raw_data,
          }))
        );
      }
    } catch (error) {
      } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUploadHistory = useCallback(async () => {
    try {
      const history = await getDevolucaoUploadHistory();
      setUploadHistory(history);
    } catch (error) {
      }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

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
          setIsLoading(false);
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
        const clienteIndex = headers.findIndex(
          (header) => header && header.toLowerCase().includes("cliente")
        );
        const produtoIndex = headers.findIndex(
          (header) => header && header.toLowerCase().includes("produto")
        );
        const motivoIndex = headers.findIndex(
          (header) => header && header.toLowerCase().includes("motivo")
        );
        const dataDevolucaoIndex = headers.findIndex(
          (header) =>
            header &&
            header.toLowerCase().includes("data") &&
            header.toLowerCase().includes("devolucao")
        );
        const dataResolucaoIndex = headers.findIndex(
          (header) =>
            header &&
            header.toLowerCase().includes("data") &&
            header.toLowerCase().includes("resolucao")
        );
        const responsavelIndex = headers.findIndex(
          (header) => header && header.toLowerCase().includes("responsavel")
        );
        const valorIndex = headers.findIndex(
          (header) => header && header.toLowerCase().includes("valor")
        );
        const observacoesIndex = headers.findIndex(
          (header) => header && header.toLowerCase().includes("observacoes")
        );

        const processedData = {
          total: 0,
          pendentes: 0,
          concluidas: 0,
          items: [] as DevolucaoItemRow[],
        };

        // Processa cada linha de dados (pula o cabeçalho)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue;

          const status =
            row[statusIndex]?.toString().toLowerCase().trim() || "pendente";
          const os = osIndex !== -1 ? row[osIndex]?.toString() : `OS-${i}`;

          // Cria o item
          const item: DevolucaoItemRow = {
            id: os,
            os: os,
            cliente:
              clienteIndex !== -1
                ? row[clienteIndex]?.toString() || "Cliente não informado"
                : "Cliente não informado",
            produto:
              produtoIndex !== -1
                ? row[produtoIndex]?.toString() || "Produto não informado"
                : "Produto não informado",
            motivo:
              motivoIndex !== -1
                ? row[motivoIndex]?.toString() || "Motivo não informado"
                : "Motivo não informado",
            status: row[statusIndex]?.toString() || "Pendente",
            data_devolucao:
              dataDevolucaoIndex !== -1
                ? row[dataDevolucaoIndex]?.toString() || ""
                : "",
            data_resolucao:
              dataResolucaoIndex !== -1
                ? row[dataResolucaoIndex]?.toString() || ""
                : "",
            responsavel:
              responsavelIndex !== -1
                ? row[responsavelIndex]?.toString() || "Não informado"
                : "Não informado",
            valor:
              valorIndex !== -1
                ? parseFloat(row[valorIndex]?.toString() || "0")
                : 0,
            observacoes:
              observacoesIndex !== -1
                ? row[observacoesIndex]?.toString() || ""
                : "",
            rawData: row,
          };

          processedData.items.push(item);
          processedData.total++;

          // Categoriza baseado no status
          if (
            status.includes("pendente") ||
            status.includes("aguardando") ||
            status.includes("analise") ||
            status.includes("análise")
          ) {
            processedData.pendentes++;
          } else if (
            status.includes("concluida") ||
            status.includes("concluído") ||
            status.includes("finalizada") ||
            status.includes("resolvida")
          ) {
            processedData.concluidas++;
          }
        }

        // Atualiza o estado
        setDevolucaoData({
          total: processedData.total,
          pendentes: processedData.pendentes,
          concluidas: processedData.concluidas,
        });

        // Armazena os itens processados
        setProcessedItems(processedData.items);

        alert(
          `Planilha de devoluções carregada com sucesso! ${processedData.total} itens processados.`
        );
      } catch (error) {
        alert(
          "Erro ao processar a planilha. Verifique se o arquivo está no formato correto (.xlsx ou .xls)."
        );
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSaveData = useCallback(async () => {
    if (processedItems.length === 0) {
      alert("Nenhum dado para salvar. Faça upload de uma planilha primeiro.");
      return;
    }

    setSaveStatus("saving");

    try {
      const devolucaoDataToSave: DevolucaoData = {
        total: devolucaoData.total,
        pendentes: devolucaoData.pendentes,
        concluidas: devolucaoData.concluidas,
      };

      const itemsToSave: DevolucaoItem[] = processedItems.map((item) => ({
        os: item.os,
        cliente: item.cliente,
        produto: item.produto,
        motivo: item.motivo,
        status: item.status,
        data_devolucao: item.data_devolucao
          ? parseDateBRtoISO(item.data_devolucao)
          : undefined,
        data_resolucao: item.data_resolucao
          ? parseDateBRtoISO(item.data_resolucao)
          : undefined,
        responsavel: item.responsavel,
        valor: item.valor,
        observacoes: item.observacoes,
        raw_data: item.rawData,
      }));

      const result = await saveDevolucaoData(
        devolucaoDataToSave,
        itemsToSave,
        fileName,
        "Paloma"
      );

      if (result.success) {
        setSaveStatus("saved");
        alert("Dados de devoluções salvos com sucesso!");

        // Recarrega o histórico
        await loadUploadHistory();

        // Reseta status após alguns segundos
        setTimeout(() => {
          setSaveStatus("idle");
        }, 3000);
      } else {
        setSaveStatus("error");
        setTimeout(() => {
          setSaveStatus("idle");
        }, 3000);
      }
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    }
  }, [devolucaoData, processedItems, fileName, loadUploadHistory]);

  const handleClearData = useCallback(async () => {
    if (
      confirm("Tem certeza que deseja limpar todos os dados de devoluções?")
    ) {
      try {
        await clearAllDevolucaoData();
        setDevolucaoData({
          total: 0,
          pendentes: 0,
          concluidas: 0,
        });
        setProcessedItems([]);
        setFileName("");
        alert("Dados de devoluções limpos com sucesso!");
      } catch (error) {
        alert("Erro ao limpar dados. Verifique o console para mais detalhes.");
      }
    }
  }, []);

  return {
    devolucaoData,
    processedItems,
    fileName,
    uploadHistory,
    isLoading,
    saveStatus,
    loadSavedData,
    loadUploadHistory,
    handleFileUpload,
    handleSaveData,
    handleClearData,
  };
}
