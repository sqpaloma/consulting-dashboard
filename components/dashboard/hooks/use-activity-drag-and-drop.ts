import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { CalendarItem } from "../types";

export function useActivityDragAndDrop(
  todayActivities: CalendarItem[],
  completedActivities: Set<string>,
  onOrderChange: (newOrder: CalendarItem[]) => void
) {
  // Configuração dos sensors para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduzido para ser mais responsivo
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Função para lidar com o fim do drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = todayActivities.findIndex(
        (item) => item.id === active.id
      );
      const newIndex = todayActivities.findIndex(
        (item) => item.id === over?.id
      );

      const newOrder = arrayMove(todayActivities, oldIndex, newIndex);

      // Garante que atividades concluídas sempre fiquem no final
      const pendingActivities = newOrder.filter(
        (item) => !completedActivities.has(item.id)
      );
      const completedActivitiesList = newOrder.filter((item) =>
        completedActivities.has(item.id)
      );
      const finalOrder = [...pendingActivities, ...completedActivitiesList];

      // Salva apenas a ordem das atividades pendentes no localStorage
      const today = new Date();
      // Converte para horário de Brasília (UTC-3)
      const todayBrasilia = new Date(
        today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
      );
      const todayKey = todayBrasilia.toISOString().split("T")[0];
      const pendingOrderIds = pendingActivities.map((item) => item.id);
      localStorage.setItem(
        `activityOrder_${todayKey}`,
        JSON.stringify(pendingOrderIds)
      );

      // Notifica o componente pai sobre a nova ordem
      onOrderChange(finalOrder);
    }
  };

  return {
    sensors,
    handleDragEnd,
  };
}
