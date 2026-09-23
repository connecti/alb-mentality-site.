'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Équivalent maison, très simple, à un outil de type Google Analytics :
// à chaque page vue, envoie silencieusement la page et le code vidéo
// (paramètre ?code=JOUR1, ?code=EQUIPE, etc., posté dans une bio) à
// /api/evenement. Visible ensuite dans /reglages/statistiques. Le code
// vidéo est aussi gardé 30 jours dans un cookie pour être associé à la
// commande si l'achat a lieu plus tard (voir lib/panier-client.ts).
export default function TraqueurVisite() {
  const chemin = usePathname();
  const parametres = useSearchParams();

  useEffect(() => {
    const code = parametres?.get('code') ?? lireCodeCookie();
    if (parametres?.get('code')) {
      document.cookie = `alb-code-video=${encodeURIComponent(parametres.get('code')!)}; max-age=${60 * 60 * 24 * 30}; path=/`;
    }

    fetch('/api/evenement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'visite', page: chemin, code: code || undefined }),
      keepalive: true,
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chemin]);

  return null;
}

function lireCodeCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const trouve = document.cookie.split('; ').find((c) => c.startsWith('alb-code-video='));
  return trouve ? decodeURIComponent(trouve.split('=')[1]) : null;
}
