import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/PageHeader';
import {
  useWishlist, useCreateWishlistItem, useUpdateWishlistItem, useGiveUpWishlistItem,
} from '@/hooks/useWishlist';
import { useTasks } from '@/hooks/useTasks';
import { Plus, Sparkles, X, Wallet, Link2 } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const SUGGESTIONS = [
  { title: 'PlayStation 5', total_value: 4000 },
  { title: 'GTA VI', total_value: 350 },
  { title: 'Viagem Fernando de Noronha', total_value: 8000 },
];

const NONE = '__none__';

export default function Metas() {
  const { data: items = [] } = useWishlist();
  const { data: tasks = [] } = useTasks();
  const create = useCreateWishlistItem();
  const update = useUpdateWishlistItem();
  const giveUp = useGiveUpWishlistItem();

  const activeTasks = tasks.filter((t) => !t.completed);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '', total_value: '', saved_value: '',
    reward_task_id: NONE, reward_type: 'fixed' as 'fixed' | 'percent', reward_value: '',
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      title: form.title,
      total_value: parseFloat(form.total_value),
      saved_value: form.saved_value ? parseFloat(form.saved_value) : 0,
      reward_task_id: form.reward_task_id === NONE ? null : form.reward_task_id,
      reward_type: form.reward_type,
      reward_value: form.reward_value ? parseFloat(form.reward_value) : 0,
    });
    setOpen(false);
    setForm({ title: '', total_value: '', saved_value: '', reward_task_id: NONE, reward_type: 'fixed', reward_value: '' });
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <PageHeader
        title="Fábrica de Sonhos"
        description="Sua wishlist ativa — cada card é um sonho em construção"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-1" /> Novo sonho</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Novo sonho</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-3">
                <div className="space-y-2"><Label>O que você quer?</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: PlayStation 5" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Valor total (R$)</Label><Input required type="number" step="0.01" min="0" value={form.total_value} onChange={(e) => setForm({ ...form, total_value: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Já guardado</Label><Input type="number" step="0.01" min="0" value={form.saved_value} onChange={(e) => setForm({ ...form, saved_value: e.target.value })} /></div>
                </div>

                <div className="pt-2 border-t space-y-3">
                  <Label className="flex items-center gap-1.5 text-xs uppercase text-muted-foreground">
                    <Link2 className="w-3 h-3" /> Recompensa por tarefa (opcional)
                  </Label>
                  <Select value={form.reward_task_id} onValueChange={(v) => setForm({ ...form, reward_task_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Vincular a uma tarefa" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Nenhuma</SelectItem>
                      {activeTasks.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.reward_task_id !== NONE && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select value={form.reward_type} onValueChange={(v: 'fixed' | 'percent') => setForm({ ...form, reward_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                            <SelectItem value="percent">% do total</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{form.reward_type === 'fixed' ? 'Valor (R$)' : '% do total'}</Label>
                        <Input type="number" step="0.01" min="0" value={form.reward_value} onChange={(e) => setForm({ ...form, reward_value: e.target.value })} />
                      </div>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={create.isPending}>Adicionar à wishlist</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {items.length === 0 ? (
        <Card className="p-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Comece pelos clássicos</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.title}
                onClick={() => create.mutate(s)}
                className="text-left rounded-xl border border-dashed p-4 hover:border-primary/50 hover:bg-primary/5 transition"
              >
                <div className="font-medium">{s.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{fmt(s.total_value)}</div>
                <div className="text-xs text-primary mt-2">+ Adicionar</div>
              </button>
            ))}
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-3">Painel analítico de aportes</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sonho</TableHead>
                  <TableHead className="text-right">Alvo</TableHead>
                  <TableHead className="text-right">Guardado</TableHead>
                  <TableHead className="text-right">Restante</TableHead>
                  <TableHead className="text-right">Progresso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => {
                  const total = Number(it.total_value);
                  const saved = Number(it.saved_value);
                  const rem = Math.max(0, total - saved);
                  const pct = total > 0 ? Math.round((saved / total) * 100) : 0;
                  return (
                    <TableRow key={it.id}>
                      <TableCell className="font-medium">{it.title}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmt(total)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmt(saved)}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{fmt(rem)}</TableCell>
                      <TableCell className="text-right tabular-nums">{pct}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((it) => (
              <WishCard key={it.id} it={it} tasks={tasks} onGiveUp={giveUp.mutate} onUpdate={update.mutate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WishCard({
  it, tasks, onGiveUp, onUpdate,
}: {
  it: ReturnType<typeof useWishlist>['data'] extends (infer U)[] | undefined ? U : never;
  tasks: ReturnType<typeof useTasks>['data'] extends (infer U)[] | undefined ? U : never[];
  onGiveUp: (v: { id: string; saved_value: number }) => void;
  onUpdate: (v: { id: string; saved_value: number }) => void;
}) {
  const total = Number(it.total_value);
  const saved = Number(it.saved_value);
  const remaining = Math.max(0, total - saved);
  const pct = total > 0 ? Math.min(100, Math.round((saved / total) * 100)) : 0;
  const complete = pct >= 100;
  const linkedTask = (tasks as { id: string; title: string }[]).find((t) => t.id === it.reward_task_id);

  const [months, setMonths] = useState<number>(12);
  const perMonth = remaining / Math.max(1, months);

  return (
    <Card className="p-5 flex flex-col gap-3 relative">
      <button
        onClick={() => onGiveUp({ id: it.id, saved_value: saved })}
        className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition"
        title="Mudei de ideia / Desistir"
      >
        <X className="w-4 h-4" />
      </button>
      <div>
        <h3 className="font-semibold pr-6">{it.title}</h3>
        <div className="text-xs text-muted-foreground mt-0.5">Alvo: {fmt(total)}</div>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Guardado</span>
          <span className="font-medium tabular-nums">{fmt(saved)} <span className="text-muted-foreground">/ {pct}%</span></span>
        </div>
        <Progress value={pct} className="h-2" />
        <div className={`text-xs mt-2 ${complete ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          {complete ? '🎉 Meta atingida!' : `Faltam ${fmt(remaining)}`}
        </div>
      </div>

      {!complete && (
        <div className="rounded-lg border border-border/60 bg-secondary/30 p-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Simulador</span>
            <span className="text-[11px] text-muted-foreground">{months} {months === 1 ? 'mês' : 'meses'}</span>
          </div>
          <Slider min={1} max={36} step={1} value={[months]} onValueChange={(v) => setMonths(v[0])} />
          <div className="text-sm font-semibold tabular-nums">
            {fmt(perMonth)}<span className="text-xs text-muted-foreground font-normal"> / mês</span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="R$ a guardar (enter)"
          className="h-9"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const v = parseFloat((e.target as HTMLInputElement).value || '0');
              if (v > 0) {
                onUpdate({ id: it.id, saved_value: saved + v });
                (e.target as HTMLInputElement).value = '';
              }
            }
          }}
        />
      </div>

      {linkedTask && (
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 rounded-lg bg-primary/5 border border-primary/10 px-2.5 py-1.5">
          <Link2 className="w-3 h-3 text-primary" />
          <span className="truncate">
            Recompensa: <span className="text-foreground">{linkedTask.title}</span>
            {' · '}
            {it.reward_type === 'fixed' ? fmt(Number(it.reward_value)) : `${Number(it.reward_value)}%`}
          </span>
        </div>
      )}

      <button
        onClick={() => onGiveUp({ id: it.id, saved_value: saved })}
        className="text-xs text-muted-foreground hover:text-foreground text-left flex items-center gap-1"
      >
        <Wallet className="w-3 h-3" /> Mudei de ideia — mover para o Cofre
      </button>
    </Card>
  );
}
