# TODO — Orya Platform

Mis à jour le 6 septembre 2026. **Mode actuel : planification uniquement, sans implémentation.** Le starter aliziodev est déjà importé. L’ancien S0 de création à zéro est remplacé par S0-R.

## Lire et reprendre

1. [Analyse du starter et décisions](docs/planning/STARTER-KIT-AUDIT.md).
2. [Sprint S0-R Scrum : stories et critères](docs/planning/SPRINT-00R-SCRUM.md).
3. [Transition SQLite vers PostgreSQL](docs/planning/POSTGRES-TRANSITION.md).
4. [Règles de développement](DEVELOPMENT_RULES.md).
5. [Vision métier conservée](.exclude/saas-platform-plan/README.md).

Les documents opérationnels et les [fiches de petites tâches](docs/planning/AGENT-TASKS.md) sont suivis par Git. L’archive .exclude reste une référence locale : ne pas en faire une dépendance de la CI.

## État observé, sans prétendre à une validation

- Starter importé au commit 399fef2 ; état analysé au commit edad712.
- Laravel à la racine, Next.js dans web, pnpm, Pest et Playwright.
- Ancien inventaire S0-01 réalisé puis corrigé pour Windows ; nouvelle baseline à vérifier en R01.
- SQLite présent ; configuration des tests et workflows encore orientée SQLite.
- Aucun test, transfert de données ou déploiement exécuté dans cette analyse.

## Avant Sprint Planning

- [ ] Confirmer la valeur des données SQLite ; préserver tant que non décidé.
- [ ] Disposer de l’accès PostgreSQL local par un canal sûr.
- [ ] Identifier la recette HTTPS et ses accès ; sinon ajuster explicitement l’objectif engagé.
- [ ] Vérifier capacité et estimations, fixer dates et responsables.

## Sprint actif à engager : S0-R

- [ ] R01 — Baseline Windows et installation reproductible.
- [ ] R02 — Bases, rôles, seeders et E2E isolés.
- [ ] R03 — Bascule PostgreSQL et traitement des données approuvé.
- [ ] R04 — Authentification et sécurité sans régression.
- [ ] R05 — Redis cache/queue, worker réel et santé.
- [ ] R06 — CI PostgreSQL, contrôles bloquants et artefacts.
- [ ] R07 — Identité Orya et intégration Cult UI ciblée, selon capacité.
- [ ] R08 — Recette HTTPS, sauvegarde et récupération.
- [ ] Review — Increment démontré et résultats inspectés.
- [ ] Rétrospective — Une amélioration retenue, backlog suivant ajusté.

Aucune case n’est cochée sur la seule présence du code. Le périmètre engagé et tout report doivent être consignés dans le journal.

## Suivi des sous-tâches de l’agent

**Tâche en cours / suivante : R01.04.** Une seule sous-tâche à la fois ; voir les [titres de commits, limites et règles d’arrêt](docs/planning/AGENT-TASKS.md). Les cases R01–R08 ci-dessus sont des synthèses, pas des missions à réaliser d’un seul coup.

### R01 — Environnement Windows

[Fiche R01](docs/planning/tasks/R01.md).

- [x] R01.01 — docs(dev): record the Windows starter baseline.
- [x] R01.02 — build(web): make pnpm installation reproducible.
- [x] R01.03 — fix(setup): preserve existing environment configuration.
- [ ] R01.04 — fix(dev): manage Windows application processes reliably.

### R02 — Isolation avant migration

[Fiche R02](docs/planning/tasks/R02.md).

- [ ] R02.01 — fix(db): scope local database provisioning to Orya.
- [ ] R02.02 — fix(test): guard database resets and fixture seeding.
- [ ] R02.03 — test(e2e): isolate fixture and server environments.

### R03 — Transition PostgreSQL

[Fiche R03](docs/planning/tasks/R03.md).

- [ ] R03.01 — docs(db): record SQLite retention and cutover decisions.
- [ ] R03.02 — fix(db): validate the starter schema on PostgreSQL.
- [ ] R03.D1 — feat(db): add a repeatable SQLite data transfer — conditionnel.
- [ ] R03.D2 — test(db): reconcile imported identities and credentials — conditionnel.
- [ ] R03.D3 — docs(db): verify data cutover and recovery rehearsal — conditionnel.
- [ ] R03.03 — fix(db): switch the active development environment to PostgreSQL.

### R04 — Identité par parcours

[Fiche R04](docs/planning/tasks/R04.md).

- [ ] R04.01 — test(auth): preserve the starter journeys on PostgreSQL.
- [ ] R04.02 — test(auth): enforce API authentication and CSRF boundaries.
- [ ] R04.03 — test(sessions): verify account isolation and revocation.
- [ ] R04.04 — test(account): verify recovery and sensitive profile changes.
- [ ] R04.05 — test(2fa): reject invalid and replayed authentication factors.
- [ ] R04.06 — test(passkeys): validate trusted origins and credential ownership.

### R05 — Redis et exploitation locale

[Fiche R05](docs/planning/tasks/R05.md).

- [ ] R05.01 — feat(cache): isolate Redis cache connections.
- [ ] R05.02 — feat(queue): process jobs through an isolated Redis worker.
- [ ] R05.03 — test(queue): verify bounded retries and failed jobs.
- [ ] R05.04 — feat(health): report readiness without leaking infrastructure details.

### R06 — CI et artefacts

[Fiche R06](docs/planning/tasks/R06.md).

- [ ] R06.01 — ci(quality): align runtime and static checks.
- [ ] R06.02 — ci(test): run integration tests on native PostgreSQL and Redis.
- [ ] R06.03 — ci(e2e): test the production frontend with isolated services.
- [ ] R06.04 — build(release): package verified artifacts and enforce release gates.

### R07 — Identité visuelle ciblée

[Fiche R07](docs/planning/tasks/R07.md).

- [ ] R07.01 — style(brand): apply Orya identity to the existing shell.
- [ ] R07.02 — style(ui): integrate one documented Cult UI component.

### R08 — Recette et récupération

[Fiche R08](docs/planning/tasks/R08.md).

- [ ] R08.01 — docs(ops): define the native staging deployment contract.
- [ ] R08.02 — chore(staging): deploy and verify the tested release.
- [ ] R08.03 — test(ops): prove PostgreSQL backup restoration.
- [ ] R08.04 — docs(ops): record release rollback and sprint acceptance.

## Product Backlog suivant

- [ ] S1 — Consolidation identité centrale, vérification email et SSO OIDC.
- [ ] S2 — Catalogue et intégration des Apps.
- [ ] S3 — Organisations, équipes et droits.
- [ ] S4 — Commerce et paiements.
- [ ] S5 — Wallet et consommation.
- [ ] S6 — Événements et communication.
- [ ] S7 — Support et back-office.
- [ ] S8 — Exploitation et extensions.

## Journal de reprise

Pour chaque story : date, ID, état, responsable, preuve ou commit, blocage éventuel, prochaine action.

| Date | Objet | État | Preuve / suite |
|---|---|---|---|
| 2026-09-05 | Ancien S0-01 | Historique | Inventaire initial ; amendement Windows dans décision 0002 |
| 2026-09-06 | Adoption starter | Analyse terminée | Lecture locale et sources officielles ; aucune modification applicative |
| 2026-09-06 | S0-R | Prêt pour affinage/Planning | Commencer R01 lors de l’autorisation de développement |
| 2026-09-06 | R01.01 | Validé | docs/decisions/0003-windows-starter-baseline.md, README.md | Relevé commit edad712, PHP 8.5.0 x64, Node v24.19.0, pnpm 11.25.0, composer.lock & web/pnpm-lock.yaml. Anomalies consignées : composer.phar 0 octet, pdo_pgsql manquant dans PHP actif. Matrice et Quick start corrigés sans diagnostic supposé réussi. Arrêt avant R01.02 |
| 2026-09-06 | R01.02 | Validé | package.json, web/package.json, web/pnpm-workspace.yaml, web/.npmrc, .npmrc | pnpm 11.25.0 fixé (packageManager & engines), allowBuilds validé pour sharp & unrs-resolver, lockfile intact, frozen install & build & format & lint vérifiés | Passer à R01.03 (préservation de configuration d'environnement) |
| 2026-09-06 | R01.03 | Validé | scripts/setup.php, scripts/setup.ps1, composer.json | Préparation adaptée (Laravel racine + web), vérification prérequis x64/Node/pnpm, préservation stricte APP_KEY et configurations (.env hash identique sur 2 passes), aucun schéma ni fichier SQLite créé | Passer à R01.04 (gestion fiable des processus Windows) |
