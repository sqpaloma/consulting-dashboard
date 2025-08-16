import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { DashboardItemLike, STATUS_COLORS } from "../../app/follow-up/utils";
import { useMemo } from "react";

interface ClientChartsSectionProps {
  items: DashboardItemLike[];
}

export function ClientChartsSection({ items }: ClientChartsSectionProps) {
  const statusChartData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const it of items) {
      const s = (it.status || "Sem Status").toString().trim();
      if (!s) continue;
      counts.set(s, (counts.get(s) || 0) + 1);
    }
    const arr = Array.from(counts.entries()).map(([name, value]) => ({
      name,
      value,
    }));
    arr.sort((a, b) => (b.value as number) - (a.value as number));
    return arr;
  }, [items]);

  const responsavelChartData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const it of items) {
      const r = (it.responsavel || "Sem Responsável").toString().trim();
      if (!r) continue;
      counts.set(r, (counts.get(r) || 0) + 1);
    }
    const arr = Array.from(counts.entries()).map(([name, value]) => ({
      name,
      value,
    }));
    arr.sort((a, b) => (b.value as number) - (a.value as number));
    return arr.slice(0, 10);
  }, [items]);

  return (
    <div className="space-y-4">
      <Card className="bg-white border-2" style={{ borderColor: "#BBDEFB" }}>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">
            Distribuição por Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {statusChartData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={STATUS_COLORS[idx % STATUS_COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-2" style={{ borderColor: "#FFCDD2" }}>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">
            Itens por Responsável (Top 10)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={responsavelChartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis allowDecimals={false} width={24} />
                <RechartsTooltip />
                <Bar
                  dataKey="value"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}