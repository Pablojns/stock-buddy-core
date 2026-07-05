import { ReactNode, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Sparkles, LogOut, Search, User, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommandMenu } from '@/components/CommandMenu';

const nav = [
  { href: '/', label: 'Visão Geral' },
  { href: '/financeiro', label: 'Finanças' },
  { href: '/foco', label: 'Rotina & Foco' },
  { href: '/notas', label: 'Segundo Cérebro' },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass">
        <div className="mx-auto max-w-7xl h-14 px-4 md:px-6 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight">LifeHub</span>
          </Link>

          {/* Centered nav */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {nav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-secondary/80 text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                )}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCmdOpen(true)}
              className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg text-xs text-muted-foreground bg-secondary/50 hover:bg-secondary/80 border border-border/60 transition-colors"
              aria-label="Central de Comando"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Comando</span>
              <kbd className="ml-2 px-1.5 py-0.5 rounded bg-background/70 text-[10px] font-mono border border-border/60">⌘K</kbd>
            </button>

            <button
              onClick={() => setCmdOpen(true)}
              className="sm:hidden p-2 rounded-lg hover:bg-secondary/60"
              aria-label="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="w-8 h-8 rounded-full bg-secondary hover:ring-2 hover:ring-primary/40 transition-all flex items-center justify-center text-xs font-semibold"
                  aria-label="Perfil"
                >
                  {user?.email?.[0].toUpperCase() ?? <User className="w-4 h-4" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-xs text-muted-foreground">Conectado como</div>
                  <div className="text-sm truncate">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-muted-foreground">
                  <LogOut className="w-4 h-4 mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary/60"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/60 bg-background/90 backdrop-blur-xl">
            <nav className="px-4 py-3 flex flex-col gap-1">
              {nav.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium',
                    isActive(item.href)
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  )}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>

      <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  );
}
