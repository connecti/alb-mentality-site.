import { getSupabaseAdmin } from './supabase';

// Attribue le prochain numéro de membre ALB, de façon séquentielle et réelle
// (jamais inventé). Utilisé juste après un paiement confirmé.
export async function prochainNumeroMembre(): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 1;

  const { count } = await supabase.from('commandes').select('*', { count: 'exact', head: true });
  return (count ?? 0) + 1;
}

export async function nombreMembres(): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;
  const { count } = await supabase.from('commandes').select('*', { count: 'exact', head: true });
  return count ?? 0;
}
