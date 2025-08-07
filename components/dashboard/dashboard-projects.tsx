"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Grid3X3,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getDashboardItemsByCategory } from "@/lib/dashboard-supabase-client";

interface FollowUpCardProps {
  filteredItems: any[];
  filteredByResponsavel: string | null;
  dashboardData: {
    aguardandoAprovacao: number;
    totalItens: number;
    analises: number;
    orcamentos: number;
    emExecucao: number;
  };
  openModal: (type: string, data?: any[]) => void;
}

export function FollowUpCard({
  filteredItems,
  filteredByResponsavel,
  dashboardData,
  openModal,
}: FollowUpCardProps) {
  const [aguardandoAprovacao, setAguardandoAprovacao] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carrega dados baseado no filtro
  useEffect(() => {
    const loadAguardandoAprovacao = async () => {
      setIsLoading(true);
      try {
        let items: any[] = [];

        if (filteredByResponsavel) {
          // Se há filtro por responsável, usar os dados já filtrados
          items = filteredItems.filter((item) => {
            const status = item.status.toLowerCase();
            return (
              status.includes("aguardando") ||
              status.includes("pendente") ||
              status.includes("aprovação") ||
              status.includes("aprovacao")
            );
          });
        } else {
          // Se não há filtro, usar dados do banco (mesma fonte que o card Aguardando Aprovação)
          items = await getDashboardItemsByCategory("aprovacao");
        }

        setAguardandoAprovacao(items);
      } catch (error) {
        console.error("Erro ao carregar itens aguardando aprovação:", error);
        setAguardandoAprovacao([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAguardandoAprovacao();
  }, [filteredItems, filteredByResponsavel]);

  // Calcular follow-up baseado na data_registro
  const calculateFollowUp = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let withinDeadlineItems: any[] = []; // Itens não atrasados (≤ 5 dias)
    let soonToExpireItems: any[] = []; // Itens que vão vencer nos próximos 5 dias
    let overdueItems: any[] = []; // Itens já atrasados (> 5 dias)

    aguardandoAprovacao.forEach((item) => {
      if (item.data_registro) {
        const itemDate = new Date(item.data_registro);
        itemDate.setHours(0, 0, 0, 0);

        // Calcular diferença em dias
        const diffTime = today.getTime() - itemDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 5) {
          withinDeadlineItems.push(item);
          // Se está entre 3-5 dias, também conta como "vai vencer em breve"
          if (diffDays >= 3) {
            soonToExpireItems.push(item);
          }
        } else {
          overdueItems.push(item);
        }
      } else {
        // Se não tem data_registro, considera dentro do prazo
        withinDeadlineItems.push(item);
      }
    });

    return {
      withinDeadlineItems,
      soonToExpireItems,
      overdueItems,
      withinDeadline: withinDeadlineItems.length,
      soonToExpire: soonToExpireItems.length,
      overdue: overdueItems.length,
      total: aguardandoAprovacao.length,
    };
  };

  const {
    withinDeadlineItems,
    soonToExpireItems,
    overdueItems,
    withinDeadline,
    soonToExpire,
    overdue,
    total,
  } = calculateFollowUp();

  // Handlers para abrir modais
  const handleNoPrazoClick = () => {
    openModal("followup-no-prazo", withinDeadlineItems);
  };

  const handleVencendoEmBreveClick = () => {
    openModal("followup-vencendo-breve", soonToExpireItems);
  };

  const handleTotalClick = () => {
    openModal("followup-total", aguardandoAprovacao);
  };

  const handleAtrasadosClick = () => {
    openModal("followup-atrasados", overdueItems);
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Follow-up
            </h3>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Métricas Principais */}
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <div
                  className="group cursor-pointer p-3 rounded-lg hover:bg-green-50 transition-all duration-200"
                  onClick={handleNoPrazoClick}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-600">
                      No prazo
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 group-hover:text-green-700">
                    {withinDeadline}
                  </div>
                </div>

                {soonToExpire > 0 && (
                  <div
                    className="group cursor-pointer p-3 rounded-lg hover:bg-orange-50 transition-all duration-200"
                    onClick={handleVencendoEmBreveClick}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-600">
                        Vencendo
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 group-hover:text-orange-700">
                      {soonToExpire}
                    </div>
                  </div>
                )}
              </div>

              {/* Resumo */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div
                  className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                  onClick={handleTotalClick}
                >
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {total}
                  </span>
                </div>

                {overdue > 0 && (
                  <div
                    className="cursor-pointer hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    onClick={handleAtrasadosClick}
                  >
                    <span className="text-sm text-red-600">Atrasados</span>
                    <span className="ml-2 font-semibold text-red-700">
                      {overdue}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Manter o componente original para compatibilidade (renomeado)
export function TotalProjectsCard() {
  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Total de Projetos</div>
            <div className="text-2xl font-bold text-gray-800">24</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +10% aumento em relação ao mês passado
            </div>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Grid3X3 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <BarChart3 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CompletedProjectsCard() {
  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <div className="text-sm text-gray-500">Concluídos</div>
        <div className="text-2xl font-bold text-gray-800">5</div>
        <div className="flex items-center text-xs text-red-600">
          <TrendingDown className="h-3 w-3 mr-1" />
          -5% comparado ao mês passado
        </div>
      </CardContent>
    </Card>
  );
}

// Mantendo o componente original para compatibilidade
export function DashboardProjects() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
      <TotalProjectsCard />
      <CompletedProjectsCard />
    </div>
  );
}
