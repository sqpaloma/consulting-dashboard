import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, FileText, AlertCircle } from "lucide-react";
import { useState } from "react";

interface RawDataRow {
  responsavel: string;
  cliente: string;
  ano: number;
  mes: number;
  valor: number;
  descricao: string;
  orcamentoId: string | null;
  isOrcamento: boolean;
  isVendaNormal: boolean;
  isVendaServicos: boolean;
}

interface AnalyticsClientAnalysisProps {
  uploadedData: any[];
  rawData?: RawDataRow[];
}

export function AnalyticsClientAnalysis({
  uploadedData,
  rawData,
}: AnalyticsClientAnalysisProps) {
  const [activeTab, setActiveTab] = useState<"faturamento" | "orcamentos">(
    "faturamento"
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Processar dados dos clientes usando dados brutos se disponíveis
  const clientesMap = new Map();
  let hasClientData = false;

  if (rawData && rawData.length > 0) {
    // Usar dados brutos para análise mais precisa
    const uniqueConversions = new Map<string, Set<string>>();
    const uniqueOrcamentos = new Map<string, Set<string>>();

    rawData.forEach((row) => {
      const cliente = row.cliente || "Cliente não informado";

      if (row.cliente && row.cliente !== "Cliente não informado") {
        hasClientData = true;
      }

      if (!clientesMap.has(cliente)) {
        clientesMap.set(cliente, {
          cliente,
          orcamentos: 0,
          valorOrcamentos: 0,
          faturamentos: 0,
          valorFaturamentos: 0,
        });
        uniqueConversions.set(cliente, new Set());
        uniqueOrcamentos.set(cliente, new Set());
      }

      const existing = clientesMap.get(cliente);
      const conversionsSet = uniqueConversions.get(cliente);
      const orcamentosSet = uniqueOrcamentos.get(cliente);

      if (row.isOrcamento) {
        existing.valorOrcamentos += row.valor;
        // Contar orçamentos únicos por ID se disponível
        if (row.orcamentoId && orcamentosSet) {
          orcamentosSet.add(row.orcamentoId);
        } else {
          existing.orcamentos += 1;
        }
      } else if (row.isVendaNormal || row.isVendaServicos) {
        existing.valorFaturamentos += row.valor;

        // Contar conversões únicas por ID de orçamento
        if (row.orcamentoId && conversionsSet) {
          conversionsSet.add(row.orcamentoId);
        } else {
          // Fallback: incrementar diretamente se não tiver ID
          existing.faturamentos += 1;
        }
      }
    });

    // Atualizar as quantidades com base nos orçamentos únicos
    clientesMap.forEach((cliente, nomeCliente) => {
      const conversionsSet = uniqueConversions.get(nomeCliente);
      const orcamentosSet = uniqueOrcamentos.get(nomeCliente);

      // Usar orçamentos únicos se disponível
      if (orcamentosSet && orcamentosSet.size > 0) {
        cliente.orcamentos = orcamentosSet.size;
      }

      // Usar conversões únicas se disponível
      if (conversionsSet && conversionsSet.size > 0) {
        cliente.faturamentos = conversionsSet.size;
      }
    });
  }

  const clientes = Array.from(clientesMap.values());

  // Top 5 clientes por faturamento
  const topClientesFaturamento = clientes
    .sort((a, b) => b.faturamentos - a.faturamentos)
    .slice(0, 5);

  // Top 5 clientes por orçamentos não convertidos
  const topClientesOrcamentosNaoConvertidos = clientes
    .map((cliente) => ({
      ...cliente,
      orcamentosNaoConvertidos: Math.max(
        0,
        cliente.orcamentos - cliente.faturamentos
      ),
    }))
    .sort((a, b) => b.orcamentosNaoConvertidos - a.orcamentosNaoConvertidos)
    .slice(0, 5);

  // Se não há dados de cliente disponíveis, mostrar aviso
  if (!hasClientData) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">
            Análise de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Dados de Cliente Indisponíveis
            </h3>
            <p className="text-gray-500 text-center mb-4">
              {rawData && rawData.length > 0
                ? "A planilha não contém informações da coluna 'Nome Parceiro (Parceiro)' ou os dados estão vazios."
                : "Para ver a análise de clientes com dados salvos, execute primeiro a migração do banco de dados."}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="text-blue-800">
                <strong>Solução:</strong>{" "}
                {rawData && rawData.length > 0
                  ? "Certifique-se de que a planilha contém a coluna 'Nome Parceiro (Parceiro)' com os dados preenchidos."
                  : "Execute a migração do banco (scripts/migrate-analytics-add-cliente.sql) e faça novo upload dos dados."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800">
              Análise de Clientes
            </CardTitle>
          </div>
          {/* Tabs */}
          <div className="relative bg-gray-200 rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab("faturamento")}
              className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                activeTab === "faturamento"
                  ? "text-green-700 bg-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Faturamento
            </button>
            <button
              onClick={() => setActiveTab("orcamentos")}
              className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                activeTab === "orcamentos"
                  ? "text-orange-700 bg-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <FileText className="h-3 w-8 inline mr-1" />
              Não Aprovados
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === "faturamento" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Clientes por Faturamento
                </h3>
              </div>

              <div className="space-y-3">
                {topClientesFaturamento.map((cliente, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 truncate max-w-[300px]">
                          {cliente.cliente}
                        </div>
                        <div className="text-sm text-gray-600">
                          {cliente.faturamentos} faturamentos
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(cliente.valorFaturamentos)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "orcamentos" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>

              <div className="space-y-3">
                {topClientesOrcamentosNaoConvertidos.map((cliente, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 truncate max-w-[300px]">
                          {cliente.cliente}
                        </div>
                        <div className="text-sm text-gray-600">
                          {cliente.orcamentos} orçamentos |{" "}
                          {cliente.faturamentos} convertidos
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-orange-600">
                        {cliente.orcamentosNaoConvertidos} não convertidos
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(
                          cliente.valorOrcamentos - cliente.valorFaturamentos
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
