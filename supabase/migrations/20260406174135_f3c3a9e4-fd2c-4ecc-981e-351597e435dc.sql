
-- Add new enum values to lead_status
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'primeiro_contato';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'qualificacao';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'fechamento';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'ganho';

-- Add new columns to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS cidade text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS prioridade text NOT NULL DEFAULT 'normal';
