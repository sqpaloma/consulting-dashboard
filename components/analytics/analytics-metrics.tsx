import { BarChart3, Wrench, Users, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AnalyticsMetricsProps {
  uploadedData: any[];
}

export function AnalyticsMetrics({ uploadedData }: AnalyticsMetricsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calculate metrics
  const totalRegistros = uploadedData.reduce(
    (sum, row) => sum + row.registros,
    0
  );
  const totalServicos = uploadedData.reduce(
    (sum, row) => sum + row.servicos,
    0
  );
  const totalPecas = uploadedData.reduce((sum, row) => sum + row.pecas, 0);
  const valorTotalFaturado = uploadedData.reduce(
    (sum, row) => sum + row.valorTotal,
    0
  );
  const valorTotalOrcamentos = uploadedData.reduce(
    (sum, row) => sum + row.valorOrcamentos,
    0
  );

  // Calcular taxa de conversão geral
  const totalOrcamentos = uploadedData.reduce(
    (sum, row) => sum + row.projetos,
    0
  );
  const totalFaturados = uploadedData.reduce(
    (sum, row) => sum + row.quantidade,
    0
  );
  const taxaConversao =
    totalOrcamentos > 0 ? (totalFaturados / totalOrcamentos) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {uploadedData.length === 0 ? (
        <div className="col-span-full text-center">
          <p className="text-gray-400">
            Faça upload de uma planilha para visualizar os dados.
          </p>
        </div>
      ) : (
        <>
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">
                  Total de Registros
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {totalRegistros}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Wrench className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">
                  Total Serviços
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {totalServicos}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Users className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-600">
                  Total Peças
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {totalPecas}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">
                  Valor Total Faturado
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {formatCurrency(valorTotalFaturado)}
              </div>
              <div className="text-sm text-gray-500">
                De {formatCurrency(valorTotalOrcamentos)} em orçamentos
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-600">
                  Taxa de Conversão Geral
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {taxaConversao.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">
                {totalFaturados} de {totalOrcamentos} orçamentos
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
