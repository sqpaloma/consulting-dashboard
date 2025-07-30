import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { CalendarItem } from "./types";

interface SortableActivityCardProps {
  activity: CalendarItem;
  index: number;
  completedActivities: Set<string>;
  getStatusColor: (status: string) => string;
  completeActivity: (id: string) => void;
  uncompleteActivity: (id: string) => void;
}

export function SortableActivityCard({
  activity,
  index,
  completedActivities,
  getStatusColor,
  completeActivity,
  uncompleteActivity,
}: SortableActivityCardProps) {
  const isCompleted = completedActivities.has(activity.id);
  const shouldDisableDrag = isCompleted;
  const [isDragging, setIsDragging] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: dndIsDragging,
  } = useSortable({
    id: activity.id,
    disabled: shouldDisableDrag,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: dndIsDragging ? 0.5 : 1,
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Se o clique foi em um botão, não inicia o drag
    if ((e.target as HTMLElement).closest("button")) {
      e.stopPropagation();
      return;
    }

    // Marca que pode ser um drag
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Se moveu o mouse, é um drag
    setIsDragging(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Se o clique foi em um botão, não executa a ação do card
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }

    // Se não estava arrastando, executa a ação de concluir
    if (!isDragging) {
      if (completedActivities.has(activity.id)) {
        uncompleteActivity(activity.id);
      } else {
        completeActivity(activity.id);
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(shouldDisableDrag ? {} : attributes)}
      {...(shouldDisableDrag ? {} : listeners)}
      className={`rounded-lg p-4 border transition-all duration-200 hover:shadow-md ${
        completedActivities.has(activity.id)
          ? "bg-green-50 border-green-200 opacity-75"
          : getStatusColor(activity.status)
      } ${dndIsDragging ? "shadow-lg" : ""} ${
        shouldDisableDrag
          ? "cursor-not-allowed"
          : "cursor-grab active:cursor-grabbing"
      }`}
      title={
        shouldDisableDrag
          ? "Atividade concluída - não pode ser movida"
          : completedActivities.has(activity.id)
            ? "Clique em qualquer lugar para desmarcar como concluída"
            : "Clique em qualquer lugar para marcar como concluída"
      }
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-800">{activity.titulo}</h4>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
            <span>OS: {activity.os}</span>
            <span>Cliente: {activity.cliente}</span>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {activity.prazo}
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                completedActivities.has(activity.id)
                  ? "bg-green-100 text-green-800"
                  : activity.status.toLowerCase().includes("concluído") ||
                      activity.status.toLowerCase().includes("concluido")
                    ? "bg-green-100 text-green-800"
                    : activity.status.toLowerCase().includes("andamento") ||
                        activity.status.toLowerCase().includes("execução") ||
                        activity.status.toLowerCase().includes("execucao")
                      ? "bg-blue-100 text-blue-800"
                      : activity.status.toLowerCase().includes("pendente") ||
                          activity.status.toLowerCase().includes("aguardando")
                        ? "bg-blue-100 text-blue-800"
                        : activity.status.toLowerCase().includes("revisão") ||
                            activity.status.toLowerCase().includes("revisao") ||
                            activity.status.toLowerCase().includes("análise") ||
                            activity.status.toLowerCase().includes("analise")
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
              }`}
            >
              {completedActivities.has(activity.id)
                ? "CONCLUÍDO"
                : activity.status}
            </span>
            {completedActivities.has(activity.id) && (
              <span className="text-xs text-green-600 font-medium">
                ✓ Concluído
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (completedActivities.has(activity.id)) {
                uncompleteActivity(activity.id);
              } else {
                completeActivity(activity.id);
              }
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            data-no-dnd="true"
            className={`p-2 rounded-full transition-all duration-200 pointer-events-auto ${
              completedActivities.has(activity.id)
                ? "bg-green-100 text-green-600 hover:bg-green-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title={
              completedActivities.has(activity.id)
                ? "Desmarcar como concluída"
                : "Marcar como concluída"
            }
          >
            {completedActivities.has(activity.id) ? (
              <div className="w-4 h-4 flex items-center justify-center">✓</div>
            ) : (
              <div className="w-4 h-4 flex items-center justify-center">○</div>
            )}
          </button>
          <div className="relative group">
            <Avatar className="w-8 h-8 border-2 border-white transition-all duration-200">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>
                {activity.cliente.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  );
}
