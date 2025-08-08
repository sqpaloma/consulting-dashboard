import { ProductionDashboard } from "@/components/dashboard/production-dashboard";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { AdminProtection } from "@/components/admin-protection";

export default function IndicadoresPage() {
  return (
    <AdminProtection
      allowedRoles={["qualidade_pcp", "gerente", "diretor", "admin"]}
    >
      <ResponsiveLayout title="Indicadores" subtitle="Dashboard de Produção">
        <ProductionDashboard />
      </ResponsiveLayout>
    </AdminProtection>
  );
}
