"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DistributionPanelProps {
  dashboardData: {
    aguardandoAprovacao: number;
    analises: number;
    orcamentos: number;
    emExecucao: number;
    pronto: number;
    totalItens: number;
  };
}

export function DistributionPanel({ dashboardData }: DistributionPanelProps) {

  // Calcula o total real dos itens que serão exibidos
  const totalDisplayedItems =
    dashboardData.aguardandoAprovacao +
    dashboardData.analises +
    dashboardData.emExecucao +
    dashboardData.orcamentos +
    dashboardData.pronto;

  // Prepara os dados para o gráfico de barras
  const chartData = [
    {
      name: "Follow UP",
      value: dashboardData.aguardandoAprovacao,
    },
    {
      name: "Análises",
      value: dashboardData.analises,
    },
    {
      name: "Em Execução",
      value: dashboardData.emExecucao,
    },
    {
      name: "Orçamentos",
      value: dashboardData.orcamentos,
    },
    {
      name: "Pronto",
      value: dashboardData.pronto,
    },
  ].filter((item) => item.value > 0); // Remove itens com valor 0

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} itens
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm text-gray-800">
          Painel de Distribuição
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {chartData.length > 0 ? (
          <>
            {/* Gráfico de Barras */}
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill="#3B82F6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              </div>
              <p className="text-sm">Nenhum dado disponível</p>
              <p className="text-xs mt-1">
                Adicione itens para ver a distribuição
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
