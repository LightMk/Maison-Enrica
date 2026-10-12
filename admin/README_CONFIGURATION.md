# Administration Maison Enrica — première version

## Ce qui est prêt

- Page `/admin/` indépendante du site public, responsive et accessible.
- Formulaire de connexion Supabase Auth (pas d'inscription publique).
- Vérification du rôle `admin` dans `public.administrateurs`.
- Lecture, création, modification et suppression des actualités.
- Sauvegarde en `brouillon` ou `publie`.
- Affichage des textes avec `textContent` (aucun HTML utilisateur interprété).
- Bouton de déconnexion et messages d'erreur.

## Configuration avant mise en ligne

1. Ouvrir `admin/config.js`.
2. Renseigner `SUPABASE_URL` (`https://...supabase.co`) et `SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`). **Ne jamais coller de clé secret/service_role.**
3. Dans Authentication > URL Configuration, conserver `https://maisonenrica.org` comme Site URL et ajouter `https://maisonenrica.org/admin/` aux URLs autorisées.
4. S'assurer que `public.actualites` possède exactement : `id uuid`, `titre text`, `contenu text`, `statut text`, `created_at timestamptz`; `statut` accepte `brouillon` et `publie`.
5. La table `public.administrateurs` associe `id` au compte Auth et `role = admin`.
6. Tester **avant publication** qu'un utilisateur non autorisé ne peut ni lire les brouillons ni créer, modifier ou supprimer une actualité, même en utilisant directement l'API. Tester avec un compte autorisé également.
7. Ne mettre en production qu'après ces tests et contrôle des règles RLS.

## Limites actuelles

- Le **site public n'affiche pas encore les actualités Supabase** : la publication dans cette version enregistre la ligne en base, sans modifier la page d'accueil. Cette intégration est une étape ultérieure après validation de la mise en page publique.
- Le module fonctionne pour le rôle `admin` ; les autorisations `redacteur` restent à définir.
- Les sessions sont gérées par Supabase Auth ; le HTML/CSS/JS de `/admin/` reste accessible publiquement, mais les données sont protégées par les politiques RLS. Ne pas placer de données secrètes dans les fichiers statiques.
- JavaScript de Supabase chargé depuis jsDelivr avec une version fixée : connexion internet requise au premier chargement ; vérifier la politique de sécurité du projet avant d'activer une CSP restrictive.
- Aucun test de bout en bout avec ton vrai projet Supabase n'a pu être effectué, car aucune clé réelle n'a été fournie.
- Les identifiants de connexion ne sont jamais à partager dans une archive ou dans le chat.

## Fichiers ajoutés

- `admin/index.html`
- `admin/admin.css`
- `admin/config.js`
- `admin/admin.js`
- `admin/README_CONFIGURATION.md`

## Fichiers conservés sans modification

Tous les fichiers existants du site public, configurations Netlify, fonctions de compteur, images et vidéos de la phase 1.
