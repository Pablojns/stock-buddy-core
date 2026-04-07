import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import {
  Building2, Mail, Phone, DollarSign, User, Crown,
  RefreshCw, AlertTriangle, ShoppingBag, Calendar, MapPin,
  Package, TrendingUp, Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useClients, type Client } from '@/hooks/useClients';
import { Loader2 } from 'lucide-react';

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const CLASSIFICACAO_CONFIG: Record<string, { label: string; icon: typeof Crown; classes: string }> = {
  vip: { label: 'VIP', icon: Crown, classes: 'border-amber-400/40 bg-amber-500/15 text-amber-400' },
  recorrente: { label: 'Recorrente', icon: RefreshCw, classes: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-400' },
  inativo: { label: 'Inativo', icon: AlertTriangle, classes: 'border-red-400/40 bg-red-500/15 text-red-400' },
  normal: { label: 'Normal', icon: User, classes: 'border-border/40 bg-muted/30 text-muted-foreground' },
};

function getAutoClassificacao(client: Client): string {
  if (client.classificacao && client.classificacao !== 'normal') return client.classificacao;
  if (client.total_comprado >= 50000 || client.total_pedidos >= 10) return 'vip';
  if (client.total_pedidos >= 3) return 'recorrente';
  if (client.ultimo_pedido) {
    const diff = Date.now() - new Date(client.ultimo_pedido).getTime();
    if (diff > 90 * 24 * 60 * 60 * 1000) return 'inativo';
  }
  return 'normal';
}

interface Props {
  leads?: any[];
  onSelect?: (lead: any) => void;
}

export function CrmClients(_props: Props) {
  const { clients, isLoading } = useClients();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string | null>(null);

  const enriched = useMemo(() =>
    clients.map(c => ({ ...c, autoClass: getAutoClassificacao(c) })),
    [clients]
  );

  const filtered = useMemo(() => {
    let list = enriched;
    if (filter) list = list.filter(c => c.autoClass === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.nome_cliente.toLowerCase().includes(q) ||
        c.empresa?.toLowerCase().includes(q) ||
        c.responsavel?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [enriched, filter, search]);

  const counts = useMemo(() => ({
    vip: enriched.filter(c => c.autoClass === 'vip').length,
    recorrente: enriched.filter(c => c.autoClass === 'recorrente').length,
    inativo: enriched.filter(c => c.autoClass === 'inativo').length,
    total: enriched.length,
    totalValue: enriched.reduce((s, c) => s + c.total_comprado, 0),
  }), [enriched]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Clientes</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{counts.total} clientes • {fmt(counts.totalValue)} em vendas</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 w-40 text-xs bg-muted/30 border-border/50" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          { label: 'Total', value: counts.total, icon: ShoppingBag, onClick: () => setFilter(null), active: !filter },
          { label: 'VIP', value: counts.vip, icon: Crown, onClick: () => setFilter(filter === 'vip' ? null : 'vip'), active: filter === 'vip' },
          { label: 'Recorrentes', value: counts.recorrente, icon: RefreshCw, onClick: () => setFilter(filter === 'recorrente' ? null : 'recorrente'), active: filter === 'recorrente' },
          { label: 'Inativos', value: counts.inativo, icon: AlertTriangle, onClick: () => setFilter(filter === 'inativo' ? null : 'inativo'), active: filter === 'inativo' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <GlassCard
              key={kpi.label}
              hover
              className={`!p-3 cursor-pointer transition-all ${kpi.active ? 'ring-1 ring-primary/40' : ''}`}
              onClick={kpi.onClick}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Client Grid */}
      {filtered.length === 0 ? (
        <GlassCard className="text-center py-12">
          <ShoppingBag className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum cliente encontrado</p>
          <p className="text-xs text-muted-foreground mt-1">Leads com status "Ganho" se tornam clientes automaticamente</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((client, i) => {
            const cls = CLASSIFICACAO_CONFIG[client.autoClass] || CLASSIFICACAO_CONFIG.normal;
            const ClsIcon = cls.icon;
            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.025 }}
              >
                <GlassCard hover className="!p-4 cursor-pointer">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground truncate">{client.nome_cliente}</h3>
                      {client.empresa && (
                        <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                          <Building2 className="h-2.5 w-2.5 shrink-0" /> {client.empresa}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className={`text-[9px] shrink-0 ${cls.classes}`}>
                      <ClsIcon className="h-2.5 w-2.5 mr-0.5" /> {cls.label}
                    </Badge>
                  </div>

                  {/* Value & Orders */}
                  <div className="flex items-baseline gap-3 mb-3">
                    <p className="text-lg font-bold text-accent">{fmt(client.total_comprado)}</p>
                    <span className="text-[10px] text-muted-foreground">{client.total_pedidos} pedido{client.total_pedidos !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Info rows */}
                  <div className="space-y-1 text-[10px] text-muted-foreground">
                    {client.produto_recorrente && (
                      <div className="flex items-center gap-1.5">
                        <Package className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{client.produto_recorrente}</span>
                      </div>
                    )}
                    {client.responsavel && (
                      <div className="flex items-center gap-1.5">
                        <User className="h-2.5 w-2.5 shrink-0" />
                        <span>{client.responsavel}</span>
                      </div>
                    )}
                    {client.cidade && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-2.5 w-2.5 shrink-0" />
                        <span>{client.cidade}</span>
                      </div>
                    )}
                    {client.ultimo_pedido && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-2.5 w-2.5 shrink-0" />
                        <span>Último pedido: {new Date(client.ultimo_pedido).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>

                  {/* Contact icons */}
                  <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-border/20">
                    {client.telefone && (
                      <a href={`https://wa.me/55${client.telefone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="p-1 rounded hover:bg-emerald-500/10 transition-colors" onClick={e => e.stopPropagation()}>
                        <WhatsAppIcon className="h-3 w-3 text-emerald-400" />
                      </a>
                    )}
                    {client.email && (
                      <a href={`mailto:${client.email}`}
                        className="p-1 rounded hover:bg-primary/10 transition-colors" onClick={e => e.stopPropagation()}>
                        <Mail className="h-3 w-3 text-primary" />
                      </a>
                    )}
                    <div className="flex-1" />
                    <span className="text-[9px] text-muted-foreground/60">{client.frequencia_compra}</span>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
