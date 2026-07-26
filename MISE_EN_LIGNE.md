# Mise en ligne de Maison Enrica

## Vérifications obligatoires avant publication

La direction de la Maison Enrica doit confirmer les éléments suivants :

1. Le numéro **+243 81 90 73 170** est bien le numéro officiel et il utilise WhatsApp.
2. L’adresse **maisonenricas@hotmail.com** est correcte et consultée régulièrement.
3. L’adresse physique, le numéro d’arrêté, le NIF et le nom du responsable légal sont exacts.
4. La direction possède les autorisations nécessaires pour publier chaque photographie où un enfant ou une autre personne est identifiable.
5. Le domaine `maisonenrica.org` est disponible. S’il faut utiliser un autre domaine, toutes les mentions de cette adresse dans les fichiers HTML, `robots.txt` et `sitemap.xml` devront être remplacées.

## Publication simple avec Netlify

1. Créer un compte Netlify au nom du propriétaire ou de l’organisation.
2. Dans Netlify, choisir l’ajout manuel d’un nouveau site.
3. Déposer le contenu de ce dossier ou le fichier ZIP fourni. `index.html` doit rester à la racine.
4. Dans les réglages du site, vérifier que la détection des formulaires est activée. Si elle vient d’être activée, lancer un nouveau déploiement.
5. Ouvrir la page Contact sur l’adresse temporaire en `.netlify.app`.
6. Envoyer un message de test.
7. Dans le tableau de bord Netlify, ouvrir la rubrique **Forms** et vérifier que le formulaire `contact` apparaît.
8. Configurer une notification par e-mail vers l’adresse officielle de la Maison Enrica.
9. Tester une deuxième fois le formulaire après l’activation de la notification.

Le formulaire Netlify ne peut pas être testé complètement en ouvrant simplement les fichiers sur l’ordinateur. Il doit être publié sur Netlify.

## Connexion du domaine `.org`

1. Acheter le domaine au nom de la Maison Enrica, pas au nom personnel du développeur.
2. Dans Netlify, ouvrir **Domain management** puis ajouter le domaine personnalisé.
3. Suivre exactement les enregistrements DNS indiqués par Netlify.
4. Définir le domaine `.org` comme domaine principal.
5. Attendre l’activation du certificat HTTPS puis vérifier que l’adresse commence par `https://`.
6. Conserver les accès au compte de domaine et à Netlify auprès du propriétaire de l’organisation.

## Apparition dans Google

Après l’activation du domaine :

1. Créer une propriété de domaine dans Google Search Console.
2. Effectuer la validation DNS demandée par Google.
3. Envoyer l’adresse `https://maisonenrica.org/sitemap.xml`.
4. Inspecter l’adresse de la page d’accueil et demander son indexation.
5. Créer ou réclamer la fiche Google Business Profile de la Maison Enrica avec l’adresse, le téléphone, les horaires, les photographies et le nouveau site.
6. Utiliser toujours le même nom, la même adresse et le même téléphone sur le site et sur la fiche Google.

L’indexation peut prendre du temps et aucune manipulation ne garantit immédiatement la première position. La cohérence des informations, le contenu utile, la réputation réelle de l’organisation et les mises à jour régulières sont essentiels.

## Règles de sécurité à conserver

- Ne jamais mettre un mot de passe, une clé privée ou un code PIN dans les fichiers HTML ou JavaScript.
- Ne pas remettre en ligne l’ancienne page publique de réception des messages.
- Ne jamais demander de données bancaires dans le formulaire de contact.
- Mettre à jour les bibliothèques externes lorsqu’une nouvelle version du site est préparée.
- Sauvegarder une copie du site avant chaque modification importante.
- Le blocage de l’inspection du code ou du clic droit n’est pas une protection réelle et ne doit pas être considéré comme une mesure de sécurité.
