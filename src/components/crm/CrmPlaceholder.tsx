import { GlassCard } from '@/components/ui/glass-card';
import { Calendar, PhoneCall, FileText, Flag } from 'lucide-react';

interface Props {
  view: 'propostas' | 'agenda' | 'metas';
}

const placeholders: Record<string, { icon: any; title: string; desc: string }> = {
  propostas: { icon: FileText, title: 'Propostas', desc: 'Módulo de propostas comerciais em desenvolvimento' },
  agenda: { icon: Calendar, title: 'Agenda Comercial', desc: 'Calendário de reuniões e follow-ups em desenvolvimento' },
  metas: { icon: Flag, title: 'Metas', desc: 'Painel de metas e OKRs comerciais em desenvolvimento' },
};

export function CrmPlaceholder({ view }: Props) {
  const { icon: Icon, title, desc } = placeholders[view];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <GlassCard className="flex flex-col items-center justify-center py-16">
        <Icon className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Em breve</p>
        <p className="text-xs text-muted-foreground/60 mt-1">{desc}</p>
      </GlassCard>
    </div>
  );
}
