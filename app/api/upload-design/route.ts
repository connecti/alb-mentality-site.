import { NextRequest, NextResponse } from 'next/server';
import { verifierImage } from '@/lib/moderation';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getSettings } from '@/lib/settings';

// Reçoit une image envoyée par un client dans le customizer, la fait vérifier
// (contenu interdit + marques/logos protégés) puis, seulement si elle est
// validée, la stocke pour qu'elle survive jusqu'à l'envoi de la commande à
// Printful. Rien n'est jamais mis sur un produit sans être passé par ici.
export async function POST(req: NextRequest) {
  const { image } = await req.json();

  if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
    return NextResponse.json({ ok: false, error: 'Image invalide' }, { status: 400 });
  }

  // Taille raisonnable pour un fichier d'impression, évite les abus
  const tailleApproxOctets = image.length * 0.75;
  if (tailleApproxOctets > 12 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: 'Image trop lourde (12 Mo max).' }, { status: 400 });
  }

  const verdict = await verifierImage(image);
  if (!verdict.autorise) {
    return NextResponse.json({ ok: false, error: verdict.raison }, { status: 422 });
  }

  const supabase = getSupabaseAdmin();
  const settings = await getSettings();

  if (!supabase) {
    // Sans stockage connecté, l'image validée ne peut pas être conservée
    // jusqu'à la commande. On le dit clairement plutôt que de faire semblant.
    return NextResponse.json(
      { ok: false, error: "L'image est valide, mais le stockage (Supabase) n'est pas encore connecté pour la conserver." },
      { status: 503 },
    );
  }

  const [, extension] = image.match(/^data:image\/(\w+);base64,/) ?? [, 'png'];
  const contenuBase64 = image.split(',')[1];
  const octets = Buffer.from(contenuBase64, 'base64');
  const nomFichier = `${crypto.randomUUID()}.${extension}`;
  const bucket = settings.supabase_storage_bucket ?? 'designs-clients';

  const { error } = await supabase.storage.from(bucket).upload(nomFichier, octets, {
    contentType: `image/${extension}`,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: `Échec du stockage : ${error.message}` }, { status: 500 });
  }

  const { data: urlPublique } = supabase.storage.from(bucket).getPublicUrl(nomFichier);

  return NextResponse.json({ ok: true, url: urlPublique.publicUrl });
}
