import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AnalyticsLossAnalysisProps {
  lossAnalysis: {
    totalOrcamentos: number;
    totalVendas: number;
    perdidos: number;
    taxaConversao: number;
    motivosPerdas: { [key: string]: number };
    detalhePerdas: Array<{
      engenheiro: string;
      orcamento: string;
      valor: number;
      motivo: string;
      observacao?: string;
    }>;
  };
  onClose: () => void;
}

export function AnalyticsLossAnalysis({
  lossAnalysis,
  onClose,
}: AnalyticsLossAnalysisProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card className="bg-white border-l-4 border-l-red-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800 flex items-center space-x-2">
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span>Análise de Motivos de Perda</span>
            </CardTitle>
            <p className="text-sm text-gray-500">
              Análise detalhada dos orçamentos não convertidos
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumo Geral */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {lossAnalysis.totalOrcamentos}
            </div>
            <div className="text-sm text-gray-600">Total Orçamentos</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {lossAnalysis.totalVendas}
            </div>
            <div className="text-sm text-gray-600">Vendas Convertidas</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {lossAnalysis.perdidos}
            </div>
            <div className="text-sm text-gray-600">Orçamentos Perdidos</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {lossAnalysis.taxaConversao.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Taxa de Conversão</div>
          </div>
        </div>

        {/* Gráfico de Motivos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Principais Motivos de Perda
            </h3>
            <div className="space-y-3">
              {Object.entries(lossAnalysis.motivosPerdas)
                .sort(([, a], [, b]) => b - a)
                .map(([motivo, quantidade], index) => {
                  const percentage =
                    lossAnalysis.perdidos > 0
                      ? (quantidade / lossAnalysis.perdidos) * 100
                      : 0;
                  const colors = [
                    "bg-red-500",
                    "bg-orange-500",
                    "bg-yellow-500",
                    "bg-blue-500",
                    "bg-purple-500",
                    "bg-pink-500",
                    "bg-gray-500",
                  ];
                  return (
                    <div key={motivo} className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded ${
                          colors[index % colors.length]
                        }`}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {motivo}
                          </span>
                          <span className="text-sm text-gray-600">
                            {quantidade} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              colors[index % colors.length]
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recomendações de Melhoria
            </h3>
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <svg
                    className="h-5 w-5 text-yellow-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <div className="font-medium text-yellow-800">
                      Preço muito alto (35%)
                    </div>
                    <div className="text-sm text-yellow-700">
                      Revisar estratégia de precificação e destacar valor
                      agregado
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <svg
                    className="h-5 w-5 text-blue-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <div className="font-medium text-blue-800">
                      Concorrência (25%)
                    </div>
                    <div className="text-sm text-blue-700">
                      Melhorar análise competitiva e diferenciação
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <svg
                    className="h-5 w-5 text-green-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <div className="font-medium text-green-800">
                      Follow-up (4%)
                    </div>
                    <div className="text-sm text-green-700">
                      Implementar CRM para melhor acompanhamento
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela Detalhada */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Detalhamento por Orçamento Perdido
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orçamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engenheiro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Observação
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 max-h-64 overflow-y-auto">
                {lossAnalysis.detalhePerdas.slice(0, 10).map((perda, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {perda.orcamento}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {perda.engenheiro}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(perda.valor)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          perda.motivo === "Preço muito alto"
                            ? "bg-red-100 text-red-800"
                            : perda.motivo === "Cliente escolheu concorrente"
                            ? "bg-orange-100 text-orange-800"
                            : perda.motivo === "Projeto cancelado/adiado"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {perda.motivo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {perda.observacao || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lossAnalysis.detalhePerdas.length > 10 && (
              <div className="text-center py-2 text-sm text-gray-500">
                Mostrando 10 de {lossAnalysis.detalhePerdas.length} registros
              </div>
            )}
          </div>
        </div>

        {/* Ações Recomendadas */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Ações Recomendadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  Revisar política de preços para ser mais competitivo
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  Implementar análise de concorrentes antes do orçamento
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  Criar processo de follow-up estruturado
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  Treinar equipe em técnicas de negociação
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  Melhorar qualificação de leads antes do orçamento
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  Implementar CRM para melhor gestão de oportunidades
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
