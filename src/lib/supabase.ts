import { createClient } from '@supabase/supabase-js';

// Banco externo do Life OS (chave publicável — segura no frontend).
const URL = 'https://isjxfqkvavoaksroutre.supabase.co';
const KEY = 'sb_publishable_6K-0CffRhhuPUfvPoGsARw_oTu31N__';

export const supabase = createClient(URL, KEY, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'life-os-auth' },
});

export type Plan = 'free' | 'pro' | 'premium';
export const PLAN_ORDER: Plan[] = ['free', 'pro', 'premium'];
