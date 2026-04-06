import { ReactNode, useState } from 'react';
import { SiteHeader } from './SiteHeader';
import { SiteSidebar } from './SiteSidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: string | null;
  displayName?: string | null;
}

export function DashboardLayout({ children, userRole, displayName }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader userRole={userRole} displayName={displayName}>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-sidebar border-border/30">
            <SiteSidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </SiteHeader>
      <div className="flex">
        <div className="hidden md:block">
          <SiteSidebar />
        </div>
        <main className="flex-1 min-w-0 p-4 lg:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
