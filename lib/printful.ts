import { getSettings } from './settings';

const PRINTFUL_API_BASE = 'https://api.printful.com';

export async function isPrintfulConnected(): Promise<boolean> {
  const settings = await getSettings();
  return Boolean(settings.printful_api_key && settings.printful_store_id);
}

interface PrintfulOrderItem {
  variant_id: string;
  quantity: number;
  name: string;
  // Présent uniquement pour un article personnalisé avec une photo déjà
  // vérifiée par IA (voir lib/moderation.ts) et stockée : c'est ce fichier
  // qui remplace le visuel standard du produit chez Printful.
  files?: { url: string; type?: string }[];
}

interface PrintfulShippingAddress {
  name: string;
  address1: string;
  city: string;
  zip: string;
  country_code: string;
  email: string;
}

// Crée une commande Printful en marque blanche : aucune mention Printful
// n'apparaît sur le colis, le bon de livraison ou le suivi envoyé au client.
// Appelé automatiquement par le webhook Stripe après un paiement réussi
// (voir app/api/webhooks/stripe/route.ts).
export async function creerCommandePrintful(params: {
  items: PrintfulOrderItem[];
  adresse: PrintfulShippingAddress;
  externalOrderId: string;
}): Promise<{ ok: boolean; printfulOrderId?: string; error?: string }> {
  const settings = await getSettings();
  if (!settings.printful_api_key || !settings.printful_store_id) {
    return { ok: false, error: 'Printful non connecté' };
  }

  try {
    const res = await fetch(`${PRINTFUL_API_BASE}/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${settings.printful_api_key}`,
        'X-PF-Store-Id': settings.printful_store_id,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_id: params.externalOrderId,
        recipient: params.adresse,
        items: params.items,
        // packing_slip : personnalise le bon de livraison avec le nom
        // et l'email de contact ALB Mentality, jamais Printful.
        packing_slip: {
          email: settings.resend_from_email ?? params.adresse.email,
          phone: '',
          message: 'Merci d\'avoir rejoint le défi. — ALB Mentality',
        },
        confirm: true, // passe directement en production, pas de brouillon à valider à la main
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data?.error?.message ?? 'Erreur Printful inconnue' };
    }
    return { ok: true, printfulOrderId: String(data.result.id) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erreur réseau Printful' };
  }
}

export async function recupererStatutCommande(printfulOrderId: string) {
  const settings = await getSettings();
  if (!settings.printful_api_key) return null;
  const res = await fetch(`${PRINTFUL_API_BASE}/orders/${printfulOrderId}`, {
    headers: { Authorization: `Bearer ${settings.printful_api_key}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.result;
}
