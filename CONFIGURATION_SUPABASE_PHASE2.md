# Maison Enrica — finalisation Supabase

## Action de sécurité obligatoire

La version reçue contenait une clé commençant par `sb_secret_` dans `admin/config.js`.
Cette clé ne doit jamais être présente dans un site public. Elle a été retirée de cette version.

Dans Supabase :

1. Ouvrir **Settings > API Keys**.
2. Révoquer / faire tourner la clé secrète qui avait été copiée dans le projet public.
3. Copier la clé **Publishable** qui commence par `sb_publishable_`.
4. La placer une seule fois dans `supabase-config.js`.

Ne jamais placer de clé `sb_secret_` ou `service_role` dans HTML/CSS/JavaScript public.

## Base de données

Dans **SQL Editor** :

1. ouvrir `supabase/schema.sql` ;
2. exécuter le script ;
3. vérifier que RLS est activé sur les tables ;
4. vérifier qu'un compte non connecté ne peut lire que les contenus publiés ;
5. vérifier qu'un compte administrateur autorisé peut gérer les contenus.

Tables utilisées :

- `administrateurs`
- `actualites`
- `evenements`
- `besoins`
- `informations_publiques`
- `commentaires`

## Compte administrateur

Le compte doit exister dans Supabase Auth puis posséder une ligne correspondante dans `public.administrateurs` :

```sql
insert into public.administrateurs (id, role)
values ('UUID_DU_COMPTE_AUTH', 'admin')
on conflict (id) do update set role = excluded.role;
```

## Variables Netlify

Les fonctions de statistiques et commentaires utilisent uniquement la clé publique pour vérifier/écrire selon les règles RLS.
Ajouter dans **Netlify > Environment variables** :

- `SUPABASE_URL` = l'URL du projet ;
- `SUPABASE_PUBLISHABLE_KEY` = la clé `sb_publishable_...`.

Aucune clé secrète Supabase n'est nécessaire à ces fonctions dans cette version.

## Ce qui devient modifiable sans redéploiement

Une fois la configuration terminée :

- actualités ;
- événements ;
- besoins actuels ;
- informations publiques sélectionnées ;
- modération des commentaires.

Le code du site reste statique. Seuls les contenus réellement dynamiques passent par Supabase.

## Statistiques visiteurs

Le compteur Netlify conserve désormais uniquement des totaux agrégés :

- visites globales ;
- premières visites / retours ;
- régions approximatives ;
- catégorie d'appareil.

Aucune adresse IP n'est enregistrée dans les données du site.
Les statistiques détaillées ne sont retournées qu'à un utilisateur connecté et autorisé dans `administrateurs`.

## Finalisation administration

Pour la nouvelle gestion des projets, réalisations, partenaires, responsables et messages, exécuter également :

`supabase/migration-finalisation-admin.sql`

Les instructions complètes se trouvent dans `FINALISATION_ADMIN_ET_APPLICATION.md`.
