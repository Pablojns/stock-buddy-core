import { ReactNode } from 'react';
import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

const roleLabels: Record<string, string> = {
  gestao: 'Gestão',
  comercial: 'Comercial',
  marketing: 'Marketing',
  logistica: 'Logística',
};

interface SiteHeaderProps {
  userRole?: string | null;
  displayName?: string | null;
  children?: ReactNode;
}

export function SiteHeader({ userRole, displayName, children }: SiteHeaderProps) {
  const { signOut, user } = useAuth();
  const name = displayName || user?.email?.split('@')[0] || 'Usuário';
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <header className="h-14 border-b border-border/30 bg-sidebar/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: mobile trigger */}
        <div className="flex items-center gap-2">
          {children}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-destructive rounded-full" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 h-8">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-medium text-foreground leading-none">{name}</p>
                  {userRole && (
                    <p className="text-[10px] text-muted-foreground">{roleLabels[userRole] || userRole}</p>
                  )}
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem><User className="mr-2 h-3.5 w-3.5" /> Perfil</DropdownMenuItem>
              <DropdownMenuItem><Settings className="mr-2 h-3.5 w-3.5" /> Configurações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-3.5 w-3.5" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
