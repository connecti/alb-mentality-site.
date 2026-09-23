import { notFound } from 'next/navigation';
import { PRODUITS } from '@/lib/config';
import Customizer from '@/components/Customizer';

export default function PersonnaliserPage({ params }: { params: { slug: string } }) {
  const produit = PRODUITS.find((p) => p.slug === params.slug);
  if (!produit || !produit.personnalisable) return notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl uppercase tracking-wide md:text-3xl">
        Crée ton {produit.nom.toLowerCase()}
      </h1>
      <p className="mt-2 text-white/60">
        Choisis un design ALB, écris ton propre texte, ou envoie ta photo — elle est vérifiée automatiquement avant
        d'être acceptée.
      </p>
      <Customizer produit={produit} />
    </div>
  );
}
