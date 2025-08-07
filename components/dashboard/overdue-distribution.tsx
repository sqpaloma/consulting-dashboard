import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Clock, AlertTriangle, Calendar, FileText } from "lucide-react";

interface OverdueDistributionProps {
  overdueItems: any[];
}

const COLORS = ["#1E40AF", "#3B82F6", "#60A5FA", "#93C5FD"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-sm text-gray-600">Quantidade: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function OverdueDistribution({
  overdueItems,
}: OverdueDistributionProps) {
  const chartData = React.useMemo(() => {
    if (!overdueItems || overdueItems.length === 0) {
      return [];
    }

    // Agrupar por status
    const statusCount: { [key: string]: number } = {};

    overdueItems.forEach((item) => {
      const status = item.status || "Sem Status";
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    // Converter para formato do gráfico
    const data = Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count,
    }));

    // Ordenar por quantidade (maior para menor)
    return data.sort((a, b) => (b.value as number) - (a.value as number));
  }, [overdueItems]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "aguardando aprovação":
        return <Clock className="w-2 h-2" />;
      case "em execução":
        return <AlertTriangle className="w-2 h-2" />;
      case "orçamentos":
        return <FileText className="w-2 h-2" />;
      case "análises":
        return <Calendar className="w-2 h-2" />;
      default:
        return <Clock className="w-2 h-2" />;
    }
  };

  if (chartData.length === 0) {
    return (
      <Card className="bg-white h-[250px] md:h-[500px] lg:h-[250px] flex flex-col">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium">
            Distribuição de Atrasos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Nenhum item em atraso</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white h-[250px] md:h-[500px] lg:h-[250px] flex flex-col">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium">
          Distribuição de Atrasos
        </CardTitle>
      </CardHeader>
      <CardContent className="flex">
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
        <div className="w-1/3 flex flex-col justify-center space-y-2 pl-4">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center space-x-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex items-center space-x-1">
                {getStatusIcon(item.name)}
                <span className="text-xs font-medium text-gray-700">
                  {item.name.toUpperCase()}
                </span>
              </div>
              <span className="text-xs font-bold text-gray-900 ml-auto">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
