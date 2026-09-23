// ─────────────────────────────────────────────────────
// Lecture/écriture des "connexions" (Stripe, Printful, Resend) configurées
// depuis la page /reglages. Les clés sont stockées dans Supabase (table
// `app_settings`, une seule ligne), jamais en clair dans le code.
// Cette couche permet à la page Réglages de savoir ce qui est déjà connecté,
// et au reste du site de récupérer les clés au moment d'appeler Stripe/Printful.
// ─────────────────────────────────────────────────────

import { getSupabaseAdmin } from './supabase';

export interface AppSettings {
  stripe_secret_key: string | null;
  stripe_publishable_key: string | null;
  stripe_webhook_secret: string | null;
  printful_api_key: string | null;
  printful_store_id: string | null;
  resend_api_key: string | null;
  resend_from_email: string | null;
  admin_password_hash: string | null;
  // Clé utilisée pour vérifier automatiquement les images envoyées par les clients
  // dans le customizer (contenu interdit + logos/marques protégés). Voir lib/moderation.ts.
  openai_api_key: string | null;
  supabase_storage_bucket: string | null;
}

const EMPTY_SETTINGS: AppSettings = {
  stripe_secret_key: null,
  stripe_publishable_key: null,
  stripe_webhook_secret: null,
  printful_api_key: null,
  printful_store_id: null,
  resend_api_key: null,
  resend_from_email: null,
  admin_password_hash: null,
  openai_api_key: null,
  supabase_storage_bucket: null,
};

// Si Supabase n'est pas encore connecté (première installation), on retombe
// sur les variables d'environnement classiques pour ne jamais bloquer le site.
export async function getSettings(): Promise<AppSettings> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      stripe_secret_key: process.env.STRIPE_SECRET_KEY ?? null,
      stripe_publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null,
      stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET ?? null,
      printful_api_key: process.env.PRINTFUL_API_KEY ?? null,
      printful_store_id: process.env.PRINTFUL_STORE_ID ?? null,
      resend_api_key: process.env.RESEND_API_KEY ?? null,
      resend_from_email: process.env.RESEND_FROM_EMAIL ?? null,
      admin_password_hash: process.env.ADMIN_PASSWORD_HASH ?? null,
      openai_api_key: process.env.OPENAI_API_KEY ?? null,
      supabase_storage_bucket: process.env.SUPABASE_STORAGE_BUCKET ?? 'designs-clients',
    };
  }

  const { data, error } = await supabase.from('app_settings').select('*').eq('id', 1).maybeSingle();
  if (error || !data) return EMPTY_SETTINGS;
  return data as AppSettings;
}

export async function updateSettings(partial: Partial<AppSettings>): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Supabase n'est pas encore connecté. Connecte-le en premier depuis /reglages." };
  }
  const { error } = await supabase.from('app_settings').upsert({ id: 1, ...partial });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export function maskKey(key: string | null): string {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
}
