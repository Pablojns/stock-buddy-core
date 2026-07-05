import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/PageHeader';
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/useGoals';
import { Plus, Trash2, Target } from 'lucide-react';

export default function Metas() {
  const { data: goals = [] } = useGoals();
  const create = useCreateGoal();
  const update = useUpdateGoal();
  const del = useDeleteGoal();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', target_value: '', deadline: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      title: form.title,
      description: form.description || undefined,
      target_value: form.target_value ? parseFloat(form.target_value) : undefined,
      deadline: form.deadline || undefined,
    });
    setOpen(false);
    setForm({ title: '', description: '', target_value: '', deadline: '' });
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <PageHeader
        title="Metas & Projetos"
        description="Objetivos macro e seu progresso"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-1" /> Nova meta</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova meta</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-3">
                <div className="space-y-2"><Label>Título</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="space-y-2"><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Valor alvo (R$)</Label><Input type="number" step="0.01" value={form.target_value} onChange={(e) => setForm({ ...form, target_value: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Prazo</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
                </div>
                <Button type="submit" className="w-full">Criar meta</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {goals.length === 0 ? (
        <Card className="p-12 flex flex-col items-center gap-3 text-center">
          <Target className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhuma meta criada ainda.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => (
            <Card key={g.id} className="p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-semibold">{g.title}</h3>
                  {g.description && <p className="text-sm text-muted-foreground mt-0.5">{g.description}</p>}
                  <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                    {g.target_value && <span>Alvo: R$ {Number(g.target_value).toLocaleString('pt-BR')}</span>}
                    {g.deadline && <span>Até: {new Date(g.deadline).toLocaleDateString('pt-BR')}</span>}
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => del.mutate(g.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progresso</span><span>{g.progress}%</span>
                </div>
                <Progress value={g.progress} className="h-2" />
                <Slider
                  value={[g.progress]}
                  onValueChange={([v]) => update.mutate({ id: g.id, progress: v })}
                  max={100} step={5}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
