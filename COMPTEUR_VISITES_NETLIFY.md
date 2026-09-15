# Activer le compteur réel de visites

Le compteur utilise :

- `netlify/functions/visites.mjs` pour la logique serveur ;
- Netlify Blobs pour conserver le total ;
- `experience.js` pour afficher le total sur l'accueil.

## Important

Un simple serveur local ou l'ouverture directe des fichiers HTML ne peut pas exécuter une Netlify Function. Dans ce cas, le compteur reste volontairement masqué.

Pour que le compteur fonctionne réellement, le déploiement Netlify doit inclure les fonctions et installer la dépendance définie dans `package.json`.

La méthode la plus fiable est :

1. conserver `package.json`, `netlify.toml` et le dossier `netlify/functions` dans le projet ;
2. déployer le projet via un dépôt Git connecté à Netlify ou via Netlify CLI ;
3. vérifier dans Netlify que la fonction `visites` apparaît dans la section Functions ;
4. ouvrir le site et vérifier que le compteur apparaît sous les chiffres clés.

Le navigateur compte au maximum une visite par session grâce à `sessionStorage`. Le total lui-même reste stocké côté serveur ; `localStorage` n'est pas utilisé comme source du compteur.
