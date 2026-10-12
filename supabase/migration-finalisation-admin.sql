-- ============================================================
-- MAISON ENRICA — FINALISATION ADMINISTRATION
-- À exécuter UNE FOIS dans Supabase > SQL Editor.
-- Le script est réexécutable : les contenus de départ utilisent ON CONFLICT.
-- ============================================================

create extension if not exists pgcrypto;

create or replace function public.mettre_a_jour_date()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create table if not exists public.projets_site (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    titre text not null check (char_length(titre) between 3 and 160),
    description text not null,
    badge text,
    image_url text,
    statut text not null default 'publie' check (statut in ('publie', 'masque', 'archive')),
    ordre integer not null default 100,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.realisations_site (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    titre text not null check (char_length(titre) between 3 and 160),
    description text not null,
    badge text,
    media_type text not null default 'image' check (media_type in ('image', 'video')),
    media_url text,
    poster_url text,
    statut text not null default 'publie' check (statut in ('publie', 'masque', 'archive')),
    ordre integer not null default 100,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.partenaires_site (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    nom text not null check (char_length(nom) between 2 and 160),
    logo_url text not null,
    site_url text,
    statut text not null default 'publie' check (statut in ('publie', 'masque', 'archive')),
    ordre integer not null default 100,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.responsables_site (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    nom text not null check (char_length(nom) between 2 and 160),
    fonction text not null,
    description text,
    photo_url text,
    statut text not null default 'publie' check (statut in ('publie', 'masque', 'archive')),
    ordre integer not null default 100,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.messages_contact (
    id uuid primary key default gen_random_uuid(),
    nom text not null check (char_length(nom) between 2 and 100),
    contact text not null check (char_length(contact) between 3 and 120),
    objet text not null check (char_length(objet) between 2 and 160),
    message text not null check (char_length(message) between 5 and 2000),
    canal text not null default 'site' check (canal in ('site', 'whatsapp', 'email')),
    statut text not null default 'nouveau' check (statut in ('nouveau', 'lu', 'traite', 'archive')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Triggers updated_at
DO $$
DECLARE
    nom_table text;
BEGIN
    FOREACH nom_table IN ARRAY ARRAY['projets_site','realisations_site','partenaires_site','responsables_site','messages_contact']
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS maj_date ON public.%I', nom_table);
        EXECUTE format('CREATE TRIGGER maj_date BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.mettre_a_jour_date()', nom_table);
    END LOOP;
END $$;

alter table public.projets_site enable row level security;
alter table public.realisations_site enable row level security;
alter table public.partenaires_site enable row level security;
alter table public.responsables_site enable row level security;
alter table public.messages_contact enable row level security;

-- Lecture publique : uniquement les contenus publiés.
DO $$
DECLARE
    nom_table text;
    nom_policy text;
BEGIN
    FOREACH nom_table IN ARRAY ARRAY['projets_site','realisations_site','partenaires_site','responsables_site']
    LOOP
        nom_policy := nom_table || '_lecture_publique';
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', nom_policy, nom_table);
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (statut = ''publie'' OR EXISTS (SELECT 1 FROM public.administrateurs a WHERE a.id = auth.uid()))',
            nom_policy, nom_table
        );
    END LOOP;
END $$;

-- Écriture : uniquement l'administrateur validé.
DO $$
DECLARE
    nom_table text;
    nom_policy text;
BEGIN
    FOREACH nom_table IN ARRAY ARRAY['projets_site','realisations_site','partenaires_site','responsables_site','messages_contact']
    LOOP
        nom_policy := nom_table || '_admin';
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', nom_policy, nom_table);
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.administrateurs a WHERE a.id = auth.uid() AND a.role = ''admin'')) WITH CHECK (EXISTS (SELECT 1 FROM public.administrateurs a WHERE a.id = auth.uid() AND a.role = ''admin''))',
            nom_policy, nom_table
        );
    END LOOP;
END $$;

-- Les messages sont insérés uniquement par la fonction Netlify sécurisée.
-- Aucun INSERT anonyme direct n'est autorisé sur cette table.
drop policy if exists "messages_contact_public_insert" on public.messages_contact;

-- Stockage d'images publiques. Les vidéos lourdes restent hors de ce bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'medias-publics',
    'medias-publics',
    true,
    2097152,
    array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
    public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admin_ajoute_medias_publics" on storage.objects;
create policy "admin_ajoute_medias_publics"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'medias-publics'
    and exists (select 1 from public.administrateurs a where a.id = auth.uid() and a.role = 'admin')
);

drop policy if exists "admin_modifie_medias_publics" on storage.objects;
create policy "admin_modifie_medias_publics"
on storage.objects for update
to authenticated
using (
    bucket_id = 'medias-publics'
    and exists (select 1 from public.administrateurs a where a.id = auth.uid() and a.role = 'admin')
)
with check (
    bucket_id = 'medias-publics'
    and exists (select 1 from public.administrateurs a where a.id = auth.uid() and a.role = 'admin')
);

drop policy if exists "admin_supprime_medias_publics" on storage.objects;
create policy "admin_supprime_medias_publics"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'medias-publics'
    and exists (select 1 from public.administrateurs a where a.id = auth.uid() and a.role = 'admin')
);

grant select on public.projets_site, public.realisations_site, public.partenaires_site, public.responsables_site to anon, authenticated;
grant select, insert, update, delete on public.projets_site, public.realisations_site, public.partenaires_site, public.responsables_site, public.messages_contact to authenticated;

-- ============================================================
-- CONTENU ACTUEL COMME POINT DE DÉPART ÉDITABLE
-- Les chemins sont ceux du site public actuel.
-- ============================================================

insert into public.projets_site (slug,titre,description,badge,image_url,ordre)
values
('ecole-saint-charles','Extension Scolaire & Modernisation','Le complexe scolaire Saint Charles entre dans sa phase finale de finition. Le projet comprend les salles de classe et la modernisation du dortoir afin d’offrir un environnement sécurisé et favorable à la réussite académique.','Infrastructure & Éducation','/projet/image/ecole.webp',10),
('agro-pastoral-pongwene','Projet Agro-pastoral de Pongwene','Le développement de 50 hectares sur le Plateau de Bateke vise à renforcer la sécurité alimentaire de Maison Enrica et à soutenir progressivement son autonomie.','Autonomie & Durabilité','/projet/image/agriculture.webp',20),
('pont-adoption','Pont International pour l’Adoption','Maison Enrica accompagne les démarches d’adoption nationale et internationale dans le respect des procédures, de l’intérêt de l’enfant et du suivi familial. Les informations complémentaires seront ajoutées après validation des responsables.','Structure d’accompagnement','/projet/image/adoption.webp',30)
on conflict (slug) do nothing;

insert into public.realisations_site (slug,titre,description,badge,media_type,media_url,ordre)
values
('ecole-saint-charles','École Saint-Charles','Une réalisation majeure axée sur l’amélioration des infrastructures et le soutien à l’éducation.','Éducation des enfants','image','/projet/image/st-charles.webp',10),
('centre-formation','Centre de Formation','Une initiative dédiée à l’apprentissage des langues et au développement de nouvelles compétences.','Apprentissage des langues','image','/projet/image/centre-formation.webp',20),
('vies-autonomes','Des vies autonomes et actives','De nombreux anciens du foyer sont aujourd’hui insérés dans la vie active et contribuent positivement à la société.','Insertion professionnelle','image','/projet/image/autonomie.webp',30),
('bourses-voyages','Bourses d’études et voyages','Certains jeunes ont pu poursuivre des études supérieures et bénéficier d’opportunités d’ouverture à l’international.','Horizons internationaux','image','/projet/image/bourse.webp',40),
('foyers-stables','Foyers stables et épanouis','Des anciennes du foyer ont construit leur propre famille et transmettent à leur tour les valeurs reçues.','Stabilité familiale','image','/projet/image/foyer.webp',50),
('engagement-nation','Engagement dans l’Armée et la Police','Plusieurs anciens ont choisi de servir la nation au sein des forces armées ou de la police.','Service de la Nation','image','/projet/image/engagement.webp',60)
on conflict (slug) do nothing;

insert into public.partenaires_site (slug,nom,logo_url,ordre)
values
('knowledge','Knowledge','/propos/image/knowledge.webp',10),
('rawbank','Rawbank','/propos/image/rawbank.webp',20),
('inner-wheel','Inner Wheel','/propos/image/innerwheel.webp',30),
('kongo','Kongo','/propos/image/kongo.webp',40),
('fondation-denise-nyakeru','Fondation Denise Nyakeru','/propos/image/fondation.webp',50),
('initiative-plus','Initiative Plus','/propos/image/initiativeplus.webp',60),
('amaca','Association AMACA','/propos/image/amaca.webp',70),
('oltre-i-confini','Oltre i Confini','/propos/image/otreiconfini.webp',80),
('mwaganza','Association Mwaganza','/propos/image/mwaganza.webp',90),
('carter','Association CARTER','/propos/image/carter.webp',100),
('croce','Croce','/propos/image/croce.webp',110),
('equity-bcdc','Equity BCDC','/propos/image/equitybcdc.webp',120),
('affaires-sociales','Ministère des Affaires sociales','/propos/image/affaires.webp',130)
on conflict (slug) do nothing;

insert into public.responsables_site (slug,nom,fonction,photo_url,ordre)
values
('david-bopeyi','Abbé David Bopeyi','Fondateur','/propos/image/David.webp',10),
('joseph-monitu','Joseph Monitu','Vice président','/propos/image/monitu.webp',20),
('molfetta-stefano','Molfetta Stefano','Président de l’association d’Italie','/propos/image/stefano.webp',30),
('antonietta-tasca','Antonietta Tasca','Conseil stratégique','/propos/image/antoinneta.webp',40),
('franco-compagni','Franco Compagni','Logistique','/propos/image/franco.webp',50),
('yvette-mbidi','Yvette Mbidi','Infirmière superviseure','/propos/image/yvette.webp',60),
('clarisse-mwanza','Clarisse Mwanza','Secrétaire générale','/propos/image/clarisse.webp',70),
('encadreurs','Encadreurs','Équipe d’encadrement','/propos/image/encadreur.webp',80),
('hawa-kendi','Hawa Kendi','Intendante','/propos/image/hawa.webp',90),
('josephine-ibengu','Joséphine Ibengu','Conseillère','/propos/image/ibengo.webp',100)
on conflict (slug) do nothing;


-- CORRECTIF RLS PUBLICATION 2026-10-12
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

DO $$
DECLARE
    nom_table text;
    nom_policy text;
BEGIN
    FOREACH nom_table IN ARRAY ARRAY['projets_site','realisations_site','partenaires_site','responsables_site']
    LOOP
        nom_policy := nom_table || '_lecture_publique';
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', nom_policy, nom_table);
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (statut = ''publie'' OR public.est_administrateur())',
            nom_policy, nom_table
        );
        nom_policy := nom_table || '_admin';
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', nom_policy, nom_table);
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.est_administrateur()) WITH CHECK (public.est_administrateur())',
            nom_policy, nom_table
        );
    END LOOP;
END $$;

drop policy if exists "messages_contact_admin" on public.messages_contact;
create policy "messages_contact_admin" on public.messages_contact for all to authenticated
using (public.est_administrateur()) with check (public.est_administrateur());

drop policy if exists "admin_ajoute_medias_publics" on storage.objects;
create policy "admin_ajoute_medias_publics" on storage.objects for insert to authenticated
with check (bucket_id = 'medias-publics' and public.est_administrateur());
drop policy if exists "admin_modifie_medias_publics" on storage.objects;
create policy "admin_modifie_medias_publics" on storage.objects for update to authenticated
using (bucket_id = 'medias-publics' and public.est_administrateur())
with check (bucket_id = 'medias-publics' and public.est_administrateur());
drop policy if exists "admin_supprime_medias_publics" on storage.objects;
create policy "admin_supprime_medias_publics" on storage.objects for delete to authenticated
using (bucket_id = 'medias-publics' and public.est_administrateur());
