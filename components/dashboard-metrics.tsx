"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, DollarSign } from "lucide-react";

interface DashboardData {
  totalItens: number;
  aguardandoAprovacao: number;
  analises: number;
  orcamentos: number;
  emExecucao: number;
}

interface DashboardMetricsProps {
  dashboardData: DashboardData;
  openModal: (type: string) => void;
}

export function DashboardMetrics({
  dashboardData,
  openModal,
}: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {/* Total Itens */}
      <Card
        onClick={() => openModal("total")}
        className="bg-white border-2 border-blue-300 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Total Itens
            </span>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {dashboardData.totalItens}
          </div>
        </CardContent>
      </Card>

      {/* Aguardando Aprovação */}
      <Card
        onClick={() => openModal("aprovacao")}
        className="bg-white border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Aguardando Aprovação
            </span>
            <svg
              className="h-4 w-4 text-gray-500"
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
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {dashboardData.aguardandoAprovacao}
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-red-500">
              {dashboardData.totalItens > 0
                ? Math.round(
                    (dashboardData.aguardandoAprovacao /
                      dashboardData.totalItens) *
                      100
                  )
                : 0}
              %
            </span>
            <span className="text-green-500">
              {dashboardData.totalItens > 0
                ? Math.round(
                    ((dashboardData.totalItens -
                      dashboardData.aguardandoAprovacao) /
                      dashboardData.totalItens) *
                      100
                  )
                : 100}
              %
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Análises */}
      <Card
        onClick={() => openModal("analises")}
        className="bg-white border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Análises</span>
            <svg
              className="h-4 w-4 text-blue-500"
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
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {dashboardData.analises}
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-red-500">
              {dashboardData.totalItens > 0
                ? Math.round(
                    (dashboardData.analises / dashboardData.totalItens) * 100
                  )
                : 0}
              %
            </span>
            <span className="text-green-500">
              {dashboardData.totalItens > 0
                ? Math.round(
                    ((dashboardData.totalItens - dashboardData.analises) /
                      dashboardData.totalItens) *
                      100
                  )
                : 100}
              %
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Orçamentos */}
      <Card
        onClick={() => openModal("orcamentos")}
        className="bg-white border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Orçamentos
            </span>
            <DollarSign className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {dashboardData.orcamentos}
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-red-500">
              {dashboardData.totalItens > 0
                ? Math.round(
                    (dashboardData.orcamentos / dashboardData.totalItens) * 100
                  )
                : 0}
              %
            </span>
            <span className="text-green-500">
              {dashboardData.totalItens > 0
                ? Math.round(
                    ((dashboardData.totalItens - dashboardData.orcamentos) /
                      dashboardData.totalItens) *
                      100
                  )
                : 100}
              %
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Em Execução */}
      <Card
        onClick={() => openModal("execucao")}
        className="bg-white border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Em Execução
            </span>
            <svg
              className="h-4 w-4 text-orange-500"
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
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {dashboardData.emExecucao}
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-red-500">
              {dashboardData.totalItens > 0
                ? Math.round(
                    (dashboardData.emExecucao / dashboardData.totalItens) * 100
                  )
                : 0}
              %
            </span>
            <span className="text-green-500">
              {dashboardData.totalItens > 0
                ? Math.round(
                    ((dashboardData.totalItens - dashboardData.emExecucao) /
                      dashboardData.totalItens) *
                      100
                  )
                : 100}
              %
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Devoluções */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Devoluções
            </span>
            <svg
              className="h-4 w-4 text-red-500"
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
          <div className="text-3xl font-bold text-gray-800 mb-2">0</div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-red-500">0%</span>
            <span className="text-green-500">100%</span>
          </div>
        </CardContent>
      </Card>

      {/* Movimentações */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Movimentações
            </span>
            <svg
              className="h-4 w-4 text-purple-500"
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
          <div className="text-3xl font-bold text-gray-800 mb-2">0</div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-red-500">0%</span>
            <span className="text-green-500">100%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
