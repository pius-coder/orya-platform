# Contrat de travail de l’agent — petites tâches et commits

Découpage du [sprint S0-R](SPRINT-00R-SCRUM.md), 6 septembre 2026. Planification uniquement : aucun code ni commande de réalisation. Les huit stories deviennent huit lots de travail ; leurs sous-tâches ne sont pas de nouveaux événements Scrum. Le Sprint Goal, la Review et la Definition of Done restent ceux du sprint.

## Règle d’exécution

1. Lire le TODO, cette règle et uniquement la fiche de la tâche attribuée. Consulter ensuite les fichiers et références utiles à cette tâche ; éviter de recharger toute l’archive.
2. Exécuter **un seul identifiant de sous-tâche par demande**, par exemple R01.01. Une demande générique de commencer le sprint signifie commencer la première tâche prête ; elle ne déclenche pas les huit stories d’un coup. Une consigne explicite ultérieure de l’utilisateur peut modifier cette cadence.
3. Avant modification, vérifier les dépendances et l’état Git ; annoncer le résultat visé et les zones concernées. Respecter les modifications déjà présentes, sans les inclure dans son commit.
4. Réaliser le minimum nécessaire, avec les tests protégeant ce résultat dans la même tâche. Ne pas livrer un commit volontairement cassé en attendant un ticket de tests ultérieur.
5. Si la tâche révèle plusieurs corrections indépendantes, un choix produit ou un travail dépassant une petite session, la redécouper avant d’étendre le code. Cible indicative : 30 minutes à 3 heures de travail concentré par tâche ; ce n’est ni une limite de tokens ni une garantie de durée. Garder une intention vérifiable plutôt qu’un nombre arbitraire de fichiers.
6. Vérifier les critères de la fiche et les contrôles pertinents, relire le diff, mettre à jour le TODO et la preuve. Ne pas lancer systématiquement toute la suite pour une simple modification documentaire ; la suite globale reste obligatoire aux jalons R04.06, R06.04 et R08.04.
7. Terminer par une livraison courte puis **s’arrêter après cette tâche**. Indiquer l’ID suivant prêt ; ne pas le commencer dans la même réponse. Cette pause est une règle de cadence demandée pour éviter les grosses réalisations en une seule fois, pas une demande de permission répétée pour chaque action interne.

## Commits

**Un ticket = un commit cohérent par défaut**, comportant réalisation, tests pertinents et mise à jour documentaire nécessaire. Les titres sont proposés en anglais avec un type et un périmètre ; le corps éventuel explique le comportement et la validation en français. Adapter le type si le travail réel diffère : une correction fonctionnelle ne doit pas être présentée comme un simple ajout de tests.

Ne pas créer de commit vide pour un contrôle uniquement opérationnel : versionner une preuve synthétique utile, sinon journaliser le résultat sans commit et l’expliquer. Aucun secret, export de base ou rapport contenant des données privées dans le commit. Le titre proposé n’autorise pas à créer un commit, pousser, fusionner ou déployer en dehors du mandat de l’utilisateur.

Si une tâche est trop grande, créer des enfants identifiés et des titres distincts avant réalisation. Ne pas regrouper plusieurs tickets dans un commit global de type « implement sprint ». Ne pas réécrire les commits déjà publiés pour embellir le suivi.

## Blocage et reprise

Une dépendance non validée bloque le ticket. Documenter la cause, ce qui a été prouvé, le responsable de la levée et la prochaine action exacte. Un test ignoré ou une CI non exécutée ne valide pas un ticket. Aucun contournement par suppression du test ou changement de base non prévu.

Le journal du TODO est la source de vérité pour les statuts : à faire, en cours, bloqué, validé, non applicable. Les cases des stories parentes ne sont cochées qu’après validation des sous-tâches applicables et des critères du sprint. Les titres de commit ci-dessous ne sont pas des commits déjà créés.

## Livrable de fin de tâche

Rapporter : ID, résultat obtenu, fichiers concernés, validations réellement effectuées, référence de preuve et commit éventuel, blocage ou risque restant, prochain ID prêt. Si le hash n’est connu qu’après le commit, le communiquer dans le bilan ; ne pas créer une chaîne de commits uniquement pour inscrire leurs propres hashes dans le TODO.

## Ordre de travail

Par défaut : R01 → R02 → R03 → R04 → R05 → R06 → R07 si engagé → R08. Les dépendances de chaque fiche priment. R03.D1 à R03.D3 s’intercalent avant R03.03 si conservation de données. R07 est optionnel selon capacité ; un report explicite permet de poursuivre R08 après R06.04. R08 exige une cible et les autorisations de recette prévues au sprint.

Les dépendances sont volontairement séquentielles pour un agent unique. La préparation technique d’un workflow peut attendre son ticket ; cela ne dispense pas de tester localement chaque changement avant son commit.

## Catalogue des tâches

30 tâches principales, dont les 2 tâches visuelles R07 peuvent être reportées, et 3 tâches conditionnelles de transfert de données. Ce découpage ne rajoute pas de points à la prévision de 31 points du sprint ; la branche de conservation de données reste à estimer séparément.

### R01 — Environnement Windows

[Fiches détaillées R01](tasks/R01.md).

| ID | Titre de commit proposé |
|---|---|
| R01.01 | docs(dev): record the Windows starter baseline |
| R01.02 | build(web): make pnpm installation reproducible |
| R01.03 | fix(setup): preserve existing environment configuration |
| R01.04 | fix(dev): manage Windows application processes reliably |

### R02 — Isolation avant migration

[Fiches détaillées R02](tasks/R02.md).

| ID | Titre de commit proposé |
|---|---|
| R02.01 | fix(db): scope local database provisioning to Orya |
| R02.02 | fix(test): guard database resets and fixture seeding |
| R02.03 | test(e2e): isolate fixture and server environments |

### R03 — Transition PostgreSQL

[Fiches détaillées R03](tasks/R03.md).

| ID | Titre de commit proposé |
|---|---|
| R03.01 | docs(db): record SQLite retention and cutover decisions |
| R03.02 | fix(db): validate the starter schema on PostgreSQL |
| R03.D1 | feat(db): add a repeatable SQLite data transfer |
| R03.D2 | test(db): reconcile imported identities and credentials |
| R03.D3 | docs(db): verify data cutover and recovery rehearsal |
| R03.03 | fix(db): switch the active development environment to PostgreSQL |

### R04 — Identité par parcours

[Fiches détaillées R04](tasks/R04.md).

| ID | Titre de commit proposé |
|---|---|
| R04.01 | test(auth): preserve the starter journeys on PostgreSQL |
| R04.02 | test(auth): enforce API authentication and CSRF boundaries |
| R04.03 | test(sessions): verify account isolation and revocation |
| R04.04 | test(account): verify recovery and sensitive profile changes |
| R04.05 | test(2fa): reject invalid and replayed authentication factors |
| R04.06 | test(passkeys): validate trusted origins and credential ownership |

### R05 — Redis et exploitation locale

[Fiches détaillées R05](tasks/R05.md).

| ID | Titre de commit proposé |
|---|---|
| R05.01 | feat(cache): isolate Redis cache connections |
| R05.02 | feat(queue): process jobs through an isolated Redis worker |
| R05.03 | test(queue): verify bounded retries and failed jobs |
| R05.04 | feat(health): report readiness without leaking infrastructure details |

### R06 — CI et artefacts

[Fiches détaillées R06](tasks/R06.md).

| ID | Titre de commit proposé |
|---|---|
| R06.01 | ci(quality): align runtime and static checks |
| R06.02 | ci(test): run integration tests on native PostgreSQL and Redis |
| R06.03 | ci(e2e): test the production frontend with isolated services |
| R06.04 | build(release): package verified artifacts and enforce release gates |

### R07 — Identité visuelle ciblée

[Fiches détaillées R07](tasks/R07.md).

| ID | Titre de commit proposé |
|---|---|
| R07.01 | style(brand): apply Orya identity to the existing shell |
| R07.02 | style(ui): integrate one documented Cult UI component |

### R08 — Recette et récupération

[Fiches détaillées R08](tasks/R08.md).

| ID | Titre de commit proposé |
|---|---|
| R08.01 | docs(ops): define the native staging deployment contract |
| R08.02 | chore(staging): deploy and verify the tested release |
| R08.03 | test(ops): prove PostgreSQL backup restoration |
| R08.04 | docs(ops): record release rollback and sprint acceptance |

## Instruction courte à donner à l’agent

« Traite uniquement R01.01 en suivant TODO.md et docs/planning/AGENT-TASKS.md. Respecte les limites de sa fiche. Fournis les preuves, mets le suivi à jour et arrête-toi avant la tâche suivante. »

Remplacer seulement l’identifiant pour la prochaine demande. Ajouter explicitement la création du commit si elle est souhaitée ; aucune demande de développement n’est lancée par la présente documentation.
