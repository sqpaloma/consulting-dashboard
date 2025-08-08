import { ConsultingDashboard } from "@/components/dashboard";
import { AdminProtection } from "@/components/admin-protection";

export default function Home() {
  return (
    <AdminProtection
      allowedRoles={["consultor", "gerente", "diretor", "admin"]}
    >
      <ConsultingDashboard />
    </AdminProtection>
  );
}
