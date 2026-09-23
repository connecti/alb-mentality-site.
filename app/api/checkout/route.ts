import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { PRODUITS, LIVRAISON, SUPPLEMENT_PERSONNALISATION_EUROS } from '@/lib/config';
import type { DesignPersonnalise } from '@/lib/panier-client';

interface ArticleRequete {
  slug: string;
  quantite: number;
  taille?: string;
  personnalisation?: DesignPersonnalise;
}

// Prix unitaire recalculé côté serveur, jamais depuis ce que le navigateur
// envoie : prix de base + supplément personnalisation si l'article en a une.
function prixUnitaire(a: ArticleRequete): number {
  const produit = PRODUITS.find((p) => p.slug === a.slug);
  if (!produit) return 0;
  return produit.prixVenteEuros + (a.personnalisation ? SUPPLEMENT_PERSONNALISATION_EUROS : 0);
}

// Crée une session de paiement Stripe Checkout. Les prix sont recalculés
// côté serveur à partir de lib/config.ts (jamais depuis ce que le
// navigateur envoie) pour qu'un client ne puisse pas modifier un prix.
export async function POST(req: NextRequest) {
  const { client, connected } = await getStripeClient();

  if (!connected || !client) {
    return NextResponse.json(
      { error: "Le paiement n'est pas encore connecté. Rends-toi sur /reglages pour connecter Stripe." },
      { status: 503 },
    );
  }

  const body = await req.json();
  const articles: ArticleRequete[] = body.articles ?? [];

  const lineItems = articles
    .map((a) => {
      const produit = PRODUITS.find((p) => p.slug === a.slug);
      if (!produit) return null;
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: a.personnalisation ? `${produit.nom} — personnalisé` : produit.nom,
          },
          unit_amount: Math.round(prixUnitaire(a) * 100),
        },
        quantity: a.quantite ?? 1,
      };
    })
    .filter(Boolean) as any[];

  if (lineItems.length === 0) {
    return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
  }

  const sousTotal = articles.reduce((s, a) => s + prixUnitaire(a) * (a.quantite ?? 1), 0);

  if (sousTotal < LIVRAISON.offerteDesEuros) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: { name: 'Livraison' },
        unit_amount: Math.round(LIVRAISON.fraisStandardEuros * 100),
      },
      quantity: 1,
    });
  }

  const baseUrl = req.nextUrl.origin;

  // Chaque article devient sa propre clé de metadata (au lieu d'un seul gros
  // tableau) : une valeur de metadata Stripe est limitée à 500 caractères, un
  // panier avec plusieurs articles personnalisés dépasserait vite cette limite.
  // L'aperçu (apercuDataUrl, une image encodée en base64) n'est jamais transmis
  // à Stripe : il ne sert qu'à l'affichage du panier côté client.
  // Code vidéo (bio TikTok/Instagram, ?code=...) posé en cookie par
  // TraqueurVisite : permet de savoir, dans /reglages/statistiques, quelle
  // vidéo a mené à quelle vente.
  const codeVideo = req.cookies.get('alb-code-video')?.value;

  const metadata: Record<string, string> = { nombre_articles: String(articles.length) };
  if (codeVideo) metadata.code_video = codeVideo.slice(0, 40);
  articles.forEach((a, i) => {
    const compact = {
      slug: a.slug,
      quantite: a.quantite ?? 1,
      taille: a.taille,
      personnalisation: a.personnalisation
        ? {
            designId: a.personnalisation.designId,
            texte: a.personnalisation.texte,
            couleurTexte: a.personnalisation.couleurTexte,
            photoUrl: a.personnalisation.photoUrl,
            couleurVetement: a.personnalisation.couleurVetement,
          }
        : undefined,
    };
    metadata[`article_${i}`] = JSON.stringify(compact).slice(0, 500);
  });

  const session = await client.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    payment_method_types: ['card', 'bancontact'],
    shipping_address_collection: { allowed_countries: ['FR', 'BE'] },
    success_url: `${baseUrl}/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/panier`,
    metadata,
  });

  return NextResponse.json({ url: session.url });
}
