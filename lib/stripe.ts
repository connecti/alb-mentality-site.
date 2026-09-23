import Stripe from 'stripe';
import { getSettings } from './settings';

// Le client Stripe est reconstruit à chaque appel avec la clé la plus
// récente enregistrée depuis /reglages : pas besoin de redéployer le site
// quand les fondateurs connectent ou changent leur compte Stripe.
export async function getStripeClient(): Promise<{ client: Stripe | null; connected: boolean }> {
  const settings = await getSettings();
  if (!settings.stripe_secret_key) {
    return { client: null, connected: false };
  }
  const client = new Stripe(settings.stripe_secret_key, {
    apiVersion: '2024-06-20',
  });
  return { client, connected: true };
}

export async function isStripeConnected(): Promise<boolean> {
  const settings = await getSettings();
  return Boolean(settings.stripe_secret_key && settings.stripe_publishable_key);
}
