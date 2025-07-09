import { CalendarMain } from "@/components/calendar/calendar-main";
import { ResponsiveLayout } from "@/components/responsive-layout";

export default function CalendarPage() {
  return (
    <ResponsiveLayout title="Calendário & Tarefas">
      <CalendarMain />
    </ResponsiveLayout>
  );
}
