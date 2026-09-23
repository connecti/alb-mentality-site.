'use client';

interface Props {
  nom: string;
  prix: number;
  onAcheter: () => void;
}

export default function StickyBuyBar({ nom, prix, onAcheter }: Props) {
  return (
    <div className="sticky-buy-bar">
      <div>
        <p className="text-sm font-semibold">{nom}</p>
        <p className="text-xs text-white/60">{prix} €</p>
      </div>
      <button onClick={onAcheter} className="btn-primary !px-5 !py-2 text-xs">
        Je commence mon Jour 1
      </button>
    </div>
  );
}
