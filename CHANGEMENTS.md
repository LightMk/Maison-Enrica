# Changements apportés au site Maison Enrica

## Objectif

La structure et l’identité visuelle originales ont été conservées. Les modifications servent uniquement à préparer une version plus fiable, plus légère et plus facile à publier.

## Modifications principales

### 1. Page Don temporairement retirée

- Le dossier `don` a été retiré de la version publique.
- Les anciens liens de soutien conduisent maintenant au formulaire de contact.
- Le sujet **Devenir donateur** est automatiquement sélectionné.
- Le fichier `_redirects` évite que les anciennes adresses de la page Don affichent une erreur.

### 2. Formulaire de contact rendu utilisable en ligne

- L’ancien stockage dans `localStorage` a été retiré : il ne permettait pas au propriétaire de recevoir les messages envoyés depuis les appareils des visiteurs.
- Le formulaire est préparé pour **Netlify Forms**.
- Un champ invisible anti-robot a été ajouté.
- Une case de consentement et un avertissement contre l’envoi de données sensibles ont été ajoutés.
- Une page `merci.html` confirme correctement l’envoi.
- Le téléphone, l’e-mail et WhatsApp restent disponibles comme moyens de contact directs.

### 3. Sécurité raisonnable

- Aucun code de blocage de `F12`, du clic droit ou de l’inspection n’a été ajouté, car cela ne protège pas réellement un site public.
- Le fichier `_headers` ajoute des protections contre l’intégration du site dans une autre page, certains types de contenus indésirables et l’accès inutile à la caméra, au microphone ou à la localisation.
- Aucun mot de passe, code PIN, identifiant d’hébergement ou secret n’est conservé dans le JavaScript.

### 4. Référencement naturel

- Titres et descriptions propres à chaque page.
- Adresses canoniques prévues pour `https://maisonenrica.org`.
- Métadonnées de partage pour les réseaux sociaux.
- Données structurées de type `Organization` sur la page d’accueil.
- Fichiers `robots.txt` et `sitemap.xml` ajoutés.
- Textes et titres légèrement corrigés pour être plus lisibles.

### 5. Accessibilité et responsive

- Lien « Aller au contenu principal » ajouté.
- Indication de la page active dans la navigation.
- Focus clavier rendu visible.
- Réduction des animations lorsque le visiteur l’a demandé dans son appareil.
- Galerie, titres, formulaire, footer et cartes améliorés sur téléphone.
- Textes alternatifs ajoutés ou conservés sur les images.

### 6. Performances

- Les images les plus lourdes ont été redimensionnées et recompressées.
- Les métadonnées inutiles des images ont été retirées lors de l’optimisation.
- Le chargement différé a été utilisé pour les images situées plus bas dans les pages.

## Fichiers ajoutés

- `merci.html`
- `404.html`
- `robots.txt`
- `sitemap.xml`
- `_headers`
- `_redirects`
- `netlify.toml`
- `favicon.png`
- `MISE_EN_LIGNE.md`
- `menu.js`

## Fichiers retirés de la version publique

- Le dossier `don`
- `contact/reception.html`
- `contact/reception.css`
- `contact/reception.js`

Les commentaires commençant par `AJOUT`, `MODIFICATION`, `CORRECTION` ou `IMPORTANT` indiquent les changements essentiels dans le code.

### 7. Menu burger et lisibilité du code HTML

- Un menu burger a été ajouté sur toutes les pages principales pour les téléphones et les tablettes.
- Sur ordinateur, la navigation complète reste affichée comme avant.
- Le bouton « Nous soutenir » est intégré au menu afin d’éviter un en-tête trop chargé sur petit écran.
- Le menu peut être fermé avec le bouton, après le choix d’un lien ou avec la touche Échap.
- Le fichier partagé `menu.js` contient uniquement la logique nécessaire et reste commenté.
- L’indentation des fichiers HTML a été réorganisée avec quatre espaces, dans le même esprit que le code initial.
- Aucune animation au défilement ni galerie carrousel n’a été ajoutée : les animations légères déjà présentes suffisent pour cette version.


### 8. Corrections après le premier déploiement

- L’image de fond de la page d’accueil possède maintenant une version WebP pour ordinateur et une version plus légère pour téléphone.
- Ces images de fond sont préchargées dans `index.html`, car une image appelée depuis le CSS est découverte plus tard par le navigateur.
- Le logo affiché dans l’en-tête utilise désormais `Logo.webp`, beaucoup plus léger que le PNG original.
- Toutes les images réellement affichées ont une version WebP ; les originaux sont conservés dans le projet comme sauvegarde.
- La galerie de l’accueil utilise des hauteurs de lignes fixes afin d’éviter les blocs irréguliers pendant le chargement.
- Deux bibliothèques d’icônes ont été retirées : Font Awesome suffit maintenant pour l’ensemble du site.
- Le décalage du `header` fixe est centralisé dans `general.css` avec `--hauteur-entete`.
- Les `h1` des pages Contact, À propos, FAQ et Mentions légales ne possèdent plus chacun leur propre grand `padding-top`.
- Le formulaire Contact utilise une adresse de confirmation absolue, le champ anti-robot recommandé et réactive son bouton lorsque le visiteur revient en arrière.
- Le nom cassé de l’image de l’Abbé a été réparé afin que la photographie apparaisse dans la galerie.
