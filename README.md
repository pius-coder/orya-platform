# Laravel + Next.js Starter Kit

[![tests](https://github.com/aliziodev/laravel-next-starter-kit/actions/workflows/tests.yml/badge.svg)](https://github.com/aliziodev/laravel-next-starter-kit/actions/workflows/tests.yml)
[![lint](https://github.com/aliziodev/laravel-next-starter-kit/actions/workflows/lint.yml/badge.svg)](https://github.com/aliziodev/laravel-next-starter-kit/actions/workflows/lint.yml)
[![e2e](https://github.com/aliziodev/laravel-next-starter-kit/actions/workflows/e2e.yml/badge.svg)](https://github.com/aliziodev/laravel-next-starter-kit/actions/workflows/e2e.yml)
[![Packagist Version](https://img.shields.io/packagist/v/aliziodev/laravel-next-starter-kit)](https://packagist.org/packages/aliziodev/laravel-next-starter-kit)
[![Packagist Downloads](https://img.shields.io/packagist/dt/aliziodev/laravel-next-starter-kit)](https://packagist.org/packages/aliziodev/laravel-next-starter-kit)
[![next-sanctum](https://img.shields.io/npm/v/next-sanctum?label=next-sanctum)](https://www.npmjs.com/package/next-sanctum)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/aliziodev/laravel-next-starter-kit/blob/main/LICENSE)

A **decoupled** starter kit: a headless **Laravel** API and a separate **Next.js** (App Router) frontend, wired together with [Laravel Fortify](https://laravel.com/docs/fortify) + [Sanctum](https://laravel.com/docs/sanctum) and the [`next-sanctum`](https://www.npmjs.com/package/next-sanctum) client.

It mirrors the UI and feature set of the official [laravel/react-starter-kit](https://github.com/laravel/react-starter-kit), but instead of Inertia it ships an independent SPA that talks to Laravel over a **same-origin proxy** (no CORS).

## Architecture

```mermaid
flowchart LR
    subgraph client [Client]
        B["Browser<br/>cookies · CSRF"]
    end
    subgraph next ["Next.js · :3000"]
        P["Route proxy<br/>app/api/sanctum/[...path]"]
        SC["Server Components<br/>getUser() · serverFetch()"]
    end
    subgraph api ["Laravel API · :8000"]
        L["Fortify + Sanctum<br/>routes/api.php (auth:sanctum)"]
    end
    B -->|same-origin| P
    P -->|"forwards cookies + Origin/Referer"| L
    SC -->|server-to-server| L
```

The browser only ever talks to the **Next.js** origin. The route handler forwards requests to Laravel carrying the session cookie and `Origin`/`Referer`, so Sanctum treats the SPA as first-party (stateful) — no CORS. Server Components authenticate directly via `getUser()` / `serverFetch()` from `next-sanctum/server`.

### Login (cookie/SPA) flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant N as Next.js proxy
    participant L as Laravel (Fortify + Sanctum)
    B->>N: GET /api/sanctum/sanctum/csrf-cookie
    N->>L: forward (+ Origin/Referer)
    L-->>B: Set-Cookie XSRF-TOKEN + session
    B->>N: POST /api/sanctum/login (X-XSRF-TOKEN)
    N->>L: forward
    L-->>B: 200 authenticated — or { two_factor: true }
```

### Auth boundaries

Protected pages live in an **`(app)` route group** whose layout calls `getUser()` once and redirects guests to `/login` — the decoupled equivalent of `Route::middleware('auth')->group(...)`; auth pages live in **`(auth)`**. Only those groups mount the Sanctum provider, so public pages (e.g. the welcome page) stay provider-free. The authoritative security boundary is the API itself (`auth:sanctum`); `proxy.ts` is only an optimistic edge fast-path.

## Features

- **Authentication** — login, registration, password reset, password confirmation
- **Two-factor authentication** (TOTP) — QR setup, confirmation, recovery codes, login challenge
- **Passkeys** (WebAuthn) — passwordless sign-in + management, via [`laravel/passkeys`](https://github.com/laravel/passkeys) and `@laravel/passkeys`
- **Email verification** — opt-in (off by default, like the official kit — see [below](#email-verification))
- **Browser sessions** — list devices, log out one or all other sessions (password-confirmed), over the framework `sessions` table
- **Settings** — profile, password, appearance (light/dark/system), account deletion
- **App shell** — sidebar/header layouts, breadcrumbs, user menu, dashboard
- Dark mode (`next-themes`), toasts (`sonner`), shadcn/ui (Nova preset), Tailwind v4, React 19

## Requirements

- **PHP 8.4+ / 8.5 x64** avec extensions requises (`pdo_pgsql`, `redis`, `mbstring`, `openssl`, `curl`, `zip`, `bcmath`) et **Composer 2.x**.
- **Node.js 24 LTS** et **pnpm** (11.x, lockfile `web/pnpm-lock.yaml`).
- **PostgreSQL 17** (service Windows local sur `127.0.0.1:5432`).
- **Redis** (service WSL 1 sur `127.0.0.1:6379`).
- Matrice de référence et état des observations locales : voir [0003 — Baseline Windows starter](docs/decisions/0003-windows-starter-baseline.md).

## Quick start (Démarrage Windows)

Le dépôt est déjà initialisé. Ne pas exécuter `laravel new`.

```powershell
# 1. Préparation de l'environnement (idempotente, préserve les clés existantes)
.\scripts\setup.ps1

# 2. Lancer l'API Laravel, le Worker de queue et le frontend Next.js
.\start.ps1

# 3. Pour un arrêt contrôlé des processus d'arrière-plan
.\stop.ps1
```

- Le frontend Web est accessible sur **http://localhost:3000**.
- L'API Laravel s'exécute sur **http://localhost:8000**.
- Le worker de queue traite les événements asynchrones (`queue:listen`).
- En mode arrière-plan : `.\start.ps1 -Background` (arrêt avec `.\stop.ps1`).
- Contrôle préalable sans démarrage : `.\start.ps1 -CheckOnly`.

## Project structure

```
.
├── app/                # Laravel application code (Fortify actions, controllers)
├── routes/
│   ├── api.php         # Sanctum-guarded API routes (/user, /account, /passkeys, /sessions)
│   └── web.php         # Headless: returns JSON at / (no Blade views)
├── config/             # fortify.php, sanctum.php, passkeys.php, …
├── database/
│   └── seeders/        # DatabaseSeeder + E2eSeeder (test users)
├── docker-compose.yml  # one-command deploy (frontend + api + db + workers)
├── docker/             # php (FPM) + nginx images + entrypoint
├── package.json        # root: delegates dev/build/start/lint to web/ (no deps)
└── web/                # Next.js frontend (App Router, no src/)
    ├── app/            # root layout + (app)/ & (auth)/ route groups + /api/sanctum proxy
    ├── components/     # UI (shadcn in components/ui) + auth/settings components
    ├── layouts/        # app shell + auth page layouts
    ├── e2e/            # Playwright tests
    ├── lib/            # sanctum.ts (client config) · auth.ts (request-cached getUser)
    └── proxy.ts        # Next middleware (optimistic auth fast-path)
```

## Environment

Backend (`.env`):

| Variable                   | Purpose                                                              |
| -------------------------- | ------------------------------------------------------------------- |
| `FRONTEND_URL`             | Where email links (verify / reset) point back to (the SPA).         |
| `SANCTUM_STATEFUL_DOMAINS` | First-party origins for cookie auth — **must** list `:3000` + `:8000`. |
| `SESSION_DRIVER=database`  | Required for the cookie/SPA flow.                                    |
| `SESSION_COOKIE`           | Pinned to `laravel_session` for the proxy's cookie check.           |

Frontend (`web/.env.local`):

| Variable                       | Purpose                                                   |
| ------------------------------ | --------------------------------------------------------- |
| `NEXT_PUBLIC_SANCTUM_BASE_URL` | Client base URL → the same-origin proxy (`/api/sanctum`). |
| `SANCTUM_BASE_URL`             | Server-only upstream → the real Laravel origin.           |

## Deployment (Docker)

Even though the stack is two runtimes (Node + PHP), **Docker Compose turns it into one command** — you never run Node or PHP yourself. Thanks to the same-origin proxy, **only the Next.js container is public**; Laravel, MySQL, and the workers stay on the internal network.

**Prerequisite:** Docker + Docker Compose.

```bash
cp .env.docker.example .env.docker          # then edit domains for a real deploy
docker compose --env-file .env.docker up -d --build
```

Open **http://localhost:3000**. That's it — on first boot the stack **generates `APP_KEY`**, **runs migrations**, and **builds the prod caches** (`config`/`route`/`event`) automatically.

| Service     | Role                                          | Public? |
| ----------- | --------------------------------------------- | ------- |
| `frontend`  | Next.js (standalone build)                    | ✅ yes  |
| `api`       | nginx → php-fpm (Laravel)                     | no      |
| `php`       | Laravel (php-fpm) — migrates + caches on boot | no      |
| `queue`     | `queue:work` (verification / reset emails)    | no      |
| `scheduler` | `schedule:work`                               | no      |
| `db`        | MySQL 8                                        | no      |

**Before a real (public) deploy**, edit `.env.docker`:

- `FRONTEND_URL` → your public frontend URL (used in email links).
- `SANCTUM_STATEFUL_DOMAINS` → your public frontend domain, **plus** the internal `api` host (e.g. `app.example.com,api`).
- `SESSION_SECURE_COOKIE=true` once you serve over HTTPS.
- `DB_PASSWORD` / `DB_ROOT_PASSWORD` → real secrets.
- `MAIL_MAILER` → a real SMTP provider (defaults to `log`).

Put a TLS reverse proxy (Caddy / Traefik / your platform) in front of `frontend`. The same `docker-compose.yml` also deploys as-is on PaaS that consume Compose files (e.g. **Coolify**, **Railway**), so you can skip managing a server entirely.

> **Redis is optional.** Session / cache / queue default to the database driver (zero extra services). Switch `SESSION_DRIVER` / `CACHE_STORE` / `QUEUE_CONNECTION` to `redis` and add a `redis` service if you want it.

## Security

- **No CORS:** the browser only calls the Next.js origin; the route proxy forwards to Laravel server-side. The API is never exposed cross-origin to the browser.
- **Stateful cookie auth:** Sanctum's `statefulApi()` authenticates the SPA via an `HttpOnly` session cookie. Only origins listed in `SANCTUM_STATEFUL_DOMAINS` are treated as first-party.
- **CSRF:** every mutating request carries the `XSRF-TOKEN` cookie as an `X-XSRF-TOKEN` header; `next-sanctum` attaches it and transparently refreshes + retries once on a 419.
- **Password confirmation:** sensitive actions (managing passkeys, deleting the account, enabling/disabling 2FA) sit behind Fortify's password-confirmation window (`password.confirm`); logging out other browser sessions re-validates the current password in the request itself.
- **Two-factor authentication:** TOTP with a required confirmation step, single-use recovery codes, and password-confirmed enable/disable.
- **Passkeys (WebAuthn):** Fortify (>= 1.37) owns the passkey routes, so the relying-party ID and `allowed_origins` are configured in `config/fortify.php` (`passkeys` key) — `allowed_origins` **must** include the SPA origin (`FRONTEND_URL`, e.g. `:3000`) since the browser runs the ceremony there. Registration requires resident keys + user verification, management is password-confirmed, and the endpoints are rate limited (`6,1`). Use **`localhost`** (not `127.0.0.1`) in development so the origin matches the relying-party ID.
- **Rate limiting:** Fortify throttles login attempts (5/min per email + IP); passkey endpoints use `throttle:6,1`.
- **API tokens:** Sanctum personal-access tokens are available for mobile / third-party clients via `Authorization: Bearer <token>` (the SPA itself uses cookies).
- **Going to production:** serve both apps over **HTTPS**; set `APP_URL`, `FRONTEND_URL`, and `SANCTUM_STATEFUL_DOMAINS` to your real domains; set `SESSION_DOMAIN` (e.g. `.example.com`) for cross-subdomain cookies; set `APP_DEBUG=false`; and configure a real mailer.

## Testing

End-to-end (Playwright, Chromium) — drives the full stack and covers login, invalid credentials, registration, logout, the **passkey ceremony** (register + passwordless sign-in, via a CDP virtual authenticator), **2FA** (enable + login challenge, via a computed TOTP), and **browser sessions** (a second device's session listed + logged out). No real device is needed.

```bash
pnpm --dir web exec playwright install chromium   # first time only
pnpm --dir web test:e2e
```

Locally the suite reuses already-running dev servers; in CI it boots them itself. GitHub Actions runs it on every push / PR (`.github/workflows/e2e.yml`).

Backend (Pest):

```bash
composer test
```

Lint & format:

```bash
pnpm --dir web lint && pnpm --dir web format:check   # Next.js / TypeScript
vendor/bin/pint --test                               # PHP (Laravel Pint)
```

All three suites run in **GitHub Actions** on every push / PR — `tests.yml` (Pest, PHP 8.4/8.5), `lint.yml` (Pint + ESLint + Prettier), and `e2e.yml` (Playwright).

## Email verification

Email verification is **off by default**, matching the official Laravel starter kit. To enable it:

1. In `web/lib/email-verification.ts`, set `MUST_VERIFY_EMAIL = true`.
2. In `app/Models/User.php`, uncomment the `MustVerifyEmail` import and add it to the `implements` list so Fortify sends verification emails.

The verify-email pages and the resend flow ship ready to use; the flag simply gates the UI enforcement.

## License

MIT.
