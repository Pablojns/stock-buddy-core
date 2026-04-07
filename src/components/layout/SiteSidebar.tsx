import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Calculator,
  Package, Warehouse, MessageCircle, Shield,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/hooks/useUserRole';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/comercial', label: 'CRM', icon: ShoppingBag },
  { href: '/calculadora', label: 'Calculadora', icon: Calculator },
  { href: '/estoque', label: 'Estoque', icon: Warehouse },
  { href: '/separacao', label: 'Separação', icon: Package },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
];

interface SiteSidebarProps {
  onNavigate?: () => void;
}

export function SiteSidebar({ onNavigate }: SiteSidebarProps) {
  const location = useLocation();

  return (
    <aside className="flex flex-col w-56 border-r border-border/30 bg-sidebar sticky top-14 h-[calc(100vh-3.5rem)]">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border/20">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
          <Zap className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="text-sm font-bold text-foreground tracking-tight">Energy Brands</span>
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className="px-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.href);

            return (
              <Link key={item.href} to={item.href} onClick={onNavigate}>
                <div
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
