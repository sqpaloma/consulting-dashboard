"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
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
  // Calcula as porcentagens
  const calculatePercentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  // Calcula o total real dos itens que serão exibidos
  const totalDisplayedItems =
    dashboardData.aguardandoAprovacao +
    dashboardData.analises +
    dashboardData.emExecucao +
    dashboardData.orcamentos +
    dashboardData.pronto;

  // Prepara os dados para o gráfico
  const chartData = [
    {
      name: "Aguardando Aprovação",
      value: dashboardData.aguardandoAprovacao,
      percentage: calculatePercentage(
        dashboardData.aguardandoAprovacao,
        totalDisplayedItems
      ),
      color: "#1E40AF", // dark blue
    },
    {
      name: "Análises",
      value: dashboardData.analises,
      percentage: calculatePercentage(
        dashboardData.analises,
        totalDisplayedItems
      ),
      color: "#1D4ED8", // dark blue
    },
    {
      name: "Em Execução",
      value: dashboardData.emExecucao,
      percentage: calculatePercentage(
        dashboardData.emExecucao,
        totalDisplayedItems
      ),
      color: "#3B82F6", // medium blue
    },
    {
      name: "Orçamentos",
      value: dashboardData.orcamentos,
      percentage: calculatePercentage(
        dashboardData.orcamentos,
        totalDisplayedItems
      ),
      color: "#60A5FA", // light blue
    },
    {
      name: "Pronto",
      value: dashboardData.pronto,
      percentage: calculatePercentage(
        dashboardData.pronto,
        totalDisplayedItems
      ),
      color: "#BFDBFE", // very light blue
    },
  ].filter((item) => item.value > 0); // Remove itens com valor 0

  const COLORS = chartData.map((item) => item.color);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} itens ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white h-[250px] flex flex-col overflow-hidden">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm text-gray-800 flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          Painel de Distribuição
          <div className="ml-auto flex space-x-1">
            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col lg:flex-row">
        {chartData.length > 0 ? (
          <>
            {/* Gráfico de Pizza */}
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legenda */}
            <div className="w-full lg:w-1/3 flex flex-col justify-center space-y-2 lg:pl-4 pt-4 lg:pt-0">
              {chartData.map((item, index) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-gray-800">
                      {item.name}: {item.percentage}%
                    </div>
                  </div>
                </div>
              ))}
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
