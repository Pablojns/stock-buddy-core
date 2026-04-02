import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Calculator, FileText,
  Truck, Package, Warehouse, FileCheck, DollarSign,
  Settings, Users, BarChart3, Target
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/comercial', label: 'Comercial/CRM', icon: ShoppingBag },
  { href: '/orcamentos', label: 'Orçamentos', icon: FileText },
  { href: '/calculadora', label: 'Calculadora', icon: Calculator },
  { href: '/logistica', label: 'Logística', icon: Truck },
  { href: '/estoque', label: 'Estoque', icon: Warehouse },
  { href: '/separacao', label: 'Separação', icon: Package },
  { href: '/transportadoras', label: 'Transportadoras', icon: Truck },
  { href: '/notas', label: 'Notas Fiscais', icon: FileCheck },
  { href: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/marketing', label: 'Marketing', icon: Target },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/usuarios', label: 'Usuários', icon: Users },
  { href: '/config', label: 'Configurações', icon: Settings },
];

export function SiteSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-sidebar sticky top-[57px] h-[calc(100vh-57px)]">
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.href);

            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 rounded-xl h-10 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
