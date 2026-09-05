# Sources du sprint S0

Consultées le 5 septembre 2026. Documentation officielle uniquement. Ces pages établissent les capacités et prérequis ; elles ne prouvent ni l’état du PC ni la réussite future de l’intégration. Les versions patch seront relevées et figées par S0-01. Aucune nouvelle recherche sur les fonctionnalités S1–S8 n’est présentée comme achevée.

| Source | Fait vérifié et conséquence pour le plan |
|---|---|
| [Laravel 13 — déploiement](https://laravel.com/framework/docs/13.x/deployment) | PHP >= 8.3 ; racine publique dédiée, caches de déploiement, debug désactivé et rechargement des services persistants. Protéger les fichiers de configuration. |
| [Laravel — tests](https://laravel.com/framework/docs/13.x/testing) | Environnement de test configurable et exécution via PHPUnit/Artisan. Nos tests d’infrastructure doivent configurer explicitement PostgreSQL et Redis. |
| [Laravel — queues](https://laravel.com/framework/docs/13.x/queues) | Driver Redis et workers disponibles ; tentatives, timeouts et échecs configurables. Le plan exige une exécution réelle hors requête HTTP. |
| [Next.js — installation](https://nextjs.org/docs/app/getting-started/installation) | App Router, TypeScript et scripts de build/start disponibles ; Node minimum 20.9. Depuis Next 16, lint séparé du build. Le minimum technique n’est pas notre version cible. |
| [Node.js — releases](https://nodejs.org/en/about/previous-releases) | Node 24 indiqué LTS ; Node 20 indiqué EOL. Choix Node 24 LTS pour le socle. |
| [Next.js — self-hosting](https://nextjs.org/docs/app/guides/self-hosting) | Exécution sur serveur Node et reverse proxy possible ; variables publiques intégrées au build à distinguer des variables serveur runtime. Docker n’est pas nécessaire. |
| [Cult UI — installation](https://www.cult-ui.com/docs/installation) | Registre `https://cult-ui.com/r/{name}.json`, intégration shadcn et copie manuelle disponibles. Les exemples CLI beta ne constituent pas une obligation de dépendre d’une beta. |
| [Microsoft — réseau WSL](https://learn.microsoft.com/en-us/windows/wsl/networking) | Le comportement réseau diffère entre NAT et mirrored ; ne pas supposer que le localhost WSL atteint PostgreSQL Windows. |
| [PostgreSQL — createdb](https://www.postgresql.org/docs/current/app-createdb.html) | Création d’une base et choix du propriétaire avec les droits appropriés. La documentation courante ne prouve pas la version locale. |
| [Playwright — CI](https://playwright.dev/docs/ci) | Installation des navigateurs/dépendances et exécution des tests en CI ; les conteneurs sont une option. Le plan utilise les processus Linux natifs. |

## Limites relevées

La lecture directe d’un chemin `composer.json` de l’extension OIDC candidate a échoué ; aucune compatibilité Laravel 13 n’en est déduite. L’archive signale déjà cette incertitude. La validation OIDC complète appartient à S1.

L’hébergeur, la version locale PostgreSQL, la distribution WSL, les ports disponibles et les droits d’administration restent à inventorier par l’agent. Aucun service n’a été contacté ou modifié pour vérifier ces éléments pendant cette planification.
