import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface AnalyticsRankingProps {
  uploadedData: any[];
}

export function AnalyticsRanking({ uploadedData }: AnalyticsRankingProps) {
  const [filterType, setFilterType] = useState<"orcamento" | "faturamento">(
    "orcamento"
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Change topEngineers to show all engineers instead of just top 5
  const allEngineers = uploadedData.sort((a, b) => {
    // Sort based on selected filter
    if (filterType === "orcamento") {
      // Sort by conversion rate (quantidade/projetos) for orçamento filter
      const rateA = a.projetos > 0 ? a.quantidade / a.projetos : 0;
      const rateB = b.projetos > 0 ? b.quantidade / b.projetos : 0;
      return rateB - rateA;
    } else {
      return b.valorTotal - a.valorTotal;
    }
  });

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800">
              Ranking de Colaboradores
            </CardTitle>
            <p className="text-sm text-gray-500">
              {filterType === "orcamento"
                ? "Por quantidade de orçamentos"
                : "Por faturamento"}
            </p>
          </div>

          {/* Filter buttons */}
          <div className="flex items-center space-x-2">
            <div className="relative bg-gray-200 rounded-lg p-1 flex">
              <button
                onClick={() => setFilterType("orcamento")}
                className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  filterType === "orcamento"
                    ? "text-blue-700 bg-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Orçamento
              </button>
              <button
                onClick={() => setFilterType("faturamento")}
                className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  filterType === "faturamento"
                    ? "text-blue-700 bg-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Faturamento
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {allEngineers.length > 0 ? (
          <div className="space-y-6">
            {/* Legenda explicativa */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    {filterType === "orcamento"
                      ? "Filtro: Quantidade de Orçamentos"
                      : "Filtro: Faturamento"}
                  </h4>
                  <div className="text-sm text-blue-700">
                    {filterType === "orcamento" ? (
                      <div className="space-y-1"></div>
                    ) : (
                      <div className="space-y-1"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo estatístico */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {filterType === "orcamento"
                    ? uploadedData.reduce((sum, eng) => sum + eng.projetos, 0)
                    : uploadedData.reduce(
                        (sum, eng) => sum + eng.quantidade,
                        0
                      )}
                </div>
                <div className="text-sm text-gray-600">
                  {filterType === "orcamento"
                    ? "Total de Orçamentos"
                    : "Total de Vendas"}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filterType === "orcamento"
                    ? formatCurrency(
                        uploadedData.reduce(
                          (sum, eng) => sum + eng.valorOrcamentos,
                          0
                        )
                      )
                    : formatCurrency(
                        uploadedData.reduce(
                          (sum, eng) => sum + eng.valorTotal,
                          0
                        )
                      )}
                </div>
                <div className="text-sm text-gray-600">
                  {filterType === "orcamento"
                    ? "Valor em Orçamentos"
                    : "Valor Faturado"}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {allEngineers.length}
                </div>
                <div className="text-sm text-gray-600">
                  Colaboradores Ativos
                </div>
              </div>
            </div>

            {/* Lista de engenheiros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {allEngineers.map((engineer, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                            ? "bg-gray-400"
                            : index === 2
                            ? "bg-orange-600"
                            : "bg-blue-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">
                          {engineer.engenheiro}
                        </div>
                      </div>
                    </div>
                    {index < 3 && (
                      <div className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                        Top {index + 1}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {filterType === "orcamento" ? (
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Orçamentos:
                          </span>
                          <span className="font-semibold text-lg text-gray-800">
                            {engineer.projetos}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Valor total:
                          </span>
                          <span className="font-medium text-sm text-green-600">
                            {formatCurrency(engineer.valorOrcamentos)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Média/orçamento:
                          </span>
                          <span className="font-medium text-sm text-blue-600">
                            {engineer.projetos > 0
                              ? formatCurrency(
                                  engineer.valorOrcamentos / engineer.projetos
                                )
                              : "R$ 0"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Vendas:</span>
                          <span className="font-semibold text-lg text-gray-800">
                            {engineer.quantidade}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Faturamento:
                          </span>
                          <span className="font-medium text-sm text-green-600">
                            {formatCurrency(engineer.valorTotal)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100">
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Peças</div>
                            <div className="font-medium text-xs text-purple-600">
                              {formatCurrency(engineer.valorPecas)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">
                              Serviços
                            </div>
                            <div className="font-medium text-xs text-orange-600">
                              {formatCurrency(engineer.valorServicos)}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            Ticket médio:
                            <div className="relative group">
                              <svg
                                className="w-3 h-3 text-gray-400 cursor-help"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                Valor total ÷ Número de vendas
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </span>
                          <span className="font-medium text-xs text-blue-600">
                            {engineer.quantidade > 0
                              ? formatCurrency(
                                  engineer.valorTotal / engineer.quantidade
                                )
                              : "R$ 0"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Barra de progresso relativa - Taxa de Conversão */}
                  {filterType === "orcamento" && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">
                          Taxa de Conversão
                        </span>
                        <span className="text-xs text-gray-600">
                          {`${
                            engineer.projetos > 0
                              ? Math.round(
                                  (engineer.quantidade / engineer.projetos) *
                                    100
                                )
                              : 0
                          }%`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                              ? "bg-gray-400"
                              : index === 2
                              ? "bg-orange-600"
                              : "bg-blue-500"
                          }`}
                          style={{
                            width: `${
                              engineer.projetos > 0
                                ? Math.min(
                                    (engineer.quantidade / engineer.projetos) *
                                      100,
                                    100
                                  )
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-center">
                        {`${engineer.quantidade} vendas de ${engineer.projetos} orçamentos`}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <BarChart3 className="h-16 w-16 mx-auto" />
            </div>
            <p className="text-gray-500 font-medium">Nenhum dado disponível</p>
            <p className="text-sm text-gray-400 mt-2">
              Faça upload de uma planilha para visualizar o ranking
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
