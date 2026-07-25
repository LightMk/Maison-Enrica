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
