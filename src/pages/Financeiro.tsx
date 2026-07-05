import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';
import { TransactionDialog } from '@/components/TransactionDialog';
import { CreditCardsSection } from '@/components/CreditCardsSection';
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions';
import { useInstallments } from '@/hooks/useInstallments';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

type Mode = 'personal' | 'business';

const BUSINESS_KEYWORDS = ['projeto', 'cliente', 'freela', 'nota fiscal', 'nf', 'empresa', 'pj', 'negócio'];
const isBusiness = (t: { category: string; description: string }) => {
  const s = `${t.category} ${t.description}`.toLowerCase();
  return BUSINESS_KEYWORDS.some((k) => s.includes(k));
};

export default function Financeiro() {
  const { data: transactions = [] } = useTransactions();
  const { data: installments = [] } = useInstallments();
  const del = useDeleteTransaction();
  const [mode, setMode] = useState<Mode>('personal');

  const filtered = useMemo(
    () => transactions.filter((t) => (mode === 'business' ? isBusiness(t) : !isBusiness(t))),
    [transactions, mode]
  );

  const chartData = useMemo(() => {
    const now = new Date();
    // Past 6 months + next 3 months (projection)
    const buckets: { month: string; receitas: number; despesas: number; projecao: number | null; ts: number }[] = [];
    for (let i = 5; i >= -3; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        month: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        receitas: 0,
        despesas: 0,
        projecao: null,
        ts: d.getTime(),
      });
    }
    const monthKey = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getTime();

    filtered.forEach((t) => {
      const k = monthKey(new Date(t.date));
      const b = buckets.find((x) => x.ts === k);
      if (!b) return;
      if (t.type === 'income') b.receitas += Number(t.amount);
      else b.despesas += Number(t.amount);
    });

    // Baseline projection: avg of last 3 real expense months
    const past = buckets.filter((b) => b.ts <= monthKey(now));
    const last3 = past.slice(-3);
    const avgExp = last3.reduce((s, b) => s + b.despesas, 0) / Math.max(1, last3.length);

    // Add credit-card installments due in each future month
    buckets.forEach((b) => {
      const isPast = b.ts < monthKey(now);
      if (isPast) return;
      const instThisMonth = installments
        .filter((i) => monthKey(new Date(i.due_date)) === b.ts)
        .reduce((s, i) => s + Number(i.amount), 0);
      b.projecao = avgExp + instThisMonth;
    });

    return buckets;
  }, [filtered, installments]);

  const totals = useMemo(() => {
    const r = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const d = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    return { receitas: r, despesas: d, saldo: r - d };
  }, [filtered]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Financeiro"
        description="Fluxo pessoal e de projetos com projeção preditiva"
        action={<TransactionDialog trigger={<Button><Plus className="w-4 h-4 mr-1" /> Nova transação</Button>} />}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList>
            <TabsTrigger value="personal">Modo Pessoal</TabsTrigger>
            <TabsTrigger value="business">Projetos / Negócios</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2 text-xs">
          <Badge variant="secondary">Receitas {fmt(totals.receitas)}</Badge>
          <Badge variant="secondary">Despesas {fmt(totals.despesas)}</Badge>
          <Badge variant={totals.saldo >= 0 ? 'default' : 'destructive'}>Saldo {fmt(totals.saldo)}</Badge>
        </div>
      </div>

      {mode === 'personal' && <CreditCardsSection />}

      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Fluxo mensal + projeção 3 meses</h2>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <TrendingUp className="w-3 h-3" /> baseline = média + parcelas futuras
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                formatter={(v: number) => fmt(Number(v))}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="receitas" name="Receitas" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="despesas" name="Despesas" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} />
              <Line
                type="monotone"
                dataKey="projecao"
                name="Projeção"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ r: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold mb-4">Histórico — {mode === 'personal' ? 'Pessoal' : 'Projetos'}</h2>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma transação neste modo.</p>
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
              {filtered.map((t) => (
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
