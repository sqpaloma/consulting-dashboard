import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";


interface ActivityHeaderProps {
  isLoading: boolean;
  completedActivities: Set<string>;
  onClearCompleted: () => void;
}

export function ActivityHeader({
  isLoading,
  completedActivities,
  onClearCompleted,
}: ActivityHeaderProps) {


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
    </CardHeader>
  );
}
