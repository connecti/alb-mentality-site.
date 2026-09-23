# ALB Mentality — Boutique

Site e-commerce sur mesure, prêt à recevoir des commandes dès que les quatre connexions (Stripe, Printful, Resend, vérification IA) sont faites depuis la page **/reglages**. Le site inclut aussi un créateur de design : chaque client peut commander un produit tel quel, ou le personnaliser (couleur, texte, design ALB, ou sa propre photo — vérifiée automatiquement).

## ⚠️ Important avant de commencer

Ce projet a été écrit dans un environnement dont l'accès au réseau est volontairement restreint (pas d'installation de paquets possible ici, pour des raisons de sécurité). C'est normal et sans conséquence : `npm install` doit être lancé **une seule fois**, soit sur ton propre ordinateur, soit automatiquement par la plateforme d'hébergement (Vercel) au moment du déploiement. Aucune des deux méthodes ne demande de compétence technique particulière — suis simplement les étapes ci-dessous.

## Déploiement en 15 minutes (recommandé, sans ordinateur à configurer)

1. **Crée un compte sur [github.com](https://github.com)** (gratuit) et crée un nouveau dépôt vide, par exemple `alb-mentality-site`.
2. **Dépose tous les fichiers de ce dossier** dans ce dépôt (bouton "Add file" → "Upload files" sur GitHub, glisse tout le contenu du dossier).
3. **Crée un compte sur [vercel.com](https://vercel.com)** avec le même compte GitHub.
4. Sur Vercel : "Add New Project" → sélectionne ton dépôt `alb-mentality-site` → "Deploy". Vercel installe tout automatiquement.
5. Une fois déployé, Vercel te donne une adresse (ex. `alb-mentality-site.vercel.app`). Le site est en ligne.
6. **Connecte un nom de domaine** (ex. `albmentality.com`) depuis Vercel → Project Settings → Domains, si vous en achetez un (Namecheap, OVH, etc.).

## Connecter Supabase (obligatoire, à faire en premier)

Supabase stocke les commandes, les membres, et les clés des autres services.

1. Crée un compte sur [supabase.com](https://supabase.com), crée un nouveau projet (choisis une région Europe).
2. Une fois créé : menu **SQL Editor** → colle tout le contenu du fichier `supabase/schema.sql` de ce projet → **Run**.
3. Va dans **Project Settings → API** : copie l'**URL** et la clé **service_role**.
4. Sur Vercel : Project Settings → Environment Variables, ajoute :
   - `SUPABASE_URL` = l'URL copiée
   - `SUPABASE_SERVICE_ROLE_KEY` = la clé copiée
5. Redéploie (Vercel → Deployments → "Redeploy").

## Connecter Stripe, Printful et Resend (depuis le site, en un clic chacun)

Une fois le site en ligne et Supabase connecté :

1. Va sur `tonsite.com/reglages`.
2. Choisis un mot de passe (c'est celui que tu utiliseras à chaque fois pour revenir sur cette page).
3. **Stripe** (paiement) : crée un compte sur [stripe.com](https://stripe.com), active les paiements. Dans Développeurs → Clés API, copie la clé secrète et la clé publique. Pour le webhook : Développeurs → Webhooks → Ajouter un endpoint → URL = `tonsite.com/api/webhooks/stripe`, événement à cocher : `checkout.session.completed`. Copie le secret de signature. Colle les trois valeurs dans /reglages.
4. **Printful** (fabrication) : crée un compte sur [printful.com](https://printful.com), crée ta boutique, ajoute les produits (t-shirt, hoodie, casquette, jogging) avec le design ALB Mentality, active l'étiquette de cou personnalisée et le packing slip à votre nom (Réglages boutique → Marque blanche). Dans Réglages → API, génère une clé et copie l'identifiant de boutique. Colle les deux dans /reglages.
   - **Étape technique restante** : une fois les produits créés dans Printful, ouvre `lib/config.ts` et remplis le champ `printfulVariantId` de chaque produit avec l'identifiant donné par Printful (visible dans Produits → sur chaque variante). C'est la seule étape qui touche au code — tout le reste passe par /reglages.
5. **Resend** (e-mails) : crée un compte sur [resend.com](https://resend.com), connecte votre nom de domaine (Resend te donne 3 enregistrements DNS à ajouter chez votre hébergeur de domaine), génère une clé API. Colle-la dans /reglages avec l'adresse d'envoi (ex. `contact@albmentality.com`).
6. **Vérification IA** (photos clients) : crée un compte sur [platform.openai.com](https://platform.openai.com), ajoute un petit crédit (quelques dollars suffisent au début), génère une clé API (Dashboard → API keys). Colle-la dans /reglages. **Sans cette étape, le créateur de design refuse toutes les photos envoyées par les clients** — c'est volontaire : mieux vaut bloquer que laisser passer une image protégée par erreur.

À chaque connexion, l'écran passe de "Non connecté" à "Connecté" — c'est la confirmation que ça fonctionne.

### Storage Supabase pour les photos clients (une étape manuelle, 1 minute)

Le créateur de design stocke les photos des clients une fois validées par l'IA, pour pouvoir les envoyer à Printful comme fichier d'impression. Ce bucket n'est pas créé automatiquement par `supabase/schema.sql` (ce n'est pas une table SQL classique) :

1. Dans Supabase : menu **Storage** → **New bucket**.
2. Nom : `designs-clients` (ou change `SUPABASE_STORAGE_BUCKET` si tu préfères un autre nom).
3. Active **Public bucket** (l'URL publique de chaque photo est ce qui est envoyé à Printful).

## Contenu déjà en place

- Page d'accueil avec le récit fondateur et le compteur de jours réel depuis le 16 juin 2025.
- Boutique, fiches produits, panier, paiement.
- Créateur de design (`/produits/[produit]/personnaliser`) sur t-shirt, hoodie, casquette et jogging : couleur du vêtement, choix parmi des designs ALB prédéfinis, texte libre, ou photo envoyée par le client — vérifiée automatiquement (contenu interdit, puis logos/marques protégées) avant d'être acceptée. Chaque produit personnalisable reste commandable tel quel, sans rien personnaliser.
- Commandes avec photo vérifiée : le fichier est transmis directement à Printful comme visuel d'impression. Commandes avec texte/design seul (pas de photo) : marquées "à préparer manuellement" dans les commandes Supabase, en attendant un générateur automatique de visuel imprimable.
- **Application interne pour l'équipe** (pas visible des clients), protégée par le même mot de passe que /reglages :
  - `/reglages/commandes` — liste de toutes les commandes, statut, détail de la personnalisation, montant, code vidéo d'origine.
  - `/reglages/statistiques` — équivalent maison à Google Analytics : visites et ventes par code vidéo (`?code=...` ajouté au lien posté sous chaque vidéo), taux de conversion par vidéo. Rien à configurer ailleurs, tout est déjà branché (`components/TraqueurVisite.tsx`).
  - Une notification e-mail est envoyée automatiquement à l'adresse pro (celle configurée dans Resend) dès qu'une nouvelle commande arrive, avec un rappel si elle doit être préparée à la main.
- Pack Équipe, ajout du Tracker au panier, page de remerciement.
- Liste d'attente pour le maillot (`/produits/maillot-liste-attente`).
- Défi 7 jours gratuit (premier e-mail envoyé automatiquement à l'inscription).
- Pages légales (mentions légales, CGV avec l'exclusion du droit de rétractation pour le digital, confidentialité), bandeau cookies conforme CNIL.
- Site optimisé mobile, bouton d'achat collant, pas de compte requis pour commander.

## Ce qu'il reste à compléter (tous les `[À FOURNIR]`)

Ouvre `lib/config.ts` et remplis, en haut du fichier, dans l'objet `ENTREPRISE` :
- Raison sociale de la société (SAS) qui vendra sur le site
- Numéro SIREN
- Adresse du siège
- Numéro de TVA
- E-mail de contact client
- Le pourcentage reversé à l'association, uniquement s'il est confirmé (sinon laisser à 0)

Dans `app/mentions-legales/page.tsx` : le nom du représentant légal.

Photos produits : dépose les visuels réels dans `public/images/produits/` (mêmes noms de fichiers que dans `lib/config.ts`), et l'image de partage dans `public/images/og/accueil.jpg`.

Liens réels TikTok et Instagram : dans `lib/config.ts`, objet `RESEAUX`.

**Ces deux points ne doivent pas être oubliés avant le lancement** (ils étaient dans les "points à régler" du récap envoyé aux fondateurs) :
- Dépôt de la marque ALB Mentality à l'INPI.
- Création de la société commerciale et ouverture d'un compte bancaire pro (nécessaire pour activer Stripe).

## Générer le PDF du Tracker 90 jours

Une fois le projet installé (`npm install` fait, voir plus haut) :
```
npx tsx scripts/generer-tracker-pdf.ts
```
Cela crée `public/produits-digitaux/tracker-90-jours.pdf`, le fichier vendu et envoyé automatiquement après paiement.

## Kit de lancement pour les fondateurs

### 10 idées de vidéos qui mènent au site

1. **"Pourquoi j'ai un t-shirt avec un nom bizarre dessus"** — accroche 3s : *"Ce t-shirt, c'est mon Jour 1."* → renvoie vers `/histoire`.
2. **Unboxing du premier colis de la collection** — accroche : *"On a reçu les premiers vêtements ALB, regardez."*
3. **"Le pari qu'on a tenu depuis 1 an"** — reprise du récit fondateur, compteur de jours à l'écran → `/histoire`.
4. **Les 4 potes portent le Pack Équipe ensemble** — accroche : *"On ne s'en sort pas seul."* → `/produits` (code EQUIPE).
5. **"Ce qu'il y a dans le Tracker 90 jours"** — feuilletage rapide du PDF → `/produits/tracker-defi-90-jours`.
6. **Réponse à un commentaire "vous vendez quoi ?"** — direct au but → `/produits`.
7. **"Le maillot arrive"** — teaser flou du design → `/produits/maillot-liste-attente`.
8. **Témoignage d'un premier acheteur avec son numéro de membre** (avec son accord) — preuve sociale réelle.
9. **"3 signes que t'es prêt à commencer"** — contenu utile, CTA doux vers le Défi 7 jours gratuit.
10. **Compte à rebours réel de fin de drop** — *"Il reste 48h pour ce design, après il disparaît."* → `/drops`.

### Calendrier du premier drop (10 jours)

- **Jour 1-2** : Teasing — vidéos 1 et 3, lien en bio vers `/histoire` uniquement, pas encore de vente.
- **Jour 3** : Ouverture du drop — vidéo 4 ou 6, lien vers `/produits`, annonce claire de la date de fin.
- **Jour 4-7** : Une vidéo par jour (mix produit/histoire/utilité), toujours avec un code vidéo différent en description.
- **Jour 8-9** : Urgence réelle — rappeler la date de fin exacte du drop.
- **Jour 10** : Dernier jour, vidéo de clôture, puis retrait du design du site (page Archives).

### Texte de bio et lien

> ALB Mentality 🔴 On ne coule jamais.
> 👇 Rejoins le défi

Lien unique en bio : `tonsite.com` (toutes les pages d'arrivée par vidéo partent de là via les codes).

### Codes vidéo à utiliser

`JOUR1`, `EQUIPE`, `TRACKER`, `MAILLOT`, `DROP1` — à ajouter en paramètre `?code=` dans chaque lien posté, pour savoir quelle vidéo vend le mieux (visible dans `/reglages/statistiques`).

## Vérifications avant le vrai lancement

- [ ] Passer une commande test complète et vérifier qu'elle arrive bien chez Printful.
- [ ] Passer une commande test avec le créateur de design (photo, puis texte) et vérifier le statut dans Supabase.
- [ ] Tester le paiement en carte et en Bancontact.
- [ ] Ouvrir le site sur un téléphone, depuis un lien TikTok si possible.
- [ ] Vérifier qu'aucun prix affiché n'est en dessous de la marge minimum (le site les cache automatiquement, mais vérifier `lib/config.ts`).
- [ ] Relire les mentions légales et CGV une fois les `[À FOURNIR]` remplis.
- [ ] Faire valider le montage société/association par un expert-comptable avant d'encaisser les premières ventes.
