# Script de préparation Windows pour Orya Platform
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent

# Charger la configuration des chemins via env.ps1
if (Test-Path "$PSScriptRoot/env.ps1") {
    . "$PSScriptRoot/env.ps1"
}

# Vérifier les prérequis avant toute exécution
if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    Write-Error "[ERREUR] PHP est introuvable dans le PATH. Veuillez installer PHP 8.4+ x64."
    exit 1
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "[ERREUR] Node.js est introuvable dans le PATH. Veuillez installer Node 20+ LTS."
    exit 1
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Error "[ERREUR] pnpm est introuvable dans le PATH."
    exit 1
}

# Exécuter le script de préparation PHP idempotent
& php "$PSScriptRoot/setup.php"
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
