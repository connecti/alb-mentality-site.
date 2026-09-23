import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeClient } from '@/lib/stripe';
import { getSettings } from '@/lib/settings';
import { getSupabaseAdmin } from '@/lib/supabase';
import { creerCommandePrintful } from '@/lib/printful';
import { prochainNumeroMembre } from '@/lib/membres';
import { PRODUITS } from '@/lib/config';
import { envoyerEmailConfirmation, envoyerNotificationNouvelleCommande } from '@/lib/emails';
import type { DesignPersonnalise } from '@/lib/panier-client';

interface ArticleCommande {
  slug: string;
  quantite: number;
  taille?: string;
  personnalisation?: DesignPersonnalise;
}

// Les articles sont répartis en plusieurs clés de metadata (article_0, article_1, …)
// par /api/checkout, car une seule valeur Stripe est limitée à 500 caractères.
// On les reconstitue ici.
function lireArticlesDepuisMetadata(metadata: Record<string, string> | null | undefined): ArticleCommande[] {
  if (!metadata) return [];
  const nombre = Number(metadata.nombre_articles ?? '0');
  const articles: ArticleCommande[] = [];
  for (let i = 0; i < nombre; i++) {
    const brut = metadata[`article_${i}`];
    if (!brut) continue;
    try {
      articles.push(JSON.parse(brut));
    } catch {
      // article illisible : ignoré plutôt que de faire échouer toute la commande
    }
  }
  return articles;
}

// Reçoit la confirmation de paiement de Stripe, puis déclenche automatiquement
// la commande Printful et l'e-mail de confirmation. C'est le cœur du "site fini" :
// une fois Stripe et Printful connectés depuis /reglages, tout est automatique,
// personne n'a besoin de traiter une commande à la main.
export async function POST(req: NextRequest) {
  const settings = await getSettings();
  const { client } = await getStripeClient();

  if (!client || !settings.stripe_webhook_secret) {
    return NextResponse.json({ error: 'Stripe non connecté' }, { status: 503 });
  }

  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = client.webhooks.constructEvent(body, signature ?? '', settings.stripe_webhook_secret);
  } catch (err) {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    await traiterPaiementReussi(session);
  }

  return NextResponse.json({ received: true });
}

async function traiterPaiementReussi(session: Stripe.Checkout.Session) {
  const articles = lireArticlesDepuisMetadata(session.metadata);
  const numeroMembre = await prochainNumeroMembre();

  const adresse = session.customer_details?.address;
  const email = session.customer_details?.email ?? '';
  const nom = session.customer_details?.name ?? '';

  // Un design ou un texte personnalisé sans photo n'a pas de fichier d'impression
  // généré automatiquement (voir plus bas) : la commande doit être préparée à la
  // main par les fondateurs avant envoi à Printful, donc on la marque comme telle.
  const aUnePersonnalisationSansPhoto = articles.some((a) => a.personnalisation && !a.personnalisation.photoUrl);

  // Enregistrement de la commande dans Supabase
  const supabase = getSupabaseAdmin();
  let commandeId: string | null = null;
  if (supabase) {
    const { data } = await supabase
      .from('commandes')
      .insert({
        numero_membre: numeroMembre,
        stripe_session_id: session.id,
        email,
        nom,
        adresse,
        articles,
        montant_total_euros: (session.amount_total ?? 0) / 100,
        statut: aUnePersonnalisationSansPhoto ? 'a_preparer_manuellement' : 'payee',
        code_video: session.metadata?.code_video ?? null,
      })
      .select('id')
      .single();
    commandeId = data?.id ?? null;
  }

  // Séparer les produits physiques (à envoyer à Printful) des produits digitaux
  const articlesPhysiques = articles.filter((a) => {
    const p = PRODUITS.find((pr) => pr.slug === a.slug);
    return p?.categorie === 'vetement';
  });

  if (articlesPhysiques.length > 0 && adresse) {
    const items = articlesPhysiques
      .map((a) => {
        const p = PRODUITS.find((pr) => pr.slug === a.slug);
        if (!p?.printfulVariantId) return null;
        const perso = a.personnalisation;
        return {
          variant_id: p.printfulVariantId,
          quantity: a.quantite,
          name: perso ? `${p.nom} — personnalisé` : p.nom,
          // Seule une photo déjà vérifiée par IA et stockée devient un vrai
          // fichier d'impression envoyé à Printful. Un design prédéfini ou un
          // texte seul (sans photo) reste enregistré dans la commande
          // (Supabase) pour être préparé à la main tant que la génération
          // automatique du visuel imprimable n'est pas branchée.
          files: perso?.photoUrl ? [{ url: perso.photoUrl }] : undefined,
        };
      })
      .filter(Boolean) as any[];

    if (items.length > 0) {
      const resultat = await creerCommandePrintful({
        items,
        adresse: {
          name: nom,
          address1: adresse.line1 ?? '',
          city: adresse.city ?? '',
          zip: adresse.postal_code ?? '',
          country_code: adresse.country ?? 'FR',
          email,
        },
        externalOrderId: session.id,
      });

      if (resultat.ok && supabase && commandeId) {
        await supabase.from('commandes').update({ printful_order_id: resultat.printfulOrderId }).eq('id', commandeId);
      }
    }
  }

  await envoyerEmailConfirmation({ email, nom, numeroMembre, articles });
  await envoyerNotificationNouvelleCommande({
    numeroMembre,
    nomClient: nom,
    email,
    montant: (session.amount_total ?? 0) / 100,
    aBesoinDePreparationManuelle: aUnePersonnalisationSansPhoto,
  });
}
