import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PRODUITS, produitsActifs, PACK_EQUIPE_REDUCTION } from '@/lib/config';
import AjouterAuPanier from '@/components/AjouterAuPanier';

export function generateStaticParams() {
  return produitsActifs().map((p) => ({ slug: p.slug }));
}

export default function FicheProduitPage({ params }: { params: { slug: string } }) {
  const produit = PRODUITS.find((p) => p.slug === params.slug);
  if (!produit) return notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-alb-gray">
          <Image src={produit.image} alt={produit.nom} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        </div>

        <div>
          <h1 className="font-display text-2xl uppercase tracking-wide md:text-3xl">{produit.nom}</h1>
          <p className="mt-2 text-xl">{produit.prixVenteEuros} €</p>
          <p className="mt-4 text-white/70">{produit.description}</p>

          {/* Ancrage : 3 options côte à côte */}
          <div className="mt-8 space-y-3">
            <div className="rounded-lg border border-white/15 p-4">
              <p className="font-semibold">La pièce seule</p>
              <p className="text-sm text-white/60">{produit.prixVenteEuros} €</p>
            </div>
            <div className="rounded-lg border-2 border-alb-red p-4">
              <p className="font-semibold">
                Kit Jour 1 <span className="ml-2 rounded bg-alb-red px-2 py-0.5 text-xs uppercase">Recommandé</span>
              </p>
              <p className="text-sm text-white/60">La pièce + le Tracker 90 jours</p>
              <p className="mt-1 text-sm">{produit.prixVenteEuros + 9} €</p>
            </div>
            <div className="rounded-lg border border-white/15 p-4">
              <p className="font-semibold">Pack Équipe (2 à 4 pièces)</p>
              <p className="text-sm text-white/60">-{PACK_EQUIPE_REDUCTION * 100}% pour toute l'équipe + un tracker chacun</p>
            </div>
          </div>

          <AjouterAuPanier produit={produit} />

          <p className="mt-6 text-xs text-white/40">
            Fabriqué à la commande en Europe. Livraison estimée 5 à 10 jours ouvrés. Article non personnalisé :
            droit de rétractation de 14 jours applicable — voir nos{' '}
            <a href="/cgv" className="underline">CGV</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
