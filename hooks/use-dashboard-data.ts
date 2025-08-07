import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  saveDashboardData,
  loadDashboardData,
  getDashboardUploadHistory,
  clearAllDashboardData,
  type DashboardData as DashboardDataType,
  type DashboardItem,
  type DashboardUpload,
} from "@/lib/dashboard-supabase-client";
import { mapEngineerResponsible } from "@/lib/engineer-mapping";

// Estado global para controlar salvamento
let isSavingGlobal = false;

interface DashboardDataRow {
  totalItens: number;
  aguardandoAprovacao: number;
  analises: number;
  orcamentos: number;
  emExecucao: number;
  pronto: number;
}

interface DashboardItemRow {
  id: string;
  os: string;
  titulo: string;
  cliente: string;
  responsavel?: string;
  status: string;
  data: string;
  prazo: string;
  rawData: any;
  data_registro: string | null;
}

// Função para converter data BR para ISO (YYYY-MM-DD)
function parseDateBRtoISO(dateStr: string) {
  if (!dateStr) return "";

  const cleanDate = dateStr.toString().trim();

  // Tenta diferentes formatos
  const formats = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // dd/mm/yyyy
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // dd-mm-yyyy
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // yyyy-mm-dd
    /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, // dd/mm/yy
  ];

  for (const format of formats) {
    const match = cleanDate.match(format);
    if (match) {
      if (format.source.includes("(\\d{4})-(\\d{1,2})-(\\d{1,2})")) {
        // yyyy-mm-dd (já está no formato ISO)
        const [, year, month, day] = match;
        const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
          2,
          "0"
        )}`;
        return isoDate;
      } else {
        // dd/mm/yyyy ou dd-mm-yyyy (formato brasileiro)
        const [, day, month, year] = match;
        let fullYear = year;

        // Se o ano tem apenas 2 dígitos
        if (year.length === 2) {
          const yearNum = parseInt(year);
          fullYear = yearNum < 50 ? `20${year}` : `19${year}`;
        }

        const isoDate = `${fullYear}-${month.padStart(2, "0")}-${day.padStart(
          2,
          "0"
        )}`;
        return isoDate;
      }
    }
  }

  // Se for um número (data do Excel)
  if (!isNaN(Number(cleanDate)) && cleanDate.length > 4) {
    const excelDate = Number(cleanDate);
    const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
    const isoDate = jsDate.toISOString().split("T")[0];
    return isoDate;
  }

  return "";
}

// Função para exibir data ISO como BR
export function formatDateToBR(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("pt-BR");
}

export function useDashboardData() {
  const [dashboardData, setDashboardData] = useState<DashboardDataRow>({
    totalItens: 0,
    aguardandoAprovacao: 0,
    analises: 0,
    orcamentos: 0,
    emExecucao: 0,
    pronto: 0,
  });
  const [processedItems, setProcessedItems] = useState<DashboardItemRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [uploadHistory, setUploadHistory] = useState<DashboardUpload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const loadSavedData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { dashboardData: savedDashboardData, items } =
        await loadDashboardData();
      if (savedDashboardData && items.length > 0) {
        setDashboardData({
          totalItens: savedDashboardData.total_itens,
          aguardandoAprovacao: savedDashboardData.aguardando_aprovacao,
          analises: savedDashboardData.analises,
          orcamentos: savedDashboardData.orcamentos,
          emExecucao: savedDashboardData.em_execucao,
          pronto: savedDashboardData.pronto || 0,
        });
        setProcessedItems(
          items.map((item) => ({
            id: item.os,
            os: item.os,
            titulo: item.titulo || `Item ${item.os}`,
            cliente: item.cliente || "Cliente não informado",
            responsavel: item.responsavel || "Não informado",
            status: item.status,
            data: item.data_registro ? formatDateToBR(item.data_registro) : "",
            prazo: item.raw_data?.prazo || "",
            rawData: item.raw_data,
            data_registro: item.data_registro || "",
          }))
        );
      }
    } catch (error) {
      // Silently handle error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUploadHistory = useCallback(async () => {
    try {
      const history = await getDashboardUploadHistory();
      setUploadHistory(history);
    } catch (error) {
      // Silently handle error
    }
  }, []);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      setIsLoading(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
            defval: "",
          });

          if (jsonData.length === 0) {
            alert("Planilha está vazia.");
            setIsLoading(false);
            return;
          }

          // Busca o cabeçalho na primeira linha
          const headers = jsonData[0] as string[];

          // Encontra os índices das colunas
          const osIndex = headers.findIndex(
            (header) =>
              header &&
              (header.toLowerCase().includes("os") ||
                header.toLowerCase().includes("ordem") ||
                header.toLowerCase().includes("número"))
          );

          const statusIndex = headers.findIndex(
            (header) =>
              header &&
              (header.toLowerCase().includes("status") ||
                header.toLowerCase().includes("situação"))
          );

          const prazoIndex = headers.findIndex(
            (header) =>
              header &&
              (header.toLowerCase().includes("prazo") ||
                header.toLowerCase().includes("data") ||
                header.toLowerCase().includes("vencimento"))
          );

          const responsavelIndex = headers.findIndex((header) => {
            if (!header) return false;
            const headerLower = header.toLowerCase().trim();
            return (
              headerLower.includes("responsavel") ||
              headerLower.includes("responsável") ||
              headerLower === "responsavel" ||
              headerLower === "responsável" ||
              headerLower === "resp" ||
              headerLower.includes("responsible") ||
              headerLower.includes("encarregado")
            );
          });

          // Se não encontrou a coluna responsável pelo nome, vamos tentar algumas posições comuns
          let finalResponsavelIndex = responsavelIndex;
          if (responsavelIndex === -1) {
            // Tentar algumas posições comuns baseadas na estrutura típica das planilhas
            // Posição 4 é comum para responsável (após OS, titulo, cliente)
            const possiblePositions = [4, 3, 5, 6, 7];
            for (const pos of possiblePositions) {
              if (pos < headers.length && headers[pos]) {
                const headerLower = headers[pos].toLowerCase().trim();

                // Se a coluna não for vazia e não for claramente outra coisa
                if (
                  headers[pos].trim() !== "" &&
                  !headerLower.includes("status") &&
                  !headerLower.includes("prazo") &&
                  !headerLower.includes("data") &&
                  !headerLower.includes("valor") &&
                  !headerLower.includes("preco") &&
                  !headerLower.includes("quantidade") &&
                  headers[pos].length > 1 // pelo menos 2 caracteres
                ) {
                  // Confirmar se há dados nesta coluna checando algumas linhas
                  let hasData = false;
                  for (
                    let checkRow = 1;
                    checkRow < Math.min(6, jsonData.length);
                    checkRow++
                  ) {
                    const row = jsonData[checkRow] as any[];
                    if (row && row[pos] && row[pos].toString().trim() !== "") {
                      hasData = true;
                      break;
                    }
                  }

                  if (hasData) {
                    finalResponsavelIndex = pos;
                    break;
                  }
                }
              }
            }
          }

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
            pronto: 0,
            items: [] as DashboardItemRow[],
          };

          // Processa cada linha de dados (pula o cabeçalho)
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            if (!row || row.length === 0) continue;

            const status = row[statusIndex]?.toString().toLowerCase().trim();
            const os = osIndex !== -1 ? row[osIndex]?.toString() : `OS-${i}`;

            // Extrair responsável e aplicar mapeamento
            const responsavelOriginal =
              finalResponsavelIndex !== -1
                ? row[finalResponsavelIndex]?.toString()?.trim() ||
                  "Não informado"
                : "Não informado";

            const responsavelMapeado =
              mapEngineerResponsible(responsavelOriginal);

            // Cria o item
            const item: DashboardItemRow = {
              id: os,
              os: os,
              status: row[statusIndex]?.toString() || "Não definido",
              titulo: row[1] || `Item ${i}`, // Assume que a segunda coluna é o título
              cliente: row[2] || "Cliente não informado", // Assume que a terceira coluna é o cliente
              responsavel: responsavelMapeado, // Usa o nome mapeado
              data: new Date().toLocaleDateString("pt-BR"),
              prazo: prazoIndex !== -1 ? row[prazoIndex]?.toString() || "" : "",
              rawData: row,
              data_registro:
                prazoIndex !== -1
                  ? parseDateBRtoISO(row[prazoIndex]?.toString() || "")
                  : "",
            };

            processedData.items.push(item);
            processedData.totalItens++;

            // Categoriza baseado no status
            if (
              status.includes("aguardando") ||
              status.includes("pendente") ||
              status.includes("aprovação") ||
              status.includes("aprovacao")
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
            } else if (
              status.includes("pronto") ||
              status.includes("concluído") ||
              status.includes("concluido") ||
              status.includes("finalizado") ||
              status.includes("entregue")
            ) {
              processedData.pronto++;
            }
          }

          // Atualiza os estados
          setDashboardData(processedData);
          setProcessedItems(processedData.items);
          setIsLoading(false);
        } catch (error) {
          alert("Erro ao processar planilha. Verifique o formato.");
          setIsLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    },
    []
  );

  const handleSaveData = useCallback(async () => {
    if (processedItems.length === 0) {
      alert("Nenhum dado para salvar. Faça upload de uma planilha primeiro.");
      return;
    }

    // Verificar se já está salvando GLOBALMENTE para evitar múltiplas chamadas
    if (isSavingGlobal || saveStatus === "saving") {
      return;
    }

    // Marcar como salvando globalmente
    isSavingGlobal = true;
    setSaveStatus("saving");

    try {
      const dashboardDataToSave: DashboardDataType = {
        total_itens: dashboardData.totalItens,
        aguardando_aprovacao: dashboardData.aguardandoAprovacao,
        analises: dashboardData.analises,
        orcamentos: dashboardData.orcamentos,
        em_execucao: dashboardData.emExecucao,
        pronto: dashboardData.pronto,
        devolucoes: 0,
        movimentacoes: 0,
      };

      const itemsToSave: DashboardItem[] = processedItems.map((item) => ({
        os: item.os,
        titulo: item.titulo,
        cliente: item.cliente,
        responsavel: item.responsavel,
        status: item.status,
        data_registro: item.data_registro || undefined,
        raw_data: item.rawData,
      }));

      const result = await saveDashboardData(
        dashboardDataToSave,
        itemsToSave,
        fileName,
        "Paloma"
      );

      if (result.success) {
        setSaveStatus("saved");
        await loadUploadHistory();
        setTimeout(() => setSaveStatus("idle"), 3000);
        alert(
          "Dados do dashboard salvos com sucesso! Agora outras pessoas podem visualizar estes dados."
        );
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);

        alert("Erro ao salvar dados do dashboard. Tente novamente.");
      }
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);

      alert("Erro ao salvar dados do dashboard. Tente novamente.");
    } finally {
      // Sempre desmarcar o estado global
      isSavingGlobal = false;
    }
  }, [processedItems, dashboardData, fileName, saveStatus, loadUploadHistory]);

  const handleClearData = async () => {
    if (
      confirm(
        "Tem certeza que deseja limpar todos os dados do dashboard? Esta ação não pode ser desfeita."
      )
    ) {
      setIsLoading(true);
      try {
        await clearAllDashboardData();
        setDashboardData({
          totalItens: 0,
          aguardandoAprovacao: 0,
          analises: 0,
          orcamentos: 0,
          emExecucao: 0,
          pronto: 0,
        });
        setProcessedItems([]);
        setFileName("");
        setUploadHistory([]);
        alert("Dados do dashboard limpos com sucesso!");
      } catch (error) {
        alert("Erro ao limpar dados do dashboard.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    dashboardData,
    setDashboardData,
    processedItems,
    setProcessedItems,
    fileName,
    setFileName,
    uploadHistory,
    setUploadHistory,
    isLoading,
    setIsLoading,
    saveStatus,
    setSaveStatus,
    loadSavedData,
    loadUploadHistory,
    handleFileUpload,
    handleSaveData,
    handleClearData,
  };
}
