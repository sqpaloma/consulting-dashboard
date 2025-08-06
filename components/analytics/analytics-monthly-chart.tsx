import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface AnalyticsMonthlyChartProps {
  uploadedData: any[];
}

export function AnalyticsMonthlyChart({
  uploadedData,
}: AnalyticsMonthlyChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<
    "orcamento" | "faturamento" | "conversao"
  >("faturamento");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Função para agregar dados por mês e ano
  const aggregateMonthlyData = (data: any[]) => {
    const monthlyYearMap = new Map();

    // Agregar dados dos meses que têm informações
    data.forEach((row) => {
      const month = parseInt(row.mes?.toString() || "1");
      const year = parseInt(row.ano?.toString() || "2025");

      if (month >= 1 && month <= 12) {
        const key = `${year}-${month.toString().padStart(2, "0")}`;

        if (!monthlyYearMap.has(key)) {
          monthlyYearMap.set(key, {
            ano: year,
            mes: month,
            mesNome: getMonthName(month),
            valorOrcamentos: 0,
            valorFaturamento: 0,
            quantidadeOrcamentos: 0,
            quantidadeFaturados: 0,
          });
        }

        const existing = monthlyYearMap.get(key);
        monthlyYearMap.set(key, {
          ...existing,
          valorOrcamentos:
            existing.valorOrcamentos + (row.valorOrcamentos || 0),
          valorFaturamento: existing.valorFaturamento + (row.valorTotal || 0),
          quantidadeOrcamentos:
            existing.quantidadeOrcamentos + (row.quantidade || 0),
          quantidadeFaturados:
            existing.quantidadeFaturados + (row.projetos || 0),
        });
      }
    });

    // Converter para array e ordenar por ano e mês
    return Array.from(monthlyYearMap.values()).sort((a, b) => {
      if (a.ano !== b.ano) {
        return a.ano - b.ano; // Ordenar por ano primeiro
      }
      return a.mes - b.mes; // Depois por mês
    });
  };

  const getMonthName = (month: number) => {
    const monthNames = [
      "",
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    return monthNames[month];
  };

  // Calcular porcentagem de conversão
  const calculateConversionRate = (monthlyData: any[]) => {
    return monthlyData.map((month) => ({
      ...month,
      conversao:
        month.quantidadeOrcamentos > 0
          ? (month.quantidadeFaturados / month.quantidadeOrcamentos) * 100
          : 0,
    }));
  };

  const monthlyData = aggregateMonthlyData(uploadedData);
  const monthlyDataWithConversion = calculateConversionRate(monthlyData);

  // Filtrar apenas meses que têm dados relevantes para a métrica selecionada
  const filterMonthsWithData = (data: any[], metric: string) => {
    return data.filter((month) => {
      if (metric === "orcamento") {
        return month.valorOrcamentos > 0;
      } else if (metric === "faturamento") {
        return month.valorFaturamento > 0;
      } else if (metric === "conversao") {
        return month.quantidadeOrcamentos > 0 || month.quantidadeFaturados > 0;
      }
      return false;
    });
  };

  // Filtrar dados baseado na métrica selecionada
  const getChartData = () => {
    const monthsWithData = filterMonthsWithData(
      monthlyDataWithConversion,
      selectedMetric
    );
    return monthsWithData.map((month) => ({
      ...month,
      value:
        selectedMetric === "orcamento"
          ? month.valorOrcamentos
          : selectedMetric === "faturamento"
            ? month.valorFaturamento
            : month.conversao,
    }));
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.map((item) => item.value));

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case "orcamento":
        return "Valor de Orçamentos";
      case "faturamento":
        return "Valor de Faturamento";
      case "conversao":
        return "Taxa de Conversão";
      default:
        return "";
    }
  };

  // Função para formatar o label do mês com ano quando necessário
  const formatMonthLabel = (monthData: any, allData: any[]) => {
    const years = [...new Set(allData.map((item) => item.ano))];

    if (years.length > 1) {
      // Se há múltiplos anos, mostrar mês/ano
      return `${monthData.mesNome}/${monthData.ano}`;
    } else {
      // Se há apenas um ano, mostrar apenas o mês
      return monthData.mesNome;
    }
  };

  const formatValue = (value: number) => {
    if (selectedMetric === "conversao") {
      return formatPercentage(value);
    }
    return formatCurrency(value);
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-gray-800">
            {getMetricLabel()} por Mês
          </CardTitle>

          {/* Filter buttons */}
          <div className="flex items-center space-x-2">
            <div className="relative bg-gray-200 rounded-lg p-1 flex">
              <button
                onClick={() => setSelectedMetric("orcamento")}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedMetric === "orcamento"
                    ? "text-blue-700 bg-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Orçamento
              </button>
              <button
                onClick={() => setSelectedMetric("faturamento")}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedMetric === "faturamento"
                    ? "text-blue-700 bg-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Faturamento
              </button>
              <button
                onClick={() => setSelectedMetric("conversao")}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedMetric === "conversao"
                    ? "text-blue-700 bg-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Conversão
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {chartData.length > 0 && maxValue > 0 ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-x-auto pb-8">
                <div
                  className="flex items-end justify-start space-x-4 min-w-max px-4"
                  style={{ minWidth: `${chartData.length * 80}px` }}
                >
                  {chartData.map((month, index) => {
                    const height =
                      maxValue > 0 ? (month.value / maxValue) * 200 : 0;
                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center space-y-2 flex-shrink-0"
                      >
                        <div className="text-xs text-gray-600 font-medium text-center w-16">
                          {formatValue(month.value)}
                        </div>
                        <div
                          className={
                            "w-12 rounded-t transition-all duration-500 hover:opacity-80 border border-blue-700"
                          }
                          style={{
                            height: `${Math.max(height, 20)}px`,
                            backgroundColor: "rgba(37, 99, 235, 0.6)", // Azul-500 com 60% de opacidade
                          }}
                          title={`${formatMonthLabel(month, chartData)}: ${formatValue(month.value)}`}
                        ></div>
                        <div className="text-xs text-gray-700 font-medium text-center w-16 leading-tight">
                          {formatMonthLabel(month, chartData)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">
                      Maior {getMetricLabel()}:
                    </span>
                    <div className="font-semibold text-green-600">
                      {formatMonthLabel(
                        chartData.reduce((max, curr) =>
                          curr.value > max.value ? curr : max
                        ),
                        chartData
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Geral:</span>
                    <div className="font-semibold text-blue-600">
                      {formatValue(
                        chartData.reduce((sum, curr) => sum + curr.value, 0)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {chartData.length === 0
                    ? "Nenhum dado disponível para esta métrica"
                    : "Nenhum valor encontrado para esta métrica"}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {chartData.length === 0
                    ? "Faça upload de uma planilha para visualizar os dados"
                    : "Tente selecionar outra métrica ou período"}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
