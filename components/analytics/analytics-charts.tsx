import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsMonthlyChart } from "./analytics-monthly-chart";
import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";

interface AnalyticsChartsProps {
  uploadedData: any[];
  originalData?: any[]; // Dados originais para o gráfico mensal
}

export function AnalyticsCharts({
  uploadedData,
  originalData,
}: AnalyticsChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Function to sort engineers alphabetically with special characters/numbers at the end
  const sortEngineers = (data: any[]) => {
    return data.sort((a, b) => {
      const nameA = a.engenheiro || "";
      const nameB = b.engenheiro || "";
      const isLetterA = /^[a-zA-ZÀ-ÿ]/.test(nameA);
      const isLetterB = /^[a-zA-ZÀ-ÿ]/.test(nameB);
      if (isLetterA && isLetterB) {
        return nameA.localeCompare(nameB, "pt-BR", { sensitivity: "base" });
      }
      if (isLetterA && !isLetterB) {
        return -1;
      }
      if (!isLetterA && isLetterB) {
        return 1;
      }
      return nameA.localeCompare(nameB, "pt-BR", { sensitivity: "base" });
    });
  };

  // Filter and sort data - exclude engineers with zero value
  const filteredData = sortEngineers(
    [...uploadedData].filter(
      (engineer) =>
        (engineer.valorTotal || 0) + (engineer.valorOrcamentos || 0) > 0
    )
  );

  // New controls for performance chart
  const [perfMetric, setPerfMetric] = React.useState<
    "faturamento" | "orcamento"
  >("faturamento");
  const [perfView, setPerfView] = React.useState<"valor" | "quantidade">(
    "valor"
  );

  // Virtualization state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Chart item dimensions
  const ITEM_WIDTH = 60; // Base width for mobile (includes spacing)
  const ITEM_WIDTH_DESKTOP = 80; // Width for desktop
  const BUFFER_SIZE = 5; // Number of items to render outside visible area

  const getEngineerValue = (engineer: any) => {
    if (perfMetric === "faturamento") {
      return perfView === "valor"
        ? engineer.valorTotal || 0
        : engineer.quantidade || 0;
    } else {
      return perfView === "valor"
        ? engineer.valorOrcamentos || 0
        : engineer.projetos || 0;
    }
  };

  const maxValue =
    filteredData.length > 0
      ? Math.max(...filteredData.map((e) => getEngineerValue(e)))
      : 0;

  const formatValue = (value: number) =>
    perfView === "valor" ? formatCurrency(value) : String(value);

  // Memoized chart bar component for better performance
  const ChartBar = React.memo(({ 
    engineer, 
    value, 
    height, 
    actualIndex, 
    currentItemWidth, 
    isDesktop 
  }: { 
    engineer: any; 
    value: number; 
    height: number; 
    actualIndex: number; 
    currentItemWidth: number; 
    isDesktop: boolean; 
  }) => (
    <div
      key={actualIndex}
      className="flex flex-col items-center space-y-2 flex-shrink-0"
      style={{ width: `${currentItemWidth - (isDesktop ? 16 : 8)}px` }}
    >
      <div className="text-xs text-gray-600 font-medium text-center w-12 md:w-16">
        {formatValue(value)}
      </div>
      <div
        className="w-8 md:w-12 rounded-t transition-all duration-300 hover:opacity-80 border border-blue-700 cursor-pointer"
        style={{
          height: `${Math.max(height, 20)}px`,
          backgroundColor: "rgba(37, 99, 235, 0.6)",
        }}
        title={`${engineer.engenheiro}: ${formatValue(value)}`}
      />
      <div className="text-xs text-gray-700 font-medium text-center w-12 md:w-16 leading-tight">
        {engineer.engenheiro.split(" ")[0]}
      </div>
    </div>
  ));

  // Virtualization calculations
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
  const currentItemWidth = isDesktop ? ITEM_WIDTH_DESKTOP : ITEM_WIDTH;
  
  const visibleRange = useMemo(() => {
    if (containerWidth === 0) return { start: 0, end: filteredData.length };
    
    const visibleCount = Math.ceil(containerWidth / currentItemWidth);
    const startIndex = Math.max(0, Math.floor(scrollLeft / currentItemWidth) - BUFFER_SIZE);
    const endIndex = Math.min(filteredData.length, startIndex + visibleCount + (BUFFER_SIZE * 2));
    
    return { start: startIndex, end: endIndex };
  }, [scrollLeft, containerWidth, currentItemWidth, filteredData.length]);

  const visibleData = useMemo(() => {
    return filteredData.slice(visibleRange.start, visibleRange.end);
  }, [filteredData, visibleRange.start, visibleRange.end]);

  const totalWidth = filteredData.length * currentItemWidth;
  const offsetLeft = visibleRange.start * currentItemWidth;

  // Handle scroll with throttling for better performance
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeftValue = e.currentTarget.scrollLeft;
    // Simple throttling - only update if difference is significant
    if (Math.abs(scrollLeftValue - scrollLeft) > 10) {
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
    <div className="space-y-6">
      {/* Monthly Chart */}
      <AnalyticsMonthlyChart uploadedData={originalData || uploadedData} />

      {/* Performance Chart - Full Width */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle className="text-lg md:text-xl text-gray-800">
              Desempenho por Colaborador(a)
            </CardTitle>
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:gap-3">
              <div className="relative bg-gray-200 rounded-lg p-1 flex">
                <button
                  onClick={() => setPerfMetric("faturamento")}
                  className={`relative px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all duration-200 ${
                    perfMetric === "faturamento"
                      ? "text-blue-700 bg-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Faturamento
                </button>
                <button
                  onClick={() => setPerfMetric("orcamento")}
                  className={`relative px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all duration-200 ${
                    perfMetric === "orcamento"
                      ? "text-blue-700 bg-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Orçamento
                </button>
              </div>
              <div className="relative bg-gray-200 rounded-lg p-1 flex">
                <button
                  onClick={() => setPerfView("valor")}
                  className={`relative px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all duration-200 ${
                    perfView === "valor"
                      ? "text-blue-700 bg-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Valores
                </button>
                <button
                  onClick={() => setPerfView("quantidade")}
                  className={`relative px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all duration-200 ${
                    perfView === "quantidade"
                      ? "text-blue-700 bg-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Quantidade
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {filteredData.length > 0 ? (
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
                      className="flex items-end justify-start space-x-2 md:space-x-4 h-full absolute"
                      style={{ 
                        left: `${offsetLeft}px`,
                        width: `${(visibleRange.end - visibleRange.start) * currentItemWidth}px`
                      }}
                    >
                      {visibleData.map((engineer, relativeIndex) => {
                        const actualIndex = visibleRange.start + relativeIndex;
                        const value = getEngineerValue(engineer);
                        const height = maxValue > 0 ? (value / maxValue) * 200 : 0;
                        return (
                          <ChartBar
                            key={actualIndex}
                            engineer={engineer}
                            value={value}
                            height={height}
                            actualIndex={actualIndex}
                            currentItemWidth={currentItemWidth}
                            isDesktop={isDesktop}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Scroll indicator */}
                    {filteredData.length > 10 && (
                      <div className="absolute bottom-0 right-4 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow-sm">
                        {visibleRange.start + 1}-{Math.min(visibleRange.end, filteredData.length)} de {filteredData.length}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">
                        Maior{" "}
                        {perfMetric === "faturamento"
                          ? perfView === "valor"
                            ? "Faturamento"
                            : "Qtde. Faturados"
                          : perfView === "valor"
                            ? "Orçamento"
                            : "Qtde. Orçamentos"}
                        :
                      </span>
                      <div className="font-semibold text-green-600">
                        {
                          filteredData.reduce((max, curr) =>
                            getEngineerValue(curr) > getEngineerValue(max)
                              ? curr
                              : max
                          ).engenheiro
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Geral:</span>
                      <div className="font-semibold text-blue-600">
                        {perfView === "valor"
                          ? formatCurrency(
                              filteredData.reduce(
                                (sum, curr) => sum + getEngineerValue(curr),
                                0
                              )
                            )
                          : filteredData.reduce(
                              (sum, curr) => sum + getEngineerValue(curr),
                              0
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
                  <p className="text-gray-500">Nenhum dado disponível</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Faça upload de uma planilha para visualizar os dados
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
