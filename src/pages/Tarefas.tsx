import { useState, useEffect, useRef, KeyboardEvent, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/PageHeader';
import { useTasks, useCreateTask, useToggleTask, useDeleteTask, Task } from '@/hooks/useTasks';
import { useHabits, useHabitLogs, useCreateHabit, useToggleHabitLog, useDeleteHabit } from '@/hooks/useHabits';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Sparkles, Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const HABIT_SUGGESTIONS = ['Treinar', 'Beber 3L de água', 'Revisar código', 'Ler 30min', 'Meditar 10min'];

const BUCKETS: { key: Task['bucket']; label: string }[] = [
  { key: 'today', label: 'Hoje' },
  { key: 'next', label: 'Próximo' },
  { key: 'ideas', label: 'Ideias' },
];

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

type Priority = 'high' | 'med' | 'low';
type Quadrant = 'UI' | 'UN' | 'nUI' | 'nUN'; // Urgent+Important etc.

type Meta = { priority: Priority; quadrant: Quadrant; seconds: number };

const META_KEY = 'lh:task-meta:v1';
const readMeta = (): Record<string, Meta> => {
  try { return JSON.parse(localStorage.getItem(META_KEY) || '{}'); } catch { return {}; }
};
const writeMeta = (m: Record<string, Meta>) => localStorage.setItem(META_KEY, JSON.stringify(m));

const PRI_STYLE: Record<Priority, string> = {
  high: 'bg-destructive/15 text-destructive border-destructive/30',
  med: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  low: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
};
const PRI_LABEL: Record<Priority, string> = { high: 'Alta', med: 'Média', low: 'Baixa' };

const QUAD_LABEL: Record<Quadrant, string> = {
  UI: 'Urgente + Importante',
  nUI: 'Importante',
  UN: 'Urgente',
  nUN: 'Descartar',
};

function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now); monday.setDate(now.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function get30Days() {
  const now = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now); d.setDate(now.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
}

export default function Tarefas() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <PageHeader title="Rotina & Foco" description="Kanban analítico, Pomodoro embutido e matriz de consistência" />
      <Tabs defaultValue="tasks">
        <TabsList className="mb-4">
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="matrix">Matriz Eisenhower</TabsTrigger>
          <TabsTrigger value="habits">Hábitos</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks"><TasksBoard /></TabsContent>
        <TabsContent value="matrix"><EisenhowerBoard /></TabsContent>
        <TabsContent value="habits"><HabitsBoard /></TabsContent>
      </Tabs>
    </div>
  );
}

function useMeta() {
  const [meta, setMeta] = useState<Record<string, Meta>>(() => readMeta());
  const update = (id: string, patch: Partial<Meta>) => {
    setMeta((prev) => {
      const next = { ...prev, [id]: { priority: 'med', quadrant: 'nUI', seconds: 0, ...prev[id], ...patch } as Meta };
      writeMeta(next);
      return next;
    });
  };
  return { meta, update };
}

function TasksBoard() {
  const { data: tasks = [] } = useTasks();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {BUCKETS.map((b) => (
        <BucketColumn key={b.key} bucket={b.key} label={b.label} tasks={tasks.filter((t) => t.bucket === b.key)} />
      ))}
    </div>
  );
}

function BucketColumn({ bucket, label, tasks }: { bucket: Task['bucket']; label: string; tasks: Task[] }) {
  const [title, setTitle] = useState('');
  const create = useCreateTask();

  const submit = async () => {
    if (!title.trim()) return;
    await create.mutateAsync({ title: title.trim(), bucket });
    setTitle('');
  };

  return (
    <Card className="p-4 transition-colors hover:border-primary/30">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold tracking-tight">{label}</h3>
        <Badge variant="secondary" className="rounded-full">{tasks.length}</Badge>
      </div>
      <Input
        placeholder="Nova tarefa..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') submit(); }}
        className="mb-3 h-9"
      />
      <ul className="space-y-2">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} />
        ))}
      </ul>
    </Card>
  );
}

function TaskCard({ task }: { task: Task }) {
  const toggle = useToggleTask();
  const del = useDeleteTask();
  const { meta, update } = useMeta();
  const m: Meta = meta[task.id] ?? { priority: 'med', quadrant: 'nUI', seconds: 0 };

  return (
    <li className="group rounded-lg border border-border/60 bg-secondary/20 hover:bg-secondary/40 transition-all p-2.5 space-y-2">
      <div className="flex items-start gap-2">
        <Checkbox
          className="mt-0.5"
          checked={task.completed}
          onCheckedChange={(v) => toggle.mutate({ id: task.id, completed: !!v })}
        />
        <span className={cn('text-sm flex-1 leading-snug', task.completed && 'line-through text-muted-foreground')}>
          {task.title}
        </span>
        <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 h-6 w-6" onClick={() => del.mutate(task.id)}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {(['high', 'med', 'low'] as Priority[]).map((p) => (
          <button
            key={p}
            onClick={() => update(task.id, { priority: p })}
            className={cn(
              'text-[10px] font-medium px-1.5 py-0.5 rounded border transition',
              m.priority === p ? PRI_STYLE[p] : 'border-border/60 text-muted-foreground hover:text-foreground'
            )}
          >
            {PRI_LABEL[p]}
          </button>
        ))}
        <Select value={m.quadrant} onValueChange={(v: Quadrant) => update(task.id, { quadrant: v })}>
          <SelectTrigger className="h-6 px-2 text-[10px] w-auto gap-1 border-border/60">
            <Zap className="w-2.5 h-2.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(QUAD_LABEL) as Quadrant[]).map((q) => (
              <SelectItem key={q} value={q} className="text-xs">{QUAD_LABEL[q]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Pomodoro
        seconds={m.seconds}
        onTick={(s) => update(task.id, { seconds: s })}
      />
    </li>
  );
}

function Pomodoro({ seconds, onTick }: { seconds: number; onTick: (s: number) => void }) {
  const [running, setRunning] = useState(false);
  const [local, setLocal] = useState(seconds);
  const ref = useRef<number | null>(null);

  useEffect(() => { setLocal(seconds); }, [seconds]);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setLocal((s) => {
        const n = s + 1;
        if (n % 5 === 0) onTick(n);
        return n;
      });
    }, 1000);
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [running, onTick]);

  const stop = () => { setRunning(false); onTick(local); };
  const reset = () => { setRunning(false); setLocal(0); onTick(0); };

  const mm = String(Math.floor(local / 60)).padStart(2, '0');
  const ss = String(local % 60).padStart(2, '0');
  const pomo = 25 * 60;
  const pct = Math.min(100, (local / pomo) * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full bg-border/60 overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{mm}:{ss}</span>
      {running ? (
        <button onClick={stop} className="p-1 rounded hover:bg-secondary" title="Pausar"><Pause className="w-3 h-3" /></button>
      ) : (
        <button onClick={() => setRunning(true)} className="p-1 rounded hover:bg-secondary" title="Iniciar"><Play className="w-3 h-3" /></button>
      )}
      <button onClick={reset} className="p-1 rounded hover:bg-secondary" title="Zerar"><RotateCcw className="w-3 h-3" /></button>
    </div>
  );
}

function EisenhowerBoard() {
  const { data: tasks = [] } = useTasks();
  const { meta } = useMeta();

  const quadrants: { key: Quadrant; title: string; hint: string; tone: string }[] = [
    { key: 'UI', title: 'Fazer agora', hint: 'Urgente + Importante', tone: 'border-destructive/40 bg-destructive/5' },
    { key: 'nUI', title: 'Planejar', hint: 'Importante · Não urgente', tone: 'border-primary/40 bg-primary/5' },
    { key: 'UN', title: 'Delegar', hint: 'Urgente · Não importante', tone: 'border-amber-500/40 bg-amber-500/5' },
    { key: 'nUN', title: 'Eliminar', hint: 'Nem urgente nem importante', tone: 'border-border' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {quadrants.map((q) => {
        const list = tasks.filter((t) => (meta[t.id]?.quadrant ?? 'nUI') === q.key && !t.completed);
        return (
          <Card key={q.key} className={cn('p-4 border', q.tone)}>
            <div className="flex justify-between items-baseline mb-3">
              <div>
                <h3 className="text-sm font-semibold">{q.title}</h3>
                <p className="text-[11px] text-muted-foreground">{q.hint}</p>
              </div>
              <Badge variant="secondary" className="rounded-full">{list.length}</Badge>
            </div>
            {list.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3">Nada aqui.</p>
            ) : (
              <ul className="space-y-1.5">
                {list.map((t) => (
                  <li key={t.id} className="text-sm px-2 py-1.5 rounded bg-background/50 border border-border/50 flex items-center justify-between">
                    <span className="truncate">{t.title}</span>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded border', PRI_STYLE[meta[t.id]?.priority ?? 'med'])}>
                      {PRI_LABEL[meta[t.id]?.priority ?? 'med']}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function HabitsBoard() {
  const { data: habits = [] } = useHabits();
  const { data: logs = [] } = useHabitLogs();
  const [name, setName] = useState('');
  const create = useCreateHabit();
  const toggle = useToggleHabitLog();
  const del = useDeleteHabit();
  const week = getWeekDates();
  const month = useMemo(() => get30Days(), []);

  const submit = async () => {
    if (!name.trim()) return;
    await create.mutateAsync(name.trim());
    setName('');
  };

  const has = (habit_id: string, date: string) => logs.some((l) => l.habit_id === habit_id && l.date === date);

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex gap-2 mb-5">
          <Input
            placeholder="Novo hábito (ex: Treinar, Ler 30min)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          />
          <Button onClick={submit}><Plus className="w-4 h-4" /></Button>
        </div>

        {habits.length === 0 ? (
          <div className="py-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> Comece com uma sugestão:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {HABIT_SUGGESTIONS.map((s) => (
                <Button key={s} variant="outline" size="sm" onClick={() => create.mutate(s)} className="rounded-full">
                  + {s}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr>
                  <th className="text-left text-xs text-muted-foreground font-medium pb-3">Semana</th>
                  {DAYS.map((d, i) => (
                    <th key={i} className="text-center text-xs text-muted-foreground font-medium pb-3">{d}</th>
                  ))}
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {habits.map((h) => {
                  const done = week.filter((d) => has(h.id, d)).length;
                  return (
                    <tr key={h.id} className="border-t border-border">
                      <td className="py-2 pr-3">
                        <div className="text-sm font-medium">{h.name}</div>
                        <div className="text-xs text-muted-foreground">{done}/7 essa semana</div>
                      </td>
                      {week.map((date) => {
                        const active = has(h.id, date);
                        return (
                          <td key={date} className="text-center py-2">
                            <button
                              onClick={() => toggle.mutate({ habit_id: h.id, date, exists: active })}
                              className={cn(
                                'w-7 h-7 rounded-md border transition-colors mx-auto flex items-center justify-center',
                                active
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'border-border hover:border-primary/50'
                              )}
                            >
                              {active && '✓'}
                            </button>
                          </td>
                        );
                      })}
                      <td>
                        <Button size="icon" variant="ghost" onClick={() => del.mutate(h.id)}><Trash2 className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {habits.length > 0 && (
        <Card className="p-5">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Matriz de consistência</h3>
              <p className="text-[11px] text-muted-foreground">Últimos 30 dias — quanto mais denso, mais consistente</p>
            </div>
          </div>
          <div className="space-y-3">
            {habits.map((h) => {
              const doneCount = month.filter((d) => has(h.id, d)).length;
              const pct = Math.round((doneCount / 30) * 100);
              return (
                <div key={h.id} className="flex items-center gap-3">
                  <div className="w-32 shrink-0">
                    <div className="text-xs font-medium truncate">{h.name}</div>
                    <div className="text-[10px] text-muted-foreground">{pct}% · {doneCount}/30</div>
                  </div>
                  <div className="grid grid-cols-30 gap-[3px] flex-1" style={{ gridTemplateColumns: 'repeat(30, minmax(0, 1fr))' }}>
                    {month.map((d) => {
                      const on = has(h.id, d);
                      return (
                        <div
                          key={d}
                          title={`${d}${on ? ' ✓' : ''}`}
                          className={cn(
                            'aspect-square rounded-[3px] border',
                            on ? 'bg-primary border-primary/60' : 'bg-secondary/40 border-border/50'
                          )}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
