import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

import { CalendarItem } from "./types";

interface ActivityHeaderProps {
  isLoading: boolean;
  todayActivities: CalendarItem[];
  todayBrasilia: Date;
  completedActivities: Set<string>;
  onClearCompleted: () => void;
}

export function ActivityHeader({
  isLoading,
  todayActivities,
  todayBrasilia,
  completedActivities,
  onClearCompleted,
}: ActivityHeaderProps) {
  const getCurrentWeek = (date: Date) => {
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    return { start: monday, end: friday };
  };

  const formatWeekRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
      timeZone: "America/Sao_Paulo",
    });
    const endStr = end.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    });
    return `${startStr} - ${endStr}`;
  };


  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-xl text-gray-800 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Agenda Semanal
          {isLoading && (
            <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}
        </CardTitle>
        <div className="flex items-center space-x-2">
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
        {(() => {
          const currentWeek = getCurrentWeek(todayBrasilia);
          return formatWeekRange(currentWeek.start, currentWeek.end);
        })()} - {todayActivities.length} atividade(s) agendada(s)
      </p>
    </CardHeader>
  );
}
