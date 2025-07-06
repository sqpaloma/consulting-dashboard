import { useState } from "react";
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

interface DashboardDataRow {
  totalItens: number;
  aguardandoAprovacao: number;
  analises: number;
  orcamentos: number;
  emExecucao: number;
}

interface DashboardItemRow {
  id: string;
  os: string;
  titulo: string;
  cliente: string;
  status: string;
  valor: string;
  data: string;
  prazo: string;
  rawData: any;
}

export function useDashboardData() {
  const [dashboardData, setDashboardData] = useState<DashboardDataRow>({
    totalItens: 0,
    aguardandoAprovacao: 0,
    analises: 0,
    orcamentos: 0,
    emExecucao: 0,
  });
  const [processedItems, setProcessedItems] = useState<DashboardItemRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [uploadHistory, setUploadHistory] = useState<DashboardUpload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const loadSavedData = async () => {
    setIsLoading(true);
    try {
      const { dashboardData: savedDashboardData, items } =
        await loadDashboardData();
      if (savedDashboardData && items.length > 0) {
        setDashboardData({
          totalItens: savedDashboardData.total_items,
          aguardandoAprovacao: savedDashboardData.aguardando_aprovacao,
          analises: savedDashboardData.analises,
          orcamentos: savedDashboardData.orcamentos,
          emExecucao: savedDashboardData.em_execucao,
        });
        setProcessedItems(
          items.map((item) => ({
            id: item.os,
            os: item.os,
            titulo: item.titulo || `Item ${item.os}`,
            cliente: item.cliente || "Cliente não informado",
            status: item.status,
            valor: item.valor || "Valor não informado",
            data: item.data_registro || new Date().toLocaleDateString("pt-BR"),
            prazo: item.raw_data?.prazo || "",
            rawData: item.raw_data,
          }))
        );
      }
    } catch (error) {
      console.error("Erro ao carregar dados salvos do dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUploadHistory = async () => {
    try {
      const history = await getDashboardUploadHistory();
      setUploadHistory(history);
    } catch (error) {
      console.error("Erro ao carregar histórico do dashboard:", error);
    }
  };

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
          items: [] as DashboardItemRow[],
        };

        // Processa cada linha de dados (pula o cabeçalho)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue;

          const status = row[statusIndex]?.toString().toLowerCase().trim();
          const os = osIndex !== -1 ? row[osIndex]?.toString() : `OS-${i}`;

          // Cria o item
          const item: DashboardItemRow = {
            id: os,
            os: os,
            status: row[statusIndex]?.toString() || "Não definido",
            titulo: row[1] || `Item ${i}`, // Assume que a segunda coluna é o título
            cliente: row[2] || "Cliente não informado", // Assume que a terceira coluna é o cliente
            data: new Date().toLocaleDateString("pt-BR"),
            prazo: prazoIndex !== -1 ? row[prazoIndex]?.toString() || "" : "",
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

  const handleSaveData = async () => {
    console.log("=== DEBUG: Iniciando salvamento do dashboard ===");
    console.log("processedItems.length:", processedItems.length);
    console.log("dashboardData:", dashboardData);
    console.log("fileName:", fileName);

    if (processedItems.length === 0) {
      alert("Nenhum dado para salvar. Faça upload de uma planilha primeiro.");
      return;
    }

    setSaveStatus("saving");
    try {
      // Teste: verificar se a função saveDashboardData está sendo importada corretamente
      console.log("saveDashboardData function:", typeof saveDashboardData);

      const dashboardDataToSave: DashboardDataType = {
        total_items: dashboardData.totalItens,
        aguardando_aprovacao: dashboardData.aguardandoAprovacao,
        analises: dashboardData.analises,
        orcamentos: dashboardData.orcamentos,
        em_execucao: dashboardData.emExecucao,
        devolucoes: 0,
        movimentacoes: 0,
      };

      const itemsToSave: DashboardItem[] = processedItems.map((item) => ({
        os: item.os,
        titulo: item.titulo,
        cliente: item.cliente,
        status: item.status,
        valor: item.valor,
        data_registro: item.data,
        raw_data: item.rawData,
      }));

      console.log("dashboardDataToSave:", dashboardDataToSave);
      console.log("itemsToSave (primeiros 2):", itemsToSave.slice(0, 2));

      // Teste: verificar se o supabase está configurado
      const { supabase } = await import("@/lib/dashboard-supabase-client");
      console.log("Supabase client:", supabase);

      // Teste: tentar salvar apenas o upload primeiro
      if (supabase) {
        console.log("=== TESTE: Salvando apenas upload ===");
        const testUploadResult = await supabase
          .from("dashboard_uploads")
          .insert({
            file_name: "teste-" + fileName,
            uploaded_by: "Teste",
            total_records: itemsToSave.length,
            status: "processing",
          })
          .select()
          .single();

        console.log("Teste upload result:", testUploadResult);
      }

      const result = await saveDashboardData(
        dashboardDataToSave,
        itemsToSave,
        fileName,
        "Paloma"
      );

      console.log("Resultado do salvamento:", result);

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
        console.error("Erro retornado pelo saveDashboardData:", result.error);
        alert("Erro ao salvar dados do dashboard. Tente novamente.");
      }
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
      console.error("Erro ao salvar dados do dashboard:", error);
      alert("Erro ao salvar dados do dashboard. Tente novamente.");
    }
  };

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
