'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { lirePanier, retirerDuPanier, type ArticlePanier } from '@/lib/panier-client';
import { LIVRAISON } from '@/lib/config';

export default function PanierPage() {
  const [panier, setPanier] = useState<ArticlePanier[]>([]);
  const [chargement, setChargement] = useState(false);
  const [pasEncorePret, setPasEncorePret] = useState(false);

  useEffect(() => {
    setPanier(lirePanier());
  }, []);

  const sousTotal = panier.reduce((s, a) => s + a.prix * a.quantite, 0);
  const livraison = sousTotal >= LIVRAISON.offerteDesEuros || sousTotal === 0 ? 0 : LIVRAISON.fraisStandardEuros;
  const total = sousTotal + livraison;

  function retirer(i: number) {
    retirerDuPanier(i);
    setPanier(lirePanier());
  }

  async function payer() {
    setChargement(true);
    setPasEncorePret(false);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articles: panier }),
    });
    const data = await res.json();
    setChargement(false);

    if (data.url) {
      window.location.href = data.url;
    } else {
      setPasEncorePret(true);
    }
  }

  if (panier.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl uppercase tracking-wide">Ton panier est vide</h1>
        <a href="/produits" className="btn-primary mt-6 inline-flex">Voir la boutique</a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-2xl uppercase tracking-wide">Ton panier</h1>

      <div className="mt-6 space-y-3">
        {panier.map((a, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-white/10 p-4">
            <div className="flex items-center gap-3">
              {a.personnalisation?.apercuDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.personnalisation.apercuDataUrl}
                  alt="Aperçu du design"
                  className="h-14 w-14 rounded-md border border-white/10 object-cover"
                />
              )}
              <div>
                <p className="font-semibold">{a.nom}</p>
                {a.taille && <p className="text-xs text-white/60">Taille {a.taille}</p>}
                {a.personnalisation && (
                  <p className="text-xs text-white/50">
                    {a.personnalisation.couleurVetement && `${a.personnalisation.couleurVetement} · `}
                    {a.personnalisation.texte
                      ? `Texte : "${a.personnalisation.texte}"`
                      : a.personnalisation.designId
                        ? `Design : ${a.personnalisation.designId}`
                        : ''}
                    {a.personnalisation.photoUrl && ' · Photo vérifiée'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p>{a.prix} €</p>
              <button onClick={() => retirer(i)} className="text-xs text-white/40 hover:text-alb-red">
                Retirer
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-1 border-t border-white/10 pt-4 text-sm text-white/70">
        <div className="flex justify-between"><span>Sous-total</span><span>{sousTotal} €</span></div>
        <div className="flex justify-between">
          <span>Livraison</span>
          <span>{livraison === 0 ? 'Offerte' : `${livraison} €`}</span>
        </div>
        <div className="flex justify-between text-base font-semibold text-white"><span>Total</span><span>{total.toFixed(2)} €</span></div>
      </div>

      <button onClick={payer} disabled={chargement} className="btn-primary mt-6 w-full">
        {chargement ? 'Un instant…' : 'Payer'}
      </button>
      <p className="mt-3 text-center text-xs text-white/40">Paiement sécurisé. Carte Bancaire, Bancontact, Apple Pay.</p>

      {pasEncorePret && (
        <div className="mt-4 rounded-lg border border-alb-red/40 bg-alb-red/10 p-4 text-sm">
          <p className="font-semibold">Le paiement n'est pas encore activé sur ce site.</p>
          <p className="mt-1 text-white/70">
            Ça se règle depuis la page Réglages, en connectant Stripe (2 minutes une fois le compte créé).
          </p>
          <Link href="/reglages" className="btn-secondary mt-3 inline-flex !px-4 !py-2 text-xs">
            Aller aux Réglages
          </Link>
        </div>
      )}
    </div>
  );
}
