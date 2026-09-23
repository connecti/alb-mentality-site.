-- ──────────────────────────────────────────────────────────────────
-- Schéma Supabase — ALB Mentality
-- À exécuter une seule fois : Supabase → SQL Editor → coller → Run.
-- ───────────────────────────────────────────────────────────────

create table if not exists app_settings (
  id integer primary key default 1,
  stripe_secret_key text,
  stripe_publishable_key text,
  stripe_webhook_secret text,
  printful_api_key text,
  printful_store_id text,
  resend_api_key text,
  resend_from_email text,
  -- Vérification automatique des photos envoyées dans le customizer
  -- (contenu interdit + marques/logos protégés). Voir lib/moderation.ts.
  openai_api_key text,
  supabase_storage_bucket text default 'designs-clients',
  admin_password_hash text,
  updated_at timestamptz default now()
);

-- Bucket de stockage pour les photos clients validées par l'IA, utilisées
-- comme fichier d'impression Printful. À créer une seule fois : Supabase →
-- Storage → New bucket → nom "designs-clients" → Public bucket activé
-- (l'URL publique est ce qui est envoyé à Printful comme fichier à imprimer).

create table if not exists commandes (
  id uuid primary key default gen_random_uuid(),
  numero_membre integer not null,
  stripe_session_id text unique not null,
  printful_order_id text,
  email text not null,
  nom text,
  adresse jsonb,
  articles jsonb not null,
  montant_total_euros numeric not null,
  code_parrainage_utilise text,
  code_video text,
  statut text not null default 'payee', -- payee | a_preparer_manuellement | en_fabrication | expediee | livree | annulee
  created_at timestamptz default now()
);

create table if not exists parrainages (
  code text primary key,
  commande_id uuid references commandes(id),
  email_parrain text not null,
  utilisations integer default 0,
  created_at timestamptz default now()
);

create table if not exists liste_attente_maillot (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

create table if not exists defi_7_jours_inscrits (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  jour_actuel integer default 0,
  created_at timestamptz default now()
);

create table if not exists drops (
  slug text primary key,
  nom text not null,
  date_debut timestamptz not null,
  date_fin timestamptz not null,
  actif boolean default true
);

-- Suivi marketing minimal : une ligne par visite de page, avec le code vidéo
-- (paramètre ?code=... posté dans une bio TikTok/Instagram) s'il y en a un.
-- Sert à la page /reglages/statistiques pour savoir quelle vidéo amène du
-- monde et convertit, sans dépendre d'un outil externe (Google Analytics).
create table if not exists evenements (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'visite', -- visite | ajout_panier | debut_paiement
  page text,
  code_video text,
  created_at timestamptz default now()
);
create index if not exists evenements_code_video_idx on evenements(code_video);
create index if not exists evenements_created_at_idx on evenements(created_at);
