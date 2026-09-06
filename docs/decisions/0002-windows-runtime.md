# 0002 — Exécution locale Windows

Décision utilisateur du 5 septembre 2026, prioritaire sur 0001 et le plan S0 initial.

- PHP, Composer, Laravel, worker, Node, Next.js et Playwright s’exécutent sous Windows.
- PostgreSQL 17 Windows existant est conservé. Redis reste dans WSL 1, joignable sur 127.0.0.1:6379.
- Installation PHP/Composer via l’installateur officiel php.new Windows 8.5 fourni par l’utilisateur ; aucune installation PHP/Node Linux nécessaire.
- La recette distante et la CI Linux restent distinctes du poste Windows ; aucune dépendance Docker.
- L’installation PHP 8.5.10 x86 d’UwAmp n’est pas modifiée. Le runtime php.new est vérifié avant création du backend.
- Laravel 13 est retenu, sans alternative Laravel 12 implicite. OIDC reste différé à S1.
- Les accès SQL administrateur et la cible de recette restent nécessaires à la validation complète de S0.

L’installation apt tentée dans WSL a été interrompue. La vérification des processus n’a trouvé aucun apt/dpkg actif. Redis a été démarré ; aucun backend n’a été installé dans WSL pendant cette session.

Consulter [0003 — Baseline Windows starter](0003-windows-starter-baseline.md) pour le relevé complet des versions observées, cibles et inconnues du ticket R01.01.
