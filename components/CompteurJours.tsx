import { DATE_JOUR_1 } from '@/lib/config';

export default function CompteurJours() {
  const jours = Math.floor((Date.now() - DATE_JOUR_1.getTime()) / (1000 * 60 * 60 * 24));
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-alb-red/40 bg-alb-red/10 px-4 py-2 text-sm">
      <span className="h-2 w-2 rounded-full bg-alb-red" />
      <span>
        Jour <strong>{jours}</strong> depuis le début du défi — 16 juin 2025
      </span>
    </div>
  );
}
