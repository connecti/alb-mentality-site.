'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface EtatService {
  connecte: boolean;
  cleMasquee: string;
}

interface EtatReglages {
  stripe: EtatService;
  printful: EtatService;
  resend: EtatService;
  openai: EtatService;
}

export default function ReglagesPage() {
  const [connecte, setConnecte] = useState(false);
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [etat, setEtat] = useState<EtatReglages | null>(null);

  async function chargerEtat() {
    const res = await fetch('/api/settings');
    if (res.ok) {
      setEtat(await res.json());
      setConnecte(true);
    }
  }

  useEffect(() => {
    chargerEtat();
  }, []);

  async function seConnecter(e: React.FormEvent) {
    e.preventDefault();
    setErreur('');
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motDePasse }),
    });
    if (res.ok) {
      await chargerEtat();
    } else {
      const data = await res.json();
      setErreur(data.error ?? 'Erreur de connexion');
    }
  }

  if (!connecte) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24">
        <h1 className="font-display text-xl uppercase tracking-wide">Réglages</h1>
        <p className="mt-2 text-sm text-white/60">
          Espace réservé aux fondateurs. Première visite : le mot de passe que tu choisis ici devient le mot de
          passe d'accès.
        </p>
        <form onSubmit={seConnecter} className="mt-6 space-y-3">
          <input
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            placeholder="Mot de passe"
            className="w-full rounded-md border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-alb-red"
            required
          />
          {erreur && <p className="text-sm text-alb-red">{erreur}</p>}
          <button type="submit" className="btn-primary w-full">Entrer</button>
        </form>
      </div>
    );
  }

  const total = 4;
  const faits = [
    etat?.stripe.connecte,
    etat?.printful.connecte,
    etat?.resend.connecte,
    etat?.openai.connecte,
  ].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl uppercase tracking-wide">Réglages</h1>
        <div className="flex gap-4 text-xs text-white/50">
          <Link href="/reglages/commandes" className="hover:text-white">Commandes</Link>
          <Link href="/reglages/statistiques" className="hover:text-white">Statistiques</Link>
        </div>
      </div>
      <p className="mt-2 text-white/60">
        Quatre choses à connecter, chacune en quelques clics. Le bouton "Créer le compte" ouvre le bon site dans un
        nouvel onglet ; reviens ensuite ici coller les identifiants qu'il te donne.
      </p>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-alb-red transition-all" style={{ width: `${(faits / total) * 100}%` }} />
      </div>
      <p className="mt-2 text-xs text-white/50">{faits} sur {total} connectés{faits === total ? ' — le site peut vendre.' : ''}</p>

      <div className="mt-8 space-y-6">
        <CartePaiement etat={etat?.stripe} />
        <CarteProduction etat={etat?.printful} />
        <CarteEmail etat={etat?.resend} />
        <CarteVerificationIA etat={etat?.openai} />
      </div>
    </div>
  );
}

function BoutonCreerCompte({ href, texte }: { href: string; texte: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-secondary !px-4 !py-2 text-xs"
    >
      {texte} ↗
    </a>
  );
}

function Badge({ connecte }: { connecte?: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs uppercase ${
        connecte ? 'bg-green-600/20 text-green-400' : 'bg-white/10 text-white/50'
      }`}
    >
      {connecte ? 'Connecté' : 'Non connecté'}
    </span>
  );
}

function CartePaiement({ etat }: { etat?: EtatService }) {
  const [secretKey, setSecretKey] = useState('');
  const [publishableKey, setPublishableKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState('');

  async function connecter() {
    setEnCours(true);
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service: 'stripe', secretKey, publishableKey, webhookSecret }),
    });
    const data = await res.json();
    setMessage(data.ok ? 'Paiement connecté. Le site peut désormais encaisser.' : data.error);
    setEnCours(false);
  }

  return (
    <div className="rounded-lg border border-white/10 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">1. Paiement (Stripe)</h2>
        <Badge connecte={etat?.connecte} />
      </div>
      <p className="mt-1 text-sm text-white/60">
        C'est ici que les clients paieront par carte et Bancontact.
      </p>
      {etat?.connecte && <p className="mt-2 text-xs text-white/40">Clé actuelle : {etat.cleMasquee}</p>}

      <div className="mt-3">
        <BoutonCreerCompte href="https://dashboard.stripe.com/register" texte="Créer le compte Stripe" />
      </div>
      <p className="mt-2 text-xs text-white/50">
        Puis : Développeurs → Clés API (copie les deux clés) et Développeurs → Webhooks → Ajouter un endpoint avec
        l'URL <code className="text-white/70">tonsite.com/api/webhooks/stripe</code>, événement
        <code className="text-white/70"> checkout.session.completed</code> (copie le secret de signature).
      </p>

      <div className="mt-4 space-y-2">
        <input
          placeholder="Clé secrète (sk_live_...)"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm"
        />
        <input
          placeholder="Clé publique (pk_live_...)"
          value={publishableKey}
          onChange={(e) => setPublishableKey(e.target.value)}
          className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm"
        />
        <input
          placeholder="Secret webhook (whsec_...)"
          value={webhookSecret}
          onChange={(e) => setWebhookSecret(e.target.value)}
          className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm"
        />
        <button onClick={connecter} disabled={enCours} className="btn-primary !px-4 !py-2 text-xs">
          {enCours ? 'Connexion…' : 'Connecter Stripe'}
        </button>
        {message && <p className="text-xs text-white/60">{message}</p>}
      </div>
    </div>
  );
}

function CarteProduction({ etat }: { etat?: EtatService }) {
  const [apiKey, setApiKey] = useState('');
  const [storeId, setStoreId] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState('');

  async function connecter() {
    setEnCours(true);
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service: 'printful', apiKey, storeId }),
    });
    const data = await res.json();
    setMessage(data.ok ? 'Fabrication connectée. Les commandes partiront automatiquement.' : data.error);
    setEnCours(false);
  }

  return (
    <div className="rounded-lg border border-white/10 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">2. Fabrication et livraison (Printful)</h2>
        <Badge connecte={etat?.connecte} />
      </div>
      <p className="mt-1 text-sm text-white/60">
        C'est le fabricant qui imprime et envoie les vêtements sous votre nom, sans jamais apparaître côté client.
      </p>
      {etat?.connecte && <p className="mt-2 text-xs text-white/40">Clé actuelle : {etat.cleMasquee}</p>}

      <div className="mt-3">
        <BoutonCreerCompte href="https://www.printful.com/auth/register" texte="Créer le compte Printful" />
      </div>
      <p className="mt-2 text-xs text-white/50">
        Ajoute ensuite les produits (t-shirt, hoodie, casquette, jogging) avec le logo ALB, active l'étiquette de
        cou et le bon de livraison personnalisés (Réglages boutique → Marque blanche). Puis Réglages → API pour
        générer la clé ci-dessous.
      </p>

      <div className="mt-4 space-y-2">
        <input
          placeholder="Clé API Printful"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm"
        />
        <input
          placeholder="Identifiant de la boutique"
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm"
        />
        <button onClick={connecter} disabled={enCours} className="btn-primary !px-4 !py-2 text-xs">
          {enCours ? 'Connexion…' : 'Connecter Printful'}
        </button>
        {message && <p className="text-xs text-white/60">{message}</p>}
      </div>
    </div>
  );
}

function CarteEmail({ etat }: { etat?: EtatService }) {
  const [apiKey, setApiKey] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState('');

  async function connecter() {
    setEnCours(true);
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service: 'resend', apiKey, fromEmail }),
    });
    const data = await res.json();
    setMessage(data.ok ? 'E-mails connectés.' : data.error);
    setEnCours(false);
  }

  return (
    <div className="rounded-lg border border-white/10 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">3. E-mails (Resend)</h2>
        <Badge connecte={etat?.connecte} />
      </div>
      <p className="mt-1 text-sm text-white/60">
        Pour envoyer les e-mails de confirmation de commande et de suivi de livraison.
      </p>
      {etat?.connecte && <p className="mt-2 text-xs text-white/40">Clé actuelle : {etat.cleMasquee}</p>}

      <div className="mt-3">
        <BoutonCreerCompte href="https://resend.com/signup" texte="Créer le compte Resend" />
      </div>
      <p className="mt-2 text-xs text-white/50">
        Connecte votre nom de domaine (Resend donne 3 lignes DNS à ajouter chez votre hébergeur de domaine), puis
        génère une clé API ci-dessous.
      </p>

      <div className="mt-4 space-y-2">
        <input
          placeholder="Clé API Resend"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm"
        />
        <input
          placeholder="Adresse d'envoi (contact@albmentality.com)"
          value={fromEmail}
          onChange={(e) => setFromEmail(e.target.value)}
          className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm"
        />
        <button onClick={connecter} disabled={enCours} className="btn-primary !px-4 !py-2 text-xs">
          {enCours ? 'Connexion…' : 'Connecter Resend'}
        </button>
        {message && <p className="text-xs text-white/60">{message}</p>}
      </div>
    </div>
  );
}

function CarteVerificationIA({ etat }: { etat?: EtatService }) {
  const [apiKey, setApiKey] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState('');

  async function connecter() {
    setEnCours(true);
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service: 'openai', apiKey }),
    });
    const data = await res.json();
    setMessage(data.ok ? 'Vérification IA connectée. Les photos envoyées par les clients sont désormais contrôlées automatiquement.' : data.error);
    setEnCours(false);
  }

  return (
    <div className="rounded-lg border border-white/10 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">4. Vérification des photos (IA)</h2>
        <Badge connecte={etat?.connecte} />
      </div>
      <p className="mt-1 text-sm text-white/60">
        Quand un client envoie sa propre photo dans le créateur de design, elle est automatiquement contrôlée avant
        d'être acceptée : contenu interdit, puis logos ou marques protégées. Tant que ce n'est pas connecté, aucune
        photo client n'est acceptée — par sécurité, jamais l'inverse.
      </p>
      {etat?.connecte && <p className="mt-2 text-xs text-white/40">Clé actuelle : {etat.cleMasquee}</p>}

      <div className="mt-3">
        <BoutonCreerCompte href="https://platform.openai.com/signup" texte="Créer le compte OpenAI" />
      </div>
      <p className="mt-2 text-xs text-white/50">
        Puis : Dashboard → API keys → Create new secret key, et colle-la ci-dessous. Un petit crédit de départ
        (quelques dollars) suffit largement pour démarrer.
      </p>

      <div className="mt-4 space-y-2">
        <input
          placeholder="Clé API OpenAI (sk-...)"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm"
        />
        <button onClick={connecter} disabled={enCours} className="btn-primary !px-4 !py-2 text-xs">
          {enCours ? 'Connexion…' : 'Connecter la vérification IA'}
        </button>
        {message && <p className="text-xs text-white/60">{message}</p>}
      </div>
    </div>
  );
}
