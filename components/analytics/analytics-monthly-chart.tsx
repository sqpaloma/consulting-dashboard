import { BarChart3, User, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  RESPONSAVEIS,
  DEPARTAMENTOS,
  getDepartamentoByResponsavel,
} from "@/components/dashboard/types";

interface AnalyticsMonthlyChartProps {
  uploadedData: any[];
}

export function AnalyticsMonthlyChart({
  uploadedData,
}: AnalyticsMonthlyChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<
    "orcamento" | "faturamento" | "conversao"
  >("faturamento");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [comparisonMetric, setComparisonMetric] = useState<
    "orcamento" | "faturamento" | "conversao"
  >("faturamento");
  const [selectedDepartamento, setSelectedDepartamento] = useState<
    string | null
  >(null);
  const [viewMode, setViewMode] = useState<"valor" | "quantidade">("valor");
  const [isComparison, setIsComparison] = useState<boolean>(false);

  // Virtualization state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Chart item dimensions
  const ITEM_WIDTH_MOBILE = 80;
  const ITEM_WIDTH_DESKTOP = 120;
  const COMPARISON_WIDTH_MOBILE = 120;
  const COMPARISON_WIDTH_DESKTOP = 160;
  const BUFFER_SIZE = 3;

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

    return data.filter((row) => {
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
  const availableYears = [
    ...new Set(monthlyDataWithConversion.map((item) => item.ano)),
  ].sort((a, b) => b - a);

  // Default to current year if available, otherwise the latest, only once
  useEffect(() => {
    if (availableYears.length === 0) return;
    if (selectedYear !== null) return;
    const currentYear = new Date().getFullYear();
    const defaultYear = availableYears.includes(currentYear)
      ? currentYear
      : availableYears[0];
    setSelectedYear(defaultYear);
  }, [availableYears.length]);

  // Keep comparison metric aligned to selected metric
  useEffect(() => {
    setComparisonMetric(selectedMetric);
  }, [selectedMetric]);

  // Filter data by selected year (only when not comparing)
  const filteredDataByYear =
    !isComparison && selectedYear
      ? monthlyDataWithConversion.filter((item) => item.ano === selectedYear)
      : monthlyDataWithConversion;

  // Get comparison data - group by month across all years for current metric
  const getComparisonData = () => {
    const monthMap = new Map();
    monthlyDataWithConversion.forEach((item) => {
      const monthKey = item.mes;
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          mes: item.mes,
          mesNome: item.mesNome,
          years: {},
        });
      }
      const monthData = monthMap.get(monthKey);
      const value =
        comparisonMetric === "orcamento"
          ? viewMode === "valor"
            ? item.valorOrcamentos
            : item.quantidadeOrcamentos
          : comparisonMetric === "faturamento"
            ? viewMode === "valor"
              ? item.valorFaturamento
              : item.quantidadeFaturados
            : viewMode === "valor"
              ? item.conversao
              : item.quantidadeFaturados;
      monthData.years[item.ano] = {
        value,
        ano: item.ano,
      };
    });

    return Array.from(monthMap.values())
      .sort((a, b) => a.mes - b.mes)
      .filter((month) => Object.keys(month.years).length > 0);
  };

  const filterMonthsWithData = (data: any[], metric: string) => {
    return data.filter((month) => {
      if (metric === "orcamento") {
        return (
          (viewMode === "valor"
            ? month.valorOrcamentos
            : month.quantidadeOrcamentos) > 0
        );
      } else if (metric === "faturamento") {
        return (
          (viewMode === "valor"
            ? month.valorFaturamento
            : month.quantidadeFaturados) > 0
        );
      } else if (metric === "conversao") {
        return viewMode === "valor"
          ? month.quantidadeOrcamentos > 0 || month.quantidadeFaturados > 0
          : month.quantidadeFaturados > 0;
      }
      return false;
    });
  };

  const getChartData = () => {
    const monthsWithData = filterMonthsWithData(
      filteredDataByYear,
      selectedMetric
    );
    return monthsWithData.map((month) => ({
      ...month,
      value:
        selectedMetric === "orcamento"
          ? viewMode === "valor"
            ? month.valorOrcamentos
            : month.quantidadeOrcamentos
          : selectedMetric === "faturamento"
            ? viewMode === "valor"
              ? month.valorFaturamento
              : month.quantidadeFaturados
            : viewMode === "valor"
              ? month.conversao
              : month.quantidadeFaturados,
    }));
  };

  const chartData = getChartData();
  const comparisonData = getComparisonData();
  const maxValue = isComparison
    ? Math.max(
        ...comparisonData.flatMap((month) =>
          Object.values(month.years).map((year: any) => year.value)
        )
      )
    : Math.max(...chartData.map((item) => item.value));

  const getMetricLabel = () => {
    if (isComparison) {
      return `Comparação de ${
        comparisonMetric === "orcamento"
          ? viewMode === "valor"
            ? "Orçamentos"
            : "Qtd. Orçamentos"
          : comparisonMetric === "faturamento"
            ? viewMode === "valor"
              ? "Faturamento"
              : "Qtd. Faturados"
            : viewMode === "valor"
              ? "Conversão (%)"
              : "Conversões"
      } por Ano`;
    }
    const prefix = viewMode === "valor" ? "Valor de " : "Quantidade de ";
    switch (selectedMetric) {
      case "orcamento":
        return `${prefix}Orçamentos`;
      case "faturamento":
        return `${prefix}Faturamento`;
      case "conversao":
        return viewMode === "valor" ? "Taxa de Conversão" : "Conversões";
      default:
        return "";
    }
  };

  const formatMonthLabel = (monthData: any, allData: any[]) => {
    const years = [...new Set(allData.map((item) => item.ano))];
    if (years.length > 1) {
      return `${monthData.mesNome}/${monthData.ano}`;
    } else {
      return monthData.mesNome;
    }
  };

  const formatValue = (value: number) => {
    if (selectedMetric === "conversao" && viewMode === "valor") {
      return `${value.toFixed(1)}%`;
    }
    return viewMode === "valor"
      ? new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value)
      : String(value);
  };

  // Virtualization calculations
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
  const currentItemWidth = isComparison 
    ? (isDesktop ? COMPARISON_WIDTH_DESKTOP : COMPARISON_WIDTH_MOBILE)
    : (isDesktop ? ITEM_WIDTH_DESKTOP : ITEM_WIDTH_MOBILE);

  const activeData = isComparison ? comparisonData : chartData;

  const visibleRange = useMemo(() => {
    if (containerWidth === 0) return { start: 0, end: activeData.length };
    
    const visibleCount = Math.ceil(containerWidth / currentItemWidth);
    const startIndex = Math.max(0, Math.floor(scrollLeft / currentItemWidth) - BUFFER_SIZE);
    const endIndex = Math.min(activeData.length, startIndex + visibleCount + (BUFFER_SIZE * 2));
    
    return { start: startIndex, end: endIndex };
  }, [scrollLeft, containerWidth, currentItemWidth, activeData.length]);

  const visibleData = useMemo(() => {
    return activeData.slice(visibleRange.start, visibleRange.end);
  }, [activeData, visibleRange.start, visibleRange.end]);

  const totalWidth = activeData.length * currentItemWidth;
  const offsetLeft = visibleRange.start * currentItemWidth;

  // Handle scroll with throttling for better performance  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeftValue = e.currentTarget.scrollLeft;
    // Simple throttling - only update if difference is significant
    if (Math.abs(scrollLeftValue - scrollLeft) > 15) {
      setScrollLeft(scrollLeftValue);
    }
  }, [scrollLeft]);

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex flex-col space-y-4">
          {/* Title */}
          <CardTitle className="text-lg md:text-xl text-gray-800">
            {getMetricLabel()} por Mês
            {selectedDepartamento && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                -{" "}
                {DEPARTAMENTOS.find((d) => d.id === selectedDepartamento)?.nome}
              </span>
            )}
          </CardTitle>

          {/* Controls - Mobile First */}
          <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            {/* Left side controls */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              {/* Departamento filter */}
              <div className="flex items-center space-x-2">
                <label className="text-xs md:text-sm text-gray-600 font-medium whitespace-nowrap">
                  Departamento:
                </label>
                <Select
                  value={selectedDepartamento || "todos"}
                  onValueChange={(value) =>
                    setSelectedDepartamento(value === "todos" ? null : value)
                  }
                >
                  <SelectTrigger className="w-40 md:w-48 px-2 md:px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span>Todos</span>
                      </div>
                    </SelectItem>
                    {DEPARTAMENTOS.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{dept.nome}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year filter */}
              {availableYears.length > 0 && (
                <div className="flex items-center space-x-2">
                  <label className="text-xs md:text-sm text-gray-600 font-medium whitespace-nowrap">
                    Ano:
                  </label>
                  <select
                    value={selectedYear || ""}
                    onChange={(e) =>
                      setSelectedYear(
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className={`px-2 md:px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isComparison ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isComparison}
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right side controls */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
              {/* Valor vs Quantidade toggle */}
              <div className="relative bg-gray-200 rounded-lg p-1 flex">
                <button
                  onClick={() => setViewMode("valor")}
                  className={`relative px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === "valor"
                      ? "text-blue-700 bg-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Valores
                </button>
                <button
                  onClick={() => setViewMode("quantidade")}
                  className={`relative px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === "quantidade"
                      ? "text-blue-700 bg-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Quantidade
                </button>
              </div>

              {/* Metric tabs */}
              <div className="relative bg-gray-200 rounded-lg p-1 flex">
                <button
                  onClick={() => {
                    setSelectedMetric("orcamento");
                  }}
                  className={`relative px-1.5 md:px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all duration-200 ${
                    selectedMetric === "orcamento"
                      ? "text-blue-700 bg-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Orçamento
                </button>
                <button
                  onClick={() => {
                    setSelectedMetric("faturamento");
                  }}
                  className={`relative px-1.5 md:px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all duration-200 ${
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
                  }}
                  className={`relative px-1.5 md:px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all duration-200 ${
                    selectedMetric === "conversao"
                      ? "text-blue-700 bg-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Conversão
                </button>
              </div>

              {/* Comparison toggle */}
              {availableYears.length > 1 && (
                <div className="relative bg-gray-200 rounded-lg p-1 flex">
                  <button
                    onClick={() => setIsComparison((prev) => !prev)}
                    className={`relative px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all duration-200 ${
                      isComparison
                        ? "text-blue-700 bg-white shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    title="Comparar anos para a métrica atual"
                  >
                    Comparar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {isComparison && comparisonData.length > 0 && maxValue > 0 ? (
            <div className="h-full flex flex-col">
              <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
                onScroll={handleScroll}
                style={{ 
                  scrollbarWidth: 'thin',
                  scrollBehavior: 'smooth'
                }}
              >
                <div 
                  className="relative h-full px-2 md:px-4"
                  style={{ width: `${totalWidth + 32}px` }}
                >
                  <div
                    className="flex items-end justify-start space-x-4 md:space-x-8 h-full absolute"
                    style={{ 
                      left: `${offsetLeft}px`,
                      width: `${(visibleRange.end - visibleRange.start) * currentItemWidth}px`
                    }}
                  >
                    {visibleData.map((month, relativeIndex) => {
                      const monthIndex = visibleRange.start + relativeIndex;
                      return (
                        <div
                          key={monthIndex}
                          className="flex flex-col items-center space-y-2 flex-shrink-0"
                        >
                      <div className="flex items-end space-x-3">
                        {availableYears.map((year, yearIndex) => {
                          const yearData = month.years[year];
                          if (!yearData) return null;
                          const height =
                            maxValue > 0
                              ? (yearData.value / maxValue) * 180
                              : 0;
                          const colors = [
                            "rgba(59, 130, 246, 0.8)",
                            "rgba(16, 185, 129, 0.8)",
                            "rgba(245, 158, 11, 0.8)",
                            "rgba(239, 68, 68, 0.8)",
                            "rgba(139, 92, 246, 0.8)",
                          ];
                          const displayValue =
                            comparisonMetric === "conversao" &&
                            viewMode === "valor"
                              ? `${yearData.value.toFixed(1)}%`
                              : viewMode === "valor"
                                ? new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  }).format(yearData.value)
                                : String(yearData.value);
                          return (
                            <div
                              key={year}
                              className="flex flex-col items-center space-y-1"
                            >
                              <div className="text-xs text-gray-600 font-medium text-center w-12 md:w-16">
                                {displayValue}
                              </div>
                              <div
                                className="w-8 md:w-10 rounded-t transition-all duration-500 hover:opacity-80 border border-gray-400"
                                style={{
                                  height: `${Math.max(height, 12)}px`,
                                  backgroundColor:
                                    colors[yearIndex % colors.length],
                                }}
                                title={`${month.mesNome} ${year}: ${displayValue}`}
                              ></div>
                              <div className="text-xs text-gray-500 font-medium text-center w-8 md:w-10">
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
                      );
                    })}
                  </div>
                  
                  {/* Scroll indicator */}
                  {comparisonData.length > 5 && (
                    <div className="absolute bottom-0 right-4 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow-sm">
                      {visibleRange.start + 1}-{Math.min(visibleRange.end, comparisonData.length)} de {comparisonData.length}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : chartData.length > 0 && maxValue > 0 ? (
            <div className="h-full flex flex-col">
              <div 
                ref={isComparison ? undefined : scrollContainerRef}
                className="flex-1 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
                onScroll={isComparison ? undefined : handleScroll}
                style={{ 
                  scrollbarWidth: 'thin',
                  scrollBehavior: 'smooth'
                }}
              >
                <div 
                  className="relative h-full px-2 md:px-4"
                  style={{ width: `${isComparison ? 'auto' : totalWidth + 32}px` }}
                >
                  <div
                    className="flex items-end justify-start space-x-6 md:space-x-12 h-full absolute"
                    style={isComparison ? {} : { 
                      left: `${offsetLeft}px`,
                      width: `${(visibleRange.end - visibleRange.start) * currentItemWidth}px`
                    }}
                  >
                    {(isComparison ? chartData : visibleData).map((month, relativeIndex) => {
                      const actualIndex = isComparison ? relativeIndex : visibleRange.start + relativeIndex;
                      const height =
                        maxValue > 0 ? (month.value / maxValue) * 200 : 0;
                      return (
                        <div
                          key={actualIndex}
                          className="flex flex-col items-center space-y-2 flex-shrink-0"
                          style={isComparison ? {} : { width: `${currentItemWidth - (isDesktop ? 48 : 24)}px` }}
                        >
                          <div className="text-xs text-gray-600 font-medium text-center w-16 md:w-18">
                            {formatValue(month.value)}
                          </div>
                          <div
                            className={
                              "w-8 md:w-12 rounded-t transition-all duration-300 hover:opacity-80 border border-blue-700 cursor-pointer"
                            }
                            style={{
                              height: `${Math.max(height, 16)}px`,
                              backgroundColor: "rgba(59, 130, 246, 0.7)",
                            }}
                            title={`${formatMonthLabel(month, chartData)}: ${formatValue(month.value)}`}
                          ></div>
                          <div className="text-xs text-gray-700 font-medium text-center w-16 md:w-18 leading-tight">
                            {formatMonthLabel(month, chartData)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Scroll indicator for regular chart */}
                  {!isComparison && chartData.length > 5 && (
                    <div className="absolute bottom-0 right-4 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow-sm">
                      {visibleRange.start + 1}-{Math.min(visibleRange.end, chartData.length)} de {chartData.length}
                    </div>
                  )}
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
