"use client";

import React, { useState, useEffect } from "react";

import { ResponsiveLayout } from "@/components/responsive-layout";
import { DashboardMetrics } from "./dashboard-metrics";
import { WorkSessionTimer } from "./work-session-timer";
import { DashboardCalendar } from "./dashboard-calendar";
import { FollowUpCard, OverdueItemsCard } from "./dashboard-projects";
import { ActivityPlanner } from "./activity-planner";
import { DashboardModal } from "./dashboard-modal";
import { ResponsavelFilter } from "./responsavel-filter";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useAuth } from "@/hooks/use-auth";
import { getDashboardItemsByCategory } from "@/lib/dashboard-supabase-client";
import Image from "next/image";

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
      pronto: 0,
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
      } else if (
        status.includes("pronto") ||
        status.includes("concluído") ||
        status.includes("concluido") ||
        status.includes("finalizado") ||
        status.includes("completo")
      ) {
        metrics.pronto++;
      }
    });

    return metrics;
  }, [filteredItems, filteredByResponsavel, dashboardData]);

  // Calcular itens atrasados baseado na lógica do calendário
  const overdueItems = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueItems: any[] = [];

    filteredItems.forEach((item) => {
      let itemDate = null;

      // Tenta extrair a data do prazo
      if (item.data_registro && item.data_registro.includes("-")) {
        itemDate = new Date(item.data_registro);
        if (isNaN(itemDate.getTime())) {
          itemDate = null;
        }
      } else if (item.prazo) {
        itemDate = parseDate(item.prazo);
      } else if (item.data) {
        itemDate = parseDate(item.data);
      }

      if (itemDate && itemDate < today) {
        overdueItems.push(item);
      }
    });

    return overdueItems;
  }, [filteredItems]);

  // Função para fazer parse de diferentes formatos de data (copiada do calendário)
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    // Remove espaços extras
    const cleanDate = dateString.toString().trim();

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
        if (format.source.includes("yyyy")) {
          // Formato com ano completo
          const [, day, month, year] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // Formato com ano abreviado
          const [, day, month, year] = match;
          const fullYear =
            parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
          return new Date(fullYear, parseInt(month) - 1, parseInt(day));
        }
      }
    }

    // Se for um número (data do Excel)
    if (!isNaN(Number(cleanDate)) && cleanDate.length > 4) {
      const excelDate = Number(cleanDate);
      return new Date((excelDate - 25569) * 86400 * 1000);
    }

    return null;
  };

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

  const openModal = async (modalType: string, data?: any[]) => {
    setActiveModal(modalType);

    let items: any[] = [];

    // Se os dados já foram fornecidos (para follow-up), use-os diretamente
    if (data) {
      items = data;
    } else {
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
            case "pronto":
              items = filteredItems.filter((item) => {
                const status = item.status.toLowerCase();
                return (
                  status.includes("pronto") ||
                  status.includes("concluído") ||
                  status.includes("concluido") ||
                  status.includes("finalizado") ||
                  status.includes("completo")
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
            case "pronto":
              items = await getDashboardItemsByCategory("pronto");
              break;
            default:
              items = [];
          }
        }
      } catch (error) {
        items = [];
      }
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
      <div className="space-y-2">
        {/* Metrics Cards - Menores */}
        <DashboardMetrics
          dashboardData={filteredDashboardData}
          openModal={openModal}
          overdueItems={overdueItems}
        />

        {/* Layout em duas colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* Coluna esquerda: Follow-up e WorkSessionTimer */}
          <div className="flex flex-col space-y-2">
            <FollowUpCard
              filteredItems={filteredItems}
              filteredByResponsavel={filteredByResponsavel}
              dashboardData={filteredDashboardData}
              openModal={openModal}
            />
            <WorkSessionTimer />
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
