import { useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateCreditCard } from '@/hooks/useCreditCards';

export function CreditCardDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [limit, setLimit] = useState('');
  const [closing, setClosing] = useState('1');
  const [due, setDue] = useState('10');
  const create = useCreateCreditCard();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      name,
      brand: brand || null,
      limit_amount: parseFloat(limit || '0'),
      closing_day: parseInt(closing, 10),
      due_day: parseInt(due, 10),
      color: 'primary',
    });
    setOpen(false);
    setName(''); setBrand(''); setLimit('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Novo cartão</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome (apelido)</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nubank Roxinho" />
          </div>
          <div className="space-y-2">
            <Label>Bandeira</Label>
            <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Visa, Mastercard..." />
          </div>
          <div className="space-y-2">
            <Label>Limite total (R$)</Label>
            <Input type="number" step="0.01" min="0" required value={limit} onChange={(e) => setLimit(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Dia fechamento</Label>
              <Input type="number" min="1" max="31" required value={closing} onChange={(e) => setClosing(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Dia vencimento</Label>
              <Input type="number" min="1" max="31" required value={due} onChange={(e) => setDue(e.target.value)} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={create.isPending}>Salvar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
