import { Search, Bell, Plus, Zap, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const roleLabels: Record<string, string> = {
  gestao: 'Gestão',
  comercial: 'Comercial',
  marketing: 'Marketing',
  logistica: 'Logística',
};

interface SiteHeaderProps {
  userRole?: string | null;
  displayName?: string | null;
}

export function SiteHeader({ userRole, displayName }: SiteHeaderProps) {
  const { signOut, user } = useAuth();
  const name = displayName || user?.email?.split('@')[0] || 'Usuário';
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <header className="glass-card border-b border-white/10 sticky top-0 z-50 rounded-none">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:inline">Energy Brands</span>
          </div>

          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pesquisa global..." className="pl-10 glass-input w-72 h-9 text-sm" />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-xl">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-white/10 rounded-xl px-2">
                <Avatar className="h-8 w-8 border border-white/20">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-foreground leading-none">{name}</p>
                  {userRole && (
                    <p className="text-xs text-muted-foreground mt-0.5">{roleLabels[userRole] || userRole}</p>
                  )}
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card w-56 border-white/10 p-2">
              <DropdownMenuItem className="rounded-lg hover:bg-white/10 cursor-pointer">
                <User className="mr-2 h-4 w-4" /> Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg hover:bg-white/10 cursor-pointer">
                <Settings className="mr-2 h-4 w-4" /> Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={signOut} className="rounded-lg hover:bg-destructive/20 text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
