import { KanbanMain } from "@/components/kanban/kanban-main";
import { ResponsiveLayout } from "@/components/responsive-layout";

export default function CalendarPage() {
  return (
    <ResponsiveLayout title="Organize-se">
      <KanbanMain />
    </ResponsiveLayout>
  );
}
