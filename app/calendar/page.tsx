import { CalendarMain } from "@/components/calendar/calendar-main";
import { ResponsiveLayout } from "@/components/responsive-layout";

export default function CalendarPage() {
  return (
    <ResponsiveLayout title="Organize-se">
      <CalendarMain />
    </ResponsiveLayout>
  );
}
