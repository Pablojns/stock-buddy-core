import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Swords, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HeroStore } from '@/hooks/useHeroState';
import { Quest, uid } from '@/lib/hero';

export function QuestsTab({ store }: { store: HeroStore }) {
  const { state, setState, grantXp } = store;
  const [name, setName] = useState('');
  const [reward, setReward] = useState('');
  const [xp, setXp] = useState('25');

  const addQuest = () => {
    if (!name.trim()) return;
    const quest: Quest = {
      id: uid(),
      name: name.trim(),
      reward: reward.trim() || 'Glória e honra',
      xp: Math.max(1, Number(xp) || 25),
      done: false,
    };
    setState((s) => ({ ...s, quests: [quest, ...s.quests] }));
    setName('');
    setReward('');
    toast('Missão registrada no diário', { description: quest.name });
  };

  const complete = (quest: Quest) => {
    setState((s) => ({
      ...s,
      quests: s.quests.map((q) =>
        q.id === quest.id ? { ...q, done: true, completedAt: new Date().toISOString() } : q,
      ),
    }));
    grantXp(quest.xp, `Missão cumprida — recompensa: ${quest.reward}`);
  };

  const remove = (id: string) =>
    setState((s) => ({ ...s, quests: s.quests.filter((q) => q.id !== id) }));

  const pending = state.quests.filter((q) => !q.done);
  const done = state.quests.filter((q) => q.done);

  return (
    <div className="space-y-5">
      <div className="parchment space-y-2 p-4">
        <h2 className="font-display text-sm gold-text">Nova missão</h2>
        <Input placeholder="Nome da missão" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_110px_auto]">
          <Input placeholder="Recompensa" value={reward} onChange={(e) => setReward(e.target.value)} />
          <Input type="number" min={1} placeholder="XP" value={xp} onChange={(e) => setXp(e.target.value)} />
          <Button onClick={addQuest}>Registrar</Button>
        </div>
      </div>

      {pending.length === 0 && done.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nenhuma missão no diário. O destino aguarda.
        </p>
      )}

      <div className="space-y-2">
        {pending.map((q) => (
          <div key={q.id} className="parchment flex items-center gap-3 p-3">
            <Swords className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm">{q.name}</p>
              <p className="truncate text-xs text-muted-foreground">Recompensa: {q.reward}</p>
            </div>
            <span className="shrink-0 font-display text-xs gold-text">+{q.xp}</span>
            <Button size="icon" variant="ghost" onClick={() => complete(q)} aria-label="Completar missão">
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => remove(q.id)} aria-label="Descartar missão">
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>

      {done.length > 0 && (
        <div className="space-y-2">
          <div className="rune-divider" />
          <h3 className="font-display text-xs text-muted-foreground">Feitos concluídos</h3>
          {done.map((q) => (
            <div key={q.id} className="flex items-center gap-3 rounded-md border border-border/60 p-2.5 opacity-60">
              <Check className="h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-sm line-through">{q.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{q.reward}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
