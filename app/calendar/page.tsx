import { ResponsiveLayout } from "@/components/responsive-layout";
import { CalendarCombined } from "@/components/calendar/calendar-combined";

export default function CalendarPage() {
  return (
    <ResponsiveLayout title="Organize-se">
      <CalendarCombined />
    </ResponsiveLayout>
  );
}
