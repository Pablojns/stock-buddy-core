import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CreditCardDialog } from '@/components/CreditCardDialog';
import { useCreditCards, useDeleteCreditCard } from '@/hooks/useCreditCards';
import { useInstallments } from '@/hooks/useInstallments';
import { Plus, CreditCard as CardIcon, Trash2 } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function CreditCardsSection() {
  const { data: cards = [] } = useCreditCards();
  const { data: installments = [] } = useInstallments();
  const del = useDeleteCreditCard();

  const usageByCard = useMemo(() => {
    const map: Record<string, number> = {};
    installments.filter((i) => !i.paid).forEach((i) => {
      if (!i.credit_card_id) return;
      map[i.credit_card_id] = (map[i.credit_card_id] ?? 0) + Number(i.amount);
    });
    return map;
  }, [installments]);

  return (
    <Card className="p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold flex items-center gap-2"><CardIcon className="w-4 h-4" /> Cartões de crédito</h2>
        <CreditCardDialog trigger={<Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" /> Novo cartão</Button>} />
      </div>
      {cards.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum cartão cadastrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cards.map((c) => {
            const used = usageByCard[c.id] ?? 0;
            const limit = Number(c.limit_amount) || 0;
            const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
            const available = Math.max(0, limit - used);
            return (
              <div key={c.id} className="rounded-xl border p-4 bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.brand ? `${c.brand} · ` : ''}fecha dia {c.closing_day} · vence dia {c.due_day}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => del.mutate(c.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Fatura em aberto</span>
                  <span className="font-medium">{fmt(used)} / {fmt(limit)}</span>
                </div>
                <Progress value={pct} className="h-2" />
                <div className="text-xs text-muted-foreground mt-2">Disponível: <span className="text-foreground font-medium">{fmt(available)}</span></div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
