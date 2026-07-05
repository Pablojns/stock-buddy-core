import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useTransactions } from '@/hooks/useTransactions';
import { useInstallments } from '@/hooks/useInstallments';
import { Sparkles, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

type Insight = { kind: 'good' | 'bad' | 'info'; text: string };

export function InsightsCard() {
  const { data: transactions = [] } = useTransactions();
  const { data: installments = [] } = useInstallments();

  const insights = useMemo<Insight[]>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const prev = new Date(y, m - 1, 1);

    const inMonth = (iso: string, yy: number, mm: number) => {
      const d = new Date(iso);
      return d.getFullYear() === yy && d.getMonth() === mm;
    };

    // Sum expenses per category, combining cash expenses + installments due in that month
    const sumByCategory = (yy: number, mm: number) => {
      const map: Record<string, number> = {};
      transactions
        .filter((t) => t.type === 'expense' && t.payment_method !== 'credit' && inMonth(t.date, yy, mm))
        .forEach((t) => {
          map[t.category] = (map[t.category] ?? 0) + Number(t.amount);
        });
      // Add installments due this month, using category of parent transaction
      installments
        .filter((i) => inMonth(i.due_date, yy, mm))
        .forEach((i) => {
          const parent = transactions.find((t) => t.id === i.transaction_id);
          const cat = parent?.category ?? 'Cartão';
          map[cat] = (map[cat] ?? 0) + Number(i.amount);
        });
      return map;
    };

    const curr = sumByCategory(y, m);
    const prevSum = sumByCategory(prev.getFullYear(), prev.getMonth());

    const out: Insight[] = [];
    const categories = Array.from(new Set([...Object.keys(curr), ...Object.keys(prevSum)]));

    categories.forEach((cat) => {
      const c = curr[cat] ?? 0;
      const p = prevSum[cat] ?? 0;
      if (p === 0 && c === 0) return;
      if (p > 0 && c < p) {
        const diff = p - c;
        const pct = Math.round((diff / p) * 100);
        if (pct >= 15) {
          out.push({
            kind: 'good',
            text: `Mandou bem! Gastos em ${cat} caíram ${pct}% (economia de ${fmt(diff)}) vs. mês passado.`,
          });
        }
      } else if (c > p && p > 0) {
        const diff = c - p;
        const pct = Math.round((diff / p) * 100);
        if (pct >= 20) {
          out.push({
            kind: 'bad',
            text: `Atenção: ${cat} subiu ${pct}% (${fmt(diff)} a mais) em relação ao mês anterior.`,
          });
        }
      } else if (p === 0 && c > 0) {
        out.push({ kind: 'info', text: `Novo gasto em ${cat} este mês: ${fmt(c)}.` });
      }
    });

    const totalCurr = Object.values(curr).reduce((s, v) => s + v, 0);
    const totalPrev = Object.values(prevSum).reduce((s, v) => s + v, 0);
    if (totalPrev > 0) {
      const diff = totalCurr - totalPrev;
      const pct = Math.round((Math.abs(diff) / totalPrev) * 100);
      if (Math.abs(diff) > 0 && pct >= 5) {
        out.unshift(
          diff < 0
            ? { kind: 'good', text: `Total gasto no mês: ${fmt(totalCurr)} — ${pct}% menor que o mês passado.` }
            : { kind: 'bad', text: `Total gasto no mês: ${fmt(totalCurr)} — ${pct}% acima do mês passado.` }
        );
      }
    }

    return out.slice(0, 4);
  }, [transactions, installments]);

  return (
    <Card className="p-5 mb-4 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">Insights do Hub</h2>
      </div>
      {insights.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ainda não há dados suficientes para gerar insights. Registre transações por pelo menos dois meses para ver comparativos.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {insights.map((i, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm">
              {i.kind === 'good' && <TrendingDown className="w-4 h-4 text-primary mt-0.5 shrink-0" />}
              {i.kind === 'bad' && <TrendingUp className="w-4 h-4 text-destructive mt-0.5 shrink-0" />}
              {i.kind === 'info' && <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />}
              <span>{i.text}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
