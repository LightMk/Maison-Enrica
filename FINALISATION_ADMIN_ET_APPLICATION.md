# Maison Enrica — finalisation administration et application

## Accès administrateur

L’administration est accessible directement par :

- `https://maisonenrica.org/admin/`
- `https://maisonenrica.org/administration`

Il n’est donc plus nécessaire d’ouvrir le code du projet.

L’espace administrateur est aussi préparé comme **PWA installable**. Sur un navigateur compatible, le bouton « Installer Maison Enrica Admin » apparaît. Sur certains téléphones, l’installation se fait depuis le menu du navigateur avec « Ajouter à l’écran d’accueil » ou « Installer l’application ».

La PWA ne remplace pas la sécurité Supabase : une personne qui connaît l’adresse `/admin/` ne peut rien administrer sans compte autorisé et sans les règles RLS.

## Étape Supabase à effectuer

Dans **Supabase > SQL Editor**, exécuter le fichier :

`supabase/migration-finalisation-admin.sql`

Ce script ajoute :

- projets administrables ;
- réalisations administrables ;
- partenaires administrables ;
- responsables administrables ;
- messages de contact privés ;
- bucket `medias-publics` pour les images ;
- règles RLS ;
- contenus actuels comme point de départ éditable.

Les anciens contenus HTML restent présents comme solution de secours. Lorsque Supabase répond correctement, les versions administrables sont utilisées.

## Variables Netlify à ajouter

Dans les variables d’environnement du site Netlify, ajouter :

- `SUPABASE_URL` : URL du projet Supabase ;
- `SUPABASE_SECRET_KEY` : **nouvelle clé secrète Supabase côté serveur uniquement**.

La clé secrète ne doit jamais être ajoutée dans `supabase-config.js`, HTML, CSS ou JavaScript public.

Elle est utilisée uniquement par `netlify/functions/messages.mjs` pour enregistrer les messages privés. Si cette variable n’est pas configurée, WhatsApp et l’e-mail continuent de fonctionner, mais la copie du message n’apparaît pas dans l’administration.

Après modification des variables Netlify, effectuer un nouveau déploiement pour qu’elles soient disponibles aux fonctions.

## Administration disponible

Le tableau de bord permet désormais de gérer :

- actualités ;
- événements ;
- besoins ;
- projets ;
- réalisations ;
- partenaires ;
- responsables ;
- messages reçus ;
- commentaires ;
- informations publiques sélectionnées ;
- statistiques visiteurs.

Pour les partenaires, un nouveau logo téléversé est automatiquement replacé sur un canevas **1200 × 760 blanc**, afin de conserver le même fond et les mêmes proportions visuelles entre les logos.

Les vidéos lourdes ne sont pas envoyées automatiquement dans Supabase Storage : elles restent gérées séparément afin de limiter les coûts et la bande passante.

## Messages

Le formulaire conserve WhatsApp comme canal principal. Avant l’ouverture de WhatsApp ou de l’application e-mail, le site essaie d’enregistrer une copie privée dans l’administration.

La fonction Netlify applique une validation, un champ anti-robot et une limite de requêtes. Dans l’administration, un message peut être marqué lu, traité, archivé ou supprimé. « Répondre » ouvre WhatsApp ou l’application e-mail avec un brouillon ; aucune réponse n’est envoyée automatiquement.

## Accueil visiteurs

Le premier élément de la page d’accueil affiche désormais :

- « Bienvenue à Maison Enrica » lors de la première visite ;
- « Bon retour à Maison Enrica » si le navigateur revient après au moins 24 heures ;
- un message plus discret lorsqu’il revient dans les 24 heures.

Cette reconnaissance reste locale au navigateur et n’identifie pas personnellement le visiteur.

## CSSC / Saint-Charles

La page a été réduite à une page d’attente consacrée uniquement à **l’école Saint-Charles**. Elle est en `noindex` et n’apparaît plus dans le footer ni dans le sitemap tant que les informations officielles ne sont pas disponibles.
