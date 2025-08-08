import { KanbanMain } from "@/components/kanban/kanban-main";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { ChatEmbedded } from "@/components/chat";

export default function CalendarPage() {
  return (
    <ResponsiveLayout title="Organize-se">
      <div className="space-y-4">
        {/* Chat acima das tarefas */}
        <ChatEmbedded />
        {/* Tarefas (Kanban + Notas) abaixo */}
        <KanbanMain />
      </div>
    </ResponsiveLayout>
  );
}
