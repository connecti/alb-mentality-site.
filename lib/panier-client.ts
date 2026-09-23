'use client';

// Panier stocké côté navigateur (localStorage). Simple et suffisant pour
// une boutique sans compte client — le paiement se fait en invité.

export interface DesignPersonnalise {
  designId?: string; // un des DESIGNS_PREDEFINIS
  texte?: string;
  couleurTexte?: string;
  photoUrl?: string; // URL de la photo déjà vérifiée par IA et stockée
  couleurVetement?: string;
  apercuDataUrl?: string; // aperçu affiché dans le panier
}

export interface ArticlePanier {
  slug: string;
  nom: string;
  prix: number;
  taille?: string;
  quantite: number;
  personnalisation?: DesignPersonnalise;
}

const CLE = 'alb-panier';

export function lirePanier(): ArticlePanier[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CLE) ?? '[]');
  } catch {
    return [];
  }
}

export function ajouterAuPanier(article: ArticlePanier) {
  const panier = lirePanier();
  panier.push(article);
  localStorage.setItem(CLE, JSON.stringify(panier));
}

export function viderPanier() {
  localStorage.removeItem(CLE);
}

export function retirerDuPanier(index: number) {
  const panier = lirePanier();
  panier.splice(index, 1);
  localStorage.setItem(CLE, JSON.stringify(panier));
}
