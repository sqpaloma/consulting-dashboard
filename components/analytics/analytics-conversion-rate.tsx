import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsConversionRateProps {
  uploadedData: any[];
}

export function AnalyticsConversionRate({
  uploadedData,
}: AnalyticsConversionRateProps) {
  const totalOrcamentos = uploadedData.reduce(
    (sum, eng) => sum + eng.projetos,
    0
  );
  const totalFaturamentos = uploadedData.reduce(
    (sum, eng) => sum + eng.quantidade,
    0
  );
  const conversionRate =
    totalOrcamentos > 0 ? (totalFaturamentos / totalOrcamentos) * 100 : 0;

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">
          Taxa de Conversão Geral
        </CardTitle>
        <p className="text-sm text-gray-500">Orçamentos vs Faturamentos</p>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-between h-[450px]">
        {/* Circular Progress - Even larger */}
        <div className="relative flex-1 flex items-center justify-center">
          <div className="w-72 h-72 relative">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="6"
              />
              {/* Progress circle - Changed to blue */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - conversionRate / 100)}`}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold text-gray-800">
                {Math.round(conversionRate)}%
              </span>
            </div>
          </div>
        </div>

        {/* Legend - Numbers next to names with dark gray font */}
        <div className="flex items-center justify-center space-x-12 mt-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-700">
                {totalOrcamentos}
              </span>
              <span className="text-gray-700">Orçamentos</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-700">
                {totalFaturamentos}
              </span>
              <span className="text-gray-700">Faturamentos</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
