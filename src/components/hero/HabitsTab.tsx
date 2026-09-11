import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { HeroStore } from '@/hooks/useHeroState';
import { daysInMonth, monthDayISO, todayISO, uid } from '@/lib/hero';

export function HabitsTab({ store }: { store: HeroStore }) {
  const { state, setState, grantXp } = store;
  const [name, setName] = useState('');
  const total = daysInMonth();
  const today = todayISO();
  const currentDay = new Date().getDate();

  const addHabit = () => {
    if (!name.trim()) return;
    setState((s) => ({ ...s, habits: [...s.habits, { id: uid(), name: name.trim(), xp: 10 }] }));
    setName('');
    toast('Novo hábito jurado', { description: name.trim() });
  };

  const toggle = (habitId: string, date: string, xp: number) => {
    const logged = state.logs[habitId]?.includes(date);
    setState((s) => {
      const prev = s.logs[habitId] ?? [];
      return {
        ...s,
        logs: { ...s.logs, [habitId]: logged ? prev.filter((d) => d !== date) : [...prev, date] },
      };
    });
    if (!logged && date === today) grantXp(xp, 'Hábito honrado hoje');
  };

  const remove = (id: string) =>
    setState((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) }));

  return (
    <div className="space-y-5">
      <div className="parchment flex gap-2 p-4">
        <Input placeholder="Novo hábito" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={addHabit}>Jurar</Button>
      </div>

      {state.habits.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Nenhum juramento firmado.</p>
      ) : (
        <div className="parchment overflow-x-auto p-3">
          <table className="w-full border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-card/95 pr-2 text-left font-display text-[11px] text-muted-foreground">
                  Hábito
                </th>
                {Array.from({ length: total }, (_, i) => (
                  <th key={i} className="w-6 text-center text-[10px] text-muted-foreground">
                    {i + 1}
                  </th>
                ))}
                <th className="pl-2 text-right text-[10px] text-muted-foreground">%</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {state.habits.map((h) => {
                const logs = state.logs[h.id] ?? [];
                const pct = Math.round((logs.length / total) * 100);
                return (
                  <tr key={h.id}>
                    <td className="sticky left-0 z-10 max-w-[9rem] truncate bg-card/95 pr-2 text-sm">
                      {h.name}
                    </td>
                    {Array.from({ length: total }, (_, i) => {
                      const date = monthDayISO(i + 1);
                      const active = logs.includes(date);
                      return (
                        <td key={i}>
                          <button
                            onClick={() => toggle(h.id, date, h.xp)}
                            aria-label={`${h.name} dia ${i + 1}`}
                            className={cn(
                              'h-6 w-6 rounded-sm border transition-colors',
                              active
                                ? 'border-primary bg-primary/80'
                                : 'border-border bg-secondary/60 hover:bg-secondary',
                              i + 1 === currentDay && !active && 'ring-1 ring-primary/60',
                            )}
                          />
                        </td>
                      );
                    })}
                    <td className="pl-2 text-right font-display text-xs gold-text">{pct}%</td>
                    <td>
                      <Button size="icon" variant="ghost" onClick={() => remove(h.id)} aria-label="Remover hábito">
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
