# Repository Guidelines

## Project Structure & Architecture

Laravel lives at the repository root: `app/` contains actions, controllers and models; `routes/` defines endpoints; `database/` contains migrations, factories and seeders. Backend tests are in `tests/Feature` and `tests/Unit`.

The Next.js App Router frontend lives in `web/`, with routes in `web/app`, shared components in `web/components`, assets in `web/public`, and Playwright tests in `web/e2e`. Keep this structure; do not recreate `apps/api` or `apps/web`.

Laravel owns business rules and authorization. Preserve Fortify, Sanctum and the same-origin Next proxy. Planning lives in `docs/planning`; `.exclude/` is ignored local reference material.

## Development & Validation Commands

Run from the repository root after configuring local environments:

- `composer install`: install locked PHP dependencies.
- `pnpm --dir web install --frozen-lockfile`: install locked frontend dependencies.
- `composer run dev`: start Laravel, its queue listener and Next.js.
- `pnpm --dir web build`: build the production frontend.
- `composer test`: clear Laravel configuration cache and run backend tests.
- `php vendor/bin/pint --test`: check PHP formatting.
- `pnpm --dir web lint`: run ESLint.
- `pnpm --dir web format:check`: check Prettier formatting.
- `pnpm --dir web test:e2e`: run Playwright; first verify isolated database and server settings because setup modifies fixture accounts.

Do not blindly rerun `composer run setup`: it currently regenerates APP_KEY and prepares SQLite.

## Coding Style & Naming

Follow `.editorconfig`: UTF-8, LF, four-space indentation, with two spaces for ordinary YAML. Use Pint for PHP and Prettier, including its Tailwind plugin, for frontend formatting. Follow existing PascalCase PHP classes and React component names, kebab-case component filenames, and descriptive `*.spec.ts` browser tests. Read `web/AGENTS.md` before frontend changes.

## Testing & Configuration

Use Pest/PHPUnit and Playwright Chromium. Add behavioral regression tests; no arbitrary coverage percentage is required. PostgreSQL migration is planned: existing SQLite tests do not prove PostgreSQL compatibility. Protect development data before resets or seeding. Keep sessions database-backed; target Redis for cache and queues. Develop under Windows, with Redis in WSL, without Docker. Never commit secrets or regenerate an existing environment’s key casually.

## Commits, PRs & Agent Workflow

History uses Conventional Commits, such as `chore(web): ...` and `feat: ...`. Keep commits focused. PRs should identify the task, summarize behavior, report executed checks and migration requirements, and include screenshots for UI changes.

Follow `TODO.md`, `DEVELOPMENT_RULES.md` and `docs/planning/AGENT-TASKS.md`: handle one assigned subtask, validate it, update tracking and stop before the next unless explicitly instructed otherwise.
