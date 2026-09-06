# 0001. Décisions de fondation et inventaire d'infrastructure (S0-01)

Date : 5 septembre 2026  
Statut : Validé (remplacé pour S0-R)  
Mise à jour : [0002 — Exécution Windows](0002-windows-runtime.md) et [0003 — Baseline Windows starter](0003-windows-starter-baseline.md) remplacent la matrice locale pour le sprint S0-R.  
Auteur : Agent de développement  
Contexte : Ticket S0-01 du [Sprint 00](../planning/SPRINT-00.md)

---

## 1. Contexte et Objectif

Le ticket S0-01 impose d'établir l'inventaire précis de la machine de développement, de fixer la matrice des versions sans hypothèse cachée sur `localhost`, les comptes d'administration ou les environnements d'hébergement, et de documenter la topologie réseau, le chemin de travail ainsi que la cible de recette de référence.

---

## 2. Inventaire réel de l'environnement de développement

Le relevé a été exécuté sur la machine locale sans exposer de secrets :

| Élément | État relevé / Version locale | Emplacement / Contexte | Décision / Cible Sprint 00 |
|---|---|---|---|
| **OS Hôte** | Windows (10/11 x64) | Système hôte de travail | Héberge l'IDE, Git et PostgreSQL 17 |
| **WSL** | Version 1 (Ubuntu 22.04.1 LTS Jammy) | Noyau Linux 4.4.0-22000 | Runtime d'exécution backend, worker et Redis |
| **Mode Réseau WSL** | WSL 1 (partage direct de pile réseau) | `127.0.0.1` identique entre Windows et WSL 1 | Les ports 5432 (Postgres) et 6379 (Redis) sont joignables directement sur `127.0.0.1` |
| **Répertoire de travail** | Windows : `C:\Users\HP\orya-platform`<br>WSL : `/mnt/c/Users/HP/orya-platform` | Montage `/mnt/c/` | Dépôt unique conservé sur `/mnt/c/...` ; aucun clone divergent sur le rootfs Linux |
| **PostgreSQL** | PostgreSQL 17.10 (Service Windows `postgresql-x64-17`) | Port TCP 5432 en écoute (`0.0.0.0:5432`) | Réutilisation de cette instance existante pour créer `orya_core_dev` et `orya_core_test` (ticket S0-02) |
| **Redis** | Redis server v=6.0.16 (`/usr/bin/redis-server`) | Ubuntu WSL, port TCP 6379 | Démarré via `service redis-server start` dans WSL ; écoute sur `127.0.0.1:6379` |
| **Node.js / npm** | Node v24.19.0 LTS, npm 11.17.0 | Windows (`C:\Program Files\nodejs\`) | Conforme à la cible (Node 24 LTS) pour Next.js 16 et Playwright |
| **PHP & Composer** | Cible WSL : PHP 8.3/8.4 + Composer 2.x (via PPA ondrej/php) | WSL Ubuntu 22.04 | Exécution PHP, worker Laravel et Composer isolée dans Linux (évite les conflits d'extensions Windows/Linux) |
| **Git Remote** | `https://github.com/pius-coder/orya-platform.git` | Branche `main` synchronisée | Suivi distant opérationnel |

---

## 3. Matrice des versions arrêtées

| Composant | Version retenue | Justification |
|---|---|---|
| **Framework Backend** | Laravel 12.x / 13.x (dernière stable compatible PHP 8.3+) | Respecte l'exigence du plan (PHP 8.3 minimum, Composer 2). |
| **Extensions PHP** | `php8.3-cli`, `php8.3-pgsql`, `php8.3-redis`, `php8.3-mbstring`, `php8.3-xml`, `php8.3-curl`, `php8.3-zip`, `php8.3-bcmath` | Extensions requises par Laravel et communication native PostgreSQL + Redis. |
| **Framework Frontend** | Next.js 16 (App Router, React 19, TypeScript strict) | Conforme aux exigences du plan et du registre shadcn/Cult UI. |
| **Base de données** | PostgreSQL 17 | Instance locale Windows 17.10 ; même version majeure retenue pour CI et recette. |
| **Broker asynchrone** | Redis 6.0.16 (ou supérieur) | File de messages Laravel et cache. |
| **Outils de test** | PHPUnit (Feature/Integration) + Playwright Chromium (E2E) | Aucun recours à SQLite pour les preuves PostgreSQL ; vrais processus Redis/worker. |

---

## 4. Topologie réseau et ports réservés

```text
[ Navigateur Web ]
       │
       ▼ :3000
[ Next.js (apps/web) ] ──(façade HTTP interne :8000)──► [ Laravel (apps/api) ]
                                                              │       │
                                             (TCP 127.0.0.1:5432)   (TCP 127.0.0.1:6379)
                                                              ▼       ▼
                                                      [ PostgreSQL 17 ] [ Redis 6 ]
                                                      (Service Windows)  (Service WSL)
```

- **Port 3000** : Frontend Next.js (`apps/web`).
- **Port 8000** : Backend Laravel (`apps/api`), accessible en local / interne.
- **Port 5432** : PostgreSQL 17 (Windows).
- **Port 6379** : Redis (WSL).

En WSL 1, la résolution de `127.0.0.1` pointe sur le même réseau d'interface de bouclage que l'hôte Windows. Il n'y a donc pas d'adresse IP dynamique de commutateur virtuel (contrairement à WSL 2 en NAT).

---

## 5. Cible de recette de référence

- **Environnement** : Serveur Linux sans conteneurs (Debian 12 ou Ubuntu 24.04/22.04 LTS).
- **Services système** :
  - Nginx (reverse proxy TLS, sert `apps/api/public` et relaie vers le serveur Node Next.js).
  - PHP-FPM (PHP 8.3+) pour l'API Laravel.
  - Processus Node.js (Next.js standalone build) supervisé (systemd).
  - Worker Laravel natif (`php artisan queue:work --queue=orya_default,orya_test`) supervisé (systemd).
  - PostgreSQL 17 et Redis locaux ou managés privés.
- **Sécurité** : Aucun fichier `.env` servi, `APP_DEBUG=false`, bases dev et test strictement séparées, certificats TLS valides.

---

## 6. Inconnues et points en attente

1. **Accès administrateur PostgreSQL Windows pour S0-02** : La création des bases dédiées (`orya_core_dev`, `orya_core_test`) et des rôles d'accès restreints nécessitera les identifiants de connexion au serveur local PostgreSQL 17 (compte `postgres`).
2. **Accès au serveur de recette distant pour S0-07** : Les accès SSH, nom de domaine et certificats de l'hébergeur de recette de référence devront être fournis en amont du ticket S0-07. Si indisponibles à cette étape, le blocage sera formellement consigné sans clore prématurément le sprint complet.
3. **Moteur OIDC** : Le choix définitif du moteur et sa validation avec deux clients restent explicitement différés au ticket S1-01, conformément au plan.
