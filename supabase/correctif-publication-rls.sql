-- ============================================================
-- MAISON ENRICA — CORRECTIF PUBLICATION / RLS
-- À exécuter UNE FOIS dans Supabase > SQL Editor.
-- Corrige la lecture publique des contenus publiés sans exposer
-- la table administrateurs aux visiteurs anonymes.
-- ============================================================

create or replace function public.est_administrateur()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.administrateurs
        where id = auth.uid()
          and role = 'admin'
    );
$$;

revoke all on function public.est_administrateur() from public;
grant execute on function public.est_administrateur() to anon, authenticated;

-- ACTUALITÉS
drop policy if exists "actualites_publiques" on public.actualites;
create policy "actualites_publiques"
on public.actualites for select
to anon, authenticated
using (statut = 'publie' or public.est_administrateur());

drop policy if exists "administrateurs_gerent_actualites" on public.actualites;
create policy "administrateurs_gerent_actualites"
on public.actualites for all
to authenticated
using (public.est_administrateur())
with check (public.est_administrateur());

-- ÉVÉNEMENTS
drop policy if exists "evenements_publics" on public.evenements;
create policy "evenements_publics"
on public.evenements for select
to anon, authenticated
using (statut = 'publie' or public.est_administrateur());

drop policy if exists "administrateurs_gerent_evenements" on public.evenements;
create policy "administrateurs_gerent_evenements"
on public.evenements for all
to authenticated
using (public.est_administrateur())
with check (public.est_administrateur());

-- BESOINS
drop policy if exists "besoins_publics" on public.besoins;
create policy "besoins_publics"
on public.besoins for select
to anon, authenticated
using (statut = 'actif' or public.est_administrateur());

drop policy if exists "administrateurs_gerent_besoins" on public.besoins;
create policy "administrateurs_gerent_besoins"
on public.besoins for all
to authenticated
using (public.est_administrateur())
with check (public.est_administrateur());

-- INFORMATIONS PUBLIQUES
drop policy if exists "administrateurs_gerent_infos" on public.informations_publiques;
create policy "administrateurs_gerent_infos"
on public.informations_publiques for all
to authenticated
using (public.est_administrateur())
with check (public.est_administrateur());

-- COMMENTAIRES
drop policy if exists "commentaires_publics" on public.commentaires;
create policy "commentaires_publics"
on public.commentaires for select
to anon, authenticated
using (statut = 'publie' or public.est_administrateur());

drop policy if exists "administrateurs_gerent_commentaires" on public.commentaires;
create policy "administrateurs_gerent_commentaires"
on public.commentaires for all
to authenticated
using (public.est_administrateur())
with check (public.est_administrateur());

-- CONTENUS ADMINISTRABLES DU SITE
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

-- MESSAGES PRIVÉS : administration uniquement
drop policy if exists "messages_contact_admin" on public.messages_contact;
create policy "messages_contact_admin"
on public.messages_contact for all
to authenticated
using (public.est_administrateur())
with check (public.est_administrateur());

-- STORAGE DES IMAGES
drop policy if exists "admin_ajoute_medias_publics" on storage.objects;
create policy "admin_ajoute_medias_publics"
on storage.objects for insert
to authenticated
with check (bucket_id = 'medias-publics' and public.est_administrateur());

drop policy if exists "admin_modifie_medias_publics" on storage.objects;
create policy "admin_modifie_medias_publics"
on storage.objects for update
to authenticated
using (bucket_id = 'medias-publics' and public.est_administrateur())
with check (bucket_id = 'medias-publics' and public.est_administrateur());

drop policy if exists "admin_supprime_medias_publics" on storage.objects;
create policy "admin_supprime_medias_publics"
on storage.objects for delete
to authenticated
using (bucket_id = 'medias-publics' and public.est_administrateur());

-- La lecture publique du bucket reste assurée par le statut public du bucket.
