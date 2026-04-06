export type LeadStatus = 'novo_lead' | 'em_contato' | 'orcamento_enviado' | 'negociacao' | 'pedido_fechado' | 'perdido';

export interface Lead {
  id: string;
  user_id: string;
  nome_cliente: string;
  empresa: string | null;
  telefone: string | null;
  email: string | null;
  produto_solicitado: string | null;
  valor_estimado: number;
  responsavel: string | null;
  prazo: string | null;
  observacoes: string | null;
  status: LeadStatus;
  posicao: number;
  created_at: string;
  updated_at: string;
}

export interface ContactHistory {
  id: string;
  lead_id: string;
  user_id: string;
  tipo: string;
  descricao: string;
  created_at: string;
}

export const KANBAN_COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'novo_lead', label: 'Novo Lead', color: 'hsl(var(--primary))' },
  { id: 'em_contato', label: 'Em Contato', color: 'hsl(var(--accent))' },
  { id: 'orcamento_enviado', label: 'Orçamento Enviado', color: 'hsl(var(--warning))' },
  { id: 'negociacao', label: 'Negociação', color: 'hsl(199 89% 68%)' },
  { id: 'pedido_fechado', label: 'Pedido Fechado', color: 'hsl(var(--success))' },
  { id: 'perdido', label: 'Perdido', color: 'hsl(var(--destructive))' },
];
