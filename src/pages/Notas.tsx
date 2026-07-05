import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/PageHeader';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '@/hooks/useNotes';
import { Plus, Trash2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Notas() {
  const { data: notes = [] } = useNotes();
  const create = useCreateNote();
  const update = useUpdateNote();
  const del = useDeleteNote();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!selectedId && notes.length) setSelectedId(notes[0].id);
  }, [notes, selectedId]);

  const selected = notes.find((n) => n.id === selectedId);

  useEffect(() => {
    if (selected) { setTitle(selected.title); setContent(selected.content ?? ''); }
  }, [selected?.id]);

  useEffect(() => {
    if (!selected) return;
    const t = setTimeout(() => {
      if (title !== selected.title || content !== (selected.content ?? '')) {
        update.mutate({ id: selected.id, title, content });
      }
    }, 500);
    return () => clearTimeout(t);
  }, [title, content]);

  const handleCreate = async () => {
    const n = await create.mutateAsync();
    setSelectedId(n.id);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader title="Notas" description="Seu segundo cérebro" action={
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-1" /> Nova nota</Button>
      } />

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-14rem)]">
        <Card className="p-2 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <FileText className="w-6 h-6" />
              Nenhuma nota.
            </div>
          ) : (
            <ul className="space-y-0.5">
              {notes.map((n) => (
                <li
                  key={n.id}
                  onClick={() => setSelectedId(n.id)}
                  className={cn(
                    'p-3 rounded-md cursor-pointer transition-colors',
                    selectedId === n.id ? 'bg-secondary' : 'hover:bg-secondary/50'
                  )}
                >
                  <div className="text-sm font-medium truncate">{n.title || 'Sem título'}</div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {n.content?.slice(0, 60) || 'Vazia'}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5 flex flex-col">
          {selected ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg font-semibold border-0 px-0 focus-visible:ring-0" />
                <Button size="icon" variant="ghost" onClick={() => { del.mutate(selected.id); setSelectedId(null); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Comece a escrever..."
                className="flex-1 resize-none border-0 px-0 focus-visible:ring-0 text-sm"
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Selecione ou crie uma nota
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
