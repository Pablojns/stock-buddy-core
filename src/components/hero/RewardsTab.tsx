import { useState } from 'react';
import { toast } from 'sonner';
import { Gift, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HeroStore } from '@/hooks/useHeroState';
import { uid } from '@/lib/hero';

export function RewardsTab({ store }: { store: HeroStore }) {
  const { state, setState, balance } = store;
  const [name, setName] = useState('');
  const [cost, setCost] = useState('100');

  const add = () => {
    if (!name.trim()) return;
    setState((s) => ({
      ...s,
      rewards: [...s.rewards, { id: uid(), name: name.trim(), cost: Math.max(1, Number(cost) || 100), claimed: false }],
    }));
    setName('');
    toast('Recompensa adicionada ao baú');
  };

  const claim = (id: string, rewardCost: number, rewardName: string) => {
    if (balance < rewardCost) {
      toast.error('XP insuficiente', { description: `Faltam ${rewardCost - balance} XP` });
      return;
    }
    setState((s) => ({
      ...s,
      spent: s.spent + rewardCost,
      rewards: s.rewards.map((r) => (r.id === id ? { ...r, claimed: true } : r)),
    }));
    toast.success('Recompensa reivindicada', { description: `${rewardName} · −${rewardCost} XP` });
  };

  const remove = (id: string) =>
    setState((s) => ({ ...s, rewards: s.rewards.filter((r) => r.id !== id) }));

  return (
    <div className="space-y-5">
      <div className="parchment animate-slide-down space-y-2 p-4">
        <h2 className="font-display text-sm gold-text">Baú de recompensas · saldo {balance} XP</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_110px_auto]">
          <Input placeholder="Recompensa" value={name} onChange={(e) => setName(e.target.value)} />
          <Input type="number" min={1} value={cost} onChange={(e) => setCost(e.target.value)} />
          <Button onClick={add}>Adicionar</Button>
        </div>
      </div>

      {state.rewards.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Gift className="h-10 w-10 text-primary/50" />
          <p className="font-display text-sm text-muted-foreground">O baú está vazio.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {state.rewards.map((r) => (
            <div key={r.id} className="parchment edge-gold card-hover flex items-center gap-3 p-4">
              <Gift className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm">{r.name}</p>
                <span className="badge-xp mt-0.5">{r.cost} XP</span>
              </div>
              {r.claimed ? (
                <span className="badge-done shrink-0">Reivindicada</span>
              ) : (
                <Button size="sm" variant="complete" onClick={() => claim(r.id, r.cost, r.name)} disabled={balance < r.cost}>
                  Reivindicar
                </Button>
              )}
              <Button size="icon" variant="ghost" onClick={() => remove(r.id)} aria-label="Remover recompensa" className="h-8 w-8 hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
