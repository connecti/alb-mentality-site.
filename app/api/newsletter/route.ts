import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { envoyerEmailDefiJour } from '@/lib/emails';

// Inscription au Défi 7 jours gratuit. Envoie immédiatement le premier e-mail
// (Jour 1), les 6 suivants partent via la tâche planifiée quotidienne
// (voir README, section "Défi 7 jours" pour la brancher sur un cron).
export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? '';
  let email = '';

  if (contentType.includes('application/json')) {
    const body = await req.json();
    email = body.email;
  } else {
    const form = await req.formData();
    email = String(form.get('email') ?? '');
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase.from('defi_7_jours_inscrits').upsert({ email, jour_actuel: 1 }, { onConflict: 'email' });
  }

  await envoyerEmailDefiJour({
    email,
    jour: 1,
    contenu: `
      <p>Bienvenue dans le défi.</p>
      <p>Aujourd'hui, une seule règle : tiens ta journée. Pas la semaine, pas le mois. Juste aujourd'hui.</p>
      <p>On se retrouve demain.</p>
      <p>— ALB Mentality</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
