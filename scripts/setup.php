<?php

declare(strict_types=1);

/**
 * Script de préparation de l'environnement de développement Orya Platform.
 * Idempotent : vérifie les prérequis avant mutation, crée uniquement les configurations
 * manquantes, préserve strictement les clés existantes et n'exécute aucune migration.
 */
$root = dirname(__DIR__);

echo "=== Préparation de l'environnement Orya Platform ===\n";

// 1. Vérification stricte des prérequis système
$errors = [];

if (PHP_INT_SIZE !== 8) {
    $errors[] = 'Architecture PHP non conforme : x64 requis (PHP_INT_SIZE === 8). Actuel : '.PHP_INT_SIZE.' octets.';
}

if (PHP_VERSION_ID < 80400) {
    $errors[] = 'Version PHP non conforme : 8.4.0 minimum requis. Version actuelle : '.PHP_VERSION;
}

$requiredExtensions = ['mbstring', 'openssl', 'curl', 'zip', 'bcmath', 'xml', 'filter'];
$missingExtensions = [];
foreach ($requiredExtensions as $ext) {
    if (! extension_loaded($ext)) {
        $missingExtensions[] = $ext;
    }
}
if (! empty($missingExtensions)) {
    $errors[] = 'Extensions PHP obligatoires manquantes : '.implode(', ', $missingExtensions);
}

// Vérification de Node.js
exec('node -v 2>&1', $nodeOutput, $nodeExit);
if ($nodeExit !== 0 || empty($nodeOutput)) {
    $errors[] = 'Node.js introuvable ou non exécutable. Node 20+ LTS requis.';
} else {
    $nodeVersion = trim($nodeOutput[0]);
}

// Vérification de pnpm
exec('pnpm -v 2>&1', $pnpmOutput, $pnpmExit);
if ($pnpmExit !== 0 || empty($pnpmOutput)) {
    $errors[] = 'pnpm introuvable ou non exécutable. pnpm 10+ / 11+ requis.';
} else {
    $pnpmVersion = trim($pnpmOutput[0]);
}

if (! empty($errors)) {
    fwrite(STDERR, "\n[ERREUR] Échec de la vérification des prérequis :\n");
    foreach ($errors as $error) {
        fwrite(STDERR, "  - $error\n");
    }
    exit(1);
}

echo 'Prérequis validés : PHP '.PHP_VERSION." (x64), Node $nodeVersion, pnpm $pnpmVersion.\n";

// 2. Configuration Backend (.env) : création uniquement si manquant
$envPath = "$root/.env";
$envExamplePath = "$root/.env.example";

if (! file_exists($envPath)) {
    if (! file_exists($envExamplePath)) {
        fwrite(STDERR, "[ERREUR] Le fichier modèle .env.example est introuvable.\n");
        exit(1);
    }
    copy($envExamplePath, $envPath);
    echo "Fichier .env créé depuis .env.example.\n";
} else {
    echo "Fichier .env existant conservé.\n";
}

// 3. Préservation stricte ou génération initiale de l'APP_KEY
$envContent = file_get_contents($envPath);
if ($envContent === false) {
    fwrite(STDERR, "[ERREUR] Impossible de lire le fichier .env.\n");
    exit(1);
}

$hasKey = preg_match('/^APP_KEY=(.+)$/m', $envContent, $matches) && trim($matches[1]) !== '';

if (! $hasKey) {
    echo "APP_KEY manquante ou vide dans .env. Génération d'une nouvelle clé...\n";
    $keyGenerated = false;
    exec('php artisan key:generate --ansi 2>&1', $artisanOutput, $artisanExit);
    if ($artisanExit === 0) {
        $keyGenerated = true;
        echo "APP_KEY générée avec succès via artisan.\n";
    } else {
        $key = 'base64:'.base64_encode(random_bytes(32));
        if (preg_match('/^APP_KEY=.*$/m', $envContent)) {
            $envContent = preg_replace('/^APP_KEY=.*$/m', "APP_KEY=$key", $envContent);
        } else {
            $envContent .= "\nAPP_KEY=$key\n";
        }
        file_put_contents($envPath, $envContent);
        echo "APP_KEY cryptographique générée dans .env.\n";
    }
} else {
    echo "APP_KEY existante préservée dans .env (aucun écrasement).\n";
}

// 4. Configuration Frontend (web/.env.local) : création uniquement si manquant
$webEnvPath = "$root/web/.env.local";
$webEnvExamplePath = "$root/web/.env.example";

if (! file_exists($webEnvPath)) {
    if (file_exists($webEnvExamplePath)) {
        copy($webEnvExamplePath, $webEnvPath);
        echo "Fichier web/.env.local créé depuis web/.env.example.\n";
    } else {
        echo "Avertissement : web/.env.example introuvable.\n";
    }
} else {
    echo "Fichier web/.env.local existant conservé.\n";
}

// 5. Installation reproductible des dépendances frontend
echo "Installation des dépendances frontend via pnpm (frozen lockfile)...\n";
passthru('pnpm --dir web install --frozen-lockfile', $pnpmInstallExit);
if ($pnpmInstallExit !== 0) {
    fwrite(STDERR, "[ERREUR] Échec de l'installation pnpm (code $pnpmInstallExit).\n");
    exit($pnpmInstallExit);
}

// 6. Règle stricte sur la base de données : AUCUN schéma ni fichier SQLite créé
echo "Bases de données : aucun schéma ni fichier SQLite créé implicitement.\n";
echo "=== Préparation terminée avec succès. ===\n";
