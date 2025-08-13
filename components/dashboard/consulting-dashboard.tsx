"use client";

import React, { useState, useEffect, useRef, useDeferredValue } from "react";
import dynamic from "next/dynamic";

import { ResponsiveLayout } from "@/components/responsive-layout";
import { DashboardMetrics } from "./dashboard-metrics";
import { Card, CardContent } from "@/components/ui/card";

// Componentes pesados carregados dinamicamente com placeholders visuais
const DashboardCalendar = dynamic(
  () => import("./dashboard-calendar").then((m) => m.DashboardCalendar),
  {
    ssr: false,
    loading: () => (
      <div className="h-[520px] animate-pulse rounded-lg bg-neutral-900/40" />
    ),
  }
);

const DistributionPanel = dynamic(
  () => import("./distribution-panel").then((m) => m.DistributionPanel),
  {
    ssr: false,
    loading: () => (
      <div className="h-[256px] animate-pulse rounded-lg bg-neutral-900/40" />
    ),
  }
);

const OverdueDistribution = dynamic(() => import("./overdue-distribution"), {
  ssr: false,
  loading: () => (
    <div className="h-[256px] animate-pulse rounded-lg bg-neutral-900/40" />
  ),
});

const ActivityPlanner = dynamic(
  () => import("./activity-planner").then((m) => m.ActivityPlanner),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] animate-pulse rounded-lg bg-neutral-900/40" />
    ),
  }
);

const DashboardModal = dynamic(
  () => import("./dashboard-modal").then((m) => m.DashboardModal),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] animate-pulse rounded-lg bg-neutral-900/40" />
    ),
  }
);

const ResponsavelFilter = dynamic(
  () => import("./responsavel-filter").then((m) => m.ResponsavelFilter),
  { ssr: false }
);

const DepartamentoInfo = dynamic(
  () => import("./departamento-info").then((m) => m.DepartamentoInfo),
  {
    ssr: false,
    loading: () => (
      <div className="h-[520px] animate-pulse rounded-lg bg-neutral-900/40" />
    ),
  }
);

import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useAuth } from "@/hooks/use-auth";
import { useNotificationsCenter } from "@/hooks/use-notifications-center";
import { useAdmin } from "@/hooks/use-admin";

export function ConsultingDashboard() {
  const { dashboardData, processedItems, loadSavedData } = useDashboardData();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { add } = useNotificationsCenter();

  // Estados para modais
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any[]>([]);
  const [calendarModalData, setCalendarModalData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Estados para filtro por responsável
  const [filteredByResponsavel, setFilteredByResponsavel] = useState<
    string | null
  >(null);

  // Forçar escopo somente do próprio usuário para Lucas, independente do papel
  const forceOwnByEmail =
    user?.email?.toLowerCase() === "lucas@novakgouveia.com.br" ||
    user?.email?.toLowerCase() === "lucas.santos@novakgouveia.com.br";

  // Flag global: consultores (e exceções por email) veem apenas seus próprios itens
  const isConsultor = user?.role === "consultor" && !isAdmin;
  const shouldForceOwn = isAdmin ? false : isConsultor || forceOwnByEmail;

  const isGiovanniManager =
    user?.email?.toLowerCase() === "giovanni.gamero@novakgouveia.com.br";

  // Dados filtrados baseados no responsável selecionado e no papel do usuário
  const filteredItems = React.useMemo(() => {
    let base = processedItems;

    if (shouldForceOwn && user?.name) {
      const ownFirstName = user.name.split(" ")[0]?.toLowerCase();
      base = processedItems.filter((item) =>
        (item.responsavel || "").toString().toLowerCase().includes(ownFirstName)
      );
    }

    if (!shouldForceOwn && filteredByResponsavel) {
      return base.filter(
        (item) =>
          item.responsavel && item.responsavel.trim() === filteredByResponsavel
      );
    }

    // Filtro padrão: quando sem filtro manual, mostrar itens do próprio usuário por primeiro nome
    // EXCEÇÃO: Giovanni (gerente) vê o geral por padrão
    if (
      !shouldForceOwn &&
      !filteredByResponsavel &&
      user?.name &&
      !isGiovanniManager &&
      !isAdmin
    ) {
      const ownFirstName = user.name.split(" ")[0]?.toLowerCase();
      return base.filter((item) =>
        (item.responsavel || "").toString().toLowerCase().includes(ownFirstName)
      );
    }

    return base;
  }, [
    processedItems,
    filteredByResponsavel,
    shouldForceOwn,
    user?.name,
    user?.email,
    isGiovanniManager,
    isAdmin,
  ]);

  // Deferir listas grandes para manter a UI responsiva
  const deferredFilteredItems = useDeferredValue(filteredItems);

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
          const [, day, month, year] = match as any;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // Formato com ano abreviado
          const [, day, month, year] = match as any;
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

  // Memo do due date por item para evitar recomputações
  const itemIdToDueDate = React.useMemo(() => {
    const map = new Map<string, Date | null>();
    deferredFilteredItems.forEach((item) => {
      let itemDate: Date | null = null;
      if (item.data_registro && item.data_registro.includes("-")) {
        const d = new Date(item.data_registro);
        itemDate = isNaN(d.getTime()) ? null : d;
      } else if (item.prazo) {
        itemDate = parseDate(item.prazo);
      } else if (item.data) {
        itemDate = parseDate(item.data);
      }
      map.set(item.id, itemDate);
    });
    return map;
  }, [deferredFilteredItems]);

  // Agrupamento por status para reuso em métricas e modais
  type Groups = {
    total: any[];
    aprovacao: any[];
    analises: any[];
    orcamentos: any[];
    execucao: any[];
    pronto: any[];
  };

  const buildGroups = (items: any[]): Groups => {
    const groups: Groups = {
      total: items,
      aprovacao: [],
      analises: [],
      orcamentos: [],
      execucao: [],
      pronto: [],
    };
    items.forEach((item) => {
      const status = (item.status || "").toLowerCase();
      if (
        status.includes("aguardando") ||
        status.includes("pendente") ||
        status.includes("aprovação") ||
        status.includes("aprovacao")
      ) {
        groups.aprovacao.push(item);
      } else if (
        status.includes("análise") ||
        status.includes("analise") ||
        status.includes("revisão") ||
        status.includes("revisao")
      ) {
        groups.analises.push(item);
      } else if (
        status.includes("orçamento") ||
        status.includes("orcamento") ||
        status.includes("cotação") ||
        status.includes("cotacao")
      ) {
        groups.orcamentos.push(item);
      } else if (
        status.includes("execução") ||
        status.includes("execucao") ||
        status.includes("andamento") ||
        status.includes("progresso")
      ) {
        groups.execucao.push(item);
      } else if (
        status.includes("pronto") ||
        status.includes("concluído") ||
        status.includes("concluido") ||
        status.includes("finalizado") ||
        status.includes("entregue") ||
        status.includes("completo")
      ) {
        groups.pronto.push(item);
      }
    });
    return groups;
  };

  const groupedFiltered = React.useMemo(
    () => buildGroups(deferredFilteredItems),
    [deferredFilteredItems]
  );
  const groupedAll = React.useMemo(
    () => buildGroups(processedItems || []),
    [processedItems]
  );

  // Recalcular métricas baseadas nos dados filtrados
  const filteredDashboardData = React.useMemo(() => {
    return {
      totalItens: groupedFiltered.total.length,
      aguardandoAprovacao: groupedFiltered.aprovacao.length,
      analises: groupedFiltered.analises.length,
      orcamentos: groupedFiltered.orcamentos.length,
      emExecucao: groupedFiltered.execucao.length,
      pronto: groupedFiltered.pronto.length,
    };
  }, [groupedFiltered]);

  // Calcular itens atrasados baseado na lógica do calendário
  const overdueItems = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue: any[] = [];
    deferredFilteredItems.forEach((item) => {
      const itemDate = itemIdToDueDate.get(item.id) ?? null;
      if (itemDate && itemDate < today) {
        overdue.push(item);
      }
    });

    return overdue;
  }, [deferredFilteredItems, itemIdToDueDate]);

  // Notificações: atrasados e aguardando aprovação
  const notifiedOverdueRef = useRef<Set<string>>(new Set());
  const notifiedApprovalRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    deferredFilteredItems.forEach((item) => {
      // Determinar data do item via memo
      const date = itemIdToDueDate.get(item.id) ?? null;

      // Atrasados
      if (date && date < today) {
        if (!notifiedOverdueRef.current.has(item.id)) {
          add({
            type: "project",
            title: `Item ${item.os} atrasado`,
            message: `${item.titulo || "Item"} do cliente ${item.cliente} está atrasado`,
            urgent: true,
          });
          notifiedOverdueRef.current.add(item.id);
        }
      } else if (date && date >= today && date <= tomorrow) {
        // Prazo hoje ou amanhã
        if (!notifiedOverdueRef.current.has(item.id)) {
          add({
            type: "calendar",
            title: `Prazo próximo: ${item.os}`,
            message: `${item.titulo || "Item"} vence em breve (${date.toLocaleDateString("pt-BR")})`,
            urgent: false,
          });
          notifiedOverdueRef.current.add(item.id);
        }
      }

      // Aguardando aprovação
      const status = (item.status || "").toLowerCase();
      const isWaitingApproval =
        status.includes("aguardando") ||
        status.includes("pendente") ||
        status.includes("aprovação") ||
        status.includes("aprovacao");
      if (isWaitingApproval && !notifiedApprovalRef.current.has(item.id)) {
        add({
          type: "system",
          title: `Aprovação pendente: ${item.os}`,
          message: `${item.titulo || "Item"} aguarda aprovação`,
          urgent: false,
        });
        notifiedApprovalRef.current.add(item.id);
      }
    });
  }, [deferredFilteredItems, add, itemIdToDueDate]);

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
        const groups =
          shouldForceOwn || filteredByResponsavel
            ? groupedFiltered
            : groupedAll;
        switch (modalType) {
          case "total":
            items = groups.total;
            break;
          case "aprovacao":
            items = groups.aprovacao;
            break;
          case "analises":
            items = groups.analises;
            break;
          case "orcamentos":
            items = groups.orcamentos;
            break;
          case "execucao":
            items = groups.execucao;
            break;
          case "pronto":
            items = groups.pronto;
            break;
          default:
            items = [];
        }
      } catch (error) {
        items = [];
      }
    }

    setModalData(items);
  };

  const canSeeResponsavelFilter =
    (isAdmin || user?.role === "gerente" || user?.role === "diretor") &&
    !forceOwnByEmail;

  return (
    <ResponsiveLayout>
      {/* Título com nome do usuário */}
      <div className="mt-6 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold text-white">
            Seja bem-vindo(a),
            <br className="sm:hidden" /> {user?.name || "Usuário"}!
          </h1>
        </div>
        <div className="sm:mt-0 mt-2">
          {canSeeResponsavelFilter && (
            <ResponsavelFilter
              onFilterChange={handleResponsavelFilterChange}
              processedItems={processedItems}
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-2">
        {/* Metrics Cards - Originais */}
        <DashboardMetrics
          dashboardData={filteredDashboardData}
          openModal={openModal}
          overdueItems={overdueItems}
        />

        {/* Mobile layout: order -> Departamento -> Calendário -> Distribuições (sem execução) */}
        <div className="block lg:hidden md:hidden space-y-2">
          <DepartamentoInfo
            processedItems={deferredFilteredItems}
            filteredByResponsavel={filteredByResponsavel}
          />

          <DashboardCalendar
            processedItems={deferredFilteredItems}
            onDateClick={handleCalendarDateClick}
            filteredByResponsavel={filteredByResponsavel}
          />

          <div className="space-y-4 mt-4">
            <div className="h-[250px]">
              <DistributionPanel dashboardData={filteredDashboardData} />
            </div>
            <div className="h-[250px]">
              <OverdueDistribution overdueItems={overdueItems} />
            </div>
          </div>
        </div>

        {/* Medium screens (md to <xl): Departamento + Calendário lado a lado; gráficos embaixo lado a lado */}
        <div className="hidden md:grid xl:hidden grid-cols-2 gap-2">
          <div className="col-span-1">
            <DepartamentoInfo
              processedItems={deferredFilteredItems}
              filteredByResponsavel={filteredByResponsavel}
            />
          </div>
          <div className="col-span-1">
            <DashboardCalendar
              processedItems={deferredFilteredItems}
              onDateClick={handleCalendarDateClick}
              filteredByResponsavel={filteredByResponsavel}
            />
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-2">
            <div className="h-[250px]">
              <DistributionPanel dashboardData={filteredDashboardData} />
            </div>
            <div className="h-[250px]">
              <OverdueDistribution overdueItems={overdueItems} />
            </div>
          </div>
        </div>

        {/* Desktop layout (xl+): layout amplo */}
        <div className="hidden xl:grid grid-cols-6 xl:grid-cols-8 gap-2">
          {/* Seção esquerda: Informações do Departamento */}
          <div className="col-span-1 xl:col-span-2">
            <DepartamentoInfo
              processedItems={deferredFilteredItems}
              filteredByResponsavel={filteredByResponsavel}
              className="h-[520px]"
            />
          </div>

          {/* Seção central: Gráficos */}
          <div className="space-y-2 col-span-2 xl:col-span-3">
            {/* Gráficos empilhados */}
            <div className="block">
              <div className="h-[256px]">
                <DistributionPanel dashboardData={filteredDashboardData} />
              </div>
              <div className="mt-2 h-[256px]">
                <OverdueDistribution overdueItems={overdueItems} />
              </div>
            </div>
          </div>

          {/* Seção direita: Calendário */}
          <div className="col-span-3 xl:col-span-3 xl:col-start-6">
            <DashboardCalendar
              processedItems={deferredFilteredItems}
              onDateClick={handleCalendarDateClick}
              filteredByResponsavel={filteredByResponsavel}
            />
          </div>
        </div>
      </div>

      {/* Atividades Diárias - Seção inferior */}
      <div className="mt-8">
        <ActivityPlanner
          processedItems={deferredFilteredItems}
          filteredByResponsavel={filteredByResponsavel}
        />
      </div>

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
