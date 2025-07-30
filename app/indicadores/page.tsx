import { ProductionDashboard } from "@/components/dashboard/production-dashboard";
import { ResponsiveLayout } from "@/components/responsive-layout";

export default function IndicadoresPage() {
  return (
    <ResponsiveLayout title="Indicadores" subtitle="Dashboard de Produção">
      <ProductionDashboard />
    </ResponsiveLayout>
  );
}
