import Link from 'next/link';
import { ENTREPRISE } from '@/lib/config';

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-alb-black px-4 py-10 text-sm text-white/60">
      <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-3">
        <div>
          <p className="font-display uppercase tracking-widest text-white">ALB Mentality</p>
          <p className="mt-2">On ne coule jamais. On prend de l'élan pour frapper encore plus fort.</p>
          {ENTREPRISE.pourcentageReverseAssociation > 0 && (
            <p className="mt-2 text-white/40">
              {ENTREPRISE.pourcentageReverseAssociation}% de chaque vente est reversé à l'association ALB Mentality.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/faq" className="hover:text-white">FAQ — tailles, délais, retours</Link>
          <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
          <Link href="/cgv" className="hover:text-white">Conditions générales de vente</Link>
          <Link href="/confidentialite" className="hover:text-white">Confidentialité</Link>
        </div>
        <div className="text-white/40">
          <p>{ENTREPRISE.raisonSociale}</p>
          <p>{ENTREPRISE.adresse}</p>
          <p>{ENTREPRISE.emailContact}</p>
        </div>
      </div>
    </footer>
  );
}
