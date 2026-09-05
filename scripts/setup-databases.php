<?php

// Bootstrap local uniquement. Ne modifie jamais un rôle ou une base préexistants.
declare(strict_types=1);

$root = dirname(__DIR__);
$host = $argv[2] ?? '127.0.0.1';
$port = (int) ($argv[3] ?? 5432);
if (!in_array($host, ['127.0.0.1', 'localhost'], true)) {
    throw new RuntimeException('Provisionnement réservé à PostgreSQL local.');
}
$pdo = new PDO("pgsql:host=$host;port=$port;dbname=postgres;connect_timeout=3", $argv[1] ?? 'postgres', getenv('ORYA_PG_ADMIN_PASSWORD') ?: null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$targets = ['dev', 'test', 'restore'];
foreach (['.env', '.env.testing', '.env.restore'] as $file) {
    if (file_exists("$root/apps/api/$file")) {
        throw new RuntimeException("$file existe déjà : sauvegarder et vérifier manuellement avant provisionnement.");
    }
}
foreach ($targets as $target) {
    $name = "orya_core_$target";
    $query = $pdo->prepare('SELECT EXISTS(SELECT FROM pg_database WHERE datname = ?) OR EXISTS(SELECT FROM pg_roles WHERE rolname = ?)');
    $query->execute([$name, $name]);
    if ($query->fetchColumn()) {
        throw new RuntimeException("$name existe : aucun remplacement automatique. Vérifier la configuration existante.");
    }
}
$template = file_get_contents("$root/apps/api/.env.example");
foreach ($targets as $target) {
    $name = "orya_core_$target";
    $password = bin2hex(random_bytes(24));
    $pdo->exec('CREATE ROLE '.$name.' LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD '.$pdo->quote($password));
    $pdo->exec("CREATE DATABASE $name OWNER $name");
    $pdo->exec("REVOKE ALL ON DATABASE $name FROM PUBLIC");
    $local = new PDO("pgsql:host=$host;port=$port;dbname=$name;connect_timeout=3", $argv[1] ?? 'postgres', getenv('ORYA_PG_ADMIN_PASSWORD') ?: null);
    $local->exec('REVOKE CREATE ON SCHEMA public FROM PUBLIC');
    $config = [
        'APP_ENV' => $target === 'test' ? 'testing' : 'local',
        'APP_KEY' => 'base64:'.base64_encode(random_bytes(32)),
        'DB_HOST' => $host, 'DB_PORT' => (string) $port,
        'DB_DATABASE' => $name, 'DB_USERNAME' => $name, 'DB_PASSWORD' => $password,
        'REDIS_PREFIX' => "orya:$target:", 'CACHE_PREFIX' => "orya:$target:cache:",
        'REDIS_QUEUE' => "orya_$target",
    ];
    $contents = $template;
    foreach ($config as $key => $value) {
        $contents = preg_replace_callback('/^'.preg_quote($key, '/').'=.*/m', fn () => "$key=$value", $contents);
    }
    $filename = match ($target) { 'dev' => '.env', 'test' => '.env.testing', default => '.env.restore' };
    file_put_contents("$root/apps/api/$filename", $contents);
    echo "Créé : $name ; configuration locale enregistrée (secret masqué).\n";
}
// Les fichiers écrits permettent de reprendre manuellement en cas de panne partielle.
echo "Vérifier ensuite : scripts/check.ps1 integration. Ne jamais committer les .env.\n";
