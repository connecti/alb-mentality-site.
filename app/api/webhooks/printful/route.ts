import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { envoyerEmailExpedition } from '@/lib/emails';

// Reçoit les mises à jour de statut de Printful (fabrication, expédition,
// numéro de suivi) et les relaie au client par e-mail — toujours au nom
// d'ALB Mentality, jamais de Printful.
export async function POST(req: NextRequest) {
  const payload = await req.json();

  if (payload.type === 'package_shipped') {
    const externalId = payload.data?.order?.external_id;
    const suivi = payload.data?.shipment?.tracking_url;

    const supabase = getSupabaseAdmin();
    if (supabase && externalId) {
      const { data: commande } = await supabase
        .from('commandes')
        .update({ statut: 'expediee' })
        .eq('stripe_session_id', externalId)
        .select('email, nom')
        .maybeSingle();

      if (commande?.email) {
        await envoyerEmailExpedition({ email: commande.email, nom: commande.nom, suivi });
      }
    }
  }

  return NextResponse.json({ received: true });
}
