import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CalendarItem } from "./types";
import { SortableActivityCard } from "./sortable-activity-card";

interface ActivityCardProps {
  activities: CalendarItem[];
  completedActivities: Set<string>;
  getStatusColor: (status: string) => string;
  completeActivity: (id: string) => void;
  uncompleteActivity: (id: string) => void;
  sensors: any;
  onDragEnd: (event: DragEndEvent) => void;
}

export function ActivityCard({
  activities,
  completedActivities,
  getStatusColor,
  completeActivity,
  uncompleteActivity,
  sensors,
  onDragEnd,
}: ActivityCardProps) {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={activities.map((activity) => activity.id)}
        strategy={verticalListSortingStrategy}
      >
        {activities.map((activity, index) => (
          <SortableActivityCard
            key={`activity-${activity.id}-${index}`}
            activity={activity}
            index={index}
            completedActivities={completedActivities}
            getStatusColor={getStatusColor}
            completeActivity={completeActivity}
            uncompleteActivity={uncompleteActivity}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
