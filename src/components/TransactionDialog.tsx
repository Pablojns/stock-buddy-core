import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { ReactNode } from 'react';

const CATEGORIES = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Faturamento', 'Investimento', 'Outros'];

export function TransactionDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const create = useCreateTransaction();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({ type, amount: parseFloat(amount), description, category, date });
    setOpen(false);
    setAmount(''); setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Nova transação</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant={type === 'income' ? 'default' : 'outline'} onClick={() => setType('income')}>Receita</Button>
            <Button type="button" variant={type === 'expense' ? 'default' : 'outline'} onClick={() => setType('expense')}>Despesa</Button>
          </div>
          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input type="number" step="0.01" min="0" required value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input required value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Data</Label>
            <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={create.isPending}>Salvar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
