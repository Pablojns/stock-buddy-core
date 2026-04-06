import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { Building2, Mail, Phone, DollarSign, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { KANBAN_COLUMNS, type Lead } from '@/types/crm';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface Props {
  leads: Lead[];
  onSelect: (lead: Lead) => void;
}

export function CrmClients({ leads, onSelect }: Props) {
  const clients = useMemo(() => {
    return leads
      .filter(l => l.status === 'pedido_fechado')
      .sort((a, b) => (b.valor_estimado || 0) - (a.valor_estimado || 0));
  }, [leads]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-foreground">Clientes</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{clients.length} clientes convertidos</p>
      </div>

      {clients.length === 0 ? (
        <GlassCard className="text-center py-12">
          <p className="text-sm text-muted-foreground">Nenhum cliente convertido ainda</p>
          <p className="text-xs text-muted-foreground mt-1">Leads com status "Pedido Fechado" aparecem aqui</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {clients.map((client, i) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <GlassCard hover className="cursor-pointer !p-4" onClick={() => onSelect(client)}>
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{client.nome_cliente}</h3>
                    {client.empresa && (
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                        <Building2 className="h-2.5 w-2.5" /> {client.empresa}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[9px] border-success/30 text-success shrink-0">Cliente</Badge>
                </div>

                <p className="text-lg font-bold text-accent">{fmt(client.valor_estimado || 0)}</p>

                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                  {client.responsavel && (
                    <span className="flex items-center gap-0.5"><User className="h-2.5 w-2.5" /> {client.responsavel}</span>
                  )}
                  {client.telefone && <Phone className="h-2.5 w-2.5" />}
                  {client.email && <Mail className="h-2.5 w-2.5" />}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
