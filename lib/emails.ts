import { Resend } from 'resend';
import { getSettings } from './settings';

async function getResendClient() {
  const settings = await getSettings();
  if (!settings.resend_api_key || !settings.resend_from_email) return null;
  return { client: new Resend(settings.resend_api_key), from: settings.resend_from_email };
}

export async function envoyerEmailConfirmation(params: {
  email: string;
  nom: string;
  numeroMembre: number;
  articles: { slug: string; quantite: number }[];
}) {
  const resend = await getResendClient();
  if (!resend || !params.email) return;

  await resend.client.emails.send({
    from: resend.from,
    to: params.email,
    subject: `Bienvenue, membre #${String(params.numeroMembre).padStart(4, '0')}`,
    html: `
      <p>${params.nom ? params.nom + ',' : 'Salut,'}</p>
      <p>C'est officiel : tu es le membre <strong>#${String(params.numeroMembre).padStart(4, '0')}</strong> d'ALB Mentality.</p>
      <p>Ta commande part en fabrication. Tu reçois un e-mail dès qu'elle est expédiée, avec le suivi.</p>
      <p>On ne coule jamais. On prend de l'élan.</p>
      <p>— ALB Mentality</p>
    `,
  });
}

// Prévient l'équipe (à l'adresse d'envoi configurée dans /reglages, celle qui
// sert de boîte pro) dès qu'une nouvelle commande arrive — c'est la
// notification "il y a une inscription/vente sur le site" demandée, sans
// avoir besoin d'aller chercher l'information dans /reglages/commandes.
export async function envoyerNotificationNouvelleCommande(params: {
  numeroMembre: number;
  nomClient: string;
  email: string;
  montant: number;
  aBesoinDePreparationManuelle: boolean;
}) {
  const resend = await getResendClient();
  if (!resend) return;

  await resend.client.emails.send({
    from: resend.from,
    to: resend.from, // boîte pro ALB Mentality : nouvelle commande reçue
    subject: `Nouvelle commande — membre #${String(params.numeroMembre).padStart(4, '0')} (${params.montant} €)`,
    html: `
      <p>Nouvelle commande reçue.</p>
      <p><strong>${params.nomClient || params.email}</strong> — ${params.montant} €</p>
      ${
        params.aBesoinDePreparationManuelle
          ? '<p style="color:#c4291f;"><strong>À préparer à la main</strong> : un article personnalisé (texte ou design, sans photo) n\'a pas de fichier d\'impression automatique. Voir /reglages/commandes.</p>'
          : '<p>Envoyée automatiquement à Printful.</p>'
      }
      <p><a href="/reglages/commandes">Voir toutes les commandes</a></p>
    `,
  });
}

export async function envoyerEmailExpedition(params: { email: string; nom?: string; suivi?: string }) {
  const resend = await getResendClient();
  if (!resend || !params.email) return;

  await resend.client.emails.send({
    from: resend.from,
    to: params.email,
    subject: 'Ta commande est en route',
    html: `
      <p>${params.nom ? params.nom + ',' : 'Salut,'}</p>
      <p>Ta commande vient d'être expédiée.</p>
      ${params.suivi ? `<p><a href="${params.suivi}">Suivre mon colis</a></p>` : ''}
      <p>— ALB Mentality</p>
    `,
  });
}

export async function envoyerEmailDefiJour(params: { email: string; jour: number; contenu: string }) {
  const resend = await getResendClient();
  if (!resend) return;

  await resend.client.emails.send({
    from: resend.from,
    to: params.email,
    subject: `Défi ALB — Jour ${params.jour}`,
    html: params.contenu,
  });
}
