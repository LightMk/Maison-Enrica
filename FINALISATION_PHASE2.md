# Maison Enrica — Finalisation Phase 2

Date : 11 octobre 2026

## Réalisé

- Modernisation visuelle mesurée : glassmorphism conservé uniquement sur les éléments qui gagnent réellement en hiérarchie.
- Accueil visiteur amélioré : bienvenue / bon retour, fréquence locale sur l'appareil et compteur global Netlify.
- Guide première visite amélioré : 5 étapes, progression visuelle, précédent/suivant, liens utiles, relance via « Visiter le site ».
- Centre de notifications interne : actualités, événements et besoins importants ; aucune notification push demandée.
- Actualités dynamiques Supabase sur l'accueil.
- Événements dynamiques avec téléchargement calendrier `.ics`.
- Besoins actuels dynamiques avec contact direct pour contribuer.
- Partage WhatsApp et Facebook des contenus dynamiques.
- Deux pages Facebook officielles reliées sans charger de flux Facebook lourd.
- Zone commentaires avec envoi, mise en attente, modération, publication, masquage et suppression.
- Page CSSC structurée sans inventer de contenu officiel.
- Familles du Pont d'adoption réactivées comme modèle réutilisable.
- Vidéo mise en avant dans « Nos Réalisations » avec chargement différé du MP4.
- Logos partenaires normalisés directement dans les fichiers images : canevas 1200 × 760 et fond blanc identique.
- Administration redessinée dans un style Maison Enrica et avec une syntaxe JavaScript volontairement simple/française.
- Administration : actualités, événements, besoins, informations publiques, commentaires et statistiques visiteurs.
- Statistiques visiteurs agrégées : région approximative, appareil, premières visites et retours.
- Politique de confidentialité actualisée pour Supabase, commentaires et statistiques agrégées.
- Secret Supabase retiré des fichiers publics.

## Volontairement non ajouté

- Paiement/don en ligne : reporté à la demande du propriétaire.
- Notifications push : non nécessaires à ce stade.
- PWA complète : valeur insuffisante face au coût de maintenance actuel.
- Version anglaise : à faire seulement quand une traduction officielle des contenus sera souhaitée.
- Recherche interne complexe : le volume actuel du site ne la justifie pas encore.
- Téléversement de médias dans l'administration : à ajouter seulement après définition des règles Storage, tailles et droits ; les vidéos lourdes restent volontairement hors Supabase Storage.

## Configuration encore nécessaire avant production

Voir `CONFIGURATION_SUPABASE_PHASE2.md`.
La clé publique Supabase n'est pas inventée : elle doit être copiée depuis le tableau de bord Supabase.
