import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Brain, Send, Archive, CheckSquare, Trash2 } from 'lucide-react';
import {
  useQuickNotes, useCreateQuickNote, useDeleteQuickNote,
  useConvertQuickNoteToTask, useArchiveQuickNoteToNote,
} from '@/hooks/useQuickNotes';

export function BrainDump() {
  const { data: notes = [] } = useQuickNotes();
  const create = useCreateQuickNote();
  const del = useDeleteQuickNote();
  const toTask = useConvertQuickNoteToTask();
  const toNote = useArchiveQuickNoteToNote();
  const [text, setText] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await create.mutateAsync(text.trim());
    setText('');
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">Brain Dump</h2>
        <span className="text-xs text-muted-foreground">despejo de ideias</span>
      </div>

      <form onSubmit={submit} className="flex gap-2 mb-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ex: Minha chefe pediu para entrar mais cedo dia 15/06"
          className="min-h-[60px] resize-none"
        />
        <Button type="submit" size="icon" disabled={create.isPending || !text.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>

      {notes.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhuma ideia solta. Que tal despejar uma?</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {notes.map((n) => (
            <PostIt
              key={n.id}
              text={n.text}
              onToTask={(due) => toTask.mutate({ id: n.id, text: n.text, due_date: due })}
              onArchive={() => toNote.mutate({ id: n.id, text: n.text })}
              onDelete={() => del.mutate(n.id)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function PostIt({
  text, onToTask, onArchive, onDelete,
}: {
  text: string;
  onToTask: (due: string | null) => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex flex-col gap-2">
      <p className="text-sm whitespace-pre-wrap break-words flex-1">{text}</p>
      <div className="flex gap-1.5 items-center pt-1 border-t border-primary/10">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
              <CheckSquare className="w-3.5 h-3.5 mr-1" /> Tarefa
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3 space-y-2" align="start">
            <label className="text-xs text-muted-foreground">Data</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Button size="sm" className="w-full" onClick={() => onToTask(date)}>Enviar para Foco</Button>
          </PopoverContent>
        </Popover>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={onArchive}>
          <Archive className="w-3.5 h-3.5 mr-1" /> Arquivar
        </Button>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs ml-auto text-muted-foreground" onClick={onDelete}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
