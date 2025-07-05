import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsRankingProps {
  uploadedData: any[];
}

export function AnalyticsRanking({ uploadedData }: AnalyticsRankingProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Change topEngineers to show all engineers instead of just top 5
  const allEngineers = uploadedData.sort((a, b) => {
    // Default to orcamento filter
    return b.projetos - a.projetos;
  });

  const topEngineersFilter = "orcamento"; // This would come from props in a real implementation

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800">
              Ranking de Engenheiros
            </CardTitle>
            <p className="text-sm text-gray-500">
              {topEngineersFilter === "orcamento"
                ? "Por quantidade de orçamentos"
                : "Por faturamento"}
            </p>
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
                    {topEngineersFilter === "orcamento"
                      ? "Filtro: Quantidade de Orçamentos"
                      : "Filtro: Faturamento"}
                  </h4>
                  <div className="text-sm text-blue-700">
                    {topEngineersFilter === "orcamento" ? (
                      <div className="space-y-1">
                        <p>
                          <strong>Contabiliza apenas:</strong> Linhas com
                          "Orçamento de Venda" na coluna Descrição
                        </p>
                        <p>
                          <strong>Métrica:</strong> Número total de orçamentos
                          elaborados por engenheiro
                        </p>
                        <p>
                          <strong>Objetivo:</strong> Medir produtividade na
                          elaboração de propostas comerciais
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p>
                          <strong>Contabiliza apenas:</strong> Linhas com "Venda
                          de Serviços" + "Venda Normal" na coluna Descrição
                        </p>
                        <p>
                          <strong>Métrica:</strong> Número de vendas efetivadas
                          e valor total faturado
                        </p>
                        <p>
                          <strong>Objetivo:</strong> Medir performance comercial
                          e receita gerada
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo estatístico */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {topEngineersFilter === "orcamento"
                    ? uploadedData.reduce((sum, eng) => sum + eng.projetos, 0)
                    : uploadedData.reduce(
                        (sum, eng) => sum + eng.quantidade,
                        0
                      )}
                </div>
                <div className="text-sm text-gray-600">
                  {topEngineersFilter === "orcamento"
                    ? "Total de Orçamentos"
                    : "Total de Vendas"}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {topEngineersFilter === "orcamento"
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
                  {topEngineersFilter === "orcamento"
                    ? "Valor em Orçamentos"
                    : "Valor Faturado"}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {allEngineers.length}
                </div>
                <div className="text-sm text-gray-600">Engenheiros Ativos</div>
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
                    {topEngineersFilter === "orcamento" ? (
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
                          <span className="text-xs text-gray-600">
                            Ticket médio:
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
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">
                        Taxa de Conversão
                      </span>
                      <span className="text-xs text-gray-600">
                        {topEngineersFilter === "orcamento"
                          ? `${
                              engineer.projetos > 0
                                ? Math.round(
                                    (engineer.quantidade / engineer.projetos) *
                                      100
                                  )
                                : 0
                            }%`
                          : `${
                              engineer.projetos > 0
                                ? Math.round(
                                    (engineer.valorTotal /
                                      engineer.valorOrcamentos) *
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
                            topEngineersFilter === "orcamento"
                              ? engineer.projetos > 0
                                ? Math.min(
                                    (engineer.quantidade / engineer.projetos) *
                                      100,
                                    100
                                  )
                                : 0
                              : engineer.valorOrcamentos > 0
                              ? Math.min(
                                  (engineer.valorTotal /
                                    engineer.valorOrcamentos) *
                                    100,
                                  100
                                )
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      {topEngineersFilter === "orcamento"
                        ? `${engineer.quantidade} vendas de ${engineer.projetos} orçamentos`
                        : `${formatCurrency(
                            engineer.valorTotal
                          )} de ${formatCurrency(
                            engineer.valorOrcamentos
                          )} orçados`}
                    </div>
                  </div>
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
