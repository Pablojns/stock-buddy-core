import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Mail,
  Crown,
  RefreshCw,
  AlertTriangle,
  ShoppingBag,
  Calendar,
  MapPin,
  Package,
  Search,
  User,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { useClients, type Client } from '@/hooks/useClients';
import { getWhatsAppUrl } from '@/lib/utils';

const fmt = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const CLASSIFICACAO_CONFIG: Record<string, { label: string; icon: LucideIcon; classes: string }> = {
  vip: { label: 'VIP', icon: Crown, classes: 'border-amber-400/40 bg-amber-500/15 text-amber-400' },
  recorrente: { label: 'Recorrente', icon: RefreshCw, classes: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-400' },
  inativo: { label: 'Inativo', icon: AlertTriangle, classes: 'border-destructive/40 bg-destructive/15 text-destructive' },
  normal: { label: 'Normal', icon: User, classes: 'border-border/40 bg-muted/30 text-muted-foreground' },
};

function getAutoClassificacao(client: Client) {
  if (client.classificacao && client.classificacao !== 'normal') return client.classificacao;
  if (client.total_comprado >= 50000 || client.total_pedidos >= 10) return 'vip';
  if (client.total_pedidos >= 3) return 'recorrente';

  if (client.ultimo_pedido) {
    const diff = Date.now() - new Date(client.ultimo_pedido).getTime();
    if (diff > 90 * 24 * 60 * 60 * 1000) return 'inativo';
  }

  return 'normal';
}

export function CrmClients() {
  const { clients, isLoading } = useClients();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string | null>(null);

  const enriched = useMemo(
    () => clients.map((client) => ({ ...client, autoClass: getAutoClassificacao(client) })),
    [clients]
  );

  const filtered = useMemo(() => {
    let list = enriched;

    if (filter) {
      list = list.filter((client) => client.autoClass === filter);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter(
        (client) =>
          client.nome_cliente.toLowerCase().includes(query) ||
          client.empresa?.toLowerCase().includes(query) ||
          client.responsavel?.toLowerCase().includes(query)
      );
    }

    return list;
  }, [enriched, filter, search]);

  const counts = useMemo(
    () => ({
      vip: enriched.filter((client) => client.autoClass === 'vip').length,
      recorrente: enriched.filter((client) => client.autoClass === 'recorrente').length,
      inativo: enriched.filter((client) => client.autoClass === 'inativo').length,
      total: enriched.length,
      totalValue: enriched.reduce((sum, client) => sum + client.total_comprado, 0),
    }),
    [enriched]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground">Clientes</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {counts.total} clientes • {fmt(counts.totalValue)} em vendas
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-8 w-40 border-border/50 bg-muted/30 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {[
          { label: 'Total', value: counts.total, icon: ShoppingBag, active: !filter, onClick: () => setFilter(null) },
          { label: 'VIP', value: counts.vip, icon: Crown, active: filter === 'vip', onClick: () => setFilter(filter === 'vip' ? null : 'vip') },
          {
            label: 'Recorrentes',
            value: counts.recorrente,
            icon: RefreshCw,
            active: filter === 'recorrente',
            onClick: () => setFilter(filter === 'recorrente' ? null : 'recorrente'),
          },
          {
            label: 'Inativos',
            value: counts.inativo,
            icon: AlertTriangle,
            active: filter === 'inativo',
            onClick: () => setFilter(filter === 'inativo' ? null : 'inativo'),
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <GlassCard
              key={item.label}
              hover
              onClick={item.onClick}
              className={`cursor-pointer !p-3 transition-all ${item.active ? 'ring-1 ring-primary/40' : ''}`}
            >
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="py-12 text-center">
          <ShoppingBag className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Nenhum cliente encontrado</p>
          <p className="mt-1 text-xs text-muted-foreground">Leads com status “Ganho” viram clientes automaticamente</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((client, index) => {
            const classification = CLASSIFICACAO_CONFIG[client.autoClass] || CLASSIFICACAO_CONFIG.normal;
            const ClassificationIcon = classification.icon;
            const whatsappUrl = getWhatsAppUrl(client.telefone);

            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.025 }}
              >
                <GlassCard hover className="!p-4">
                  <div className="mb-2.5 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-foreground">{client.nome_cliente}</h3>
                      {client.empresa && (
                        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Building2 className="h-2.5 w-2.5 shrink-0" />
                          {client.empresa}
                        </div>
                      )}
                    </div>

                    <Badge variant="outline" className={`shrink-0 text-[9px] ${classification.classes}`}>
                      <ClassificationIcon className="mr-0.5 h-2.5 w-2.5" />
                      {classification.label}
                    </Badge>
                  </div>

                  <div className="mb-3 flex items-baseline gap-3">
                    <p className="text-lg font-bold text-accent">{fmt(client.total_comprado)}</p>
                    <span className="text-[10px] text-muted-foreground">
                      {client.total_pedidos} pedido{client.total_pedidos !== 1 ? 's' : ''}
                    </span>
                  </div>

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

                  <div className="mt-2.5 flex items-center gap-2 border-t border-border/20 pt-2">
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded p-1 text-emerald-400 transition-colors hover:bg-emerald-500/10"
                        onClick={(event) => event.stopPropagation()}
                        aria-label={`Abrir WhatsApp de ${client.nome_cliente}`}
                      >
                        <WhatsAppIcon className="h-3 w-3" />
                      </a>
                    )}

                    {client.email && (
                      <a
                        href={`mailto:${client.email}`}
                        className="rounded p-1 text-primary transition-colors hover:bg-primary/10"
                        onClick={(event) => event.stopPropagation()}
                        aria-label={`Enviar email para ${client.nome_cliente}`}
                      >
                        <Mail className="h-3 w-3" />
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
