import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  saveMovimentacaoData,
  loadMovimentacaoData,
  getMovimentacaoUploadHistory,
  clearAllMovimentacaoData,
  type MovimentacaoData,
  type MovimentacaoItem,
  type MovimentacaoUpload,
} from "@/lib/returns-movements-supabase-client";

interface MovimentacaoDataRow {
  total: number;
  entrada: number;
  saida: number;
}

interface MovimentacaoItemRow {
  id: string;
  os: string;
  tipo: string; // 'entrada' ou 'saida'
  produto: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  data_movimentacao: string;
  origem: string;
  destino: string;
  responsavel: string;
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

export function useMovementsData() {
  const [movimentacaoData, setMovimentacaoData] = useState<MovimentacaoDataRow>(
    {
      total: 0,
      entrada: 0,
      saida: 0,
    }
  );
  const [processedItems, setProcessedItems] = useState<MovimentacaoItemRow[]>(
    []
  );
  const [fileName, setFileName] = useState<string>("");
  const [uploadHistory, setUploadHistory] = useState<MovimentacaoUpload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const loadSavedData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { movimentacaoData: savedData, items } =
        await loadMovimentacaoData();
      if (savedData && items.length > 0) {
        setMovimentacaoData({
          total: savedData.total,
          entrada: savedData.entrada,
          saida: savedData.saida,
        });
        setProcessedItems(
          items.map((item) => ({
            id: item.os,
            os: item.os,
            tipo: item.tipo,
            produto: item.produto || "Produto não informado",
            quantidade: item.quantidade || 0,
            valor_unitario: item.valor_unitario || 0,
            valor_total: item.valor_total || 0,
            data_movimentacao: item.data_movimentacao
              ? formatDateToBR(item.data_movimentacao)
              : "",
            origem: item.origem || "Não informado",
            destino: item.destino || "Não informado",
            responsavel: item.responsavel || "Não informado",
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
      const history = await getMovimentacaoUploadHistory();
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
        const osIndex = headers.findIndex(
          (header) =>
            header &&
            (header.toLowerCase().includes("os") ||
              header.toLowerCase().includes("ordem"))
        );
        const tipoIndex = headers.findIndex(
          (header) => header && header.toLowerCase().includes("tipo")
        );
        const produtoIndex = headers.findIndex(
          (header) => header && header.toLowerCase().includes("produto")
        );
        const quantidadeIndex = headers.findIndex(
          (header) => header && header.toLowerCase().includes("quantidade")
        );
        const valorUnitarioIndex = headers.findIndex(
          (header) =>
            header &&
            header.toLowerCase().includes("valor") &&
            header.toLowerCase().includes("unitario")
        );
        const valorTotalIndex = headers.findIndex(
          (header) =>
            header &&
            header.toLowerCase().includes("valor") &&
            header.toLowerCase().includes("total")
        );
        const dataMovimentacaoIndex = headers.findIndex(
          (header) =>
            header &&
            header.toLowerCase().includes("data") &&
            header.toLowerCase().includes("movimentacao")
        );
        const origemIndex = headers.findIndex(
          (header) => header && header.toLowerCase().includes("origem")
        );
        const destinoIndex = headers.findIndex(
          (header) => header && header.toLowerCase().includes("destino")
        );
        const responsavelIndex = headers.findIndex(
          (header) => header && header.toLowerCase().includes("responsavel")
        );
        const observacoesIndex = headers.findIndex(
          (header) => header && header.toLowerCase().includes("observacoes")
        );

        const processedData = {
          total: 0,
          entrada: 0,
          saida: 0,
          items: [] as MovimentacaoItemRow[],
        };

        // Processa cada linha de dados (pula o cabeçalho)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue;

          const tipo =
            row[tipoIndex]?.toString().toLowerCase().trim() || "entrada";
          const os = osIndex !== -1 ? row[osIndex]?.toString() : `OS-${i}`;
          const quantidade =
            quantidadeIndex !== -1
              ? parseFloat(row[quantidadeIndex]?.toString() || "0")
              : 0;
          const valorUnitario =
            valorUnitarioIndex !== -1
              ? parseFloat(row[valorUnitarioIndex]?.toString() || "0")
              : 0;
          const valorTotal =
            valorTotalIndex !== -1
              ? parseFloat(row[valorTotalIndex]?.toString() || "0")
              : quantidade * valorUnitario;

          // Cria o item
          const item: MovimentacaoItemRow = {
            id: os,
            os: os,
            tipo: tipo,
            produto:
              produtoIndex !== -1
                ? row[produtoIndex]?.toString() || "Produto não informado"
                : "Produto não informado",
            quantidade: quantidade,
            valor_unitario: valorUnitario,
            valor_total: valorTotal,
            data_movimentacao:
              dataMovimentacaoIndex !== -1
                ? row[dataMovimentacaoIndex]?.toString() || ""
                : "",
            origem:
              origemIndex !== -1
                ? row[origemIndex]?.toString() || "Não informado"
                : "Não informado",
            destino:
              destinoIndex !== -1
                ? row[destinoIndex]?.toString() || "Não informado"
                : "Não informado",
            responsavel:
              responsavelIndex !== -1
                ? row[responsavelIndex]?.toString() || "Não informado"
                : "Não informado",
            observacoes:
              observacoesIndex !== -1
                ? row[observacoesIndex]?.toString() || ""
                : "",
            rawData: row,
          };

          processedData.items.push(item);
          processedData.total++;

          // Categoriza baseado no tipo
          if (
            tipo.includes("entrada") ||
            tipo.includes("recebimento") ||
            tipo.includes("chegada")
          ) {
            processedData.entrada++;
          } else if (
            tipo.includes("saida") ||
            tipo.includes("saída") ||
            tipo.includes("entrega") ||
            tipo.includes("expedição")
          ) {
            processedData.saida++;
          }
        }

        // Atualiza o estado
        setMovimentacaoData({
          total: processedData.total,
          entrada: processedData.entrada,
          saida: processedData.saida,
        });

        // Armazena os itens processados
        setProcessedItems(processedData.items);

        alert(
          `Planilha de movimentações carregada com sucesso! ${processedData.total} itens processados.`
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
      const movimentacaoDataToSave: MovimentacaoData = {
        total: movimentacaoData.total,
        entrada: movimentacaoData.entrada,
        saida: movimentacaoData.saida,
      };

      const itemsToSave: MovimentacaoItem[] = processedItems.map((item) => ({
        os: item.os,
        tipo: item.tipo,
        produto: item.produto,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        valor_total: item.valor_total,
        data_movimentacao: item.data_movimentacao
          ? parseDateBRtoISO(item.data_movimentacao)
          : undefined,
        origem: item.origem,
        destino: item.destino,
        responsavel: item.responsavel,
        observacoes: item.observacoes,
        raw_data: item.rawData,
      }));

      const result = await saveMovimentacaoData(
        movimentacaoDataToSave,
        itemsToSave,
        fileName,
        "Paloma"
      );

      if (result.success) {
        setSaveStatus("saved");
        alert("Dados de movimentações salvos com sucesso!");

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
  }, [movimentacaoData, processedItems, fileName, loadUploadHistory]);

  const handleClearData = useCallback(async () => {
    if (
      confirm("Tem certeza que deseja limpar todos os dados de movimentações?")
    ) {
      try {
        await clearAllMovimentacaoData();
        setMovimentacaoData({
          total: 0,
          entrada: 0,
          saida: 0,
        });
        setProcessedItems([]);
        setFileName("");
        alert("Dados de movimentações limpos com sucesso!");
      } catch (error) {
        alert("Erro ao limpar dados. Verifique o console para mais detalhes.");
      }
    }
  }, []);

  return {
    movimentacaoData,
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
