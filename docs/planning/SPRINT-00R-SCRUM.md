# Sprint S0-R — Starter fiable sur PostgreSQL

Plan du 6 septembre 2026. Remplace le Sprint 00 initial pour les travaux à venir. **Plan uniquement : aucune ligne de code ou commande de réalisation dans ce document.** Lire d’abord [l’audit du starter](STARTER-KIT-AUDIT.md), puis [la transition PostgreSQL](POSTGRES-TRANSITION.md).

## Product Goal et Sprint Goal

**Product Goal :** une plateforme commune permettant de découvrir les SaaS indépendants, d’utiliser une identité commune et de gérer accès, organisations et services transversaux.

**Sprint Goal :** un utilisateur peut s’inscrire, se connecter et gérer sa sécurité avec le starter existant sur PostgreSQL ; un développeur peut reproduire l’environnement Windows et démontrer ces mêmes parcours sur un build de recette, avec tests isolés et restauration vérifiée.

L’Increment attendu est le starter consolidé, pas une nouvelle application vide. On conserve Fortify, Sanctum, next-sanctum, Pest, pnpm, les composants shadcn et les tests existants. Redis prend en charge cache et queue ; les sessions restent en PostgreSQL. Cult UI s’intègre à petite échelle.

## Cadre Scrum adapté à un développeur assisté

- **Timebox proposée : 10 jours ouvrés.** Dates fixées pendant le Sprint Planning, après disponibilité des accès. Ce délai est une prévision, pas une garantie.
- **Product Owner : toi.** Tu ordonnes la valeur, décides de la conservation des données et de la cible de recette, puis constates le résultat en Sprint Review.
- **Développement : ton agent et la personne qui le supervise.** Ils choisissent la réalisation, produisent les tests et rendent les blocages visibles. Un outil IA ne remplace pas la responsabilité humaine sur la livraison.
- **Facilitation :** une personne désignée entretient le backlog et enlève les obstacles ; en solo, cette responsabilité est cumulée explicitement. Il s’agit d’une adaptation pragmatique de Scrum, pas d’une équipe fictive.
- **Planning : 60–90 min.** Examiner objectif, accès, capacité réelle et risques ; sélectionner les stories. L’effort en points sert à comparer la difficulté, sans conversion automatique en heures.
- **Point quotidien : 10–15 min.** Écart au Sprint Goal, obstacle, résultat vérifiable du jour et adaptation du plan. Mettre à jour le TODO après chaque résultat.
- **Affinage : deux séances de 20 min.** Préciser la prochaine story et préparer S1 sans commencer ses fonctionnalités.
- **Review : 45 min.** Démonstration depuis un navigateur et présentation des preuves, y compris panne et restauration. Le Product Owner peut inspecter plus tôt ; on n’attend pas le dernier jour pour détecter un écart.
- **Rétrospective : 30 min.** Choisir une seule amélioration concrète pour le sprint suivant.

Tableau : À préciser → Prêt → En cours → À vérifier → Terminé ; un blocage est signalé avec cause, responsable et prochaine action. Limite proposée : une story en développement et une en vérification. Aucun travail caché ; les points ne mesurent pas la productivité d’une personne.

## Conditions d’entrée

Avant engagement complet : commit de départ identifié, PostgreSQL administrable, données SQLite qualifiées ou branche de préservation retenue, runtime Windows vérifié, cible de recette accessible. Ces conditions sont une checklist d’équipe, pas un artefact Scrum obligatoire.

Si la recette n’est pas disponible, ne pas engager R08 sous une fausse promesse : limiter explicitement le Sprint Goal à un Increment validé localement et en CI, conserver R08 dans le Product Backlog. Si les accès existent, l’objectif complet reste celui ci-dessus. Le backlog est adapté avec le Product Owner sans masquer un résultat incomplet.

## Sprint Backlog proposé

**Exécution par agent :** chaque story ci-dessous est décomposée dans [le catalogue des 33 petites tâches](AGENT-TASKS.md), avec titre de commit, dépendances, validation et condition d’arrêt. Attribuer un identifiant tel que R01.01, jamais toute une story implicitement. Ce découpage pilote la réalisation ; il ne change pas le Sprint Goal ni les critères de fin ci-dessous.

| ID | Story, valeur attendue | Priorité | Points provisoires | Dépendances |
|---|---|---|---|---|
| R01 | Reproduire le starter sous Windows depuis un checkout propre | P0 | 2 | Aucune |
| R02 | Isoler les environnements et empêcher les tests de toucher mes comptes | P0 | 3 | R01 |
| R03 | Utiliser PostgreSQL en conservant les données choisies | P0 | 5 | R02, décision données |
| R04 | Retrouver tous les parcours d’identité sans régression | P0 | 5 | R03 |
| R05 | Exécuter les tâches asynchrones et détecter les pannes | P0 | 3 | R03 |
| R06 | Bloquer une livraison défectueuse par une CI représentative | P0 | 5 | R02 ; finalisation après R04/R05 |
| R07 | Donner au portail une base visuelle Orya cohérente | P1 | 3 | R01 ; vérification après R04 |
| R08 | Livrer en recette HTTPS et prouver la récupération | P0 | 5 | R04/R05/R06, hébergement |

Total indicatif : 31 points, sans vélocité historique. Ce total n’est pas une promesse de capacité. Une reprise de données significative est une story additionnelle à estimer après R01 ; elle n’est pas absorbée artificiellement dans les 5 points de R03. En cas de manque de capacité, retirer R07 avant de réduire les contrôles essentiels.

### R01 — Baseline Windows reproductible

**Comme développeur, je veux démarrer la base réellement choisie, afin de ne pas maintenir deux architectures.**

Travail : relever commit local, provenance upstream, versions résolues et runtime actif ; conserver racine Laravel et web pour Next ; clarifier PHP Windows 8.5 x64, extensions PostgreSQL/Redis et celles nécessaires aux passkeys. Fixer pnpm, aligner Node 24 et la politique des scripts de dépendances. Vérifier la présence effective des environnements frontend, car les scripts d’installation sont actuellement bloqués. Adapter start.ps1 au répertoire du projet, au démarrage du worker et à la remontée des échecs. Corriger les anciennes instructions apps/api et apps/web.

**Acceptation :** un nouveau terminal Windows retrouve les bons outils ; un checkout propre s’installe à partir des lockfiles ; démarrage et arrêt ne touchent que les processus du projet ; absence de Docker et de runtime applicatif Linux. Une dépendance manquante donne un échec visible. Le second démarrage ne régénère aucune clé ni base.

**Preuves :** matrice datée, procédure Windows, résultat du démarrage et de l’arrêt. Responsable : développeur ; contrôle par le superviseur.

### R02 — Isolation DB, seeders et E2E

**Comme propriétaire du projet, je veux lancer les tests sans perdre mes comptes de développement.**

Travail : préparer les quatre bases/roles décrits dans le plan PostgreSQL ; contrôler la destination effective après résolution de la configuration, le rôle SQL et l’environnement avant migrations, nettoyage et seeders. Adapter le provisionnement hérité avant de l’utiliser. Faire appliquer la garde également à E2eSeeder lorsqu’il est lancé directement. Propager le même environnement isolé à tous les processus E2E ; attribuer ports, cookies, queues et préfixes propres. Empêcher la réutilisation d’un serveur de développement simplement parce que son port répond.

**Acceptation :** viser volontairement la base dev, une URL de connexion incompatible ou un rôle inadéquat provoque un refus avant mutation ; E2E ne change ni mot de passe ni passkey dev ; le rôle test ne modifie aucune autre base. Relancer la préparation est maîtrisé sans nettoyage global Redis.

**Preuves :** tests de refus et contrôle des droits ; fixtures identifiables ; aucune donnée personnelle dans le rapport.

### R03 — PostgreSQL et continuité des données

**Comme utilisateur, je veux retrouver mes informations après le changement de base.**

Travail : suivre les six étapes du [plan de transition](POSTGRES-TRANSITION.md) ; convertir tous les points de configuration actifs, y compris tests et scripts Composer. Créer et vérifier le schéma sur PostgreSQL 17. Conserver les sessions en base, les clés primaires et les tables techniques du starter. Qualifier JSON passkeys, unicité email, dates, valeurs nulles, relations et séquences. Tester la configuration après mise en cache. Si la source contient des données à conserver, répéter leur transfert avant la bascule réelle.

**Acceptation :** migration initiale réussie puis seconde passe sans changement inattendu ; nouvelle inscription persistante ; données choisies réconciliées ; création après import sans collision de séquence ; aucun démarrage ou test ne revient à SQLite en silence. La source est sauvegardée et la décision de retour arrière explicite.

**Preuves :** rapport de schéma, décomptes non sensibles, contrôles d’intégrité et résultat de la répétition. Décision de conservation : Product Owner ; réalisation : développeur.

### R04 — Non-régression identité

**Comme utilisateur, je veux conserver une connexion et des paramètres de sécurité fiables.**

Travail : faire passer les huit E2E existants sur PostgreSQL puis ajouter des tests backend significatifs. Vérifier authentification côté API sans dépendre de l’interface ; cookie de session invité, CSRF, invalidation logout, expiration réelle et isolation des sessions entre deux utilisateurs. Tester confirmation de mot de passe pour actions sensibles, récupération de compte, mise à jour du profil et suppression locale. Couvrir 2FA invalide, code de récupération réutilisé et passkey de mauvaise origine au niveau adapté.

Ne pas confondre le test existant du message d’expiration avec un test d’expiration effective. Conserver pour S0-R le comportement de vérification email actuellement désactivé ; décrire sa future activation backend et frontend en S1. Les tests de CSRF doivent inclure un vrai parcours HTTP, car les tests internes peuvent désactiver ce middleware.

**Acceptation :** les huit parcours existants restent verts ; une API protégée refuse un invité ; un compte ne lit/révoque pas les sessions d’un autre ; un cookie ancien ne reconnecte pas après révocation ; liens de reset invalides/expirés/rejoués refusés ; aucune donnée sensible dans la réponse profil ; erreurs comprises par next-sanctum.

**Preuves :** Pest PostgreSQL et rapports Playwright, scénarios négatifs documentés, deux contextes navigateur indépendants. Aucun faux succès obtenu en désactivant passkeys ou 2FA pour faire passer la suite.

### R05 — Redis, worker et santé

**Comme exploitant, je veux savoir si la plateforme peut traiter ses opérations et retrouver un échec.**

Travail : connecter cache et queue à Redis WSL en gardant les sessions PostgreSQL. Séparer les noms/préfixes de chaque environnement. Vérifier client Redis disponible et versions. Définir tentatives finies, attente entre tentatives, délai du job et délai de remise en queue cohérents. Examiner le déclenchement après validation d’une transaction avant de l’utiliser avec des données committées. Un job de diagnostic reste réservé au harnais de test.

Préparer disponibilité du processus, readiness DB/Redis à délai borné et preuve distincte d’activité worker ; un simple PING Redis ne prouve pas que la queue est consommée. Les logs corrèlent les erreurs sans exposer de secrets. Sous Windows, vérifier les limites des signaux et timeouts du worker ; la recette Linux valide séparément sa supervision.

**Acceptation :** vrai job transporté par Redis et effet durable relu depuis une nouvelle connexion PostgreSQL ; échec contrôlé enregistré après tentatives finies ; panne d’une dépendance visible, restauration du service vérifiée ; les sessions appareils fonctionnent toujours. Aucun fake comme unique preuve du transport.

**Preuves :** identifiant de job, résultat et échec attendu, contrôles de santé, démarrage du worker Windows. Pannes simulées sur connexions ou services isolés uniquement.

### R06 — CI et artefacts reproductibles

**Comme développeur, je veux qu’une régression bloque la livraison avant d’atteindre les utilisateurs.**

Travail : adapter les trois workflows existants sans repartir de zéro. Utiliser runner Linux fixé, Node 24, PostgreSQL 17 et Redis natifs sans conteneurs. Garder la matrice PHP 8.4/8.5 si elle reste effectivement supportée ; employer un patch compatible avec les dépendances verrouillées. Tester sur PostgreSQL avec sessions en base et vrais services pour l’intégration ; garder les fakes ciblés dans leurs suites dédiées.

Chaîne attendue : installation figée et contrôle des dépendances → Pint, lint, format et typage explicite → Pest/intégration → build frontend → démarrage des artefacts → E2E → conservation des preuves. Préparer le backend sans dépendances de développement et vérifier ses caches de production. Ne jamais inclure fixtures, secrets, base locale ou archives de recherche dans les artefacts.

**Acceptation :** installation propre avec lockfiles inchangés ; contrôles et builds passent ; E2E de validation utilise le build de production y compris en local ; une régression volontaire fait échouer le job bloquant ; aucun retry ne transforme silencieusement un test critique flaky en validation. Les statuts requis doivent être configurés sur la branche de livraison.

**Preuves :** exécution CI identifiée par commit, rapports et artefacts traçables ; aucune conclusion tirée des badges upstream. En l’absence d’accès GitHub, laisser cette validation ouverte.

### R07 — Intégration visuelle minimale

**Comme utilisateur, je veux reconnaître Orya sans perdre les parcours déjà disponibles.**

Travail : adapter nom, logo textuel, métadonnées et tokens du thème existant ; intégrer un composant Cult UI gratuit documenté et compatible. Conserver les primitives de formulaires, les identifiants des tests, le focus et le thème clair/sombre. Ne pas présenter le dashboard du starter comme un back-office métier opérationnel ni inventer revenus ou catalogue.

**Acceptation :** accueil, connexion et paramètres lisibles à 390 et 1440 pixels ; navigation clavier et mouvement réduit ; aucune régression d’authentification ni dépendance à un asset externe indispensable au build. Licence et provenance du composant conservées.

**Preuves :** captures et parcours E2E inchangés. Cette story peut être reportée si elle met en danger la migration et la fiabilité.

### R08 — Recette, sauvegarde et récupération

**Comme propriétaire, je veux une version démontrable et récupérable avant toute exploitation réelle.**

Travail : préparer une recette native HTTPS avec runtime PHP/Node, PostgreSQL privé et worker supervisé. Conserver le navigateur sur l’origine Next ; vérifier le backend interne, les hôtes de confiance, le transfert de cookies et les liens email. Le domaine de confiance passkey doit correspondre au domaine frontend retenu : ne pas laisser sa dérivation depuis une URL API interne casser WebAuthn. Préférer des cookies limités au portail au lieu d’élargir leur domaine par défaut.

Livrer un artefact identifié, configuration persistante, migration compatible, caches et redémarrage des services. Vérifier ensuite les parcours critiques. Restaurer une sauvegarde dans une base distincte ; démontrer le retour au code précédent compatible avec le schéma. S’il s’agit de la première release, construire la preuve avec deux versions de recette identifiées, sans inventer une ancienne production.

**Acceptation :** HTTPS, debug désactivé, fichiers sensibles inaccessibles ; auth et passkey valides sur la vraie origine ; test de récupération email avec transport de recette ; restauration vérifiée ; processus redémarrés et worker actif ; version précédente récupérable selon procédure. Domaine ou accès manquant = story non terminée.

**Preuves :** URL de recette, commit, résultats de smoke, sauvegarde/restauration et exercice de récupération ; aucune mise en vente ni paiement réel dans ce sprint.

## Séquencement proposé

| Période | Résultat à inspecter |
|---|---|
| J1 | Planning, R01, décision données et accès ; périmètre ajusté à la capacité |
| J2–J3 | R02 puis schéma PostgreSQL et première preuve R03 |
| J4–J5 | R04 ; démonstration intermédiaire inscription, login, sessions et passkeys |
| J6–J7 | R05 et finalisation R06 ; R07 seulement si capacité confirmée |
| J8–J9 | R08, restauration et correction des écarts découverts |
| J10 | Vérification finale, Review et rétrospective |

Ce calendrier guide l’inspection ; les tests font partie de chaque story dès son début. Le chemin critique est isolation → PostgreSQL → non-régression → CI → recette. Un blocage d’accès permet de préparer documents et tests indépendants, pas de cocher une étape non exécutée.

## Definition of Done commune

Une story est terminée lorsque son comportement et ses critères sont prouvés, les tests pertinents passent sans exclusion critique, les changements sont relus, la configuration et les migrations sont documentées et les preuves sont liées au commit. Un écran mocké ou un test avec fakes ne valide pas une intégration réelle.

Pour l’Increment engagé complet : installation propre Windows, données traitées selon décision, PostgreSQL dans intégration/CI, E2E production, worker réel, récupération et recette validés ; aucun secret dans Git ; TODO fidèle. Une story sans preuve revient au backlog même si son code existe. La réussite du sprint est jugée sur l’objectif atteint, pas sur le nombre de fichiers ou points produits.

## Prochaines étapes après S0-R

| Sprint historique conservé | Ajustement grâce au starter | Validation future principale |
|---|---|---|
| S1 — identité centrale/SSO | Réutiliser auth locale ; activer email vérifié avec contrôle API, traiter les écarts de sécurité, décider et intégrer OIDC | Deux SaaS de frameworks différents, même identité prouvée ; révocation et scénarios négatifs |
| S2 — catalogue/intégration | Construire de vraies Apps et leur administration ; conserver les routes auth existantes | App ajoutée sans changer le Core ; fiches privées filtrées |
| S3 — organisations/droits | Créer comptes personnels/organisations, memberships et politiques | Aucun accès entre comptes ; dernier propriétaire protégé |
| S4 — commerce | Garder le domaine neutre et les prestataires confinés aux adaptateurs de l’archive | Financement unique, rapprochement et échéances |
| S5 — wallet/usage | Transactions PostgreSQL, réservations et ledger | Concurrence sans solde négatif ni double consommation |
| S6 — événements/communication | Étendre Redis et jobs validés vers outbox/inbox et livraisons | Reprise après panne, effets dédupliqués |
| S7 — support/admin | Étendre le shell avec rôles et audit réels | Accès sensibles contrôlés et traçables |
| S8 — exploitation/extensions | Étendre la récupération initiale vers effacement distribué, rotation et SDK | Recette d’exploitation par scénario |

Le contenu fonctionnel détaillé reste celui de la [matrice initiale](../../.exclude/saas-platform-plan/docs/05-couverture.md). Les anciennes estimations de 20–34 jours doivent être recalculées après mesure de S0-R ; l’intégration d’un starter ne constitue pas une promesse de livraison complète.
