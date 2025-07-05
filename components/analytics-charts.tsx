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

  // Filter data function - simplified for now
  const filteredData = uploadedData;

  return (
    <div className="space-y-6">
      {/* Performance Chart - Full Width */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">
            Desempenho por Engenheiro
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
                      const colors = [
                        "bg-blue-500",
                        "bg-green-500",
                        "bg-purple-500",
                        "bg-orange-500",
                        "bg-red-500",
                      ];

                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center space-y-2 flex-shrink-0"
                        >
                          <div className="text-xs text-gray-600 font-medium text-center w-16">
                            {formatCurrency(engineer.valorTotal)}
                          </div>
                          <div
                            className={`w-12 ${
                              colors[index % colors.length]
                            } rounded-t transition-all duration-500 hover:opacity-80`}
                            style={{ height: `${Math.max(height, 20)}px` }}
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
