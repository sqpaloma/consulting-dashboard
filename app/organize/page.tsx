import { ResponsiveLayout } from "@/components/responsive-layout";
import { CalendarCombined } from "@/components/calendar/calendar-combined";

export default function CalendarPage() {
  return (
    <ResponsiveLayout
      title="Organize-se"
      subtitle="Converse, anote e organize suas tarefas em um só lugar"
    >
      <CalendarCombined />
    </ResponsiveLayout>
  );
}
