import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardGestao } from '@/components/dashboards/DashboardGestao';
import { DashboardComercial } from '@/components/dashboards/DashboardComercial';
import { DashboardMarketing } from '@/components/dashboards/DashboardMarketing';
import { DashboardLogistica } from '@/components/dashboards/DashboardLogistica';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

const roleLabels: Record<string, string> = {
  gestao: 'Gestão',
  comercial: 'Comercial',
  marketing: 'Marketing',
  logistica: 'Logística',
};

export default function Dashboard() {
  const { role, displayName, loading } = useUserRole();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={role} displayName={displayName}>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Dashboard {roleLabels[role || 'gestao']}
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Energy Brands — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {role === 'gestao' && <DashboardGestao />}
        {role === 'comercial' && <DashboardComercial />}
        {role === 'marketing' && <DashboardMarketing />}
        {role === 'logistica' && <DashboardLogistica />}
      </div>
    </DashboardLayout>
  );
}
