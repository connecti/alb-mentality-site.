import Link from 'next/link';
import Image from 'next/image';
import { produitsActifs } from '@/lib/config';

export const metadata = { title: 'Boutique — ALB Mentality' };

export default function BoutiquePage() {
  const produits = produitsActifs();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl uppercase tracking-wide">La boutique</h1>
      <p className="mt-2 text-white/60">
        Fabriqué en Europe, à la commande. Livraison en 5 à 10 jours ouvrés vers la France et la Belgique.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {produits.map((p) => (
          <Link
            key={p.slug}
            href={`/produits/${p.slug}`}
            className="group rounded-lg border border-white/10 p-3 transition hover:border-alb-red"
          >
            <div className="relative aspect-square overflow-hidden rounded-md bg-alb-gray">
              <Image
                src={p.image}
                alt={p.nom}
                fill
                className="object-cover transition group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
            <p className="mt-3 text-sm font-semibold">{p.nom}</p>
            <p className="text-xs text-white/60">{p.descriptionCourte}</p>
            <p className="mt-1 text-sm">{p.prixVenteEuros} €</p>
          </Link>
        ))}
      </div>

      <div className="mt-14 rounded-lg border border-white/10 bg-alb-gray p-6 text-center">
        <h2 className="font-display text-xl uppercase tracking-wide">Maillot d'équipe ALB</h2>
        <p className="mt-2 text-white/70">
          Le maillot arrive bientôt, avec ton nom floqué au dos. Inscris-toi pour être prévenu en premier.
        </p>
        <Link href="/produits/maillot-liste-attente" className="btn-secondary mt-4 inline-flex">
          Je m'inscris
        </Link>
      </div>
    </div>
  );
}
