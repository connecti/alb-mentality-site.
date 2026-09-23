import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Statistiques marketing internes (visites et ventes par code vidéo).
// C'est le "Google Analytics maison" demandé : pas de tableau de bord
// externe à configurer, juste ce que /api/evenement a déjà enregistré.
function estAutorise(req: NextRequest): boolean {
  return req.cookies.get('alb-admin')?.value === 'ok';
}

export async function GET(req: NextRequest) {
  if (!estAutorise(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ connecte: false, parCode: [], visitesTotales: 0, ventesTotales: 0 });
  }

  const [{ data: evenements }, { data: commandes }] = await Promise.all([
    supabase.from('evenements').select('code_video, created_at').order('created_at', { ascending: false }).limit(5000),
    supabase.from('commandes').select('code_video, montant_total_euros'),
  ]);

  const visitesParCode = new Map<string, number>();
  (evenements ?? []).forEach((e) => {
    const code = e.code_video ?? '(sans code)';
    visitesParCode.set(code, (visitesParCode.get(code) ?? 0) + 1);
  });

  const ventesParCode = new Map<string, { nombre: number; montant: number }>();
  (commandes ?? []).forEach((c) => {
    const code = c.code_video ?? '(sans code)';
    const actuel = ventesParCode.get(code) ?? { nombre: 0, montant: 0 };
    actuel.nombre += 1;
    actuel.montant += c.montant_total_euros ?? 0;
    ventesParCode.set(code, actuel);
  });

  const tousLesCodes = new Set([...visitesParCode.keys(), ...ventesParCode.keys()]);
  const parCode = Array.from(tousLesCodes).map((code) => {
    const visites = visitesParCode.get(code) ?? 0;
    const ventes = ventesParCode.get(code) ?? { nombre: 0, montant: 0 };
    return {
      code,
      visites,
      ventes: ventes.nombre,
      montant: Math.round(ventes.montant * 100) / 100,
      tauxConversion: visites > 0 ? Math.round((ventes.nombre / visites) * 1000) / 10 : null,
    };
  }).sort((a, b) => b.visites - a.visites);

  return NextResponse.json({
    connecte: true,
    parCode,
    visitesTotales: evenements?.length ?? 0,
    ventesTotales: commandes?.length ?? 0,
  });
}
