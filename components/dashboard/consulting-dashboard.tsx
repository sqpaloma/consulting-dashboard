"use client";

import React, { useState, useEffect } from "react";

import { ResponsiveLayout } from "@/components/responsive-layout";
import { DashboardMetrics } from "./dashboard-metrics";
import { WorkSessionTimer } from "./work-session-timer";
import { DashboardCalendar } from "./dashboard-calendar";
import { TotalProjectsCard, CompletedProjectsCard } from "./dashboard-projects";
import { ActivityPlanner } from "./activity-planner";
import { DashboardModal } from "./dashboard-modal";
import { ResponsavelFilter } from "./responsavel-filter";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { getDashboardItemsByCategory } from "@/lib/dashboard-supabase-client";

export function ConsultingDashboard() {
  const { dashboardData, processedItems, loadSavedData } = useDashboardData();

  // Estados para modais
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any[]>([]);
  const [calendarModalData, setCalendarModalData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Estados para filtro por responsável
  const [filteredByResponsavel, setFilteredByResponsavel] = useState<
    string | null
  >(null);

  // Dados filtrados baseados no responsável selecionado
  const filteredItems = filteredByResponsavel
    ? processedItems.filter(
        (item) =>
          item.responsavel && item.responsavel.trim() === filteredByResponsavel
      )
    : processedItems;

  // Recalcular métricas baseadas nos dados filtrados
  const filteredDashboardData = React.useMemo(() => {
    if (!filteredByResponsavel) return dashboardData;

    const metrics = {
      totalItens: filteredItems.length,
      aguardandoAprovacao: 0,
      analises: 0,
      orcamentos: 0,
      emExecucao: 0,
    };

    filteredItems.forEach((item) => {
      const status = item.status.toLowerCase();
      if (
        status.includes("aguardando") ||
        status.includes("pendente") ||
        status.includes("aprovação")
      ) {
        metrics.aguardandoAprovacao++;
      } else if (
        status.includes("análise") ||
        status.includes("analise") ||
        status.includes("revisão") ||
        status.includes("revisao")
      ) {
        metrics.analises++;
      } else if (
        status.includes("orçamento") ||
        status.includes("orcamento") ||
        status.includes("cotação") ||
        status.includes("cotacao")
      ) {
        metrics.orcamentos++;
      } else if (
        status.includes("execução") ||
        status.includes("execucao") ||
        status.includes("andamento") ||
        status.includes("progresso")
      ) {
        metrics.emExecucao++;
      }
    });

    return metrics;
  }, [filteredItems, filteredByResponsavel, dashboardData]);

  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

  const handleResponsavelFilterChange = (responsavel: string | null) => {
    setFilteredByResponsavel(responsavel);
  };

  const handleCalendarDateClick = (date: string, items: any[]) => {
    setSelectedDate(date);
    setCalendarModalData(items);
    setActiveModal("calendar");
  };

  const generateModalData = async (type: string) => {
    if (filteredItems.length === 0) {
      // Dados de exemplo se não houver planilha carregada
      const baseItems = [
        {
          id: "OS-001",
          os: "OS-001",
          titulo: "Análise Estrutural Edifício A",
          cliente: "Construtora ABC",
          data: "15/01/2025",
          status: "Em andamento",
        },
      ];
      return baseItems.slice(0, Math.floor(Math.random() * 5) + 3);
    }

    // Tenta carregar dados específicos do banco
    try {
      let itemsFromDB = await getDashboardItemsByCategory(type);

      // Aplicar filtro por responsável se necessário
      if (filteredByResponsavel && itemsFromDB.length > 0) {
        itemsFromDB = itemsFromDB.filter(
          (item) =>
            item.responsavel &&
            item.responsavel.trim() === filteredByResponsavel
        );
      }

      if (itemsFromDB.length > 0) {
        return itemsFromDB.map((item) => ({
          id: item.os,
          os: item.os,
          titulo: item.titulo || `Item ${item.os}`,
          cliente: item.cliente || "Cliente não informado",
          status: item.status,
          data: item.data_registro || new Date().toLocaleDateString("pt-BR"),
          rawData: item.raw_data,
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar dados do modal:", error);
    }

    // Fallback para filtrar os itens locais (já filtrados por responsável)
    let categorizedItems = filteredItems;

    switch (type) {
      case "aprovacao":
        categorizedItems = filteredItems.filter((item) => {
          const status = item.status.toLowerCase();
          return (
            status.includes("aguardando") ||
            status.includes("pendente") ||
            status.includes("aprovação")
          );
        });
        break;
      case "analises":
        categorizedItems = filteredItems.filter((item) => {
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
        categorizedItems = filteredItems.filter((item) => {
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
        categorizedItems = filteredItems.filter((item) => {
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
        categorizedItems = filteredItems;
    }

    return categorizedItems;
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
    <ResponsiveLayout>
      {/* Título e Filtro na mesma linha */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl  text-white">
            Seja bem vindo(a), {filteredByResponsavel}!
          </h1>
        </div>
        <ResponsavelFilter
          onFilterChange={handleResponsavelFilterChange}
          processedItems={processedItems}
        />
      </div>

      {/* Main Content Grid */}
      <div className="space-y-6">
        {/* Metrics Cards */}
        <DashboardMetrics
          dashboardData={filteredDashboardData}
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
            processedItems={filteredItems}
            onDateClick={handleCalendarDateClick}
            filteredByResponsavel={filteredByResponsavel}
          />
        </div>
      </div>

      {/* Daily Activity Planner */}
      <ActivityPlanner
        processedItems={filteredItems}
        filteredByResponsavel={filteredByResponsavel}
      />

      {/* Modals */}
      {activeModal && (
        <DashboardModal
          activeModal={activeModal}
          setActiveModal={setActiveModal}
          modalData={modalData}
          calendarModalData={calendarModalData}
          selectedDate={selectedDate}
        />
      )}
    </ResponsiveLayout>
  );
}
