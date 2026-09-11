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
      <div className="parchment space-y-2 p-4">
        <h2 className="font-display text-sm gold-text">Baú de recompensas · saldo {balance} XP</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_110px_auto]">
          <Input placeholder="Recompensa" value={name} onChange={(e) => setName(e.target.value)} />
          <Input type="number" min={1} value={cost} onChange={(e) => setCost(e.target.value)} />
          <Button onClick={add}>Adicionar</Button>
        </div>
      </div>

      {state.rewards.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">O baú está vazio.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {state.rewards.map((r) => (
            <div key={r.id} className="parchment flex items-center gap-3 p-4">
              <Gift className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.cost} XP</p>
              </div>
              {r.claimed ? (
                <span className="shrink-0 text-xs gold-text">Reivindicada</span>
              ) : (
                <Button size="sm" onClick={() => claim(r.id, r.cost, r.name)} disabled={balance < r.cost}>
                  Reivindicar
                </Button>
              )}
              <Button size="icon" variant="ghost" onClick={() => remove(r.id)} aria-label="Remover recompensa">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
