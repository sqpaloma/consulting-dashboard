import { AnalyticsPage } from "@/components/analytics/analytics-page";
import { AdminProtection } from "@/components/admin-protection";

export default function Analytics() {
  return (
    <AdminProtection>
      <AnalyticsPage />
    </AdminProtection>
  );
}
