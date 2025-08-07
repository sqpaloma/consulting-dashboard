import { BarChart3, User, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { RESPONSAVEIS, DEPARTAMENTOS, getDepartamentoByResponsavel } from "@/components/dashboard/types";

interface AnalyticsMonthlyChartProps {
  uploadedData: any[];
}

export function AnalyticsMonthlyChart({
  uploadedData,
}: AnalyticsMonthlyChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<
    "orcamento" | "faturamento" | "conversao" | "comparison"
  >("faturamento");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [comparisonMetric, setComparisonMetric] = useState<
    "orcamento" | "faturamento" | "conversao"
  >("faturamento");
  const [selectedDepartamento, setSelectedDepartamento] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Funcao para filtrar dados por departamento
  const filterDataByDepartamento = (data: any[]) => {
    if (!selectedDepartamento) return data;
    
    return data.filter(row => {
      const responsavel = row.responsavel?.toLowerCase();
      if (!responsavel) return false;
      
      const departamento = getDepartamentoByResponsavel(responsavel);
      return departamento?.id === selectedDepartamento;
    });
  };

  // Funcao para agregar dados por mes e ano
  const aggregateMonthlyData = (data: any[]) => {
    const filteredData = filterDataByDepartamento(data);
    const monthlyYearMap = new Map();

    // Agregar dados dos meses que tem informacoes
    filteredData.forEach((row) => {
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

    // Converter para array e ordenar por ano e mes
    return Array.from(monthlyYearMap.values()).sort((a, b) => {
      if (a.ano !== b.ano) {
        return a.ano - b.ano; // Ordenar por ano primeiro
      }
      return a.mes - b.mes; // Depois por mes
    });
  };

  const getMonthName = (month: number) => {
    const monthNames = [
      "",
      "Janeiro",
      "Fevereiro",
      "Marco",
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

  // Calcular porcentagem de conversao
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

  // Get available years from data
  const availableYears = [...new Set(monthlyDataWithConversion.map(item => item.ano))].sort((a, b) => b - a);

  // Filter data by selected year
  const filteredDataByYear = selectedYear 
    ? monthlyDataWithConversion.filter(item => item.ano === selectedYear)
    : monthlyDataWithConversion;

  // Get comparison data - group by month across all years
  const getComparisonData = () => {
    const monthMap = new Map();
    
    monthlyDataWithConversion.forEach(item => {
      const monthKey = item.mes;
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          mes: item.mes,
          mesNome: item.mesNome,
          years: {}
        });
      }
      
      const monthData = monthMap.get(monthKey);
      monthData.years[item.ano] = {
        value: comparisonMetric === "orcamento" 
          ? item.valorOrcamentos 
          : comparisonMetric === "faturamento" 
            ? item.valorFaturamento 
            : item.conversao,
        ano: item.ano
      };
    });

    return Array.from(monthMap.values())
      .sort((a, b) => a.mes - b.mes)
      .filter(month => Object.keys(month.years).length > 0);
  };

  // Filtrar apenas meses que tem dados relevantes para a metrica selecionada
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
      filteredDataByYear,
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
  const comparisonData = getComparisonData();
  const maxValue = selectedMetric === "comparison" 
    ? Math.max(...comparisonData.flatMap(month => 
        Object.values(month.years).map((year: any) => year.value)
      ))
    : Math.max(...chartData.map((item) => item.value));

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case "orcamento":
        return "Valor de Orcamentos";
      case "faturamento":
        return "Valor de Faturamento";
      case "conversao":
        return "Taxa de Conversao";
      case "comparison":
        return `Comparacao de ${comparisonMetric === "orcamento" ? "Orcamentos" : comparisonMetric === "faturamento" ? "Faturamento" : "Conversao"} por Ano`;
      default:
        return "";
    }
  };

  // Funcao para formatar o label do mes com ano quando necessario
  const formatMonthLabel = (monthData: any, allData: any[]) => {
    const years = [...new Set(allData.map((item) => item.ano))];

    if (years.length > 1) {
      // Se ha multiplos anos, mostrar mes/ano
      return `${monthData.mesNome}/${monthData.ano}`;
    } else {
      // Se ha apenas um ano, mostrar apenas o mes
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
            {getMetricLabel()} por Mes
            {selectedDepartamento && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                - {DEPARTAMENTOS.find(d => d.id === selectedDepartamento)?.nome}
              </span>
            )}
          </CardTitle>

          {/* Filter buttons */}
          <div className="flex items-center space-x-4">
            {/* Departamento filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 font-medium">Departamento:</label>
              <Select
                value={selectedDepartamento || ""}
                onValueChange={(value) => setSelectedDepartamento(value || null)}
              >
                <SelectTrigger className="w-48 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Todos os departamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span>Todos os departamentos</span>
                    </div>
                  </SelectItem>
                  {DEPARTAMENTOS.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <div className="flex flex-col">
                          <span className="font-medium">{dept.responsavel}</span>
                          <span className="text-xs text-gray-500">{dept.nome}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Year filter - show always when multiple years exist */}
            {availableYears.length > 1 && (
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600 font-medium">Ano:</label>
                <select
                  value={selectedYear || ""}
                  onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
                  className={`px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    selectedMetric === "comparison" ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={selectedMetric === "comparison"}
                >
                  <option value="">Selecione o ano</option>
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative bg-gray-200 rounded-lg p-1 flex">
              <button
                onClick={() => {
                  setSelectedMetric("orcamento");
                  setComparisonMetric("orcamento");
                }}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedMetric === "orcamento"
                    ? "text-blue-700 bg-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Orcamento
              </button>
              <button
                onClick={() => {
                  setSelectedMetric("faturamento");
                  setComparisonMetric("faturamento");
                }}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedMetric === "faturamento"
                    ? "text-blue-700 bg-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Faturamento
              </button>
              <button
                onClick={() => {
                  setSelectedMetric("conversao");
                  setComparisonMetric("conversao");
                }}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedMetric === "conversao"
                    ? "text-blue-700 bg-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Conversao
              </button>
              {/* Comparison button - only show if multiple years exist */}
              {availableYears.length > 1 && (
                <button
                  onClick={() => setSelectedMetric("comparison")}
                  className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    selectedMetric === "comparison"
                      ? "text-blue-700 bg-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Comparacao
                </button>
              )}
            </div>

          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {availableYears.length > 1 && selectedMetric !== "comparison" && !selectedYear ? (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Selecione um ano para visualizar os dados
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Use o filtro de ano acima para escolher o período desejado
                </p>
              </div>
            </div>
          ) : selectedMetric === "comparison" && comparisonData.length > 0 && maxValue > 0 ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-x-auto pb-8">
                <div
                  className="flex items-end justify-start space-x-4 min-w-max px-4"
                  style={{ minWidth: `${comparisonData.length * 120}px` }}
                >
                  {comparisonData.map((month, monthIndex) => (
                    <div key={monthIndex} className="flex flex-col items-center space-y-2 flex-shrink-0">
                      <div className="flex items-end space-x-1">
                        {availableYears.map((year, yearIndex) => {
                          const yearData = month.years[year];
                          if (!yearData) return null;
                          
                          const height = maxValue > 0 ? (yearData.value / maxValue) * 180 : 0;
                          const colors = [
                            "rgba(59, 130, 246, 0.8)", // Azul
                            "rgba(16, 185, 129, 0.8)", // Verde
                            "rgba(245, 158, 11, 0.8)", // Laranja
                            "rgba(239, 68, 68, 0.8)",  // Vermelho
                            "rgba(139, 92, 246, 0.8)"  // Roxo
                          ];
                          
                          return (
                            <div key={year} className="flex flex-col items-center space-y-1">
                              <div className="text-xs text-gray-600 font-medium text-center w-12">
                                {comparisonMetric === "conversao" ? formatPercentage(yearData.value) : formatCurrency(yearData.value)}
                              </div>
                              <div
                                className="w-8 rounded-t transition-all duration-500 hover:opacity-80 border border-gray-400"
                                style={{
                                  height: `${Math.max(height, 12)}px`,
                                  backgroundColor: colors[yearIndex % colors.length],
                                }}
                                title={`${month.mesNome} ${year}: ${comparisonMetric === "conversao" ? formatPercentage(yearData.value) : formatCurrency(yearData.value)}`}
                              ></div>
                              <div className="text-xs text-gray-500 font-medium text-center w-8">
                                {year}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-xs text-gray-700 font-medium text-center mt-2">
                        {month.mesNome}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center justify-center space-x-6 text-xs">
                  {availableYears.map((year, index) => {
                    const colors = [
                      "rgba(59, 130, 246, 0.8)", // Azul
                      "rgba(16, 185, 129, 0.8)", // Verde
                      "rgba(245, 158, 11, 0.8)", // Laranja
                      "rgba(239, 68, 68, 0.8)",  // Vermelho
                      "rgba(139, 92, 246, 0.8)"  // Roxo
                    ];
                    
                    return (
                      <div key={year} className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded border border-gray-400"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        ></div>
                        <span className="text-gray-600">{year}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : chartData.length > 0 && maxValue > 0 ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-x-auto pb-8">
                <div
                  className="flex items-end justify-start space-x-3 min-w-max px-4"
                  style={{ minWidth: `${chartData.length * 72}px` }}
                >
                  {chartData.map((month, index) => {
                    const height =
                      maxValue > 0 ? (month.value / maxValue) * 200 : 0;
                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center space-y-2 flex-shrink-0"
                      >
                        <div className="text-xs text-gray-600 font-medium text-center w-14">
                          {formatValue(month.value)}
                        </div>
                        <div
                          className={
                            "w-10 rounded-t transition-all duration-500 hover:opacity-80 border border-blue-700"
                          }
                          style={{
                            height: `${Math.max(height, 16)}px`,
                            backgroundColor: "rgba(59, 130, 246, 0.7)", // Melhor cor azul
                          }}
                          title={`${formatMonthLabel(month, chartData)}: ${formatValue(month.value)}`}
                        ></div>
                        <div className="text-xs text-gray-700 font-medium text-center w-14 leading-tight">
                          {formatMonthLabel(month, chartData)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="text-gray-600 text-xs">
                      Maior {getMetricLabel()}:
                    </span>
                    <div className="font-semibold text-green-600 mt-1">
                      {formatMonthLabel(
                        chartData.reduce((max, curr) =>
                          curr.value > max.value ? curr : max
                        ),
                        chartData
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 text-xs">Total Geral:</span>
                    <div className="font-semibold text-blue-600 mt-1">
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
                    ? "Nenhum dado disponivel para esta metrica"
                    : "Nenhum valor encontrado para esta metrica"}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {chartData.length === 0
                    ? "Faca upload de uma planilha para visualizar os dados"
                    : "Tente selecionar outra metrica ou periodo"}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
