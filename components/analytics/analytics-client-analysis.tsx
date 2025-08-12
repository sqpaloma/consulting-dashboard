import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, FileText, AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import { useClientSummary } from "@/lib/convex-analytics-client";

interface RawDataRow {
  responsavel: string;
  cliente: string;
  ano: number;
  mes: number;
  valor: number;
  descricao: string;
  orcamentoId: string | undefined;
  isOrcamento: boolean;
  isVendaNormal: boolean;
  isVendaServicos: boolean;
}

interface AnalyticsClientAnalysisProps {
  uploadedData: any[];
  rawData?: RawDataRow[];
  // optional filters
  selectedYear?: string;
  selectedMonth?: string;
  selectedEngineer?: string;
}

export function AnalyticsClientAnalysis({
  uploadedData,
  rawData,
  selectedYear,
  selectedMonth,
  selectedEngineer,
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

  // Tentar buscar um resumo do servidor quando rawData não for passado
  const yearNum =
    selectedYear && selectedYear !== "todos" ? Number(selectedYear) : undefined;
  const monthNum =
    selectedMonth && selectedMonth !== "todos"
      ? Number(selectedMonth)
      : undefined;
  const engineer =
    selectedEngineer && selectedEngineer !== "todos"
      ? selectedEngineer
      : undefined;
  const serverSummary =
    useClientSummary({
      year: yearNum,
      month: monthNum,
      engineer,
      limit: 1000,
    }) || [];

  // Processar dados dos clientes usando dados brutos se disponíveis; caso contrário, usar o resumo do servidor
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
        if (row.orcamentoId && orcamentosSet) {
          orcamentosSet.add(row.orcamentoId);
        } else {
          existing.orcamentos += 1;
        }
      } else if (row.isVendaNormal || row.isVendaServicos) {
        existing.valorFaturamentos += row.valor;
        if (row.orcamentoId && conversionsSet) {
          conversionsSet.add(row.orcamentoId);
        } else {
          existing.faturamentos += 1;
        }
      }
    });

    // Atualizar as quantidades com base nos orçamentos únicos
    clientesMap.forEach((cliente, nomeCliente) => {
      const conversionsSet = uniqueConversions.get(nomeCliente);
      const orcamentosSet = uniqueOrcamentos.get(nomeCliente);
      if (orcamentosSet && orcamentosSet.size > 0) {
        cliente.orcamentos = orcamentosSet.size;
      }
      if (conversionsSet && conversionsSet.size > 0) {
        cliente.faturamentos = conversionsSet.size;
      }
    });
  } else if (serverSummary && serverSummary.length > 0) {
    // Fallback: usar resumo processado no servidor a partir do analyticsRawData
    hasClientData = true;
    for (const row of serverSummary as any[]) {
      clientesMap.set(row.cliente, {
        cliente: row.cliente,
        orcamentos: row.orcamentos,
        valorOrcamentos: row.valorOrcamentos,
        faturamentos: row.faturamentos,
        valorFaturamentos: row.valorFaturamentos,
      });
    }
  }

  const clientes = Array.from(clientesMap.values());

  // Listas completas ordenadas
  const faturamentoList = useMemo(
    () =>
      [...clientes].sort((a, b) => b.valorFaturamentos - a.valorFaturamentos),
    [clientes]
  );

  const orcamentosNaoConvertidosList = useMemo(
    () =>
      [...clientes]
        .map((c: any) => ({
          ...c,
          orcamentosNaoConvertidos: Math.max(0, c.orcamentos - c.faturamentos),
          valorNaoConvertido: Math.max(
            0,
            c.valorOrcamentos - c.valorFaturamentos
          ),
        }))
        .sort(
          (a, b) => b.orcamentosNaoConvertidos - a.orcamentosNaoConvertidos
        ),
    [clientes]
  );

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
                : "Sem dados de cliente suficientes para análise."}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="text-blue-800">
                <strong>Solução:</strong>{" "}
                {rawData && rawData.length > 0
                  ? "Certifique-se de que a planilha contém a coluna 'Nome Parceiro (Parceiro)' com os dados preenchidos."
                  : "Suba uma planilha com coluna de cliente ou ajuste os filtros."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Row renderers
  const renderFaturamentoRow = ({ index, style }: ListChildComponentProps) => {
    const cliente = faturamentoList[index] as any;
    return (
      <div style={style} className="flex items-center justify-between px-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {index + 1}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-gray-800 truncate max-w-[300px]">
              {cliente.cliente}
            </div>
            <div className="text-xs text-gray-600">
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
    );
  };

  const renderOrcamentoRow = ({ index, style }: ListChildComponentProps) => {
    const cliente = orcamentosNaoConvertidosList[index] as any;
    return (
      <div style={style} className="flex items-center justify-between px-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {index + 1}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-gray-800 truncate max-w-[300px]">
              {cliente.cliente}
            </div>
            <div className="text-xs text-gray-600">
              {cliente.orcamentos} orçamentos | {cliente.faturamentos}{" "}
              convertidos
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-orange-600">
            {cliente.orcamentosNaoConvertidos} não convertidos
          </div>
          <div className="text-xs text-gray-600">
            {formatCurrency(cliente.valorNaoConvertido)}
          </div>
        </div>
      </div>
    );
  };

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
        <div className="space-y-4">
          {activeTab === "faturamento" && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Clientes por Faturamento
                </h3>
              </div>
              <div className="border rounded-lg bg-gray-50">
                <div style={{ height: 380, width: "100%" }}>
                  <List
                    height={380}
                    width={"100%"}
                    itemCount={faturamentoList.length}
                    itemSize={56}
                  >
                    {renderFaturamentoRow}
                  </List>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orcamentos" && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Não Aprovados por Cliente
                </h3>
              </div>
              <div className="border rounded-lg bg-gray-50">
                <div style={{ height: 380, width: "100%" }}>
                  <List
                    height={380}
                    width={"100%"}
                    itemCount={orcamentosNaoConvertidosList.length}
                    itemSize={56}
                  >
                    {renderOrcamentoRow}
                  </List>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
