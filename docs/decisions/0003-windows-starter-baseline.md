# 0003 — Baseline d'environnement Windows et adoption du starter (R01.01)

Date : 6 septembre 2026  
Statut : Relevé et validé  
Référence de tâche : R01.01 du [Sprint S0-R](../planning/SPRINT-00R-SCRUM.md) — [Fiche R01](../planning/tasks/R01.md)  
Précédents : [0001 — Fondation et inventaire](../decisions/0001-foundation.md), [0002 — Exécution Windows](../decisions/0002-windows-runtime.md)  
Auteur : Agent de développement  

---

## 1. Contexte et objectif de la tâche

Le ticket R01.01 a pour objet exclusif de relever l'état réel de la machine de développement Windows, du commit initial et des versions verrouillées du starter kit adopté, de distinguer formellement versions observées, cibles et inconnues sans supposer de diagnostic réussi, et de corriger la matrice des versions ainsi que le guide de démarrage.

Aucune installation logicielle, mise à jour de dépendances, migration de base de données ou exécution d'actions hors périmètre n'a été réalisée au cours de cette tâche.

---

## 2. État du dépôt et commit de référence

- **Branche active** : `develop`
- **Dépôt distant (origin)** : `https://github.com/pius-coder/orya-platform.git`
- **Commit HEAD observé** : `edad712` (*feat: add start.ps1 script to launch API and web frontend*)
- **Commits amont du starter** :
  - `399fef2` : Import du starter kit découpé `aliziodev/laravel-next-starter-kit`
  - `93035bf` : Configuration initiale pnpm (`ignore-scripts` et `onlyBuiltDependencies`)
  - `edad712` : Ajout du script Windows de lancement `start.ps1`

---

## 3. Matrice des versions : observées, cibles et inconnues

| Composant / Outil | Version observée (locale) | Version cible (S0-R / Orya) | Statut / Inconnues et points de vigilance |
|---|---|---|---|
| **OS Hôte** | Windows 10/11 x64 | Windows 10/11 x64 | Conforme. Exécution native des processus backend et frontend. |
| **Commit de référence** | `edad712` (branche `develop`) | `edad712` ou supérieur | Conforme. |
| **PHP Windows CLI** | PHP 8.5.0 (cli) NTS Visual C++ 2022 x64 (`C:\Users\HP\.config\herd-lite\bin\php.exe`) | PHP 8.4+ / 8.5 x64 (requis par `composer.json` : `^8.4`) | **Anomalie observée** : PHP 8.5.0 fonctionne en x64 mais ses modules intégrés n'incluent ni `pdo_pgsql` ni `pgsql`. |
| **Extensions PHP (PostgreSQL)** | Absent du PHP 8.5 actif (`pdo_mysql`, `pdo_sqlite` uniquement) | `pdo_pgsql`, `pgsql` chargés | **Inconnue bloquante pour R03** : Le PHP 8.5 actif n'a pas de pilote PostgreSQL. Un binaire alternatif PHP 8.4.25 avec `pdo_pgsql` est présent dans `.exclude/tools/php` mais ignoré par Git. |
| **Extensions PHP (Redis & Core)** | `redis`, `bcmath`, `curl`, `mbstring`, `openssl`, `zip`, `xml`, `session`, `tokenizer`, `fileinfo`, `filter` | `redis`, `bcmath`, `curl`, `mbstring`, `openssl`, `zip` | Conforme sur le binaire actif PHP 8.5.0. |
| **Composer** | `C:\Users\HP\.config\herd-lite\bin\composer.bat` | Composer 2.8+ | **Anomalie observée** : Le fichier cible `composer.phar` dans `herd-lite\bin` fait **0 octet** (vide). La commande `composer` ne s'exécute pas. À régulariser avant R01.03/R02. |
| **Node.js** | v24.19.0 LTS (`C:\Program Files\nodejs\node.exe`) | Node.js 24 LTS | Conforme. |
| **pnpm** | 11.25.0 (`C:\Users\HP\AppData\Roaming\npm\pnpm.cmd`) | pnpm fixé (gestion scripts sécurisée) | Installé. La politique d'exécution des scripts de build et l'isolation font l'objet de R01.02. |
| **Backend Framework (`composer.lock`)** | `laravel/framework` v13.17.0 | Laravel 13.x stable | Verrouillé dans `composer.lock`. |
| **Authentification Backend (`composer.lock`)** | `laravel/fortify` v1.37.2, `laravel/sanctum` v4.3.2, `laravel/passkeys` v0.2.1 | Fortify 1.37+, Sanctum 4.3+, Passkeys 0.2+ | Verrouillés dans `composer.lock`. |
| **Outils de test Backend (`composer.lock`)** | `pestphp/pest` v4.7.4 | Pest 4.x / PHPUnit | Verrouillé dans `composer.lock`. |
| **Frontend Framework (`web/pnpm-lock.yaml`)** | Next.js 16.2.9, React 19.2.4, React-DOM 19.2.4 | Next.js 16.x, React 19.x | Verrouillés dans `web/pnpm-lock.yaml`. |
| **Client Auth Frontend (`web/pnpm-lock.yaml`)** | `next-sanctum` 0.2.1, `@laravel/passkeys` 0.2.0 | `next-sanctum` 0.2.1+, `@laravel/passkeys` 0.2.0+ | Verrouillés dans `web/pnpm-lock.yaml`. |
| **E2E & UI Frontend (`web/pnpm-lock.yaml`)** | `@playwright/test` 1.61.1, `tailwindcss` 4.3.1, `shadcn` 4.12.0 | Playwright 1.61+, Tailwind 4, Nova UI | Verrouillés dans `web/pnpm-lock.yaml`. |
| **PostgreSQL** | PostgreSQL 17.10 (Service Windows `postgresql-x64-17` actif sur TCP 5432) | PostgreSQL 17 Windows | Service en cours d'exécution. Les droits d'administration et les bases `orya_core_dev` / `orya_core_test` restent à qualifier en R02. |
| **Redis** | Redis server v=6.0.16 (WSL 1, port 6379, répond `PONG`) | Redis 6+ (WSL 1) | Opérationnel et accessible depuis l'hôte Windows sur `127.0.0.1:6379`. |
| **Base de données actuelle** | `database/database.sqlite` (135 168 octets relevés) | Préservation jusqu'à décision R03.01 | Fichier conservé sans modification ; ne pas écraser ni considérer comme jetable. |

---

## 4. Relevé détaillé des commandes de vérification (preuves objectives)

Les vérifications suivantes ont été exécutées dans l'environnement Windows natif :

1. **Architecture et version PHP** :
   ```text
   PHP 8.5.0 (cli) (built: Nov 21 2025 13:38:22) (NTS Visual C++ 2022 x64)
   Built by Beyond Code for php.new
   PHP_INT_SIZE === 8 -> PHP x64
   ```

2. **Modules PHP actifs relevés** :
   `bcmath`, `bz2`, `calendar`, `Core`, `ctype`, `curl`, `date`, `dba`, `dom`, `exif`, `FFI`, `fileinfo`, `filter`, `ftp`, `hash`, `iconv`, `json`, `lexbor`, `libxml`, `mbstring`, `mysqli`, `mysqlnd`, `openssl`, `pcre`, `PDO`, `pdo_mysql`, `pdo_sqlite`, `Phar`, `random`, `redis`, `Reflection`, `session`, `shmop`, `SimpleXML`, `soap`, `sockets`, `SPL`, `sqlite3`, `standard`, `sysvshm`, `tokenizer`, `uri`, `xml`, `xmlreader`, `xmlwriter`, `Zend OPcache`, `zip`, `zlib`.  
   *Constat objectif : ni `pdo_pgsql` ni `pgsql` ne figurent dans la liste des modules chargés de cet exécutable.*

3. **État de Composer** :
   - Commande : `Get-Command composer` pointe sur `C:\Users\HP\.config\herd-lite\bin\composer.bat`.
   - Contenu du batch : `php "%~dp0composer.phar" %*`.
   - Taille de `composer.phar` : **0 octet**.
   - *Constat objectif : Composer est actuellement non fonctionnel sur cet interpréteur.*

4. **Node.js et pnpm** :
   - `node -v` : `v24.19.0`
   - `pnpm -v` : `11.25.0`

5. **PostgreSQL** :
   - Service Windows `postgresql-x64-17` : statut `Running`.
   - Port d'écoute : TCP 5432.

6. **Redis** :
   - `wsl redis-cli ping` : `PONG` sur `127.0.0.1:6379`.

---

## 5. Inconnues et points de blocage identifiés pour les sous-tâches suivantes

1. **Pilote PDO PostgreSQL sous Windows (requis pour R03)** :  
   Pour que Laravel communique avec PostgreSQL 17 sous Windows, PHP CLI doit charger `pdo_pgsql`. Le binaire PHP 8.5.0 fourni par `php.new` ne comprend pas ce pilote compilé. Deux pistes devront être arbitrées : soit l'ajout de l'extension `php_pdo_pgsql.dll` au runtime principal, soit l'alignement sur le binaire PHP 8.4.25 x64 déjà doté de `pdo_pgsql` (actuellement dans `.exclude/tools/php`).
2. **Composer 2.x (requis pour les scripts artisan et dépendances)** :  
   Le binaire `composer.phar` de `herd-lite` devra être restauré avec un phar Composer 2.x valide sans régénérer les clés ni modifier le code.
3. **Accès SQL administrateur (requis pour R02.01)** :  
   Les identifiants d'administration PostgreSQL Windows devront être fournis par canal sûr sans jamais être écrits dans le dépôt ou les logs.
