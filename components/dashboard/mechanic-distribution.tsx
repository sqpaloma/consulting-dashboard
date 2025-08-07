"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface MechanicDistributionProps {
  processedItems: any[];
  filteredByResponsavel?: string | null;
}

export function MechanicDistribution({
  processedItems,
  filteredByResponsavel,
}: MechanicDistributionProps) {
  // Filtra itens em execução
  const executionItems = processedItems.filter((item) => {
    const status = item.status?.toLowerCase() || "";
    return (
      status.includes("execução") ||
      status.includes("execucao") ||
      status.includes("andamento") ||
      status.includes("progresso")
    );
  });

  // Agrupa por mecânico
  const mechanicData = executionItems.reduce(
    (acc, item) => {
      const mechanic = item.responsavel || "Não informado";
      if (!acc[mechanic]) {
        acc[mechanic] = 0;
      }
      acc[mechanic]++;
      return acc;
    },
    {} as Record<string, number>
  );

  // Converte para formato do gráfico
  const chartData = Object.entries(mechanicData)
    .map(([mechanic, count]) => ({
      name: mechanic,
      value: count as number,
      percentage: Math.round(((count as number) / executionItems.length) * 100),
    }))
    .sort((a, b) => (b.value as number) - (a.value as number)); // Ordena por quantidade

  // Cores para os mecânicos (escalas de azul mais distintas)
  const COLORS = [
    "#1E40AF", // dark blue (PALOMA)
    "#3B82F6", // medium blue (MARCELO)
    "#60A5FA", // light blue (LUCAS)
    "#BFDBFE", // very light blue (CARLINHOS)
    "#93C5FD", // blue-300
    "#DBEAFE", // blue-100
    "#EFF6FF", // blue-50
    "#1D4ED8", // blue-600
  ];

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
    <Card className="bg-white h-[250px] flex flex-col">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm text-gray-800 flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          Distribuição por Mecânico
          <div className="ml-auto flex space-x-1">
            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex">
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
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legenda */}
            <div className="w-1/3 flex flex-col justify-center space-y-2 pl-4">
              {chartData.map((item, index) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-gray-800">
                      {item.name.toUpperCase()}: {item.percentage}%
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
              <p className="text-sm">Nenhum item em execução</p>
              <p className="text-xs mt-1">Não há dados para exibir</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
