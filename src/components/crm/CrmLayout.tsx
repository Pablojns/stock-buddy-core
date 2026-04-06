import { ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  BarChart3, Users, Target, FileText, PhoneCall,
  Calendar, History, TrendingUp, Flag, LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const crmNav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'funil', label: 'Funil de Vendas', icon: Target },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'propostas', label: 'Propostas', icon: FileText },
  { id: 'followup', label: 'Follow-up', icon: PhoneCall },
  { id: 'agenda', label: 'Agenda', icon: Calendar },
  { id: 'historico', label: 'Histórico', icon: History },
  { id: 'indicadores', label: 'Indicadores', icon: BarChart3 },
  { id: 'metas', label: 'Metas', icon: Flag },
];

interface CrmLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: ReactNode;
}

export function CrmLayout({ activeTab, onTabChange, children }: CrmLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-3.5rem-2rem)] -mx-4 lg:-mx-6 -mb-4 lg:-mb-6">
      {/* CRM Internal Sidebar */}
      <aside className="hidden lg:flex flex-col w-48 border-r border-border/20 bg-card/30 shrink-0">
        <div className="px-3 py-3 border-b border-border/20">
          <h2 className="text-xs font-bold text-foreground uppercase tracking-widest">CRM</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">Gestão Comercial</p>
        </div>
        <ScrollArea className="flex-1">
          <nav className="p-1.5 space-y-0.5">
            {crmNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left',
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/30 px-2 py-1.5">
        <div className="flex overflow-x-auto gap-1 no-scrollbar">
          {crmNav.slice(0, 6).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg text-[9px] font-medium transition-colors shrink-0',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-5">
        {children}
      </main>
    </div>
  );
}
