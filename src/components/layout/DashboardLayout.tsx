import { ReactNode } from 'react';
import { SiteHeader } from './SiteHeader';
import { SiteSidebar } from './SiteSidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: string | null;
  displayName?: string | null;
}

export function DashboardLayout({ children, userRole, displayName }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[hsl(221,83%,10%)] bg-grid-pattern">
      <SiteHeader userRole={userRole} displayName={displayName} />
      <div className="flex">
        <SiteSidebar />
        <main className="flex-1 p-6 overflow-auto min-h-[calc(100vh-57px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
