import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Calculator, TrendingUp, TrendingDown, DollarSign,
  Percent, Package, Truck, ReceiptText, UserCheck, Target
} from 'lucide-react';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function pct(v: number) {
  return `${v.toFixed(2)}%`;
}

interface Fields {
  custo: number;
  quantidade: number;
  personalizacao: number;
  frete: number;
  impostoPercent: number;
  comissaoPercent: number;
  precoVendaSugerido: number;
  precoVendaManual: number;
  useManual: boolean;
}

function calcResults(f: Fields) {
  const custoUnit = f.custo + f.personalizacao;
  const custoTotal = custoUnit * f.quantidade;
  const freteTotal = f.frete;
  const custoFinal = custoTotal + freteTotal;

  const preco = f.useManual ? f.precoVendaManual : f.precoVendaSugerido;
  const valorTotal = preco * f.quantidade;
  const impostoTotal = valorTotal * (f.impostoPercent / 100);
  const comissaoTotal = valorTotal * (f.comissaoPercent / 100);
  const lucroBruto = valorTotal - custoFinal;
  const lucroLiquido = lucroBruto - impostoTotal - comissaoTotal;
  const margem = valorTotal > 0 ? (lucroLiquido / valorTotal) * 100 : 0;

  return { custoFinal, valorTotal, impostoTotal, comissaoTotal, lucroBruto, lucroLiquido, margem, preco };
}

function calcScenario(f: Fields, markup: number) {
  const custoUnit = f.custo + f.personalizacao;
  const custoTotal = custoUnit * f.quantidade + f.frete;
  const precoSugerido = (custoTotal / f.quantidade) * markup;
  return calcResults({ ...f, precoVendaSugerido: precoSugerido, precoVendaManual: precoSugerido, useManual: false });
}

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function Calculadora() {
  const [fields, setFields] = useState<Fields>({
    custo: 0, quantidade: 1, personalizacao: 0, frete: 0,
    impostoPercent: 12, comissaoPercent: 5,
    precoVendaSugerido: 0, precoVendaManual: 0, useManual: false,
  });

  const set = (key: keyof Fields, value: number | boolean) =>
    setFields(prev => ({ ...prev, [key]: value }));

  // Auto-suggest price (2x markup)
  const suggestedPrice = useMemo(() => {
    const custoUnit = fields.custo + fields.personalizacao;
    const custoTotal = custoUnit * fields.quantidade + fields.frete;
    return fields.quantidade > 0 ? (custoTotal / fields.quantidade) * 2 : 0;
  }, [fields.custo, fields.personalizacao, fields.quantidade, fields.frete]);

  const activeFields = { ...fields, precoVendaSugerido: suggestedPrice };
  const results = calcResults(activeFields);

  const optimistic = calcScenario(activeFields, 2.5);
  const standard = calcScenario(activeFields, 2.0);
  const discount = calcScenario(activeFields, 1.4);

  const scenarios = [
    { label: 'Otimista', data: optimistic, color: 'text-emerald-400', bg: 'border-emerald-500/30', icon: TrendingUp, markup: '150%' },
    { label: 'Padrão', data: standard, color: 'text-blue-400', bg: 'border-blue-500/30', icon: Target, markup: '100%' },
    { label: 'Desconto Máx.', data: discount, color: 'text-amber-400', bg: 'border-amber-500/30', icon: TrendingDown, markup: '40%' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div {...fadeUp}>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
            <Calculator className="h-8 w-8" /> Calculadora Comercial
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Simule vendas, margens e lucro em tempo real</p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT: Input Fields */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="xl:col-span-1 space-y-4">
            <GlassCard>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> Dados do Produto
              </h2>
              <div className="space-y-3">
                <Field label="Custo do Produto" icon={DollarSign} value={fields.custo}
                  onChange={v => set('custo', v)} prefix="R$" />
                <Field label="Quantidade" icon={Package} value={fields.quantidade}
                  onChange={v => set('quantidade', Math.max(1, v))} />
                <Field label="Custo Personalização" icon={DollarSign} value={fields.personalizacao}
                  onChange={v => set('personalizacao', v)} prefix="R$" />
                <Field label="Frete" icon={Truck} value={fields.frete}
                  onChange={v => set('frete', v)} prefix="R$" />
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <ReceiptText className="h-5 w-5 text-primary" /> Taxas e Comissões
              </h2>
              <div className="space-y-3">
                <Field label="Imposto (%)" icon={Percent} value={fields.impostoPercent}
                  onChange={v => set('impostoPercent', v)} suffix="%" />
                <Field label="Comissão Vendedor (%)" icon={UserCheck} value={fields.comissaoPercent}
                  onChange={v => set('comissaoPercent', v)} suffix="%" />
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" /> Preço de Venda
              </h2>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Sugerido (markup 2x)</Label>
                  <div className="mt-1 p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm font-medium">
                    {fmt(suggestedPrice)}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Preço Manual</Label>
                  <Input
                    type="number"
                    className="glass-input mt-1"
                    value={fields.precoVendaManual || ''}
                    placeholder="Informe para sobrescrever"
                    onChange={e => {
                      const v = parseFloat(e.target.value) || 0;
                      set('precoVendaManual', v);
                      set('useManual', v > 0);
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Usando: <Badge variant="outline" className="ml-1 text-xs border-primary/40 text-primary">
                    {fields.useManual ? 'Manual' : 'Sugerido'}
                  </Badge>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* RIGHT: Results + Scenarios */}
          <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="xl:col-span-2 space-y-6">
            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ResultCard label="Valor Total" value={fmt(results.valorTotal)} icon={DollarSign} color="text-blue-400" />
              <ResultCard label="Margem" value={pct(results.margem)} icon={Percent}
                color={results.margem >= 20 ? 'text-emerald-400' : results.margem >= 10 ? 'text-amber-400' : 'text-red-400'} />
              <ResultCard label="Lucro Bruto" value={fmt(results.lucroBruto)} icon={TrendingUp} color="text-cyan-400" />
              <ResultCard label="Lucro Líquido" value={fmt(results.lucroLiquido)} icon={TrendingUp}
                color={results.lucroLiquido >= 0 ? 'text-emerald-400' : 'text-red-400'} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <ResultCard label="Custo Final" value={fmt(results.custoFinal)} icon={Package} color="text-slate-300" small />
              <ResultCard label="Impostos Totais" value={fmt(results.impostoTotal)} icon={ReceiptText} color="text-amber-400" small />
              <ResultCard label="Comissão Total" value={fmt(results.comissaoTotal)} icon={UserCheck} color="text-purple-400" small />
            </div>

            {/* Scenarios */}
            <GlassCard>
              <h2 className="text-lg font-semibold text-foreground mb-4">Simulação de Cenários</h2>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="bg-white/5 rounded-xl mb-4">
                  <TabsTrigger value="all">Comparativo</TabsTrigger>
                  <TabsTrigger value="otimista">Otimista</TabsTrigger>
                  <TabsTrigger value="padrao">Padrão</TabsTrigger>
                  <TabsTrigger value="desconto">Desconto Máx.</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {scenarios.map(s => (
                      <ScenarioCard key={s.label} {...s} />
                    ))}
                  </div>
                </TabsContent>

                {scenarios.map((s, i) => (
                  <TabsContent key={s.label} value={['otimista', 'padrao', 'desconto'][i]}>
                    <ScenarioCard {...s} expanded />
                  </TabsContent>
                ))}
              </Tabs>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// --- Sub-components ---

function Field({ label, icon: Icon, value, onChange, prefix, suffix }: {
  label: string; icon: any; value: number;
  onChange: (v: number) => void; prefix?: string; suffix?: string;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" /> {label}
      </Label>
      <div className="relative mt-1">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{prefix}</span>}
        <Input
          type="number"
          className={`glass-input ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}`}
          value={value || ''}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function ResultCard({ label, value, icon: Icon, color, small }: {
  label: string; value: string; icon: any; color: string; small?: boolean;
}) {
  return (
    <GlassCard hover className={small ? '!p-4' : '!p-5'}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`${small ? 'text-lg' : 'text-2xl'} font-bold ${color} mt-1`}>{value}</p>
        </div>
        <Icon className={`${small ? 'h-6 w-6' : 'h-8 w-8'} ${color} opacity-60`} />
      </div>
    </GlassCard>
  );
}

function ScenarioCard({ label, data, color, bg, icon: Icon, markup, expanded }: {
  label: string; data: ReturnType<typeof calcResults>; color: string;
  bg: string; icon: any; markup: string; expanded?: boolean;
}) {
  return (
    <div className={`rounded-2xl border ${bg} bg-white/[0.03] p-5 space-y-3`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <span className={`font-semibold ${color}`}>{label}</span>
        <Badge variant="outline" className={`ml-auto text-xs border-white/20 ${color}`}>
          +{markup}
        </Badge>
      </div>
      <div className="space-y-2 text-sm">
        <Row label="Preço Unit." value={fmt(data.preco)} />
        <Row label="Valor Total" value={fmt(data.valorTotal)} bold />
        <Row label="Margem" value={pct(data.margem)} highlight={data.margem >= 20 ? 'green' : data.margem >= 10 ? 'amber' : 'red'} />
        <Row label="Lucro Líquido" value={fmt(data.lucroLiquido)} bold />
        {expanded && (
          <>
            <div className="border-t border-white/10 my-2" />
            <Row label="Custo Final" value={fmt(data.custoFinal)} />
            <Row label="Impostos" value={fmt(data.impostoTotal)} />
            <Row label="Comissão" value={fmt(data.comissaoTotal)} />
            <Row label="Lucro Bruto" value={fmt(data.lucroBruto)} />
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, bold, highlight }: {
  label: string; value: string; bold?: boolean;
  highlight?: 'green' | 'amber' | 'red';
}) {
  const hlColor = highlight === 'green' ? 'text-emerald-400' : highlight === 'amber' ? 'text-amber-400' : highlight === 'red' ? 'text-red-400' : '';
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${bold ? 'font-semibold text-foreground' : 'text-slate-300'} ${hlColor}`}>{value}</span>
    </div>
  );
}
