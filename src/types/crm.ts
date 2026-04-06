export type LeadStatus =
  | 'novo_lead'
  | 'primeiro_contato'
  | 'qualificacao'
  | 'em_contato'
  | 'orcamento_enviado'
  | 'negociacao'
  | 'fechamento'
  | 'ganho'
  | 'pedido_fechado'
  | 'perdido';

export type LeadPriority = 'urgente' | 'medio' | 'normal';

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
  cidade: string | null;
  prioridade: LeadPriority;
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
  { id: 'novo_lead', label: 'Novo Lead', color: '#3b82f6' },
  { id: 'primeiro_contato', label: 'Primeiro Contato', color: '#06b6d4' },
  { id: 'qualificacao', label: 'Qualificação', color: '#8b5cf6' },
  { id: 'orcamento_enviado', label: 'Orçamento Enviado', color: '#f59e0b' },
  { id: 'negociacao', label: 'Negociação', color: '#0ea5e9' },
  { id: 'fechamento', label: 'Fechamento', color: '#14b8a6' },
  { id: 'ganho', label: 'Ganho', color: '#22c55e' },
  { id: 'perdido', label: 'Perdido', color: '#ef4444' },
];

export const PRIORITY_CONFIG: Record<LeadPriority, { label: string; color: string; bg: string }> = {
  urgente: { label: 'Urgente', color: '#ef4444', bg: 'bg-red-500/15 text-red-400 border-red-500/30' },
  medio: { label: 'Médio', color: '#f59e0b', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  normal: { label: 'Normal', color: '#22c55e', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
};
