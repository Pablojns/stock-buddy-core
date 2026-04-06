import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths, format, isBefore } from 'date-fns';

interface DashboardData {
  faturamentoMes: number;
  lucroLiquido: number;
  pedidosAbertos: number;
  pedidosAtrasados: number;
  estoqueCritico: number;
  pedidosEntregues: number;
  comissaoComercial: number;
  comprasMes: number;
  vendasPorMes: { month: string; receita: number; custo: number; lucro: number }[];
  produtosMaisVendidos: { name: string; quantidade: number; receita: number }[];
  performanceComercial: { responsavel: string; leads: number; fechados: number; valor: number }[];
  giroEstoque: { name: string; entradas: number; saidas: number }[];
  loading: boolean;
}

export function useDashboardGestao(): DashboardData {
  const [data, setData] = useState<DashboardData>({
    faturamentoMes: 0, lucroLiquido: 0, pedidosAbertos: 0, pedidosAtrasados: 0,
    estoqueCritico: 0, pedidosEntregues: 0, comissaoComercial: 0, comprasMes: 0,
    vendasPorMes: [], produtosMaisVendidos: [], performanceComercial: [], giroEstoque: [],
    loading: true,
  });

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const now = new Date();
    const monthStart = startOfMonth(now).toISOString();
    const monthEnd = endOfMonth(now).toISOString();

    const [ordersRes, productsRes, movementsRes, leadsRes, itemsRes] = await Promise.all([
      supabase.from('orders').select('*'),
      supabase.from('products').select('*'),
      supabase.from('stock_movements').select('*'),
      supabase.from('leads').select('*'),
      supabase.from('order_items').select('*'),
    ]);

    const orders = ordersRes.data || [];
    const products = productsRes.data || [];
    const movements = movementsRes.data || [];
    const leads = leadsRes.data || [];
    const items = itemsRes.data || [];

    // KPIs
    const ordersThisMonth = orders.filter(o => o.created_at >= monthStart && o.created_at <= monthEnd);
    const completedThisMonth = ordersThisMonth.filter(o => o.status === 'completed');
    const itemsMap = new Map<string, typeof items>();
    items.forEach(i => {
      if (!itemsMap.has(i.order_id)) itemsMap.set(i.order_id, []);
      itemsMap.get(i.order_id)!.push(i);
    });

    const calcOrderTotal = (orderId: string) => {
      const oi = itemsMap.get(orderId) || [];
      return oi.reduce((s, i) => s + i.quantity * Number(i.unit_price), 0);
    };

    const faturamentoMes = ordersThisMonth
      .filter(o => o.status !== 'cancelled')
      .reduce((s, o) => s + calcOrderTotal(o.id), 0);

    const custoMes = ordersThisMonth
      .filter(o => o.status !== 'cancelled')
      .reduce((s, o) => {
        const oi = itemsMap.get(o.id) || [];
        return s + oi.reduce((ss, i) => {
          const prod = products.find(p => p.id === i.product_id);
          return ss + i.quantity * Number(prod?.cost_price || 0);
        }, 0);
      }, 0);

    const lucroLiquido = faturamentoMes - custoMes;
    const pedidosAbertos = orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length;
    const pedidosAtrasados = orders.filter(o => {
      if (['completed', 'cancelled'].includes(o.status)) return false;
      const created = new Date(o.created_at);
      const threeDaysAgo = subMonths(now, 0);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return isBefore(created, threeDaysAgo);
    }).length;
    const estoqueCritico = products.filter(p => p.current_quantity <= p.minimum_quantity).length;
    const pedidosEntregues = completedThisMonth.length;
    const comissaoComercial = faturamentoMes * 0.05; // 5% default
    const comprasMes = movements
      .filter(m => m.type === 'entry' && m.created_at >= monthStart && m.created_at <= monthEnd)
      .reduce((s, m) => {
        const prod = products.find(p => p.id === m.product_id);
        return s + m.quantity * Number(prod?.cost_price || 0);
      }, 0);

    // Vendas por mês (últimos 6 meses)
    const vendasPorMes = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i);
      const ms = startOfMonth(d).toISOString();
      const me = endOfMonth(d).toISOString();
      const monthOrders = orders.filter(o => o.created_at >= ms && o.created_at <= me && o.status !== 'cancelled');
      const receita = monthOrders.reduce((s, o) => s + calcOrderTotal(o.id), 0);
      const custo = monthOrders.reduce((s, o) => {
        const oi = itemsMap.get(o.id) || [];
        return s + oi.reduce((ss, it) => {
          const prod = products.find(p => p.id === it.product_id);
          return ss + it.quantity * Number(prod?.cost_price || 0);
        }, 0);
      }, 0);
      return { month: format(d, 'MMM'), receita, custo, lucro: receita - custo };
    });

    // Produtos mais vendidos
    const productSales = new Map<string, { quantidade: number; receita: number }>();
    items.forEach(i => {
      const key = i.product_name;
      const prev = productSales.get(key) || { quantidade: 0, receita: 0 };
      productSales.set(key, {
        quantidade: prev.quantidade + i.quantity,
        receita: prev.receita + i.quantity * Number(i.unit_price),
      });
    });
    const produtosMaisVendidos = Array.from(productSales.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 6);

    // Performance comercial
    const respMap = new Map<string, { leads: number; fechados: number; valor: number }>();
    leads.forEach(l => {
      const resp = l.responsavel || 'Sem responsável';
      const prev = respMap.get(resp) || { leads: 0, fechados: 0, valor: 0 };
      respMap.set(resp, {
        leads: prev.leads + 1,
        fechados: prev.fechados + (l.status === 'pedido_fechado' ? 1 : 0),
        valor: prev.valor + (l.status === 'pedido_fechado' ? Number(l.valor_estimado || 0) : 0),
      });
    });
    const performanceComercial = Array.from(respMap.entries())
      .map(([responsavel, v]) => ({ responsavel, ...v }))
      .sort((a, b) => b.valor - a.valor);

    // Giro de estoque (top 6 products by movement)
    const giroMap = new Map<string, { entradas: number; saidas: number }>();
    movements.forEach(m => {
      const prev = giroMap.get(m.product_name) || { entradas: 0, saidas: 0 };
      if (m.type === 'entry') prev.entradas += m.quantity;
      else prev.saidas += m.quantity;
      giroMap.set(m.product_name, prev);
    });
    const giroEstoque = Array.from(giroMap.entries())
      .map(([name, v]) => ({ name: name.length > 12 ? name.slice(0, 12) + '…' : name, ...v }))
      .sort((a, b) => (b.entradas + b.saidas) - (a.entradas + a.saidas))
      .slice(0, 6);

    setData({
      faturamentoMes, lucroLiquido, pedidosAbertos, pedidosAtrasados,
      estoqueCritico, pedidosEntregues, comissaoComercial, comprasMes,
      vendasPorMes, produtosMaisVendidos, performanceComercial, giroEstoque,
      loading: false,
    });
  }

  return data;
}
