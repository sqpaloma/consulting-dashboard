"use client";

import { useState, useEffect } from "react";

import { Header } from "@/components/Header";
import { DashboardMetrics } from "./dashboard-metrics";
import { WorkSessionTimer } from "./work-session-timer";
import { DashboardCalendar } from "./dashboard-calendar";
import { TotalProjectsCard, CompletedProjectsCard } from "./dashboard-projects";
import { ActivityPlanner } from "./activity-planner";
import { DashboardModal } from "./dashboard-modal";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { getDashboardItemsByCategory } from "@/lib/dashboard-supabase-client";

export function ConsultingDashboard() {
  const { dashboardData, processedItems, loadSavedData } = useDashboardData();

  // Estados para modais
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any[]>([]);
  const [calendarModalData, setCalendarModalData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Header title="Dashboard" />

        {/* Main Content Grid */}
        <div className="space-y-6">
          {/* Metrics Cards */}
          <DashboardMetrics
            dashboardData={dashboardData}
            openModal={openModal}
          />

          {/* Layout reorganizado: Coluna esquerda com componentes menores e coluna direita com calendário */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch min-h-[650px]">
            {/* Coluna esquerda: WorkSessionTimer, Total de Projetos e Concluídos */}
            <div className="flex flex-col space-y-4 h-full">
              <div className="flex-1">
                <WorkSessionTimer />
              </div>
              <TotalProjectsCard />
              <CompletedProjectsCard />
            </div>

            {/* Coluna direita: Calendário */}
            <DashboardCalendar
              processedItems={processedItems}
              onDateClick={handleCalendarDateClick}
            />
          </div>
        </div>

        {/* Daily Activity Planner */}
        <ActivityPlanner />

        {/* Modals */}
        <DashboardModal
          activeModal={activeModal}
          setActiveModal={setActiveModal}
          modalData={modalData}
          calendarModalData={calendarModalData}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}
