import { getSettings } from './settings';

export interface ResultatModeration {
  autorise: boolean;
  raison?: string;
}

// Vérifie une image envoyée par un client avant de l'accepter dans le
// customizer. Deux passes, dans cet ordre :
//   1. Modération de contenu (violence, sexuel, haine...) via l'API
//      Moderation d'OpenAI, qui accepte les images.
//   2. Détection de marques/logos/personnages protégés via un modèle de
//      vision, à qui on demande explicitement de répondre par un verdict
//      structuré — jamais de décision "à l'œil" côté code.
// Si la clé OpenAI n'est pas connectée, on bloque par défaut (fail-closed) :
// mieux vaut refuser un design que d'en laisser passer un qui pose problème.
export async function verifierImage(dataUrl: string): Promise<ResultatModeration> {
  const settings = await getSettings();
  if (!settings.openai_api_key) {
    return {
      autorise: false,
      raison: "La vérification automatique n'est pas encore connectée (clé OpenAI manquante dans /reglages). Impossible d'accepter une image tant que ce n'est pas fait.",
    };
  }

  const moderation = await verifierContenuInterdit(dataUrl, settings.openai_api_key);
  if (!moderation.autorise) return moderation;

  const marque = await verifierMarqueProtegee(dataUrl, settings.openai_api_key);
  return marque;
}

async function verifierContenuInterdit(dataUrl: string, cle: string): Promise<ResultatModeration> {
  try {
    const res = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'omni-moderation-latest',
        input: [{ type: 'image_url', image_url: { url: dataUrl } }],
      }),
    });

    if (!res.ok) {
      return { autorise: false, raison: 'La vérification a échoué techniquement. Réessaie dans un instant.' };
    }

    const data = await res.json();
    const resultat = data.results?.[0];
    if (resultat?.flagged) {
      return { autorise: false, raison: "Cette image contient un contenu qui n'est pas autorisé sur nos produits." };
    }
    return { autorise: true };
  } catch {
    return { autorise: false, raison: 'La vérification a échoué techniquement. Réessaie dans un instant.' };
  }
}

async function verifierMarqueProtegee(dataUrl: string, cle: string): Promise<ResultatModeration> {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              "Tu contrôles des images avant impression sur des vêtements vendus au public. Réponds uniquement en JSON : " +
              '{"marque_protegee": true|false, "raison": "..."}. ' +
              'Mets marque_protegee à true si l\'image contient un logo de marque, un personnage de fiction, un club sportif, ' +
              "une œuvre protégée, ou tout élément identifiable appartenant à un tiers. " +
              'Mets false uniquement si l\'image est clairement originale, générique, ou libre de droits (paysage, motif abstrait, photo personnelle sans logo visible...).',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Cette image peut-elle être imprimée sans risque de contrefaçon ?' },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      return { autorise: false, raison: 'La vérification a échoué techniquement. Réessaie dans un instant.' };
    }

    const data = await res.json();
    const contenu = data.choices?.[0]?.message?.content;
    const verdict = JSON.parse(contenu ?? '{"marque_protegee": true}');

    if (verdict.marque_protegee) {
      return {
        autorise: false,
        raison:
          verdict.raison ??
          "Cette image semble contenir une marque, un logo ou un personnage protégé. Choisis une autre image, ou dessine/écris quelque chose d'original.",
      };
    }
    return { autorise: true };
  } catch {
    return { autorise: false, raison: 'La vérification a échoué techniquement. Réessaie dans un instant.' };
  }
}
