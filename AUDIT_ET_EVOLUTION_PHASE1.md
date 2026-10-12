# Maison Enrica — Audit et évolution progressive — Phase 1

Date de travail : 10 octobre 2026

## Principe respecté

Cette phase conserve l’architecture HTML, CSS, JavaScript et Netlify. Aucun framework, CMS, Supabase ou nouveau backend n’a été introduit.

La source originale n’a pas été modifiée. Le travail a été réalisé dans une copie séparée.

## Audit — constats principaux

### Points déjà solides

- Structure HTML multi-pages cohérente.
- Un seul `h1` par page principale.
- Images HTML avec textes alternatifs.
- Formulaire correctement associé à ses labels.
- Menu responsive existant.
- JavaScript séparé du HTML.
- `robots.txt`, `sitemap.xml`, `_headers`, `_redirects` et `netlify.toml` déjà présents.
- Compteur global déjà prévu avec Netlify Functions + Netlify Blobs.
- Formulaire réel basé sur WhatsApp avec e-mail de secours, sans faux message « envoyé ».

### Problèmes réellement relevés

1. Projet initial : environ 95,3 Mo.
2. Quatre vidéos des 20 ans totalisant environ 74,4 Mo et déclarées avec `preload="metadata"`.
3. Une ancienne vidéo d’environ 12,6 Mo n’était plus référencée.
4. Une photographie PNG utilisée dans « À propos » pesait environ 2,66 Mo.
5. Trois bibliothèques d’icônes étaient chargées simultanément : Boxicons, Bootstrap Icons et Font Awesome.
6. Sentry était chargé sur l’accueil alors qu’aucune nécessité actuelle ne justifiait ce service externe.
7. La politique de confidentialité décrivait encore l’ancien fonctionnement avec Netlify Forms et une adresse e-mail saisie dans le formulaire.
8. Le JSON-LD de l’accueil référençait `Logo.png`, fichier absent de cette version.
9. Certaines dimensions HTML ne correspondaient pas aux dimensions réelles des fichiers, notamment le logo, `gerant.png` et l’ancien fichier Inner Wheel.
10. Google Maps pouvait être chargé sur la page Contact sans action explicite du visiteur.
11. Le formulaire WhatsApp pouvait laisser son bouton désactivé après l’ouverture d’un nouvel onglet.
12. Le commentaire du JavaScript annonçait une galerie plein écran alors qu’aucune visionneuse n’était réellement présente.
13. Des chiffres importants sont incohérents et ne doivent pas être corrigés arbitrairement.

## Modifications appliquées

### Performance et Netlify

- Les quatre MP4 des 20 ans ne possèdent plus de `src` actif au chargement initial.
- Chaque vidéo utilise une miniature WebP légère.
- Le MP4 n’est chargé qu’après le clic sur « Lire la vidéo ».
- Une seule vidéo anniversaire peut être lue à la fois.
- Une solution `<noscript>` permet toujours d’ouvrir les vidéos si JavaScript est désactivé.
- L’ancienne vidéo non référencée a été retirée de la copie de déploiement.
- `gerant.png` (~2,66 Mo) a été convertie en WebP (~243 Ko).
- 43 variantes WebP de 640 px ont été créées pour les images larges réellement utilisées.
- `srcset` et `sizes` ont été ajoutés afin que les petits écrans puissent recevoir une image plus adaptée.
- Le hero utilise désormais WebP et précharge une image différente selon la largeur de l’écran.
- Plusieurs anciennes images JPG devenues inutiles après leurs versions WebP ont été retirées.
- Boxicons et Bootstrap Icons ont été supprimés ; Font Awesome reste la seule bibliothèque d’icônes externe.
- Le script Sentry externe a été retiré de l’accueil.
- Google Maps est désormais chargé uniquement après un clic sur « Afficher la carte ».
- Des directives de cache ont été ajoutées pour les ressources statiques.

Taille du projet : environ 95,3 Mo avant cette phase, environ 80,7 Mo après cette phase, malgré l’ajout des variantes responsives.

### Expérience utilisateur

- Ajout d’une zone d’accueil sous le hero.
- Première visite : « Bienvenue à Maison Enrica ! ».
- Visite suivante sur le même navigateur : « Bon retour à Maison Enrica ! ».
- Cette reconnaissance utilise uniquement `localStorage` et ne cherche pas à identifier la personne.
- Le compteur global reste alimenté par Netlify côté serveur.
- Ajout d’un bouton « Aide ».
- Ajout d’un guide facultatif de quatre étapes.
- Le guide n’est pas modal et ne bloque pas la navigation.
- Le guide apparaît automatiquement uniquement tant qu’il n’a pas été marqué comme vu dans le navigateur.
- Il peut être relancé avec le bouton « Aide ».
- Ajout d’une visionneuse légère pour les galeries, sans bibliothèque supplémentaire.
- La visionneuse est accessible au clavier et se ferme avec Échap.

### Formulaire Contact

- Une confirmation claire est demandée avant d’ouvrir WhatsApp.
- Une confirmation claire est demandée avant d’ouvrir l’application e-mail.
- Une annulation conserve le contenu du formulaire.
- Le bouton WhatsApp redevient disponible après l’ouverture.
- Le mécanisme d’ouverture a été corrigé pour éviter une double ouverture/redirection dans certains navigateurs.
- La carte Google n’est plus chargée automatiquement.

### SEO

- Correction du logo dans les données structurées : `Logo.webp`.
- Suppression du chiffre non confirmé « plus de 150 enfants » dans la meta description de l’accueil.
- Ajout de textes alternatifs pour les images Open Graph/Twitter.
- La page 404 reçoit `noindex, follow`.
- Les dimensions intrinsèques erronées de plusieurs images ont été corrigées.

### Sécurité et confidentialité

- Retrait de Sentry dans cette phase pour éviter une dépendance et une collecte technique externe non justifiées.
- Mise à jour de la politique de confidentialité selon le fonctionnement réel du formulaire WhatsApp/e-mail.
- Mention de l’usage limité de `localStorage` et `sessionStorage`.
- Mention du chargement volontaire de Google Maps.
- Le compteur ne stocke aucune identité personnelle dans le navigateur.
- Ajout d’une règle de limitation de débit au Netlify Function du compteur : 30 requêtes par minute et par IP/domaine.
- Cette règle doit être confirmée dans le journal de déploiement Netlify après mise en ligne, car seule Netlify peut valider définitivement sa configuration en production.

## Incohérences de contenu à faire confirmer par Maison Enrica

Aucune correction automatique n’a été faite sur les points suivants :

### Nombre d’enfants / bénéficiaires

Le site utilise notamment :

- 120 enfants ;
- 150 enfants ;
- « plus de 150 » ;
- 155 pensionnaires.

Il faut préciser pour chacun s’il s’agit de la capacité, du nombre actuel, d’un nombre historique ou d’une autre donnée.

### Tableau des effectifs

Ligne « Université » :

- filles : 3 ;
- garçons : 5 ;
- total affiché : 4.

Le total mathématique serait 8, mais il n’a pas été modifié sans confirmation officielle.

## Fonctionnalités volontairement non développées dans cette phase

- Statistiques de pays/régions et appareils.
- Google Analytics / Microsoft Clarity ou autre outil de suivi.
- Zone commentaires avec base de données.
- Supabase et espace administrateur.
- Actualités dynamiques.
- Événements dynamiques.
- Besoins dynamiques.
- Notifications internes liées à des contenus dynamiques.
- Notifications push.
- Dons et paiements en ligne.
- Page CSSC finale.
- Flux ou récupération automatique Facebook.

Ces fonctionnalités nécessitent soit des données officielles, soit une décision d’architecture, soit une base de données/authentification, soit une analyse juridique et de coût supplémentaire.

## Pages Facebook

Les deux identifiants fournis ont été conservés dans le plan de travail, mais aucune intégration automatique n’a été ajoutée dans cette phase. Leur caractère officiel n’a pas pu être confirmé de manière fiable avec les outils disponibles. Aucun flux Facebook lourd n’a été ajouté.

## Tests réellement exécutés

- Vérification de syntaxe JavaScript avec `node --check` : OK.
- Analyse syntaxique CSS : OK.
- Recherche de liens/fichiers locaux manquants : aucun lien local cassé détecté.
- Vérification des fichiers `srcset` : OK.
- Vérification des dimensions HTML des images : aucune incohérence restante détectée.
- Vérification des IDs dupliqués : aucun détecté.
- Vérification d’un `h1` unique sur les pages principales : OK.
- Vérification des `alt` d’images : OK.
- Vérification des labels du formulaire : OK.

### Limite de test

Le navigateur graphique de l’environnement a bloqué l’accès aux pages locales (`ERR_BLOCKED_BY_ADMINISTRATOR`). Je ne prétends donc pas avoir effectué un test visuel réel dans Chrome de cette copie. Avant publication définitive, la version doit être ouverte dans un Deploy Preview Netlify et vérifiée visuellement sur ordinateur et téléphone.

## Étape suivante recommandée

1. Créer un Deploy Preview, pas un déploiement production.
2. Tester visuellement accueil, menu, guide, vidéos, galerie et formulaire.
3. Vérifier dans le journal Netlify que la règle de rate limiting du compteur est acceptée.
4. Confirmer les chiffres 120 / 150 / 155 et la ligne « Université ».
5. Vérifier le forfait Netlify réellement rattaché au compte.
6. Ensuite seulement poursuivre vers les contenus dynamiques et l’administration.
