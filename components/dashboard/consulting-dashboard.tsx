"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { DashboardUpload } from "./dashboard-upload";
import { DashboardMetrics } from "./dashboard-metrics";
import { WorkSessionTimer } from "./work-session-timer";
import { DashboardCalendar } from "./dashboard-calendar";
import { DashboardProjects } from "./dashboard-projects";
import { ActivityPlanner } from "./activity-planner";
import { DashboardModal } from "./dashboard-modal";
import {
  saveDashboardData,
  loadDashboardData,
  getDashboardUploadHistory,
  clearAllDashboardData,
  getDashboardItemsByCategory,
  type DashboardData as DashboardDataType,
  type DashboardItem,
  type DashboardUpload as DashboardUploadType,
} from "@/lib/dashboard-supabase";

interface DashboardData {
  totalItens: number;
  aguardandoAprovacao: number;
  analises: number;
  orcamentos: number;
  emExecucao: number;
}

export function ConsultingDashboard() {
  // Estados para dados da planilha
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalItens: 0,
    aguardandoAprovacao: 0,
    analises: 0,
    orcamentos: 0,
    emExecucao: 0,
  });
  const [fileName, setFileName] = useState<string>("");
  const [processedItems, setProcessedItems] = useState<any[]>([]);

  // Estados para modais
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any[]>([]);
  const [calendarModalData, setCalendarModalData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Estados para upload e histórico
  const [dashboardUploadHistory, setDashboardUploadHistory] = useState<
    DashboardUploadType[]
  >([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [dashboardSaveStatus, setDashboardSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [historyDropdownOpen, setHistoryDropdownOpen] = useState(false);

  useEffect(() => {
    loadSavedDashboardData();
    loadDashboardUploadHistory();
  }, []);

  const loadSavedDashboardData = async () => {
    setIsDashboardLoading(true);
    try {
      const { dashboardData, items } = await loadDashboardData();
      if (dashboardData && items.length > 0) {
        setDashboardData({
          totalItens: dashboardData.total_itens,
          aguardandoAprovacao: dashboardData.aguardando_aprovacao,
          analises: dashboardData.analises,
          orcamentos: dashboardData.orcamentos,
          emExecucao: dashboardData.em_execucao,
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
            prazo: item.raw_data?.prazo || null,
            rawData: item.raw_data,
          }))
        );
      }
    } catch (error) {
      console.error("Erro ao carregar dados salvos do dashboard:", error);
    } finally {
      setIsDashboardLoading(false);
    }
  };

  const loadDashboardUploadHistory = async () => {
    try {
      const history = await getDashboardUploadHistory();
      setDashboardUploadHistory(history);
    } catch (error) {
      console.error("Erro ao carregar histórico do dashboard:", error);
    }
  };

  const handleSaveDashboardData = async () => {
    if (processedItems.length === 0) {
      alert("Nenhum dado para salvar. Faça upload de uma planilha primeiro.");
      return;
    }

    setDashboardSaveStatus("saving");
    try {
      const dashboardDataToSave: DashboardDataType = {
        total_itens: dashboardData.totalItens,
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

      const result = await saveDashboardData(
        dashboardDataToSave,
        itemsToSave,
        fileName,
        "Paloma"
      );

      if (result.success) {
        setDashboardSaveStatus("saved");
        await loadDashboardUploadHistory();
        setTimeout(() => setDashboardSaveStatus("idle"), 3000);
        alert(
          "Dados do dashboard salvos com sucesso! Agora outras pessoas podem visualizar estes dados."
        );
      } else {
        setDashboardSaveStatus("error");
        setTimeout(() => setDashboardSaveStatus("idle"), 3000);
        alert("Erro ao salvar dados do dashboard. Tente novamente.");
      }
    } catch (error) {
      setDashboardSaveStatus("error");
      setTimeout(() => setDashboardSaveStatus("idle"), 3000);
      console.error("Erro ao salvar dados do dashboard:", error);
      alert("Erro ao salvar dados do dashboard. Tente novamente.");
    }
  };

  const handleClearDashboardData = async () => {
    if (
      confirm(
        "Tem certeza que deseja limpar todos os dados do dashboard? Esta ação não pode ser desfeita."
      )
    ) {
      setIsDashboardLoading(true);
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
        setDashboardUploadHistory([]);
        alert("Dados do dashboard limpos com sucesso!");
      } catch (error) {
        alert("Erro ao limpar dados do dashboard.");
      } finally {
        setIsDashboardLoading(false);
      }
    }
  };

  const handleCalendarDateClick = (date: string, items: any[]) => {
    setSelectedDate(date);
    setCalendarModalData(items);
    setActiveModal("calendar");
  };

  const generateModalData = async (type: string) => {
    if (processedItems.length === 0) {
      // Dados de exemplo se não houver planilha carregada
      const baseItems = [
        {
          id: "OS-001",
          os: "OS-001",
          titulo: "Análise Estrutural Edifício A",
          cliente: "Construtora ABC",
          data: "15/01/2025",
          status: "Em andamento",
          valor: "R$ 15.000",
        },
      ];
      return baseItems.slice(0, Math.floor(Math.random() * 5) + 3);
    }

    // Tenta carregar dados específicos do banco
    try {
      const itemsFromDB = await getDashboardItemsByCategory(type);
      if (itemsFromDB.length > 0) {
        return itemsFromDB.map((item) => ({
          id: item.os,
          os: item.os,
          titulo: item.titulo || `Item ${item.os}`,
          cliente: item.cliente || "Cliente não informado",
          status: item.status,
          valor: item.valor || "Valor não informado",
          data: item.data_registro || new Date().toLocaleDateString("pt-BR"),
          rawData: item.raw_data,
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar dados do modal:", error);
    }

    // Fallback para filtrar os itens locais
    let filteredItems = processedItems;

    switch (type) {
      case "aprovacao":
        filteredItems = processedItems.filter((item) => {
          const status = item.status.toLowerCase();
          return (
            status.includes("aguardando") ||
            status.includes("pendente") ||
            status.includes("aprovação")
          );
        });
        break;
      case "analises":
        filteredItems = processedItems.filter((item) => {
          const status = item.status.toLowerCase();
          return (
            status.includes("análise") ||
            status.includes("analise") ||
            status.includes("revisão") ||
            status.includes("revisao")
          );
        });
        break;
      case "orcamentos":
        filteredItems = processedItems.filter((item) => {
          const status = item.status.toLowerCase();
          return (
            status.includes("orçamento") ||
            status.includes("orcamento") ||
            status.includes("cotação") ||
            status.includes("cotacao")
          );
        });
        break;
      case "execucao":
        filteredItems = processedItems.filter((item) => {
          const status = item.status.toLowerCase();
          return (
            status.includes("execução") ||
            status.includes("execucao") ||
            status.includes("andamento") ||
            status.includes("progresso")
          );
        });
        break;
      default:
        filteredItems = processedItems;
    }

    return filteredItems;
  };

  const openModal = async (type: string) => {
    setActiveModal(type);
    const data = await generateModalData(type);
    setModalData(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Header title="Dashboard" subtitle="Visão geral do seu processo" />

        <DashboardUpload
          dashboardData={dashboardData}
          setDashboardData={setDashboardData}
          setProcessedItems={setProcessedItems}
          dashboardUploadHistory={dashboardUploadHistory}
          setHistoryDropdownOpen={setHistoryDropdownOpen}
          historyDropdownOpen={historyDropdownOpen}
          dashboardSaveStatus={dashboardSaveStatus}
          handleSaveDashboardData={handleSaveDashboardData}
          handleClearDashboardData={handleClearDashboardData}
          isDashboardLoading={isDashboardLoading}
          fileName={fileName}
          setFileName={setFileName}
        />

        {/* Main Content Grid */}
        <div className="space-y-6">
          {/* Metrics Cards */}
          <DashboardMetrics
            dashboardData={dashboardData}
            openModal={openModal}
          />

          {/* Segunda linha: Sessão de Trabalho e Próximos Agendamentos lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WorkSessionTimer />
            <DashboardCalendar
              processedItems={processedItems}
              onDateClick={handleCalendarDateClick}
            />
          </div>

          {/* Terceira linha: Total de Projetos e Concluídos lado a lado */}
          <DashboardProjects />
        </div>

        {/* Daily Activity Planner */}
        <ActivityPlanner />
      </div>

      {isDashboardLoading && (
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">
                Carregando dados compartilhados...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <DashboardModal
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        modalData={modalData}
        calendarModalData={calendarModalData}
        selectedDate={selectedDate}
      />
    </div>
  );
}
