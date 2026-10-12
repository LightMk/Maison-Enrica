-- ============================================================
-- MAISON ENRICA — STRUCTURE DYNAMIQUE SUPABASE
-- À exécuter dans l'éditeur SQL du projet après sauvegarde.
-- Aucun compte public n'est créé par ce script.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.administrateurs (
    id uuid primary key references auth.users(id) on delete cascade,
    role text not null default 'redacteur' check (role in ('admin', 'redacteur')),
    created_at timestamptz not null default now()
);

create table if not exists public.actualites (
    id uuid primary key default gen_random_uuid(),
    titre text not null check (char_length(titre) between 3 and 160),
    contenu text not null,
    image_url text,
    source_url text,
    statut text not null default 'brouillon' check (statut in ('brouillon', 'publie', 'archive')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.evenements (
    id uuid primary key default gen_random_uuid(),
    titre text not null check (char_length(titre) between 3 and 160),
    description text not null,
    date_debut timestamptz not null,
    date_fin timestamptz,
    lieu text,
    image_url text,
    statut text not null default 'brouillon' check (statut in ('brouillon', 'publie', 'archive')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.besoins (
    id uuid primary key default gen_random_uuid(),
    titre text not null check (char_length(titre) between 3 and 160),
    description text not null,
    priorite text not null default 'normale' check (priorite in ('normale', 'importante', 'urgente')),
    statut text not null default 'actif' check (statut in ('actif', 'satisfait', 'archive')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.informations_publiques (
    cle text primary key,
    valeur text not null,
    updated_at timestamptz not null default now()
);

alter table public.administrateurs enable row level security;
alter table public.actualites enable row level security;
alter table public.evenements enable row level security;
alter table public.besoins enable row level security;
alter table public.informations_publiques enable row level security;

-- Un utilisateur connecté peut uniquement lire sa propre ligne de rôle.
drop policy if exists "administrateur_lit_son_role" on public.administrateurs;
create policy "administrateur_lit_son_role"
on public.administrateurs for select
to authenticated
using (id = auth.uid());

-- Le public ne lit que ce qui est réellement publié.
drop policy if exists "actualites_publiques" on public.actualites;
create policy "actualites_publiques"
on public.actualites for select
to anon, authenticated
using (statut = 'publie' or exists (
    select 1 from public.administrateurs a where a.id = auth.uid()
));

drop policy if exists "evenements_publics" on public.evenements;
create policy "evenements_publics"
on public.evenements for select
to anon, authenticated
using (statut = 'publie' or exists (
    select 1 from public.administrateurs a where a.id = auth.uid()
));

drop policy if exists "besoins_publics" on public.besoins;
create policy "besoins_publics"
on public.besoins for select
to anon, authenticated
using (statut = 'actif' or exists (
    select 1 from public.administrateurs a where a.id = auth.uid()
));

drop policy if exists "informations_publiques_lecture" on public.informations_publiques;
create policy "informations_publiques_lecture"
on public.informations_publiques for select
to anon, authenticated
using (true);

-- Seuls les comptes présents dans administrateurs peuvent modifier les contenus.
drop policy if exists "administrateurs_gerent_actualites" on public.actualites;
create policy "administrateurs_gerent_actualites"
on public.actualites for all
to authenticated
using (exists (select 1 from public.administrateurs a where a.id = auth.uid() and a.role = 'admin'))
with check (exists (select 1 from public.administrateurs a where a.id = auth.uid() and a.role = 'admin'));

drop policy if exists "administrateurs_gerent_evenements" on public.evenements;
create policy "administrateurs_gerent_evenements"
on public.evenements for all
to authenticated
using (exists (select 1 from public.administrateurs a where a.id = auth.uid() and a.role = 'admin'))
with check (exists (select 1 from public.administrateurs a where a.id = auth.uid() and a.role = 'admin'));

drop policy if exists "administrateurs_gerent_besoins" on public.besoins;
create policy "administrateurs_gerent_besoins"
on public.besoins for all
to authenticated
using (exists (select 1 from public.administrateurs a where a.id = auth.uid() and a.role = 'admin'))
with check (exists (select 1 from public.administrateurs a where a.id = auth.uid() and a.role = 'admin'));

drop policy if exists "administrateurs_gerent_infos" on public.informations_publiques;
create policy "administrateurs_gerent_infos"
on public.informations_publiques for all
to authenticated
using (exists (select 1 from public.administrateurs a where a.id = auth.uid() and a.role = 'admin'))
with check (exists (select 1 from public.administrateurs a where a.id = auth.uid() and a.role = 'admin'));

-- Valeurs de départ facultatives : aucune donnée fictive n'est insérée.

-- ============================================================
-- COMMENTAIRES MODÉRÉS
-- ============================================================
create table if not exists public.commentaires (
    id uuid primary key default gen_random_uuid(),
    nom text not null check (char_length(nom) between 2 and 80),
    message text not null check (char_length(message) between 5 and 1000),
    statut text not null default 'en_attente' check (statut in ('en_attente', 'publie', 'masque')),
    created_at timestamptz not null default now()
);

alter table public.commentaires enable row level security;

drop policy if exists "commentaires_publics" on public.commentaires;
create policy "commentaires_publics"
on public.commentaires for select
to anon, authenticated
using (statut = 'publie' or exists (
    select 1 from public.administrateurs a where a.id = auth.uid()
));

-- Le public ne peut jamais publier directement un commentaire : il ne peut
-- qu'insérer un commentaire en attente de modération.
drop policy if exists "commentaires_en_attente" on public.commentaires;
create policy "commentaires_en_attente"
on public.commentaires for insert
to anon
with check (statut = 'en_attente');

drop policy if exists "administrateurs_gerent_commentaires" on public.commentaires;
create policy "administrateurs_gerent_commentaires"
on public.commentaires for all
to authenticated
using (exists (select 1 from public.administrateurs a where a.id = auth.uid() and a.role = 'admin'))
with check (exists (select 1 from public.administrateurs a where a.id = auth.uid() and a.role = 'admin'));

-- Compatibilité avec une table actualites déjà créée pendant la phase précédente.
alter table public.actualites add column if not exists source_url text;
alter table public.actualites add column if not exists image_url text;
alter table public.actualites add column if not exists updated_at timestamptz not null default now();
alter table public.actualites drop constraint if exists actualites_statut_check;
alter table public.actualites add constraint actualites_statut_check check (statut in ('brouillon', 'publie', 'archive'));

-- Droits SQL minimums ; les politiques RLS restent la barrière effective.
grant select on public.administrateurs to authenticated;
grant select on public.actualites, public.evenements, public.besoins, public.informations_publiques, public.commentaires to anon, authenticated;
grant insert, update, delete on public.actualites, public.evenements, public.besoins, public.informations_publiques, public.commentaires to authenticated;
grant insert on public.commentaires to anon;

-- ============================================================
-- La finalisation de l'administration (projets, réalisations,
-- partenaires, responsables, messages et Storage) se trouve dans :
-- supabase/migration-finalisation-admin.sql
-- ============================================================


-- CORRECTIF RLS PUBLICATION 2026-10-12
-- Évite que les politiques publiques aient besoin de lire directement
-- la table privée administrateurs.
create or replace function public.est_administrateur()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from public.administrateurs
        where id = auth.uid() and role = 'admin'
    );
$$;
revoke all on function public.est_administrateur() from public;
grant execute on function public.est_administrateur() to anon, authenticated;

drop policy if exists "actualites_publiques" on public.actualites;
create policy "actualites_publiques" on public.actualites for select to anon, authenticated
using (statut = 'publie' or public.est_administrateur());
drop policy if exists "administrateurs_gerent_actualites" on public.actualites;
create policy "administrateurs_gerent_actualites" on public.actualites for all to authenticated
using (public.est_administrateur()) with check (public.est_administrateur());

drop policy if exists "evenements_publics" on public.evenements;
create policy "evenements_publics" on public.evenements for select to anon, authenticated
using (statut = 'publie' or public.est_administrateur());
drop policy if exists "administrateurs_gerent_evenements" on public.evenements;
create policy "administrateurs_gerent_evenements" on public.evenements for all to authenticated
using (public.est_administrateur()) with check (public.est_administrateur());

drop policy if exists "besoins_publics" on public.besoins;
create policy "besoins_publics" on public.besoins for select to anon, authenticated
using (statut = 'actif' or public.est_administrateur());
drop policy if exists "administrateurs_gerent_besoins" on public.besoins;
create policy "administrateurs_gerent_besoins" on public.besoins for all to authenticated
using (public.est_administrateur()) with check (public.est_administrateur());

drop policy if exists "administrateurs_gerent_infos" on public.informations_publiques;
create policy "administrateurs_gerent_infos" on public.informations_publiques for all to authenticated
using (public.est_administrateur()) with check (public.est_administrateur());

drop policy if exists "commentaires_publics" on public.commentaires;
create policy "commentaires_publics" on public.commentaires for select to anon, authenticated
using (statut = 'publie' or public.est_administrateur());
drop policy if exists "administrateurs_gerent_commentaires" on public.commentaires;
create policy "administrateurs_gerent_commentaires" on public.commentaires for all to authenticated
using (public.est_administrateur()) with check (public.est_administrateur());
