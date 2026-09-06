# Adoption du starter kit — analyse et décisions

Date : 6 septembre 2026. **Livraison documentaire uniquement, sans code ni commandes à exécuter.** Référence locale analysée : commit edad712, après import du starter au commit 399fef2 et adaptation pnpm au commit 93035bf. Le dépôt public a été consulté ; sa branche main est mutable et son identité exacte avec l’import local n’est pas attestée.

## Décision principale

Conserver le starter déjà importé : Laravel à la racine, Next.js dans web, Composer et pnpm avec leurs lockfiles, Pest et Playwright. Remplacer l’ancien S0 de création à zéro par [S0-R — consolidation PostgreSQL](SPRINT-00R-SCRUM.md). PHP, Composer, Laravel, Node et le worker restent sous Windows ; Redis reste dans WSL. PostgreSQL 17 Windows existant est réutilisé. Aucun Docker nécessaire.

Le starter fait gagner du temps sur l’identité du portail et les écrans de paramètres. Il ne fournit pas les organisations, droits commerciaux, catalogue, paiements, wallet ni SSO inter-domaines prévus par l’archive. Ces domaines restent dans le backlog ; leur disponibilité n’est pas déduite des pages du starter.

## État réel observé

| Élément | Preuve locale | Conséquence |
|---|---|---|
| Backend | composer.lock : Laravel 13.17.0, Fortify 1.37.2, Sanctum 4.3.2, Passkeys 0.2.1 | Conserver les versions résolues comme baseline ; contrôler sécurité/compatibilité avant promotion |
| PHP | composer.json demande PHP 8.4 ou supérieur | L’ancien minimum PHP 8.3 ne suffit plus au projet ; valider PHP Windows 8.5 x64 et extensions réellement chargées |
| Frontend | web/pnpm-lock.yaml : Next 16.2.9, React 19.2.4, next-sanctum 0.2.1, Playwright 1.61.1 | Ne pas remplacer par le précédent scaffold npm ; conserver pnpm et figer sa version exacte |
| Authentification | Fortify, Sanctum, proxy same-origin et vérification serveur de l’utilisateur | Réutiliser le flux existant ; les contrôles Laravel restent l’autorité |
| Sessions appareils | SessionController lit la table des sessions et refuse un autre driver | Garder les sessions en PostgreSQL ; passage global des sessions à Redis exclu |
| Email vérifié | Contrat du modèle User désactivé, indicateur frontend désactivé | Le parcours existe mais l’obligation de vérifier l’email n’est pas activée |
| SQLite | Exemple d’environnement, configuration par défaut, scripts Composer, phpunit.xml et CI | Modifier tous les chemins actifs, pas seulement le fichier d’environnement local |
| Données locales | database/database.sqlite existe, 135 168 octets au relevé | Contenu non inspecté ; ne jamais considérer cette base jetable par défaut |
| Tests backend | Un exemple HTTP et un exemple unitaire ; isolation par rafraîchissement DB non activée dans Pest.php | Une CI verte actuelle ne constitue pas une preuve PostgreSQL ou de sécurité de l’authentification |
| E2E | Huit tests déclarés : login, mauvais identifiants, inscription, logout, passkey, 2FA, sessions, message d’expiration | Couverture utile à conserver et compléter ; aucun test exécuté dans cette analyse |
| Préparation E2E | global-setup lance le seeder sur la configuration active ; E2eSeeder réinitialise mots de passe, 2FA et passkeys de comptes connus | Garde DB et environnement obligatoire avant tout lancement, même manuel |
| Démarrage Windows | start.ps1 démarre API et frontend, pas de worker ; chemin de travail implicite | Corriger l’orchestration, les contrôles de sortie et le nettoyage des seuls processus démarrés |
| Hébergement fourni | Docker Compose avec MySQL ; trois workflows CI orientés SQLite et Node 20 | Préparer une voie native PostgreSQL ; ne pas reprendre ces valeurs par défaut |
| Provisionnement ancien | scripts/setup-databases.php vise encore apps/api et attend un exemple incompatible | Script obsolète à adapter avant usage ; son existence ne prouve pas que les bases sont créées |
| Installation pnpm | Scripts bloqués dans les fichiers npmrc ; valeurs textuelles de décision non finalisées dans allowBuilds | Clarifier une seule politique et vérifier les dépendances natives, sans autoriser tous les scripts aveuglément |

## Ce qui doit rester stable

- Structure du starter, contrôleurs/actions Fortify, tables techniques et identifiants internes numériques. Introduire plus tard un identifiant public opaque pour les contrats BaaS et le sujet OIDC, sans convertir toutes les clés primaires maintenant.
- URLs d’authentification et format d’erreurs attendus par next-sanctum. L’ancien projet d’enveloppe JSON universelle ne doit pas casser les erreurs Fortify, CSRF ou de validation. Réserver les futurs contrats versionnés aux nouvelles API métier.
- Proxy serveur à destination configurée fixe. Vérifier cookies multiples, en-têtes d’origine, redirections, expiration, isolation du cache SSR entre utilisateurs et refus d’une destination externe imposée par une requête.
- Apparence shadcn Nova existante. Cult UI sera une extension ciblée du thème, sans remplacement global des formulaires, de la sidebar ou des composants accessibles.
- APP_KEY de l’environnement existant lors d’une reprise de données : les secrets 2FA chiffrés en dépendent. Une clé distincte est créée pour les environnements nouveaux, pas à chaque démarrage.

## Authentification du portail et identité de l’écosystème

Sanctum fournit ici les sessions du portail ; ce n’est pas un fournisseur OIDC. Le SSO des SaaS indépendants reste un jalon de S1 avec discovery, JWKS, code avec PKCE, validation des tokens et deux clients de technologies différentes. La session du portail peut être consolidée dès S0-R ; elle n’attend pas la construction du SSO.

S1 devra choisir la source d’identité faisant autorité et expliquer comment les comptes Fortify existants y sont liés. Si le fournisseur OIDC est externe, planifier la migration ou le rattachement avec preuve de contrôle, sans créer deux mots de passe centraux concurrents. Ne pas choisir un moteur dans cette analyse sans essai de compatibilité.

La suppression de compte actuelle supprime l’utilisateur local et ses tokens ; elle ne constitue pas l’effacement orchestré des futurs SaaS. Conserver sa recette locale, mais revoir cette capacité avant de lui attacher organisations et historique financier. La sécurité d’un futur back-office ne découle pas de la simple présence d’un dashboard connecté.

## Décisions qui conditionnent le lancement

| Décision | Responsable | Valeur proposée / règle |
|---|---|---|
| Données SQLite à garder | Product Owner | Préserver tant que le contenu n’est pas qualifié ; choisir la branche de migration après inventaire |
| Accès PostgreSQL | Responsable du poste | Fournir un moyen d’administration local sans secret dans le chat ou les preuves |
| Runtime et versions | Développeur | Windows natif ; PHP 8.5 x64, Node 24 LTS ; versions exactes relevées, patchs contrôlés |
| Hébergement de recette | Product Owner | URL stable HTTPS et accès avant engagement du ticket de déploiement |
| Vérification email obligatoire | Product Owner | Préparer son activation en S1 avec mailer validé et protection backend, pas seulement UI |
| Déploiement public | Product Owner | Jamais implicitement autorisé par une demande de planification |

## Sources et limites

- [Starter kit officiel](https://github.com/aliziodev/laravel-next-starter-kit) : architecture annoncée et licence MIT. Les constatations détaillées ci-dessus proviennent des fichiers locaux lus, pas d’un badge de CI.
- [Laravel — base de données](https://laravel.com/framework/docs/13.x/database) : PostgreSQL pris en charge nativement ; une URL de connexion peut fournir les paramètres effectivement utilisés.
- [Laravel — Sanctum](https://laravel.com/framework/docs/13.x/sanctum) : authentification de SPA par session/cookie et protection CSRF. Cela ne valide pas le SSO OIDC cible.
- [PostgreSQL 17 — types](https://www.postgresql.org/docs/17/datatype.html) : contrôler la représentation des types lors du transfert.
- [PostgreSQL 17 — sauvegarde logique](https://www.postgresql.org/docs/17/backup-dump.html) : une sauvegarde doit être restaurée et vérifiée dans une base distincte.
- [Scrum Guide](https://scrumguides.org/scrum-guide.html) : objectif de Sprint, backlog adaptable, Increment conforme à la Definition of Done, revue et rétrospective.

Lecture statique ciblée du code, migrations, configurations, CI, tests, scripts locaux et dossier métier. Aucun accès aux secrets, aucune lecture des comptes SQLite, aucun audit de sécurité exhaustif, aucune migration ou exécution de tests. La présence de vendor et des lockfiles ne prouve pas la réussite de l’installation complète.
