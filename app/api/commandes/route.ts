import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Liste des commandes pour l'application interne (/reglages/commandes),
// réservée aux fondateurs. Même garde d'accès que /api/settings.
function estAutorise(req: NextRequest): boolean {
  return req.cookies.get('alb-admin')?.value === 'ok';
}

export async function GET(req: NextRequest) {
  if (!estAutorise(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ connecte: false, commandes: [] });
  }

  const { data, error } = await supabase
    .from('commandes')
    .select('id, numero_membre, email, nom, articles, montant_total_euros, statut, code_video, printful_order_id, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ connecte: true, commandes: [], error: error.message });
  }

  return NextResponse.json({ connecte: true, commandes: data ?? [] });
}
