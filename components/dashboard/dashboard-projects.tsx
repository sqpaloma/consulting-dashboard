"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid3X3, BarChart3, TrendingUp, TrendingDown } from "lucide-react";

export function TotalProjectsCard() {
  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Total de Projetos</div>
            <div className="text-2xl font-bold text-gray-800">24</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +10% aumento em relação ao mês passado
            </div>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Grid3X3 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <BarChart3 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CompletedProjectsCard() {
  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <div className="text-sm text-gray-500">Concluídos</div>
        <div className="text-2xl font-bold text-gray-800">5</div>
        <div className="flex items-center text-xs text-red-600">
          <TrendingDown className="h-3 w-3 mr-1" />
          -5% comparado ao mês passado
        </div>
      </CardContent>
    </Card>
  );
}

// Mantendo o componente original para compatibilidade
export function DashboardProjects() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TotalProjectsCard />
      <CompletedProjectsCard />
    </div>
  );
}
