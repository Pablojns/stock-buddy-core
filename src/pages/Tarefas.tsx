import { useState, KeyboardEvent } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/PageHeader';
import { useTasks, useCreateTask, useToggleTask, useDeleteTask, Task } from '@/hooks/useTasks';
import { useHabits, useHabitLogs, useCreateHabit, useToggleHabitLog, useDeleteHabit } from '@/hooks/useHabits';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const HABIT_SUGGESTIONS = ['Treinar', 'Beber 3L de água', 'Revisar código', 'Ler 30min', 'Meditar 10min'];

const BUCKETS: { key: Task['bucket']; label: string }[] = [
  { key: 'today', label: 'Hoje' },
  { key: 'next', label: 'Próximo' },
  { key: 'ideas', label: 'Ideias' },
];

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now); monday.setDate(now.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export default function Tarefas() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <PageHeader title="Rotina & Foco" description="Tarefas, hábitos e ritmo do seu dia" />
      <Tabs defaultValue="tasks">
        <TabsList className="mb-4">
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="habits">Hábitos</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks"><TasksBoard /></TabsContent>
        <TabsContent value="habits"><HabitsBoard /></TabsContent>
      </Tabs>
    </div>
  );
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
  const toggle = useToggleTask();
  const del = useDeleteTask();

  const submit = async () => {
    if (!title.trim()) return;
    await create.mutateAsync({ title: title.trim(), bucket });
    setTitle('');
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <Input
        placeholder="Nova tarefa..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') submit(); }}
        className="mb-3"
      />
      <ul className="space-y-1.5">
        {tasks.map((t) => (
          <li key={t.id} className="group flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-secondary/50">
            <Checkbox checked={t.completed} onCheckedChange={(v) => toggle.mutate({ id: t.id, completed: !!v })} />
            <span className={cn('text-sm flex-1', t.completed && 'line-through text-muted-foreground')}>{t.title}</span>
            <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 h-7 w-7" onClick={() => del.mutate(t.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </li>
        ))}
      </ul>
    </Card>
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

  const submit = async () => {
    if (!name.trim()) return;
    await create.mutateAsync(name.trim());
    setName('');
  };

  const has = (habit_id: string, date: string) => logs.some((l) => l.habit_id === habit_id && l.date === date);

  return (
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
        <p className="text-sm text-muted-foreground text-center py-8">Adicione seu primeiro hábito.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr>
                <th className="text-left text-xs text-muted-foreground font-medium pb-3">Hábito</th>
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
                              'w-8 h-8 rounded-md border transition-colors mx-auto flex items-center justify-center',
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
  );
}
