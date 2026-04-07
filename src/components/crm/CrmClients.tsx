import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import {
  Building2, Mail, Phone, DollarSign, User, Crown,
  RefreshCw, AlertTriangle, ShoppingBag, Calendar, MapPin,
  Package, TrendingUp, Search,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useClients, type Client } from '@/hooks/useClients';
import { getWhatsAppUrl } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
...
                  <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-border/20">
                    {(() => {
                      const whatsappUrl = getWhatsAppUrl(client.telefone);

                      return whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded hover:bg-emerald-500/10 transition-colors"
                          onClick={e => e.stopPropagation()}
                        >
                          <WhatsAppIcon className="h-3 w-3 text-emerald-400" />
                        </a>
                      ) : null;
                    })()}
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
