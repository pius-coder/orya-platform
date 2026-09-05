# S0 — Initialiser le socle Laravel + Next.js + Cult UI

Plan du 5 septembre 2026, à exécuter par l’agent de développement. Aucun code ni service n’est créé par ce document.

## Résultat et limites

Depuis un checkout propre, l’agent doit pouvoir installer les dépendances figées, préparer une base dédiée, démarrer Laravel et Next.js, traiter un job Redis, exécuter les tests puis livrer les mêmes artefacts sur une recette HTTPS.

Le dépôt contient actuellement `.gitignore` et une archive de conception sous `.exclude`. L’archive couvre correctement les domaines et invariants mais son ancien S0 mélange infrastructure, catalogue et preuve SSO. Ce plan le remplace par un socle autonome. Le spike OIDC est transféré au début de S1, sans validation de compatibilité revendiquée ici. Les schémas JSON et UML existants restent conceptuels ; ne pas les convertir intégralement en migrations.

Inclus : environnement, structure, page technique connectée, santé, erreurs, PostgreSQL, Redis, worker, tests, CI et recette. Exclus : comptes/login, catalogue métier, admin réel, paiements, wallet, notifications, SDK et moteur OIDC. Les futurs espaces compte/admin ne sont pas exposés comme s’ils étaient protégés.

## Choix retenus et vérifications

| Élément | Cible du sprint | Vérification préalable |
|---|---|---|
| Backend | Laravel 13, PHP 8.3 minimum, Composer 2 | Patch PHP supporté, extensions du framework + `pdo_pgsql`, client Redis PhpRedis ; compatibilité résolue et lockfile |
| Frontend | Next.js 16, App Router, TypeScript strict, npm, Node 24 LTS | Patch stable corrigé, versions React compatibles choisies par le générateur puis figées |
| UI | Tailwind + shadcn/ui + composants Cult UI gratuits utiles | Compatibilité du composant choisi, licence et dépendances ; un seul fichier de tokens |
| Données | Instance PostgreSQL existante, nouvelles bases dédiées | Version majeure, emplacement Windows/WSL et accès depuis PHP ; même majeure en CI/recette |
| Asynchrone | Redis existant dans WSL, worker Laravel natif | Version, accès, DB/préfixes libres ; timeout du job inférieur à `retry_after` |
| Runtime local | PHP, Composer, Node et worker dans WSL | Ne pas mélanger installations Windows/Linux dans les mêmes dossiers de dépendances |
| Recette de référence | Linux sans conteneurs, Nginx + PHP-FPM + Node + worker supervisé | Hébergeur, domaine, accès, certificats et versions à confirmer en S0-01 |

Ce sont des choix de plan fondés sur les [sources](SOURCES-S0.md), pas un inventaire du PC. WSL, Redis et PostgreSQL sont déclarés présents par l’utilisateur ; leurs versions et disponibilité n’ont pas été testées. Ne pas réinstaller PostgreSQL par défaut. Aucun Docker, Sail, Kubernetes, Horizon ou moteur de recherche requis. Nginx/PHP-FPM et supervision sont nécessaires seulement pour la recette de référence ; les outils manquants locaux s’installent dans WSL.

Laravel Cloud/Vercel restent des options de l’archive, pas des hébergements acquis. Si cette option est retenue en S0-01, adapter uniquement la procédure de livraison et les variables, puis conserver les mêmes critères de recette.

## Arborescence cible à créer pendant le sprint

```text
apps/api/                 Laravel, composer.lock, tests Feature/Integration
apps/web/                 Next.js, package-lock.json, composants UI
contracts/openapi.yaml    santé/version et erreurs uniquement
tests/e2e/                scénarios Playwright, orchestrés par le package web
scripts/                  préparation/checks reproductibles sans Docker
docs/runbooks/            setup WSL, configuration, déploiement, restauration
docs/decisions/           versions, réseau, hébergement, choix différés
docs/evidence/            résultats courts et références aux artefacts CI
TODO.md
DEVELOPMENT_RULES.md
```

Pas de Nx/Turborepo ni de package partagé vide. Les manifests propres à chaque application suffisent. Si une CI distante a besoin de la vision métier, copier une synthèse utile dans les documents suivis ; elle ne peut pas lire l’archive locale ignorée.

## Tickets ordonnés

### S0-01 — Inventaire et décisions, 1–2 h

Relever sans révéler de secrets : distribution et mode réseau WSL, versions PHP/Composer/Node/npm, extensions PHP, versions et ports PostgreSQL/Redis, Git remote/CI disponible et environnement d’hébergement. Documenter le répertoire de travail WSL ; le dépôt peut rester sur `/mnt/c/...` au départ. Un éventuel déplacement vers le filesystem Linux doit être explicite, sans créer deux copies actives divergentes.

Produire `docs/decisions/0001-foundation.md` avec versions exactes, ports, chemin, topologie, cible recette et inconnues. Ne pas choisir un ancien Laravel uniquement sur la compatibilité supposée d’une extension OIDC. Le choix définitif du fournisseur appartient à S1.

Acceptation : une seule matrice de versions et aucune hypothèse cachée sur `localhost`, le compte SQL administrateur ou un hébergement disponible.

### S0-02 — Services et isolation, 2–3 h

Réutiliser PostgreSQL pour créer `orya_core_dev` et `orya_core_test`, avec rôles distincts non superutilisateurs. Le rôle de test ne doit pas pouvoir modifier les bases existantes ou dev. Vérifier les privilèges effectifs et les connexions, pas seulement les noms. Réserver une base temporaire séparée pour la restauration et les essais de migrations. Compte de migration séparé du compte runtime en recette.

Si PostgreSQL tourne sous Windows et WSL en NAT, configurer l’adresse Windows joignable depuis WSL ; en mode mirrored compatible, vérifier `127.0.0.1`. Ne changer `listen_addresses`, `pg_hba.conf` ou pare-feu qu’au strict périmètre nécessaire, sans exposer 5432 publiquement. Si PostgreSQL tourne dans la même distribution WSL, vérifier la connexion locale. [Réseau WSL](SOURCES-S0.md).

Attribuer des DB Redis disponibles et des préfixes `orya:dev:`/`orya:test:<run>:` distincts, incluant noms de queues et clés de cache. Des DB logiques ne sont pas une barrière de sécurité : nettoyage par clés du run uniquement ; instance/processus Redis jetable distinct pour CI et essais de panne.

Prévoir `.env.example` par application, configuration test dédiée et tableau des variables : DB, Redis, queue, `APP_KEY`, `APP_URL`, `APP_DEBUG`, URL interne API, version de release. Documenter création, démarrage et arrêt ; aucun mot de passe réel dans les commandes livrées.

Acceptation : lecture/écriture depuis PHP sur la nouvelle base, Redis joignable, refus de reset hors base de test et absence d’accès SQL de test aux données dev.

### S0-03 — Backend minimal, 3–4 h

Initialiser Laravel sans starter kit métier, retirer les artefacts inutilisés du scaffold en documentant le choix. Garder uniquement les migrations techniques nécessaires aux jobs échoués/batches ou autres capacités réellement activées ; aucune table utilisateur finale décidée avant S1.

Configurer PostgreSQL, Redis cache/queue et erreurs JSON de `/v1`. Contrat minimal à écrire dans OpenAPI et vérifier en tests :

| Route | Contrat |
|---|---|
| `GET /up` | Liveness du processus Laravel ; 200 si démarré, sans dépendance DB/Redis |
| `GET /ready` | Readiness : SELECT 1 + PING Redis avec délais bornés ; 200 prêt, 503 sinon ; réponse publique minimale |
| `GET /v1/system/info` | 200, `data.name`, `data.version`, `request_id` ; aucun détail infrastructure ni secret |
| Route `/v1/*` inconnue | 404 JSON avec `code`, `message`, `request_id`, `details` |

Propager un identifiant de corrélation borné/validé ou en générer un. Logger côté serveur la cause réelle des erreurs. La readiness n’atteste pas de l’activité du worker : son test est séparé. Les probes n’écrivent aucune donnée. Pas d’endpoint HTTP permettant de lancer les diagnostics ou des jobs arbitraires.

Acceptation : contrat, erreurs, migrations et configuration cachée fonctionnent avec PostgreSQL réel et `APP_DEBUG=false`.

### S0-04 — Frontend connecté, 3–4 h

Initialiser Next.js et le thème commun. Installer un petit composant Cult UI gratuit adapté au shell et les primitives shadcn nécessaires. Vérifier le registre officiel ; si le CLI présenté est en beta, choisir une version stable compatible ou la copie manuelle documentée et figer le code obtenu.

Créer uniquement une page d’accueil sobre avec le nom du projet et la version réelle reçue de Laravel ; états chargement, indisponibilité et reprise. Une route Next de façade fixe peut relayer `system/info` côté serveur : URL interne non publique, timeout, statuts cohérents et aucune URL de destination contrôlable par l’utilisateur. Ne pas créer un proxy générique. Le navigateur reste sur la même origine ; l’API n’a pas besoin de CORS permissif.

Éviter que le build nécessite un backend vivant : chargement runtime sans cache pour l’information technique. Privilégier police système ou locale. Préparer 404/error/loading, focus clavier et réduction des animations. Aucun faux catalogue ou indicateur financier.

Acceptation : page branchée, aucun débordement à 390/1440 px, navigation clavier, absence d’erreur d’hydratation ; panne API visible et récupération possible.

### S0-05 — Intégration et E2E, 3–4 h

| ID | Scénario | Preuve exigée |
|---|---|---|
| I01 | Migrations sur base vide puis seconde exécution | Schéma créé et aucune migration restante ; données conservées à la seconde exécution |
| I02 | Précontrôle avec nom dev ou rôle inadéquat | Arrêt avant toute mutation destructive |
| I03 | HTTP réel/Feature du contrat S0 | Statuts, schémas, request_id et absence de détails sensibles |
| I04 | Connexion DB puis Redis volontairement invalide en environnement isolé | `/ready` 503 borné, `/up` reste 200 ; retour à 200 après rétablissement |
| I05 | Cache Redis avec TTL court et préfixe du run | Lecture valide puis expiration, sans nettoyer les clés d’autres projets |
| I06 | Job de diagnostic envoyé dans Redis et vrai worker séparé | Marqueur unique écrit dans PostgreSQL, relu depuis une nouvelle connexion dans un délai borné |
| I07 | Échec contrôlé du job de diagnostic | Nombre fini de tentatives, enregistrement d’échec et preuve observable ; pas de boucle infinie |
| E01 | Navigateur → Next construit → Laravel → PostgreSQL/Redis prêts | Version réelle affichée ; page et probes répondent |
| E02 | Backend inaccessible puis rétabli | Message utile puis reprise ; aucune stack ni secret exposé |
| E03 | Mobile/desktop, clavier et mouvement réduit | Captures et contrôles sans débordement ni blocage de navigation |

Le job/stockage de diagnostic est réservé au harnais de test, pas une fonctionnalité publique ni une table métier de production. Les tests avec worker utilisent des transactions committées et des identifiants uniques. Exécuter ces tests en série au début ; isoler par run avant tout parallélisme.

### S0-06 — CI et artefacts, 2–3 h

Définir des commandes reproductibles `check-backend`, `check-frontend`, `test-integration`, `test-e2e` dont le nom exact est consigné dans le runbook. CI Linux avec PostgreSQL/Redis natifs temporaires ; si GitHub Actions est retenu, pas de bloc `services:` qui introduirait Docker. Figer la version du runner et installer les versions majeures décidées, puis créer les bases isolées.

Pipeline bloquant : installation lockfiles → validation Composer/Pint → lint ESLint et typage TypeScript → tests PostgreSQL et worker Redis → build Next → configuration Laravel optimisée → démarrage des applications → Playwright Chromium → archivage résultats et artefacts identifiés par commit. Installer explicitement le navigateur et ses dépendances Linux. Vérifier également les dépendances pour vulnérabilités connues et consigner les corrections/exceptions justifiées avant exposition.

Next.js 16 ne lance pas automatiquement le lint pendant le build. Tester la configuration backend après cache. Produire un artefact backend sans dépendances de développement, exécuter un smoke dessus ; assembler le frontend avec les assets nécessaires, puis tester l’artefact effectivement destiné à la recette. Ne pas reconstruire après validation avec d’autres versions.

Acceptation : pipeline réussi depuis environnement propre, échec simulé d’un contrôle bloque la livraison, traces E2E conservées en cas d’échec. Sans accès CI, fournir la procédure locale équivalente mais laisser la validation CI en attente.

### S0-07 — Recette et exploitation minimale, 2–4 h

Produire un runbook adapté à la cible S0-01 : secrets séparés, TLS, DB privée, permissions filesystem limitées, stockage persistant et processus supervisés. Nginx sert uniquement `apps/api/public` pour Laravel et relaie Next au processus Node. Les serveurs de développement ne servent pas la recette. Préparer une unique tâche scheduler si utilisée, sans exécution doublée entre instances.

Procédure : créer une release identifiée → injecter configuration → vérifier accès/services → sauvegarder la base → migrations compatibles → caches Laravel → basculer la release → redémarrer/recharger PHP, Node et worker concernés → probes et smoke E01. Une livraison échouée ne continue pas vers les étapes suivantes. Conserver l’artefact précédent.

Prouver la sauvegarde en restaurant dans une base temporaire distincte et en vérifiant schéma plus donnée témoin synthétique. Tester le retour à la release précédente avec le schéma compatible ; ne pas promettre un rollback SQL automatique. La recette doit pouvoir être reconstruite à partir du runbook et des lockfiles.

Acceptation : URL HTTPS accessible, debug désactivé, aucun `.env` accessible, probes valides, worker opérationnel, redémarrage des processus vérifié, restauration et retour de code documentés avec résultats. Si domaine/accès manquent, consigner le blocage sans déclarer S0 terminé.

## Définition de terminé et passage à S1

Les sept tickets et les scénarios I01–I07/E01–E03 passent ; preuves datées avec commit et versions ; README de démarrage utilisable depuis checkout propre ; aucune dépendance aux secrets ou fichiers locaux ignorés ; TODO mis à jour. Les estimations totalisent environ 16–24 h, et ne garantissent pas une livraison commerciale en deux jours.

À transmettre à S1 : matrice figée, topologie et contrats minimaux, procédures de test/livraison, décision OIDC explicitement ouverte. S1 commence par vérifier maintenance, compatibilité et conformité du moteur avec deux clients. Aucun succès SSO n’est attribué à S0.
