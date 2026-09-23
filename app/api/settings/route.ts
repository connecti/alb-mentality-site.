import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings, maskKey } from '@/lib/settings';

// Vérifie que la personne connectée est bien admin, via un mot de passe
// simple stocké en cookie de session (posé par /reglages après connexion).
function estAutorise(req: NextRequest): boolean {
  return req.cookies.get('alb-admin')?.value === 'ok';
}

export async function GET(req: NextRequest) {
  if (!estAutorise(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const s = await getSettings();
  return NextResponse.json({
    stripe: {
      connecte: Boolean(s.stripe_secret_key && s.stripe_publishable_key),
      cleMasquee: maskKey(s.stripe_secret_key),
    },
    printful: {
      connecte: Boolean(s.printful_api_key && s.printful_store_id),
      cleMasquee: maskKey(s.printful_api_key),
    },
    resend: {
      connecte: Boolean(s.resend_api_key && s.resend_from_email),
      cleMasquee: maskKey(s.resend_api_key),
    },
    openai: {
      connecte: Boolean(s.openai_api_key),
      cleMasquee: maskKey(s.openai_api_key),
    },
  });
}

export async function POST(req: NextRequest) {
  if (!estAutorise(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { service } = body;

  if (service === 'stripe') {
    const result = await updateSettings({
      stripe_secret_key: body.secretKey,
      stripe_publishable_key: body.publishableKey,
      stripe_webhook_secret: body.webhookSecret,
    });
    return NextResponse.json(result);
  }

  if (service === 'printful') {
    const result = await updateSettings({
      printful_api_key: body.apiKey,
      printful_store_id: body.storeId,
    });
    return NextResponse.json(result);
  }

  if (service === 'resend') {
    const result = await updateSettings({
      resend_api_key: body.apiKey,
      resend_from_email: body.fromEmail,
    });
    return NextResponse.json(result);
  }

  if (service === 'openai') {
    const result = await updateSettings({
      openai_api_key: body.apiKey,
    });
    return NextResponse.json(result);
  }

  return NextResponse.json({ ok: false, error: 'Service inconnu' }, { status: 400 });
}
