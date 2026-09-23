'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { viderPanier } from '@/lib/panier-client';

export default function SuccesPage() {
  useEffect(() => {
    viderPanier();
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-3xl uppercase tracking-wide">Bienvenue dans le défi.</h1>
      <p className="mt-4 text-white/70">
        Ta commande est confirmée. Tu reçois un e-mail avec ton numéro de membre et le suivi dès que ta commande
        part en livraison.
      </p>
      <Link href="/" className="btn-primary mt-8 inline-flex">Retour à l'accueil</Link>
    </div>
  );
}
