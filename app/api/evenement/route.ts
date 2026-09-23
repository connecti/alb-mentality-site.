import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Enregistre une visite (avec le code vidéo éventuel) pour la page
// /reglages/statistiques. Appelé silencieusement par TraqueurVisite à chaque
// changement de page. N'échoue jamais bruyamment : une visite non
// enregistrée ne doit jamais casser la navigation du client.
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true }); // pas connecté = silencieux

  const body = await req.json().catch(() => ({}));
  const { type, page, code } = body;

  await supabase.from('evenements').insert({
    type: typeof type === 'string' ? type.slice(0, 40) : 'visite',
    page: typeof page === 'string' ? page.slice(0, 200) : null,
    code_video: typeof code === 'string' && code ? code.slice(0, 40) : null,
  });

  return NextResponse.json({ ok: true });
}
