import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw } from "lucide-react";

import { CalendarItem } from "./types";

interface ActivityHeaderProps {
  isLoading: boolean;
  todayActivities: CalendarItem[];
  todayBrasilia: Date;
  completedActivities: Set<string>;
  onRefresh: () => void;
  onClearCompleted: () => void;
}

export function ActivityHeader({
  isLoading,
  todayActivities,
  todayBrasilia,
  completedActivities,
  onRefresh,
  onClearCompleted,
}: ActivityHeaderProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    });
  };

  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-xl text-gray-800 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Planejador de Atividades Diárias
          {isLoading && (
            <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            {isLoading ? "Carregando..." : "Atualizar"}
          </Button>
          {completedActivities.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearCompleted}
              className="text-xs text-red-600 hover:text-red-700"
              title="Limpar todas as atividades concluídas"
            >
              Limpar Concluídas
            </Button>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        {formatDate(todayBrasilia)} - {todayActivities.length} atividade(s)
        agendada(s)
      </p>
    </CardHeader>
  );
}
