# Script de démarrage pour Orya Platform (Laravel + Next.js)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

# Configurer PHP et PostgreSQL dans le PATH
$toolsPhp = Join-Path $root '.exclude/tools/php'
$pgBin = 'C:\Program Files\PostgreSQL\17\bin'
$herdBin = Join-Path $env:USERPROFILE '.config/herd-lite/bin'

if (Test-Path $pgBin) { $env:Path = "$pgBin;$env:Path" }
if (Test-Path (Join-Path $toolsPhp 'php.exe')) {
    $env:Path = "$toolsPhp;$herdBin;$env:Path"
} elseif (Test-Path (Join-Path $herdBin 'php.exe')) {
    $env:Path = "$herdBin;$env:Path"
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   Démarrage de Laravel + Next.js        " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Backend API : http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend Web: http://localhost:3000" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan

# Démarrer l'API Laravel en tâche de fond et Next.js au premier plan
$apiProcess = Start-Process -FilePath "php" -ArgumentList "artisan", "serve", "--host=127.0.0.1", "--port=8000" -PassThru -NoNewWindow
try {
    pnpm --dir web dev
} finally {
    if ($apiProcess -and -not $apiProcess.HasExited) {
        Stop-Process -Id $apiProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
