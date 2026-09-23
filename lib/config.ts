// ─────────────────────────────────────────────────────
// FICHIER CENTRAL DE CONFIGURATION — ALB Mentality
// C'est le seul fichier à modifier pour changer les prix, la marge minimum,
// les produits, ou les informations légales de l'entreprise.
// ─────────────────────────────────────────────────────

export const ENTREPRISE = {
  // [À FOURNIR] Raison sociale exacte de la société commerciale (pas l'association)
  raisonSociale: '[À FOURNIR : Nom de la SAS]',
  formeJuridique: 'SAS',
  siren: '[À FOURNIR : numéro SIREN]',
  adresse: '[À FOURNIR : adresse du siège]',
  tva: '[À FOURNIR : numéro de TVA intracommunautaire]',
  emailContact: '[À FOURNIR : email de contact client]',
  // Laisser à 0 tant que le pourcentage exact n'est pas confirmé.
  // Si > 0, la mention apparaît automatiquement en page d'accueil et au pied de page.
  pourcentageReverseAssociation: 0,
};

export const MARGE_MINIMUM_EUROS = 10;

export const LIVRAISON = {
  offerteDesEuros: 60,
  fraisStandardEuros: 4.9,
  delaiJoursOuvresMin: 5,
  delaiJoursOuvresMax: 10,
};

export type Categorie = 'vetement' | 'digital';

export interface Produit {
  slug: string;
  nom: string;
  categorie: Categorie;
  prixVenteEuros: number;
  // Coût fournisseur + emballage, hors livraison — à ajuster une fois le compte Printful connecté
  // et les vrais coûts constatés (voir page /reglages).
  coutFournisseurEuros: number;
  description: string;
  descriptionCourte: string;
  tailles?: string[];
  couleurs?: string[];
  // Identifiant du produit/variant côté Printful, à remplir depuis /reglages une fois le compte connecté.
  printfulVariantId?: string;
  image: string;
  actif: boolean;
  // true = le client peut aussi le personnaliser (photo, texte, design ALB) avant de commander.
  // Le produit reste commandable tel quel, sans personnalisation, dans tous les cas.
  personnalisable?: boolean;
  couleursDisponibles?: string[];
}

export interface DesignPredefini {
  id: string;
  nom: string;
  // Aperçu simple dessiné en CSS/SVG dans le customizer (pas un fichier externe,
  // pour rester indépendant des vraies images tant qu'elles ne sont pas fournies).
  cheminApercu: string;
}

// Bibliothèque de designs ALB Mentality que le client peut choisir tels quels,
// ou comme point de départ avant d'ajouter son propre texte.
// [À FOURNIR] Remplacer par les vrais designs de la marque une fois livrés.
export const DESIGNS_PREDEFINIS: DesignPredefini[] = [
  { id: 'jour1', nom: 'Jour 1', cheminApercu: '/images/designs/jour1.png' },
  { id: 'mentality', nom: 'Mentality Script', cheminApercu: '/images/designs/mentality.png' },
  { id: 'onnecoulejamais', nom: 'On ne coule jamais', cheminApercu: '/images/designs/onnecoulejamais.png' },
];

export const SUPPLEMENT_PERSONNALISATION_EUROS = 6;
export const COULEURS_VETEMENT = ['Noir', 'Blanc', 'Gris chiné', 'Bordeaux'];

export const PRODUITS: Produit[] = [
  {
    slug: 't-shirt-jour-1',
    nom: 'T-shirt Jour 1',
    categorie: 'vetement',
    prixVenteEuros: 32,
    coutFournisseurEuros: 14,
    description:
      "Le t-shirt qui a tout déclenché. Coupe heavyweight, coton épais, sérigraphie du logo ALB Mentality au dos. Celui qu'on porte le jour où on décide de changer.",
    descriptionCourte: 'Coton heavyweight, logo dos, coupe droite.',
    tailles: ['S', 'M', 'L', 'XL', 'XXL'],
    image: '/images/produits/t-shirt-jour-1.jpg',
    actif: true,
    personnalisable: true,
    couleursDisponibles: COULEURS_VETEMENT,
  },
  {
    slug: 'hoodie-jour-1',
    nom: 'Hoodie Jour 1',
    categorie: 'vetement',
    prixVenteEuros: 55,
    coutFournisseurEuros: 29,
    description:
      "Molleton épais, capuche doublée, logo ALB Mentality discret sur la poitrine. Fait pour les matins où il faut se motiver seul.",
    descriptionCourte: 'Molleton épais, capuche doublée.',
    tailles: ['S', 'M', 'L', 'XL', 'XXL'],
    image: '/images/produits/hoodie-jour-1.jpg',
    actif: true,
    personnalisable: true,
    couleursDisponibles: COULEURS_VETEMENT,
  },
  {
    slug: 'casquette-alb',
    nom: 'Casquette ALB',
    categorie: 'vetement',
    prixVenteEuros: 27,
    coutFournisseurEuros: 13,
    description: 'Casquette brodée, logo ALB Mentality à l\'avant. Simple, propre, efficace.',
    descriptionCourte: 'Broderie avant, réglable.',
    image: '/images/produits/casquette-alb.jpg',
    actif: true,
    personnalisable: true,
    couleursDisponibles: COULEURS_VETEMENT,
  },
  {
    slug: 'jogging-jour-1',
    nom: 'Jogging Jour 1',
    categorie: 'vetement',
    prixVenteEuros: 49,
    coutFournisseurEuros: 24,
    description: 'Jogging confortable, poches zippées, logo discret sur la cuisse. Pour s\'entraîner ou pour la rue.',
    descriptionCourte: 'Poches zippées, coupe droite.',
    tailles: ['S', 'M', 'L', 'XL', 'XXL'],
    image: '/images/produits/jogging-jour-1.jpg',
    actif: true,
    personnalisable: true,
    couleursDisponibles: COULEURS_VETEMENT,
  },
  {
    slug: 'tracker-defi-90-jours',
    nom: 'Tracker Défi 90 jours',
    categorie: 'digital',
    prixVenteEuros: 9,
    coutFournisseurEuros: 0,
    description:
      "Le PDF à imprimer ou à remplir à l'écran : 90 jours à cocher, un check-in chaque semaine, une page pour écrire pourquoi tu as commencé. Livré immédiatement après paiement.",
    descriptionCourte: 'PDF imprimable, 90 jours à cocher.',
    image: '/images/produits/tracker-90-jours.jpg',
    actif: true,
  },
];

export function margeEuros(p: Produit): number {
  return p.prixVenteEuros - p.coutFournisseurEuros - LIVRAISON.fraisStandardEuros;
}

export function produitPubliable(p: Produit): boolean {
  if (p.categorie === 'digital') return true;
  return margeEuros(p) >= MARGE_MINIMUM_EUROS;
}

// Produits réellement affichés sur le site : filtre automatique de la marge minimum.
export function produitsActifs(): Produit[] {
  return PRODUITS.filter((p) => p.actif && produitPubliable(p));
}

export const PACK_EQUIPE_REDUCTION = 0.15; // -15%
export const PACK_EQUIPE_MIN_PIECES = 2;
export const PACK_EQUIPE_MAX_PIECES = 4;

export const PARRAINAGE = {
  reductionFilleulPourcent: 10,
  creditParrainEuros: 5,
};

export const COMPTEUR_MEMBRES_SEUIL_AFFICHAGE = 50;

// Date du "Jour 1" pour le compteur réel en page d'accueil.
export const DATE_JOUR_1 = new Date('2025-06-16T00:00:00Z');

export const RESEAUX = {
  // [À FOURNIR] liens réels
  tiktok: '[À FOURNIR : lien TikTok]',
  instagram: '[À FOURNIR : lien Instagram]',
};
