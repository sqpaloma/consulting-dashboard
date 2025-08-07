"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import {
  loadDevolucaoData,
  loadMovimentacaoData,
} from "@/lib/returns-movements-supabase-client";
import {
  loadDashboardData,
  getDashboardItemsByCategory,
} from "@/lib/dashboard-supabase-client";

interface DashboardData {
  totalItens: number;
  aguardandoAprovacao: number;
  analises: number;
  orcamentos: number;
  emExecucao: number;
  pronto: number;
}

interface DashboardMetricsProps {
  dashboardData: DashboardData;
  openModal: (type: string, data?: any[]) => void;
  overdueItems?: any[];
}

interface ItemMetrics {
  total: number;
  overdue: number;
  onTime: number;
}

export function DashboardMetrics({
  dashboardData,
  openModal,
  overdueItems = [],
}: DashboardMetricsProps) {
  const [devolucaoData, setDevolucaoData] = useState({
    total: 0,
    pendentes: 0,
    concluidas: 0,
  });
  const [movimentacaoData, setMovimentacaoData] = useState({
    total: 0,
    entrada: 0,
    saida: 0,
  });

  // Estados para as métricas de itens atrasados
  const [itemMetrics, setItemMetrics] = useState<{
    total: ItemMetrics;
    aprovacao: ItemMetrics;
    analises: ItemMetrics;
    orcamentos: ItemMetrics;
    execucao: ItemMetrics;
    pronto: ItemMetrics;
  }>({
    total: { total: 0, overdue: 0, onTime: 0 },
    aprovacao: { total: 0, overdue: 0, onTime: 0 },
    analises: { total: 0, overdue: 0, onTime: 0 },
    orcamentos: { total: 0, overdue: 0, onTime: 0 },
    execucao: { total: 0, overdue: 0, onTime: 0 },
    pronto: { total: 0, overdue: 0, onTime: 0 },
  });

  // Função para fazer parse de diferentes formatos de data
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

    // Se for uma data ISO (YYYY-MM-DD), usa diretamente
    if (cleanDate.includes("-") && cleanDate.length === 10) {
      const date = new Date(cleanDate);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Se for um número (data do Excel)
    if (!isNaN(Number(cleanDate)) && cleanDate.length > 4) {
      const excelDate = Number(cleanDate);
      return new Date((excelDate - 25569) * 86400 * 1000);
    }

    return null;
  };

  // Função para verificar se um item está atrasado
  const isItemOverdue = (item: any): boolean => {
    let deadlineDate = null;

    // Tenta usar data_registro primeiro
    if (item.data_registro) {
      deadlineDate = new Date(item.data_registro);
    } else if (item.raw_data?.prazo) {
      deadlineDate = parseDate(item.raw_data.prazo);
    }

    if (!deadlineDate || isNaN(deadlineDate.getTime())) {
      return false; // Se não tem data válida, considera no prazo
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    return deadlineDate < today;
  };

  // Função para calcular métricas de uma categoria
  const calculateMetrics = (items: any[]): ItemMetrics => {
    const total = items.length;
    const overdue = items.filter(isItemOverdue).length;
    const onTime = total - overdue;

    return { total, overdue, onTime };
  };

  useEffect(() => {
    const loadItemMetrics = async () => {
      try {
        // Carrega todos os itens
        const { items: allItems } = await loadDashboardData();

        // Carrega itens por categoria
        const [
          totalItems,
          aprovacaoItems,
          analisesItems,
          orcamentosItems,
          execucaoItems,
          prontoItems,
        ] = await Promise.all([
          Promise.resolve(allItems), // Todos os itens
          getDashboardItemsByCategory("aprovacao"),
          getDashboardItemsByCategory("analises"),
          getDashboardItemsByCategory("orcamentos"),
          getDashboardItemsByCategory("execucao"),
          getDashboardItemsByCategory("pronto"),
        ]);

        // Calcula métricas para cada categoria
        setItemMetrics({
          total: calculateMetrics(totalItems),
          aprovacao: calculateMetrics(aprovacaoItems),
          analises: calculateMetrics(analisesItems),
          orcamentos: calculateMetrics(orcamentosItems),
          execucao: calculateMetrics(execucaoItems),
          pronto: calculateMetrics(prontoItems),
        });
      } catch (error) {}
    };

    loadItemMetrics();
  }, [dashboardData]); // Recarrega quando dashboardData muda

  useEffect(() => {
    const loadData = async () => {
      try {
        const [devolucaoResult, movimentacaoResult] = await Promise.all([
          loadDevolucaoData(),
          loadMovimentacaoData(),
        ]);

        if (devolucaoResult.devolucaoData) {
          setDevolucaoData(devolucaoResult.devolucaoData);
        }

        if (movimentacaoResult.movimentacaoData) {
          setMovimentacaoData(movimentacaoResult.movimentacaoData);
        }
      } catch (error) {}
    };

    loadData();
  }, []);

  // Função para calcular percentual seguro
  const calculatePercentage = (value: number, total: number): number => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  // Função para calcular a média dos percentuais de todos os cards
  const calculateAveragePercentages = () => {
    const categories = [
      itemMetrics.aprovacao,
      itemMetrics.analises,
      itemMetrics.orcamentos,
      itemMetrics.execucao,
    ];
    const validCategories = categories.filter((cat) => cat.total > 0);

    if (validCategories.length === 0) {
      return { overdue: 0, onTime: 0 };
    }

    const overduePercentages = validCategories.map((cat) =>
      calculatePercentage(cat.overdue, cat.total)
    );
    const onTimePercentages = validCategories.map((cat) =>
      calculatePercentage(cat.onTime, cat.total)
    );

    const avgOverdue = Math.round(
      overduePercentages.reduce((sum, p) => sum + p, 0) / validCategories.length
    );
    const avgOnTime = Math.round(
      onTimePercentages.reduce((sum, p) => sum + p, 0) / validCategories.length
    );

    return { overdue: avgOverdue, onTime: avgOnTime };
  };

  return (
    <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-2">
      {/* Cards em grid normal */}
      <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-2 col-span-4 md:col-span-2 lg:col-span-4 xl:col-span-8">
        {/* Total Itens */}
        <Card
          onClick={() => openModal("total")}
          className="bg-white/10 border-white/20 text-white cursor-pointer hover:bg-white/15 transition"
        >
          <CardContent className="p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-white/70">
                Total Itens
              </span>
              <BarChart3 className="h-3 w-3 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-white text-center">
              {dashboardData.totalItens}
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs mt-1">
              <span className="text-red-300">
                {calculateAveragePercentages().overdue}%
              </span>
              <span className="text-green-300">
                {calculateAveragePercentages().onTime}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Aguardando Aprovação */}
        <Card
          onClick={() => openModal("aprovacao")}
          className="bg-white/10 border-white/20 text-white cursor-pointer hover:bg-white/15 transition"
        >
          <CardContent className="p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-white/70">
                Aguardando Aprovação
              </span>
              <svg
                className="h-3 w-3 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </div>
            <div className="text-xl font-bold text-white mb-1 text-center">
              {dashboardData.aguardandoAprovacao}
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs">
              <span className="text-red-300">
                {calculatePercentage(
                  itemMetrics.aprovacao.overdue,
                  itemMetrics.aprovacao.total
                )}
                %
              </span>
              <span className="text-green-300">
                {calculatePercentage(
                  itemMetrics.aprovacao.onTime,
                  itemMetrics.aprovacao.total
                )}
                %
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Análises */}
        <Card
          onClick={() => openModal("analises")}
          className="bg-white/10 border-white/20 text-white cursor-pointer hover:bg-white/15 transition"
        >
          <CardContent className="p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-white/70">
                Análises
              </span>
              <svg
                className="h-3 w-3 text-blue-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div className="text-xl font-bold text-white mb-1 text-center">
              {dashboardData.analises}
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs">
              <span className="text-red-300">
                {calculatePercentage(
                  itemMetrics.analises.overdue,
                  itemMetrics.analises.total
                )}
                %
              </span>
              <span className="text-green-300">
                {calculatePercentage(
                  itemMetrics.analises.onTime,
                  itemMetrics.analises.total
                )}
                %
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Orçamentos */}
        <Card
          onClick={() => openModal("orcamentos")}
          className="bg-white/10 border-white/20 text-white cursor-pointer hover:bg-white/15 transition"
        >
          <CardContent className="p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-white/70">
                Orçamentos
              </span>
              <DollarSign className="h-3 w-3 text-green-300" />
            </div>
            <div className="text-xl font-bold text-white mb-1 text-center">
              {dashboardData.orcamentos}
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs">
              <span className="text-red-300">
                {calculatePercentage(
                  itemMetrics.orcamentos.overdue,
                  itemMetrics.orcamentos.total
                )}
                %
              </span>
              <span className="text-green-300">
                {calculatePercentage(
                  itemMetrics.orcamentos.onTime,
                  itemMetrics.orcamentos.total
                )}
                %
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Em Execução */}
        <Card
          onClick={() => openModal("execucao")}
          className="bg-white/10 border-white/20 text-white cursor-pointer hover:bg-white/15 transition"
        >
          <CardContent className="p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-white/70">
                Em Execução
              </span>
              <svg
                className="h-3 w-3 text-orange-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="text-xl font-bold text-white mb-1 text-center">
              {dashboardData.emExecucao}
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs">
              <span className="text-red-300">
                {calculatePercentage(
                  itemMetrics.execucao.overdue,
                  itemMetrics.execucao.total
                )}
                %
              </span>
              <span className="text-green-300">
                {calculatePercentage(
                  itemMetrics.execucao.onTime,
                  itemMetrics.execucao.total
                )}
                %
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pronto */}
        <Card
          onClick={() => openModal("pronto")}
          className="bg-white/10 border-white/20 text-white cursor-pointer hover:bg-white/15 transition"
        >
          <CardContent className="p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-white/70">Pronto</span>
              <svg
                className="h-3 w-3 text-green-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-xl font-bold text-white mb-1 text-center">
              {dashboardData.pronto}
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs">
              <span className="text-red-300">
                {calculatePercentage(
                  itemMetrics.pronto.overdue,
                  itemMetrics.pronto.total
                )}
                %
              </span>
              <span className="text-green-300">
                {calculatePercentage(
                  itemMetrics.pronto.onTime,
                  itemMetrics.pronto.total
                )}
                %
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Devoluções */}
        <Card className="bg-white/10 border-white/20 text-white">
          <CardContent className="p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-white/70">
                Devoluções
              </span>
              <svg
                className="h-3 w-3 text-red-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            </div>
            <div className="text-xl font-bold text-white mb-1 text-center">
              {devolucaoData.total}
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs">
              <span className="text-red-300">
                {calculatePercentage(
                  devolucaoData.pendentes,
                  devolucaoData.total
                )}
                %
              </span>
              <span className="text-green-300">
                {calculatePercentage(
                  devolucaoData.concluidas,
                  devolucaoData.total
                )}
                %
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Movimentações */}
        <Card className="bg-white/10 border-white/20 text-white">
          <CardContent className="p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-white/70">
                Movimentações
              </span>
              <svg
                className="h-3 w-3 text-purple-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <div className="text-xl font-bold text-white mb-1 text-center">
              {movimentacaoData.total}
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs">
              <span className="text-red-300">
                {calculatePercentage(
                  movimentacaoData.saida,
                  movimentacaoData.total
                )}
                %
              </span>
              <span className="text-green-300">
                {calculatePercentage(
                  movimentacaoData.entrada,
                  movimentacaoData.total
                )}
                %
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
