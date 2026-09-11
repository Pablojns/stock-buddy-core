import { Brain, Dumbbell, Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HeroStore } from '@/hooks/useHeroState';
import { Attributes, RANKS } from '@/lib/hero';

const STATS: { key: keyof Attributes; label: string; icon: typeof Brain }[] = [
  { key: 'forca', label: 'Força', icon: Dumbbell },
  { key: 'inteligencia', label: 'Inteligência', icon: Brain },
  { key: 'vitalidade', label: 'Vitalidade', icon: Heart },
];

export function AttributesTab({ store }: { store: HeroStore }) {
  const { state, setState, rank, level } = store;
  const history = state.quests.filter((q) => q.done);

  const spend = (key: keyof Attributes) => {
    if (state.points <= 0) return;
    setState((s) => ({
      ...s,
      points: s.points - 1,
      attributes: { ...s.attributes, [key]: s.attributes[key] + 1 },
    }));
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {STATS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="parchment p-4 text-center">
            <Icon className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-2 font-display text-xs text-muted-foreground">{label}</p>
            <p className="font-display text-2xl font-bold gold-text">{state.attributes[key]}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 w-full"
              disabled={state.points <= 0}
              onClick={() => spend(key)}
            >
              <Plus className="mr-1 h-3 w-3" /> Evoluir
            </Button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Pontos disponíveis: <span className="gold-text font-semibold">{state.points}</span>
      </p>

      <div className="parchment p-4">
        <h2 className="font-display text-sm gold-text">Trilha de rank · Nível {level}</h2>
        <div className="rune-divider my-3" />
        <div className="flex flex-wrap gap-2">
          {RANKS.map((r) => (
            <span
              key={r}
              className={cn(
                'rounded-sm border px-2 py-1 font-display text-[11px]',
                r === rank
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border text-muted-foreground',
              )}
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      <div className="parchment p-4">
        <h2 className="font-display text-sm gold-text">Crônica de missões concluídas</h2>
        <div className="rune-divider my-3" />
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum feito registrado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((q) => (
              <li key={q.id} className="flex items-center gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate">{q.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {q.completedAt ? new Date(q.completedAt).toLocaleDateString('pt-BR') : ''}
                </span>
                <span className="shrink-0 font-display text-xs gold-text">+{q.xp}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
