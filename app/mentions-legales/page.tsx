import { ENTREPRISE } from '@/lib/config';

export const metadata = { title: 'Mentions légales — ALB Mentality' };

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-white/80">
      <h1 className="font-display text-2xl uppercase tracking-wide text-white">Mentions légales</h1>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold text-white">Éditeur du site</h2>
          <p>{ENTREPRISE.raisonSociale}, {ENTREPRISE.formeJuridique}</p>
          <p>Siège social : {ENTREPRISE.adresse}</p>
          <p>SIREN : {ENTREPRISE.siren}</p>
          <p>N° de TVA intracommunautaire : {ENTREPRISE.tva}</p>
          <p>Contact : {ENTREPRISE.emailContact}</p>
        </section>

        <section>
          <h2 className="font-semibold text-white">Directeur de la publication</h2>
          <p>[À FOURNIR : nom du représentant légal de la société]</p>
        </section>

        <section>
          <h2 className="font-semibold text-white">Hébergement</h2>
          <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
        </section>

        <section>
          <h2 className="font-semibold text-white">Propriété intellectuelle</h2>
          <p>
            L'ensemble des contenus présents sur ce site (textes, visuels, logo ALB Mentality) est protégé. Toute
            reproduction sans autorisation est interdite.
          </p>
        </section>
      </div>
    </div>
  );
}
