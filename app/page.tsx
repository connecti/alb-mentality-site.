import Link from 'next/link';
import Image from 'next/image';
import CompteurJours from '@/components/CompteurJours';
import CompteurMembres from '@/components/CompteurMembres';
import { produitsActifs } from '@/lib/config';

export default function AccueilPage() {
  const produits = produitsActifs().slice(0, 4);

  return (
    <div>
      {/* Section héro — reprend le récit fondateur, moteur de conversion n°1 */}
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 text-center md:pt-20">
        <CompteurJours />
        <h1 className="mt-6 font-display text-4xl uppercase leading-tight tracking-tight md:text-6xl">
          On ne coule jamais.
          <br />
          <span className="text-alb-red">On prend de l'élan.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-white/70">
          Le 16 juin 2025, on a décidé d'arrêter, ensemble. Aujourd'hui, ALB Mentality, c'est un état d'esprit —
          et une collection pour ceux qui avancent, jour après jour.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/produits" className="btn-primary">
            Je commence mon Jour 1
          </Link>
          <Link href="/histoire" className="btn-secondary">
            Découvrir l'histoire
          </Link>
        </div>
        <div className="mt-6">
          <CompteurMembres />
        </div>
      </section>

      {/* Produits phares */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 font-display text-2xl uppercase tracking-wide">La collection Jour 1</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <p className="mt-3 text-sm font-semibold">{p.nom}</p>
              <p className="text-xs text-white/60">{p.prixVenteEuros} €</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Pack Équipe — le levier signature */}
      <section className="border-y border-white/10 bg-alb-gray px-4 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-2xl uppercase tracking-wide">On ne s'en sort pas seul.</h2>
          <p className="mt-3 text-white/70">
            On a arrêté à quatre. Embarque tes potes : à partir de 2 pièces, c'est -15% pour toute l'équipe, et un
            tracker 90 jours pour chacun.
          </p>
          <Link href="/produits" className="btn-primary mt-6 inline-flex">
            Voir le Pack Équipe
          </Link>
        </div>
      </section>

      {/* Défi gratuit — capture d'e-mails */}
      <section className="mx-auto max-w-3xl px-4 py-14 text-center">
        <h2 className="font-display text-2xl uppercase tracking-wide">Pas encore prêt à commander ?</h2>
        <p className="mt-3 text-white/70">
          Rejoins le Défi 7 jours gratuit. Un e-mail par jour, pendant 7 jours, pour commencer maintenant.
        </p>
        <form action="/api/newsletter" method="POST" className="mx-auto mt-6 flex max-w-sm gap-2">
          <input
            type="email"
            name="email"
            required
            placeholder="ton@email.com"
            className="flex-1 rounded-md border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-alb-red"
          />
          <button type="submit" className="btn-primary !px-5">
            Go
          </button>
        </form>
      </section>
    </div>
  );
}
