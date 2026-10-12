# Maison Enrica — Audit et première évolution progressive

Date : 10 octobre 2026  
Source de travail : `Maison-Enrica(1).7z`

## 1. Principe appliqué

Cette passe ne reconstruit pas le site. Elle conserve HTML, CSS, JavaScript et Netlify et ne crée aucun backend supplémentaire. Les changements appliqués répondent uniquement à des besoins confirmés de performance, confidentialité, UX, accessibilité, SEO ou maîtrise des ressources Netlify.

Les fonctions nécessitant une base de données ou une authentification (commentaires, administration, actualités dynamiques, dons en ligne, notifications push) ne sont volontairement pas développées dans cette première passe.

## 2. Résultat de l’audit statique

Contrôles effectués sur la version modifiée :

- 7 pages HTML analysées ;
- 1 `h1` principal par page ;
- aucun ID HTML dupliqué ;
- aucun lien/fichier local cassé détecté ;
- toutes les images de contenu existantes possèdent des dimensions explicites ;
- aucun lien `target="_blank"` sans `noopener` détecté ;
- JSON-LD de l’accueil valide ;
- CSS analysé sans erreur de syntaxe détectée ;
- `menu.js`, `experience.js`, `contact/contact.js` et `netlify/functions/visites.mjs` passent `node --check` ;
- aucune ancienne bibliothèque Boxicons ou Bootstrap Icons ne reste chargée ;
- le script Sentry précédemment présent uniquement sur l’accueil a été retiré.

Limite du contrôle : aucun déploiement Netlify réel ni test graphique dans un navigateur réel n’a été effectué dans cet environnement. La Netlify Function du compteur a été contrôlée statiquement mais n’a pas été exécutée contre le compte Netlify réel.

## 3. Performance et bande passante

### Vidéos des 20 ans

Les quatre vidéos représentent environ 77,97 Mo au total. Elles restent disponibles, mais :

- `preload="metadata"` a été remplacé par `preload="none"` ;
- quatre miniatures WebP locales ont été créées, pour environ 124 Ko au total ;
- la vidéo lourde n’est donc réellement sollicitée qu’au moment où le visiteur décide de la lire.

### Image principale de la page À propos

`propos/image/gerant.png` pesait environ 2,67 Mo.

Elle a été convertie en `gerant.webp`, environ 253 Ko, puis l’ancienne PNG a été retirée. Le gain sur ce seul fichier est supérieur à 90 %.

### Image d’accueil

L’image d’arrière-plan utilise maintenant :

- `image/C.webp` sur les grands écrans ;
- `image/C-mobile.webp` sur les petits écrans.

Les préchargements sont adaptés à la largeur d’écran afin d’éviter de précharger inutilement la version la plus lourde sur mobile.

### Services externes

Le site chargeait trois bibliothèques d’icônes : Boxicons, Bootstrap Icons et Font Awesome. Les icônes ont été harmonisées sur Font Awesome uniquement.

Le script Sentry externe, non documenté dans la politique de confidentialité et non justifié par une fonctionnalité indispensable du projet, a été supprimé.

### Google Maps

La carte Google n’est plus chargée automatiquement avec la page Contact. Un bloc local s’affiche d’abord et le visiteur choisit « Afficher la carte interactive » s’il en a besoin.

Cela évite un chargement tiers inutile pour les personnes qui ne consultent pas la carte et améliore à la fois performance et confidentialité.

### Cache navigateur

Un cache modéré a été ajouté dans `_headers` :

- CSS et JavaScript : 7 jours ;
- images et vidéos : 1 jour.

Le cache des médias reste volontairement court car les noms de fichiers ne sont pas encore systématiquement versionnés.

## 4. Ressources Netlify

Le compteur appelait auparavant la Netlify Function depuis toutes les pages puisque `experience.js` est partagé partout, même lorsqu’aucun compteur n’était affiché.

Il a été corrigé : la Function n’est maintenant appelée que sur la page qui contient réellement `#compteur-visites`.

Cela réduit les requêtes et le calcul serveur inutiles.

D’après la documentation publique Netlify consultée le 10 octobre 2026, un compte **Free utilisant la tarification par crédits** dispose actuellement de 300 crédits mensuels. Les tarifs publics indiquent notamment :

- déploiement de production : 15 crédits ;
- bande passante : 20 crédits/Go ;
- requêtes web : 2 crédits/10 000 requêtes ;
- compute : 10 crédits/Go-heure ;
- Netlify Forms : soumissions gratuites sur les offres à crédits.

Netlify précise cependant que les anciennes offres Legacy continuent d’exister. Le projet seul ne permet pas de savoir si le compte Maison Enrica utilise une offre Legacy ou la tarification par crédits. Aucune décision dépendant d’une limite précise ne doit donc être prise avant vérification du tableau de bord du compte.

Sources publiques :
- https://www.netlify.com/pricing/
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/
- https://www.netlify.com/changelog/2026-04-14-pricing-updates-april-2026/

## 5. Expérience utilisateur

### Accueil des visiteurs

La zone du compteur est maintenant placée avant les chiffres clés et peut afficher :

- « Bienvenue à Maison Enrica ! » lors de la première visite reconnue par le navigateur ;
- « Bon retour à Maison Enrica ! » lors des visites suivantes.

`localStorage` sert uniquement à cette reconnaissance locale. Le nombre global n’est pas fabriqué dans le navigateur : il continue de provenir du stockage serveur Netlify Blobs.

### Guide de première visite

Un guide léger en trois étapes a été ajouté :

1. présentation de Maison Enrica ;
2. orientation vers la mission et les informations essentielles ;
3. orientation vers les projets, le contact et les moyens de contribuer.

Le guide :

- est non bloquant ;
- peut être ignoré immédiatement ;
- reste adapté aux smartphones ;
- est affiché automatiquement une seule fois lorsque `localStorage` fonctionne ;
- peut être relancé avec le bouton « Aide » ;
- n’utilise aucun backend.

### Galerie

La visionneuse annoncée dans l’ancien commentaire de `experience.js` n’était pas réellement implémentée. Elle l’est maintenant sur les galeries Accueil et À propos.

Les images peuvent être ouvertes au clic ou au clavier, dans une boîte de dialogue native légère.

### Contact

Avant l’ouverture de WhatsApp ou de l’application e-mail, une confirmation claire est demandée. Une annulation conserve le contenu du formulaire.

Le site continue à préciser qu’il prépare le message mais ne prétend jamais l’avoir envoyé automatiquement.

## 6. SEO

Le JSON-LD de l’accueil référençait `Logo.png` alors que le fichier réel est `Logo.webp`. L’URL structurée a été corrigée.

`sitemap.xml` et `robots.txt` sont présents et référencent les pages publiques principales.

Aucun nouveau contenu non vérifié n’a été ajouté uniquement pour le référencement.

## 7. Confidentialité et sécurité

La politique légale a été mise à jour pour refléter le fonctionnement réel :

- le formulaire n’utilise plus Netlify Forms ;
- les messages ne sont pas stockés dans une base de données du site ;
- WhatsApp/e-mail sont ouverts avec le texte préparé ;
- le compteur Netlify Blobs et les stockages navigateur limités sont expliqués ;
- l’usage local nécessaire au message de bienvenue et au guide est indiqué ;
- Google Maps est présenté comme service tiers chargé volontairement.

Les en-têtes existants `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` et `Permissions-Policy` sont conservés.

Aucune CSP stricte n’a été ajoutée dans cette passe afin de ne pas risquer de casser Font Awesome, Google Maps ou d’autres contenus sans test navigateur et déploiement de prévisualisation.

## 8. Nettoyage sûr effectué

Supprimés ou remplacés uniquement lorsqu’ils étaient clairement obsolètes :

- `propos/image/gerant.png`, remplacé par `gerant.webp` ;
- `contact/image/map.webp`, ancienne capture non utilisée ;
- `propos/image/abbé.webp`, doublon exact de `abbe.webp` non référencé.

Plusieurs anciennes images JPG non référencées restent présentes. Elles n’ont pas été supprimées car elles peuvent servir d’originaux ou d’archives et leur caractère définitivement obsolète n’est pas suffisamment certain.

La vidéo `projet/ancien de la maison enrica ... .mp4` fait environ 12,6 Mo et n’est actuellement référencée par aucune page. Elle est conservée parce que son nom indique qu’elle pourrait être destinée à une future réalisation. La direction devra décider si elle doit être publiée, archivée hors du site ou supprimée.

## 9. Incohérences de contenu à confirmer par Maison Enrica

Aucune correction automatique n’a été faite sur les chiffres métier.

Les données actuellement présentes se contredisent :

- page À propos : 120 enfants, 46 filles, 74 garçons ;
- tableau de la même page : 45 filles et 80 garçons si l’on additionne les colonnes ;
- ligne Université : 3 filles + 5 garçons mais total affiché 4 ;
- FAQ : 155 jeunes, dont 61 filles et 94 garçons ;
- plusieurs autres textes parlent de plus de 150 enfants ;
- l’accueil présente 150 comme capacité d’accueil.

Il faut déterminer officiellement ce qui correspond à :

- la capacité maximale ;
- l’effectif actuel ;
- un chiffre historique ;
- les enfants scolarisés ;
- les bénéficiaires au sens large.

Ces valeurs ne doivent pas être centralisées ou corrigées tant que leur sens n’est pas confirmé.

## 10. Éléments volontairement laissés pour les prochaines phases

### Pages Facebook

Les deux IDs Facebook fournis n’ont pas été intégrés. L’accès public disponible pendant l’audit renvoyait principalement vers une connexion Facebook et ne permettait pas de confirmer de manière suffisamment fiable le caractère officiel et le contenu des pages. Il faut une confirmation du responsable avant publication des liens comme comptes officiels.

### Page CSSC

Aucun contenu n’a été inventé. La structure définitive attendra les informations officielles du propriétaire.

### Actualités, événements et besoins dynamiques

Ils nécessitent d’abord de définir les contenus réels et la future source de données. Aucun faux contenu n’a été créé.

### Commentaires

Non développés dans cette passe. Une vraie zone de commentaires nécessite stockage, modération, anti-spam et règles de sécurité/confidentialité.

### Administration / Supabase

Non introduite dans cette passe. Le site actuel ne nécessite pas Supabase pour fonctionner. Supabase deviendra justifié au moment où actualités, événements, besoins ou informations publiques devront réellement être modifiés sans redéploiement, avec authentification et RLS.

### Dons en ligne

Aucun paiement n’est simulé. Il faut d’abord confirmer les moyens réellement acceptés par Maison Enrica, les comptes de réception, les responsables habilités et les exigences juridiques/financières.

### Notifications

Les notifications internes pourront être construites lorsque de vraies actualités/événements/besoins dynamiques existeront. Les notifications push restent volontairement reportées.

## 11. Taille du projet

Taille approximative du dossier source : 99,95 Mo.  
Taille approximative après cette première passe : 97,61 Mo.

La différence sur le dossier n’est pas le principal gain : les améliorations importantes concernent surtout **ce qui est effectivement téléchargé par un visiteur**. Les vidéos restent stockées dans le projet mais ne sont plus préchargées, la carte Google est différée et plusieurs ressources externes inutiles ont été retirées.

## 12. Prochaine étape recommandée

Après validation visuelle de cette version dans un Deploy Preview Netlify :

1. vérifier mobile/desktop dans de vrais navigateurs ;
2. confirmer les chiffres officiels ;
3. confirmer les deux pages Facebook officielles ;
4. préparer les sections Actualités / Événements / Besoins avec de vraies données ;
5. seulement ensuite définir le schéma Supabase et la première administration minimale.
