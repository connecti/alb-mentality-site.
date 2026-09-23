'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Produit } from '@/lib/config';
import { ajouterAuPanier } from '@/lib/panier-client';
import StickyBuyBar from './StickyBuyBar';

export default function AjouterAuPanier({ produit }: { produit: Produit }) {
  const [taille, setTaille] = useState(produit.tailles?.[0] ?? '');
  const [avecTracker, setAvecTracker] = useState(true);
  const router = useRouter();

  function acheter() {
    ajouterAuPanier({
      slug: produit.slug,
      nom: produit.nom,
      prix: produit.prixVenteEuros,
      taille: taille || undefined,
      quantite: 1,
    });
    if (avecTracker) {
      ajouterAuPanier({ slug: 'tracker-defi-90-jours', nom: 'Tracker Défi 90 jours', prix: 9, quantite: 1 });
    }
    router.push('/panier');
  }

  return (
    <div className="mt-6">
      {produit.tailles && (
        <div className="mb-4">
          <p className="mb-2 text-sm text-white/70">Taille</p>
          <div className="flex gap-2">
            {produit.tailles.map((t) => (
              <button
                key={t}
                onClick={() => setTaille(t)}
                className={`rounded-md border px-3 py-2 text-sm ${
                  taille === t ? 'border-alb-red bg-alb-red/10' : 'border-white/20'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {produit.categorie === 'vetement' && (
        <label className="mb-4 flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={avecTracker}
            onChange={(e) => setAvecTracker(e.target.checked)}
            className="h-4 w-4 accent-alb-red"
          />
          Ajouter le Tracker 90 jours (+9 €)
        </label>
      )}

      <div className="flex flex-col gap-3 md:flex-row">
        <button onClick={acheter} className="btn-primary w-full md:w-auto">
          Je commence mon Jour 1
        </button>

        {produit.personnalisable && (
          <Link
            href={`/produits/${produit.slug}/personnaliser`}
            className="btn-secondary flex w-full items-center justify-center md:w-auto"
          >
            Créer mon propre design
          </Link>
        )}
      </div>

      {produit.personnalisable && (
        <p className="mt-2 text-xs text-white/40">
          Ce modèle se commande aussi tel quel, sans rien personnaliser — le bouton ci-dessus suffit.
        </p>
      )}

      <StickyBuyBar nom={produit.nom} prix={produit.prixVenteEuros} onAcheter={acheter} />
    </div>
  );
}
