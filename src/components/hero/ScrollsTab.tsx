import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HeroStore } from '@/hooks/useHeroState';
import { uid } from '@/lib/hero';

export function ScrollsTab({ store }: { store: HeroStore }) {
  const { state, setState } = store;
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [date, setDate] = useState('');

  const add = () => {
    if (!title.trim() && !body.trim()) return;
    setState((s) => ({
      ...s,
      scrolls: [
        {
          id: uid(),
          title: title.trim() || 'Pergaminho sem título',
          body: body.trim(),
          date: date || undefined,
          createdAt: new Date().toISOString(),
        },
        ...s.scrolls,
      ],
    }));
    setTitle('');
    setBody('');
    setDate('');
    toast('Pergaminho selado', { description: 'Sua anotação foi guardada' });
  };

  const remove = (id: string) =>
    setState((s) => ({ ...s, scrolls: s.scrolls.filter((n) => n.id !== id) }));

  return (
    <div className="space-y-5">
      <div className="parchment space-y-2 p-4">
        <Input placeholder="Título do pergaminho" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          placeholder="Escreva livremente, viajante..."
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button onClick={add}>Selar</Button>
        </div>
      </div>

      {state.scrolls.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">A estante está vazia.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {state.scrolls.map((n) => (
            <article key={n.id} className="parchment p-4">
              <div className="flex items-start gap-2">
                <h3 className="min-w-0 flex-1 font-display text-sm gold-text">{n.title}</h3>
                <Button size="icon" variant="ghost" onClick={() => remove(n.id)} aria-label="Queimar pergaminho">
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
              {n.date && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {new Date(`${n.date}T00:00:00`).toLocaleDateString('pt-BR')}
                </p>
              )}
              <div className="rune-divider my-2" />
              <p className="whitespace-pre-wrap text-sm text-foreground/90">{n.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
