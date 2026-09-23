import { nombreMembres } from '@/lib/membres';
import { COMPTEUR_MEMBRES_SEUIL_AFFICHAGE } from '@/lib/config';

// N'affiche le compteur qu'à partir du seuil réel : pas de "0 membres"
// gênant au lancement, et jamais de chiffre inventé.
export default async function CompteurMembres() {
  const total = await nombreMembres();
  if (total < COMPTEUR_MEMBRES_SEUIL_AFFICHAGE) return null;

  return (
    <p className="text-center text-sm text-white/60">
      <strong className="text-white">{total}</strong> membres ont déjà rejoint le défi.
    </p>
  );
}
