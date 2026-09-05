# Règles de développement — Orya Platform

Ces règles guideront l’agent chargé de développer. La présente livraison est uniquement documentaire. Lire [TODO.md](TODO.md), puis [S0](docs/planning/SPRINT-00.md). La vision fonctionnelle reste dans `.exclude/saas-platform-plan` ; le nouveau S0 prévaut pour l’initialisation.

## Travailler vite avec des preuves

1. Traiter un ticket vérifiable à la fois : critère attendu → test d’intégration pertinent → réalisation minimale → contrôles → mise à jour du TODO.
2. Employer les conventions Laravel, Eloquent, Form Requests, Policies, Resources, jobs et transactions. Créer un module lorsqu’il reçoit son premier comportement ; ne pas générer tous les modules, repositories génériques ou abstractions spéculatives.
3. Laravel possède les données et règles métier. Next.js gère affichage et façade HTTP ; pas d’accès PostgreSQL depuis Next.js, pas de deuxième moteur d’autorisations.
4. Utiliser TypeScript strict, Server Components par défaut et composants client seulement pour l’interaction. Un thème partagé ; composants Cult importés selon besoin et code relu.
5. Figer les versions effectivement validées et committer les lockfiles. Installer depuis ceux-ci en CI ; ne pas faire de mise à jour globale pendant une fonctionnalité.
6. Un changement = une intention, des fichiers nécessaires et des preuves courtes. Réutiliser les outils présents ; pas de nouveaux services sans besoin identifié dans le sprint.

## Tests prioritaires

- Backend : PHPUnit avec tests Feature/Integration sur PostgreSQL de même version majeure que la recette. Pas de SQLite comme preuve de compatibilité PostgreSQL.
- Tester comportement et invariants observables : statut HTTP, réponse, données persistées, contraintes et effets du job. Éviter les tests qui reproduisent simplement le code ou vérifient des getters.
- Les fakes Laravel servent aux tests ciblés, mais ne prouvent pas le transport Redis ni l’exécution d’un worker. Maintenir un scénario avec les vrais processus.
- Pour ce scénario, utiliser des données committées visibles du worker, puis nettoyage ciblé ; pas de transaction de test invisible à une autre connexion.
- PostgreSQL et Redis de test sont isolés du développement. Le précontrôle refuse toute cible hors liste de bases de test et vérifie le rôle SQL courant avant un reset. Aucun `FLUSHALL`, aucun nettoyage global de l’instance Redis partagée.
- Exécuter d’abord les tests concernés, puis les contrôles exigés à la fin du ticket. Avant livraison : suite d’intégration complète, lint, typage, build et E2E critiques. Les E2E utilisent le build de production.
- Un test critique ignoré, une CI non exécutée ou un retry masquant un échec ne valide pas une livraison. Les tests de panne ne coupent que les processus de recette jetables ou utilisent une configuration de connexion invalide dédiée.
- Ajouter des tests unitaires pour des calculs complexes quand ils apparaissent ; ne pas viser un pourcentage arbitraire de couverture. Chaque bug corrigé reçoit un test de régression au niveau utile.

## Configuration, données et sécurité

- `.env.example` contient uniquement des noms et valeurs locales non sensibles. Aucune clé réelle, même de test, dans Git, le frontend public ou les logs. Maintenir une exception Git pour les exemples imbriqués si nécessaire.
- Lire les variables Laravel via les fichiers de configuration ; tester avec configuration cachée. Déclarer pour Next.js ce qui est public et figé au build versus privé et lu au runtime.
- Une `APP_KEY` distincte par environnement, persistante entre releases. Aucune régénération automatique au déploiement.
- Migrations minimales et compatibles avec la version précédente. Contraintes SQL pour l’unicité ; transactions pour les effets atomiques. Aucune migration des futurs domaines avant leur sprint.
- Pas d’authentification maison ni de promesse OIDC basée sur Passport seul. S1 doit valider le moteur avant toute dépendance de session dans le portail.
- Erreurs API structurées et corrélées, messages publics sobres ; jamais de trace, secret ou chaîne de connexion dans les réponses. Origines autorisées explicites si un accès navigateur cross-origin est ajouté.
- Plus tard : autorisation serveur sur chaque ressource, portée account/app, sommes entières et idempotence durable ; prestataires de paiement confinés aux adaptateurs, comme prévu par l’architecture.

## Livraison

Chaque livraison indique : ticket, changement visible, commandes réellement exécutées et résultats, migration/configuration requise, preuve de recette et limite restante. Ne pas annoncer « production prête » sur la seule réussite locale.

Promotion uniquement de l’artefact testé. Sauvegarde avant migration risquée ; pas de `migrate:fresh`, rollback destructif ou seed métier automatique en production. Retour au code précédent uniquement si le schéma reste compatible ; sinon correction en avant. Recharger les processus persistants après une release.

Le sprint suivant commence après clôture explicite du précédent ou consignation d’un blocage avec les seuls travaux indépendants autorisés. Ne pas étendre silencieusement S0 à l’identité ou aux paiements.
