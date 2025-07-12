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
import { useAuth } from "@/hooks/use-auth";
import { getDashboardItemsByCategory } from "@/lib/dashboard-supabase-client";

export function ConsultingDashboard() {
  const { dashboardData, processedItems, loadSavedData } = useDashboardData();
  const { user } = useAuth();

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

  const openModal = async (modalType: string) => {
    setActiveModal(modalType);

    let items: any[] = [];
    try {
      // Se há filtro por responsável, usar os dados já filtrados
      if (filteredByResponsavel) {
        switch (modalType) {
          case "total":
            items = filteredItems;
            break;
          case "aprovacao":
            items = filteredItems.filter((item) => {
              const status = item.status.toLowerCase();
              return (
                status.includes("aguardando") ||
                status.includes("pendente") ||
                status.includes("aprovação") ||
                status.includes("aprovacao")
              );
            });
            break;
          case "analises":
            items = filteredItems.filter((item) => {
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
            items = filteredItems.filter((item) => {
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
            items = filteredItems.filter((item) => {
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
            items = [];
        }
      } else {
        // Se não há filtro, usar dados do banco
        switch (modalType) {
          case "total":
            items = await getDashboardItemsByCategory("total");
            break;
          case "aprovacao":
            items = await getDashboardItemsByCategory("aprovacao");
            break;
          case "analises":
            items = await getDashboardItemsByCategory("analises");
            break;
          case "orcamentos":
            items = await getDashboardItemsByCategory("orcamentos");
            break;
          case "execucao":
            items = await getDashboardItemsByCategory("execucao");
            break;
          default:
            items = [];
        }
      }
    } catch (error) {
      items = [];
    }

    setModalData(items);
  };

  return (
    <ResponsiveLayout>
      {/* Título com nome do usuário */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold text-white">
            Seja bem-vindo(a), {user?.name || "Usuário"}!
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
