import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/PageHeader';
import { TransactionDialog } from '@/components/TransactionDialog';
import { CreditCardsSection } from '@/components/CreditCardsSection';
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions';
import { Plus, Trash2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Financeiro() {
  const { data: transactions = [] } = useTransactions();
  const del = useDeleteTransaction();

  const chartData = useMemo(() => {
    const weeks: Record<string, { week: string; receitas: number; despesas: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i * 7);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      weeks[key] = { week: key, receitas: 0, despesas: 0 };
    }
    const keys = Object.keys(weeks);
    transactions.forEach((t) => {
      const td = new Date(t.date);
      const diffWeeks = Math.floor((now.getTime() - td.getTime()) / (7 * 86400000));
      if (diffWeeks >= 0 && diffWeeks < 6) {
        const k = keys[keys.length - 1 - diffWeeks];
        if (t.type === 'income') weeks[k].receitas += Number(t.amount);
        else weeks[k].despesas += Number(t.amount);
      }
    });
    return Object.values(weeks);
  }, [transactions]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Financeiro"
        description="Acompanhe receitas, despesas e evolução"
        action={<TransactionDialog trigger={<Button><Plus className="w-4 h-4 mr-1" /> Nova transação</Button>} />}
      />

      <CreditCardsSection />

      <Card className="p-5 mb-6">
        <h2 className="text-sm font-semibold mb-4">Últimas 6 semanas</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="receitas" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line type="monotone" dataKey="despesas" stroke="hsl(var(--destructive))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold mb-4">Histórico</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma transação registrada.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.description}</TableCell>
                  <TableCell className="text-muted-foreground">{t.category}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(t.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className={`text-right font-semibold ${t.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt(Number(t.amount))}
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => del.mutate(t.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
