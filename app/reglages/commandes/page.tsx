'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Commande {
  id: string;
  numero_membre: number;
  email: string;
  nom: string | null;
  articles: { slug: string; quantite: number; personnalisation?: { photoUrl?: string; texte?: string; designId?: string } }[];
  montant_total_euros: number;
  statut: string;
  code_video: string | null;
  printful_order_id: string | null;
  created_at: string;
}

const LIBELLES_STATUT: Record<string, { texte: string; couleur: string }> = {
  payee: { texte: 'Payée — envoyée à Printful', couleur: '#3fbf72' },
  a_preparer_manuellement: { texte: 'À préparer à la main', couleur: '#e8b23c' },
  en_fabrication: { texte: 'En fabrication', couleur: '#5a9bd8' },
  expediee: { texte: 'Expédiée', couleur: '#5a9bd8' },
  livree: { texte: 'Livrée', couleur: '#3fbf72' },
  annulee: { texte: 'Annulée', couleur: '#c4291f' },
};

export default function CommandesPage() {
  const [connecte, setConnecte] = useState(false);
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [commandes, setCommandes] = useState<Commande[] | null>(null);
  const [supabaseConnecte, setSupabaseConnecte] = useState(true);

  async function charger() {
    const res = await fetch('/api/commandes');
    if (res.ok) {
      const data = await res.json();
      setCommandes(data.commandes);
      setSupabaseConnecte(data.connecte);
      setConnecte(true);
    }
  }

  useEffect(() => {
    charger();
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
      await charger();
    } else {
      const data = await res.json();
      setErreur(data.error ?? 'Erreur de connexion');
    }
  }

  if (!connecte) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24">
        <h1 className="font-display text-xl uppercase tracking-wide">Commandes</h1>
        <p className="mt-2 text-sm text-white/60">Espace réservé aux fondateurs.</p>
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl uppercase tracking-wide">Commandes</h1>
        <div className="flex gap-4 text-xs text-white/50">
          <Link href="/reglages" className="hover:text-white">Réglages</Link>
          <Link href="/reglages/statistiques" className="hover:text-white">Statistiques</Link>
        </div>
      </div>

      {!supabaseConnecte && (
        <p className="mt-4 rounded-lg border border-alb-red/40 bg-alb-red/10 p-4 text-sm">
          Supabase n'est pas encore connecté — aucune commande ne peut être listée ici tant que ce n'est pas fait.
        </p>
      )}

      {supabaseConnecte && commandes && commandes.length === 0 && (
        <p className="mt-6 text-sm text-white/50">Aucune commande pour l'instant.</p>
      )}

      <div className="mt-6 space-y-3">
        {commandes?.map((c) => {
          const statut = LIBELLES_STATUT[c.statut] ?? { texte: c.statut, couleur: '#8a857a' };
          const aPersonnalisation = c.articles.some((a) => a.personnalisation);
          return (
            <div key={c.id} className="rounded-lg border border-white/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">Membre #{c.numero_membre} — {c.nom || c.email}</p>
                  <p className="text-xs text-white/50">{new Date(c.created_at).toLocaleString('fr-FR')}</p>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: `${statut.couleur}22`, color: statut.couleur }}
                >
                  {statut.texte}
                </span>
              </div>

              <div className="mt-3 text-sm text-white/70">
                {c.articles.map((a, i) => (
                  <p key={i}>
                    {a.quantite}× {a.slug}
                    {a.personnalisation?.texte && ` — texte : "${a.personnalisation.texte}"`}
                    {a.personnalisation?.designId && ` — design : ${a.personnalisation.designId}`}
                    {a.personnalisation?.photoUrl && ' — photo vérifiée jointe'}
                  </p>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/50">
                <span>{c.montant_total_euros} €</span>
                {c.code_video && <span>Code vidéo : {c.code_video}</span>}
                {c.printful_order_id && <span>Printful #{c.printful_order_id}</span>}
              </div>

              {aPersonnalisation && c.statut === 'a_preparer_manuellement' && (
                <p className="mt-3 rounded-md border border-dashed border-white/20 bg-white/5 p-2 text-xs text-white/60">
                  Personnalisation sans photo : pas de fichier d'impression automatique. À préparer à la main avant
                  envoi à Printful.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
