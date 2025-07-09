import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsChartsProps {
  uploadedData: any[];
}

export function AnalyticsCharts({ uploadedData }: AnalyticsChartsProps) {
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

      // Check if name starts with a letter
      const isLetterA = /^[a-zA-ZÀ-ÿ]/.test(nameA);
      const isLetterB = /^[a-zA-ZÀ-ÿ]/.test(nameB);

      // If both start with letters, sort alphabetically
      if (isLetterA && isLetterB) {
        return nameA.localeCompare(nameB, "pt-BR", { sensitivity: "base" });
      }

      // If A starts with letter but B doesn't, A comes first
      if (isLetterA && !isLetterB) {
        return -1;
      }

      // If B starts with letter but A doesn't, B comes first
      if (!isLetterA && isLetterB) {
        return 1;
      }

      // If both start with special characters/numbers, sort them alphabetically
      return nameA.localeCompare(nameB, "pt-BR", { sensitivity: "base" });
    });
  };

  // Filter and sort data - exclude engineers with zero value
  const filteredData = sortEngineers(
    [...uploadedData].filter((engineer) => engineer.valorTotal > 0)
  );

  return (
    <div className="space-y-6">
      {/* Performance Chart - Full Width */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">
            Desempenho por Colaborador(a)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {filteredData.length > 0 ? (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-x-auto pb-8">
                  <div
                    className="flex items-end justify-start space-x-4 min-w-max px-4"
                    style={{ minWidth: `${filteredData.length * 80}px` }}
                  >
                    {filteredData.map((engineer, index) => {
                      const maxValue = Math.max(
                        ...filteredData.map((e) => e.valorTotal)
                      );
                      const height = (engineer.valorTotal / maxValue) * 200;
                      // Cor única azul translúcida e borda azul escura
                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center space-y-2 flex-shrink-0"
                        >
                          <div className="text-xs text-gray-600 font-medium text-center w-16">
                            {formatCurrency(engineer.valorTotal)}
                          </div>
                          <div
                            className={
                              "w-12 rounded-t transition-all duration-500 hover:opacity-80 border border-blue-700"
                            }
                            style={{
                              height: `${Math.max(height, 20)}px`,
                              backgroundColor: "rgba(37, 99, 235, 0.6)", // Azul-500 com 60% de opacidade
                            }}
                            title={`${engineer.engenheiro}: ${formatCurrency(
                              engineer.valorTotal
                            )}`}
                          ></div>
                          <div className="text-xs text-gray-700 font-medium text-center w-16 leading-tight">
                            {engineer.engenheiro.split(" ")[0]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Maior Faturamento:</span>
                      <div className="font-semibold text-green-600">
                        {
                          filteredData.reduce((max, curr) =>
                            curr.valorTotal > max.valorTotal ? curr : max
                          ).engenheiro
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Geral:</span>
                      <div className="font-semibold text-blue-600">
                        {formatCurrency(
                          filteredData.reduce(
                            (sum, curr) => sum + curr.valorTotal,
                            0
                          )
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
