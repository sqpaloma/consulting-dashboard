import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsAdminDataProps {
  uploadedData: any[];
}

export function AnalyticsAdminData({ uploadedData }: AnalyticsAdminDataProps) {
  // Calculate metrics
  const totalRegistros = uploadedData.reduce(
    (sum, row) => sum + row.registros,
    0
  );

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">
          Dados Administrativos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <span className="text-sm text-gray-600">Total de registros:</span>
            <span className="text-2xl font-bold text-gray-800">
              {totalRegistros}
            </span>
          </div>
          <div className="space-y-2">
            <span className="text-sm text-gray-600">
              Registros processados:
            </span>
            <span className="text-2xl font-bold text-green-600">
              {Math.floor(totalRegistros * 0.8)}
            </span>
          </div>
          <div className="space-y-2">
            <span className="text-sm text-gray-600">Registros pendentes:</span>
            <span className="text-2xl font-bold text-orange-600">
              {Math.floor(totalRegistros * 0.2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
