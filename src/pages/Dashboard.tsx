import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { TransactionDialog } from '@/components/TransactionDialog';
import { InsightsCard } from '@/components/InsightsCard';
import { VaultDialog } from '@/components/VaultDialog';
import { useTransactions } from '@/hooks/useTransactions';
import { useTasks, useToggleTask } from '@/hooks/useTasks';
import { useWishlist } from '@/hooks/useWishlist';
import { BrainDump } from '@/components/BrainDump';
import { useVault } from '@/hooks/useVault';
import { TrendingUp, TrendingDown, Wallet, Plus, Sparkles, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';

const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Dashboard() {
  const { data: transactions = [] } = useTransactions();
  const { data: tasks = [] } = useTasks();
  const { data: wishes = [] } = useWishlist();
  const { data: vault } = useVault();
  const toggle = useToggleTask();
  const [vaultOpen, setVaultOpen] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    const monthTx = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const expense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    return { balance: totalIncome - totalExpense, income, expense };
  }, [transactions]);

  const todayTasks = tasks.filter((t) => t.bucket === 'today');
  const topWishes = wishes.slice(0, 3);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Visão geral"
        description={new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        action={
          <TransactionDialog
            trigger={<Button><Plus className="w-4 h-4 mr-1" /> Nova transação</Button>}
          />
        }
      />

      <InsightsCard />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Saldo total" value={fmt(stats.balance)} icon={<Wallet className="w-4 h-4" />} tone="default" />
        <StatCard label="Receitas do mês" value={fmt(stats.income)} icon={<TrendingUp className="w-4 h-4" />} tone="success" />
        <StatCard label="Despesas do mês" value={fmt(stats.expense)} icon={<TrendingDown className="w-4 h-4" />} tone="destructive" />
        <StatCard label="Cofre de Oportunidades" value={fmt(Number(vault?.balance ?? 0))} icon={<PiggyBank className="w-4 h-4" />} tone="success" onClick={() => setVaultOpen(true)} />
      </div>
      <VaultDialog open={vaultOpen} onOpenChange={setVaultOpen} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-4">Tarefas de hoje</h2>
          {todayTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma tarefa para hoje.</p>
          ) : (
            <ul className="space-y-2">
              {todayTasks.slice(0, 6).map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-1.5">
                  <Checkbox
                    checked={t.completed}
                    onCheckedChange={(v) => toggle.mutate({ id: t.id, completed: !!v })}
                  />
                  <span className={t.completed ? 'text-muted-foreground line-through text-sm' : 'text-sm'}>
                    {t.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Fábrica de sonhos
          </h2>
          {topWishes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum sonho na wishlist ainda.</p>
          ) : (
            <div className="space-y-4">
              {topWishes.map((w) => {
                const total = Number(w.total_value);
                const saved = Number(w.saved_value);
                const pct = total > 0 ? Math.min(100, Math.round((saved / total) * 100)) : 0;
                const remaining = Math.max(0, total - saved);
                return (
                  <div key={w.id}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{w.title}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">Faltam {fmt(remaining)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-4">
        <BrainDump />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: 'default' | 'success' | 'destructive' }) {
  const toneClass = tone === 'success' ? 'text-primary' : tone === 'destructive' ? 'text-destructive' : 'text-foreground';
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        {icon} {label}
      </div>
      <div className={`text-2xl font-semibold ${toneClass}`}>{value}</div>
    </Card>
  );
}
