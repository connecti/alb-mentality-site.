'use client';

import { useEffect, useState } from 'react';

// Bandeau conforme CNIL : refuser est aussi simple qu'accepter, même taille
// de bouton, même mise en avant. Aucun pixel (TikTok/Meta) ne se charge tant
// que "Accepter" n'a pas été cliqué.
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choix = localStorage.getItem('alb-cookies');
    if (!choix) setVisible(true);
  }, []);

  function choisir(accepte: boolean) {
    localStorage.setItem('alb-cookies', accepte ? 'accepte' : 'refuse');
    setVisible(false);
    if (accepte) {
      window.dispatchEvent(new CustomEvent('alb-cookies-acceptes'));
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-alb-gray p-4 text-sm text-white/80">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 md:flex-row md:justify-between">
        <p>
          On utilise des cookies pour mesurer l'audience et suivre l'efficacité de nos vidéos. Tu peux refuser sans
          rien perdre.
        </p>
        <div className="flex gap-2">
          <button onClick={() => choisir(false)} className="btn-secondary !px-4 !py-2 text-xs">
            Refuser
          </button>
          <button onClick={() => choisir(true)} className="btn-primary !px-4 !py-2 text-xs">
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
