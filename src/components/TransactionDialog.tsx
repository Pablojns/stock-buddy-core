import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { useCreditCards } from '@/hooks/useCreditCards';
import { ReactNode } from 'react';

const CATEGORIES = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Faturamento', 'Investimento', 'Outros'];

export function TransactionDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash');
  const [cardId, setCardId] = useState<string>('');
  const [installments, setInstallments] = useState('1');
  const create = useCreateTransaction();
  const { data: cards = [] } = useCreditCards();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      type,
      amount: parseFloat(amount),
      description,
      category,
      date,
      payment_method: type === 'expense' ? paymentMethod : 'cash',
      credit_card_id: type === 'expense' && paymentMethod === 'credit' && cardId ? cardId : null,
      installments_count: type === 'expense' && paymentMethod === 'credit' ? parseInt(installments, 10) : 1,
    });
    setOpen(false);
    setAmount(''); setDescription(''); setInstallments('1'); setPaymentMethod('cash'); setCardId('');
  };

  const showCredit = type === 'expense' && paymentMethod === 'credit';

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

          {type === 'expense' && (
            <div className="space-y-2">
              <Label>Forma de pagamento</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant={paymentMethod === 'cash' ? 'default' : 'outline'} onClick={() => setPaymentMethod('cash')}>Dinheiro/Pix</Button>
                <Button type="button" variant={paymentMethod === 'credit' ? 'default' : 'outline'} onClick={() => setPaymentMethod('credit')}>Cartão de crédito</Button>
              </div>
            </div>
          )}

          {showCredit && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Cartão</Label>
                <Select value={cardId} onValueChange={setCardId}>
                  <SelectTrigger><SelectValue placeholder={cards.length ? 'Escolher' : 'Cadastre um cartão'} /></SelectTrigger>
                  <SelectContent>
                    {cards.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Parcelas</Label>
                <Input type="number" min="1" max="60" value={installments} onChange={(e) => setInstallments(e.target.value)} />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={create.isPending}>Salvar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
