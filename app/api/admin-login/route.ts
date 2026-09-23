import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getSettings } from '@/lib/settings';

// Connexion simple par mot de passe à la page /reglages. Pas de compte,
// pas d'e-mail à gérer : un seul mot de passe partagé entre les fondateurs,
// choisi dans .env (ADMIN_PASSWORD_HASH) ou lors de la première configuration.
export async function POST(req: NextRequest) {
  const { motDePasse } = await req.json();
  const settings = await getSettings();

  const hashSaisi = createHash('sha256').update(motDePasse ?? '').digest('hex');

  // Première utilisation : si aucun mot de passe n'est encore défini,
  // celui-ci devient le mot de passe admin.
  if (!settings.admin_password_hash) {
    const { updateSettings } = await import('@/lib/settings');
    await updateSettings({ admin_password_hash: hashSaisi });
  } else if (hashSaisi !== settings.admin_password_hash) {
    return NextResponse.json({ ok: false, error: 'Mot de passe incorrect' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('alb-admin', 'ok', { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 8 });
  return res;
}
