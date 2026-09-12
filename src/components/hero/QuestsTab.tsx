import { useState } from 'react';
import { toast } from 'sonner';
import { Check, ScrollText, Swords, Trash2 } from 'lucide-react';
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
      <div className="parchment animate-slide-down space-y-2 p-4">
        <h2 className="font-display text-sm gold-text">Nova missão</h2>
        <Input placeholder="Nome da missão" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_110px_auto]">
          <Input placeholder="Recompensa" value={reward} onChange={(e) => setReward(e.target.value)} />
          <Input type="number" min={1} placeholder="XP" value={xp} onChange={(e) => setXp(e.target.value)} />
          <Button onClick={addQuest}>Registrar</Button>
        </div>
      </div>

      {pending.length === 0 && done.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <ScrollText className="h-10 w-10 text-primary/50" />
          <p className="font-display text-sm text-muted-foreground">
            Nenhuma missão no diário. O destino aguarda.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {pending.map((q) => (
          <div key={q.id} className="parchment edge-gold card-hover p-3">
            <div className="flex items-center gap-3">
              <Swords className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm">{q.name}</p>
              </div>
              <span className="badge-xp shrink-0">+{q.xp} XP</span>
              <Button size="icon" variant="complete" onClick={() => complete(q)} aria-label="Completar missão" className="h-8 w-8">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => remove(q.id)} aria-label="Descartar missão" className="h-8 w-8 hover:text-destructive">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            {q.reward && (
              <div className="mt-2 rounded-sm border border-primary/40 bg-primary/10 px-2.5 py-1.5 font-display text-xs text-primary">
                🍖 Recompensa: {q.reward}
              </div>
            )}
          </div>
        ))}
      </div>

      {done.length > 0 && (
        <div className="space-y-2">
          <div className="rune-divider" />
          <h3 className="font-display text-xs text-muted-foreground">Feitos concluídos</h3>
          {done.map((q) => (
            <div key={q.id} className="edge-green card-hover flex items-center gap-3 rounded-md border border-border/60 p-2.5 opacity-70">
              <Check className="h-4 w-4 shrink-0 text-success" />
              <span className="min-w-0 flex-1 truncate text-sm line-through">{q.name}</span>
              <span className="badge-done shrink-0">Concluído</span>
              <span className="badge-xp shrink-0">+{q.xp}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
