import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator, CommandShortcut,
} from '@/components/ui/command';
import {
  LayoutDashboard, Wallet, Target, Focus, Brain,
  Plus, LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Digite um comando ou pesquise..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado.</CommandEmpty>
        <CommandGroup heading="Navegação">
          <CommandItem onSelect={() => go('/')}><LayoutDashboard className="mr-2 h-4 w-4" />Visão Geral</CommandItem>
          <CommandItem onSelect={() => go('/financeiro')}><Wallet className="mr-2 h-4 w-4" />Finanças</CommandItem>
          <CommandItem onSelect={() => go('/foco')}><Focus className="mr-2 h-4 w-4" />Rotina & Foco</CommandItem>
          <CommandItem onSelect={() => go('/notas')}><Brain className="mr-2 h-4 w-4" />Segundo Cérebro</CommandItem>
          <CommandItem onSelect={() => go('/metas')}><Target className="mr-2 h-4 w-4" />Metas & Projetos</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Ações rápidas">
          <CommandItem onSelect={() => go('/financeiro?new=1')}><Plus className="mr-2 h-4 w-4" />Nova transação</CommandItem>
          <CommandItem onSelect={() => go('/foco?new=1')}><Plus className="mr-2 h-4 w-4" />Adicionar tarefa</CommandItem>
          <CommandItem onSelect={() => go('/notas?new=1')}><Plus className="mr-2 h-4 w-4" />Nova nota</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Conta">
          <CommandItem onSelect={() => { onOpenChange(false); signOut(); }}>
            <LogOut className="mr-2 h-4 w-4" />Sair
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
