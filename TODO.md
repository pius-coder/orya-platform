# TODO — Orya Platform

Statut au 5 septembre 2026 : conception uniquement. Aucune application, base ou infrastructure créée. Toutes les cases ci-dessous concernent le travail futur de l’agent de développement.

## Documents de référence

- [Sprint S0 : initialisation complète](docs/planning/SPRINT-00.md).
- [Règles de développement et de validation](DEVELOPMENT_RULES.md).
- [Sources officielles consultées](docs/planning/SOURCES-S0.md).
- [Architecture fonctionnelle existante](.exclude/saas-platform-plan/README.md) : référence locale ignorée par Git.

Le présent S0 remplace le périmètre S0 de l’ancien plan. La validation OIDC avec deux clients passe au début de S1 et reste bloquante pour le SSO. Aucun autre périmètre fonctionnel n’est supprimé. Seul S0 est détaillé et documenté par de nouvelles recherches ici.

## Sprint actif : S0 — fondation

Ordre obligatoire : 01 → 02 → 03 → 04 → 05 → 06 → 07. Estimation : 2–3 jours concentrés, hors attente d’accès à l’hébergement ; à recalibrer après inventaire.

- [x] S0-01 — Relever versions, distribution WSL, emplacement PostgreSQL, ports et cible de recette ; consigner les versions retenues.
- [ ] S0-02 — Préparer l’environnement sans Docker ; créer les bases et rôles dédiés ; prouver l’isolation des tests.
- [ ] S0-03 — Initialiser Laravel, migrations techniques, configuration et contrat HTTP minimal.
- [ ] S0-04 — Initialiser Next.js, thème shadcn/Cult UI et page connectée au backend.
- [ ] S0-05 — Valider PostgreSQL, Redis, vrai worker et E2E ; vérifier les cas de panne.
- [ ] S0-06 — Mettre en place la CI sans conteneurs et produire les artefacts de production.
- [ ] S0-07 — Déployer en recette HTTPS, vérifier restauration et retour au code précédent ; joindre les preuves.
- [ ] S0-DONE — Tous les critères du sprint passent ; aucun test critique ignoré ou remplacé par une simulation.

## Suite conservée — à détailler au sprint concerné

| Sprint | Livrable attendu | Porte de sortie |
|---|---|---|
| S1 | Choix/validation OIDC, identité centrale et SSO | Deux clients de frameworks différents ; flux invalides refusés ; suspension/logout validés |
| S2 | Catalogue, enregistrement Apps, intégration | App ajoutée sans modification du Core ; catalogue privé filtré |
| S3 | Organisations, équipes et droits | Isolation entre comptes et protection du dernier propriétaire |
| S4 | Offres, commandes, paiements et abonnements | Aucun double financement ; rapprochement et échéances vérifiés |
| S5 | Wallet, crédits et consommation | Solde et journal cohérents sous concurrence et reprise |
| S6 | Événements, notifications et livraisons | Reprise après panne sans double effet métier |
| S7 | Support et back-office | Autorisations et accès sensibles audités |
| S8 | Exploitation, export/effacement et extensions | Restauration, rotation et compatibilité des clients vérifiées |

- [ ] S1 validé.
- [ ] S2 validé.
- [ ] S3 validé.
- [ ] S4 validé.
- [ ] S5 validé.
- [ ] S6 validé.
- [ ] S7 validé.
- [ ] S8 validé.

## Journal de reprise

Après chaque ticket, ajouter une ligne : `date | ID | à faire/en cours/bloqué/validé | fichiers ou commit | commande et résultat | prochaine action`.

- 2026-09-05 | S0-01 | validé | docs/decisions/0001-foundation.md | Relevé WSL 1, PostgreSQL 17.10 (5432), Redis 6.0.16 (6379), Node v24.19.0, arrêt matrice versions | Passer à S0-02 (services et isolation DB/Redis)

Une case cochée exige une preuve. Si l’hébergement manque, S0-07 reste bloqué ; distinguer « socle local validé » de « sprint terminé ». Ne pas relire toute l’archive à chaque tâche : lire le ticket actif, les règles, puis seulement les références nécessaires.
