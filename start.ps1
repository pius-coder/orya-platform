# Script d'orchestration pour Orya Platform (Laravel API + Worker + Next.js Web)
[CmdletBinding()]
param(
    [int]$ApiPort = 8000,
    [int]$WebPort = 3000,
    [switch]$Background,
    [switch]$NoWorker,
    [switch]$NoFrontend,
    [switch]$CheckOnly
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

# 1. Configuration des chemins via env.ps1
$envScript = Join-Path $root 'scripts\env.ps1'
if (Test-Path $envScript) {
    . $envScript
} else {
    $toolsPhp = Join-Path $root '.exclude\tools\php'
    $pgBin = 'C:\Program Files\PostgreSQL\17\bin'
    $herdBin = Join-Path $env:USERPROFILE '.config\herd-lite\bin'
    if (Test-Path $pgBin) { $env:Path = "$pgBin;$env:Path" }
    if (Test-Path (Join-Path $toolsPhp 'php.exe')) {
        $env:Path = "$toolsPhp;$herdBin;$env:Path"
    } elseif (Test-Path (Join-Path $herdBin 'php.exe')) {
        $env:Path = "$herdBin;$env:Path"
    }
}

# 2. Vérification des exécutables
if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    Write-Error "[ERREUR] PHP est introuvable dans le PATH."
    exit 1
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "[ERREUR] Node.js est introuvable dans le PATH."
    exit 1
}
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Error "[ERREUR] pnpm est introuvable dans le PATH."
    exit 1
}

# 3. Fonctions de contrôle des ports
function Test-PortAvailable([int]$Port) {
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse('127.0.0.1'), $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    } catch {
        return $false
    }
}

function Get-PortProcess([int]$Port) {
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn) {
        $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($proc) {
            return "$($proc.ProcessName) (PID $($conn.OwningProcess))"
        }
        return "PID $($conn.OwningProcess)"
    }
    return "inconnu"
}

# Vérifier la disponibilité des ports
$portErrors = @()
if (-not (Test-PortAvailable -Port $ApiPort)) {
    $portErrors += "Le port API $ApiPort est déjà occupé par : $(Get-PortProcess -Port $ApiPort)."
}
if (-not $NoFrontend -and -not (Test-PortAvailable -Port $WebPort)) {
    $portErrors += "Le port Web $WebPort est déjà occupé par : $(Get-PortProcess -Port $WebPort)."
}

if ($portErrors.Count -gt 0) {
    Write-Host "=========================================" -ForegroundColor Red
    Write-Host "   ERREUR : PORT DÉJÀ OCCUPÉ             " -ForegroundColor Red
    Write-Host "=========================================" -ForegroundColor Red
    foreach ($err in $portErrors) {
        Write-Host "  - $err" -ForegroundColor Red
    }
    Write-Host "Arrêt du démarrage pour éviter tout conflit ou processus orphelin." -ForegroundColor Yellow
    exit 1
}

if ($CheckOnly) {
    Write-Host "Contrôles réussis : prérequis validés et ports $ApiPort et $WebPort disponibles." -ForegroundColor Green
    exit 0
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   Démarrage de Laravel + Next.js        " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Backend API  : http://localhost:$ApiPort" -ForegroundColor Green
Write-Host "Frontend Web : http://localhost:$WebPort" -ForegroundColor Green
if (-not $NoWorker) {
    Write-Host "Worker Queue : actif (queue:listen)" -ForegroundColor Green
}
Write-Host "Répertoire   : $root" -ForegroundColor Gray
Write-Host "=========================================" -ForegroundColor Cyan

$processTracking = @{
    startedAt = (Get-Date).ToString("o")
    root = $root
    api = $null
    worker = $null
    frontend = $null
}

$trackingFile = Join-Path $root '.orya-processes.json'

# Démarrer l'API Laravel (répertoire de travail explicite : $root)
$apiProcess = Start-Process -FilePath "php" -ArgumentList "artisan", "serve", "--host=127.0.0.1", "--port=$ApiPort" -WorkingDirectory $root -PassThru -NoNewWindow
$processTracking.api = @{ pid = $apiProcess.Id; port = $ApiPort }

# Démarrer le Worker Laravel (répertoire de travail explicite : $root)
$workerProcess = $null
if (-not $NoWorker) {
    $workerProcess = Start-Process -FilePath "php" -ArgumentList "artisan", "queue:listen", "--tries=1" -WorkingDirectory $root -PassThru -NoNewWindow
    $processTracking.worker = @{ pid = $workerProcess.Id }
}

# Enregistrer les processus du projet
$processTracking | ConvertTo-Json -Depth 3 | Set-Content $trackingFile -Encoding UTF8

# Contrôler l'état initial des processus
Start-Sleep -Milliseconds 600
if ($apiProcess.HasExited) {
    Write-Error "[ERREUR] L'API Laravel s'est arrêtée immédiatement après son lancement (code $($apiProcess.ExitCode))."
    if ($workerProcess -and -not $workerProcess.HasExited) {
        Stop-Process -Id $workerProcess.Id -Force -ErrorAction SilentlyContinue
    }
    Remove-Item $trackingFile -ErrorAction SilentlyContinue
    exit 1
}

# Mode arrière-plan
if ($Background) {
    if (-not $NoFrontend) {
        $webDir = Join-Path $root 'web'
        $frontendProcess = Start-Process -FilePath "pnpm" -ArgumentList "--dir", "$webDir", "dev" -WorkingDirectory $root -PassThru -NoNewWindow
        $processTracking.frontend = @{ pid = $frontendProcess.Id; port = $WebPort }
        $processTracking | ConvertTo-Json -Depth 3 | Set-Content $trackingFile -Encoding UTF8
    }
    Write-Host "Processus démarrés en arrière-plan (PID API: $($apiProcess.Id))." -ForegroundColor Cyan
    Write-Host "Utiliser .\stop.ps1 pour arrêter les processus du projet." -ForegroundColor Cyan
    exit 0
}

# Mode interactif au premier plan
try {
    if (-not $NoFrontend) {
        $webDir = Join-Path $root 'web'
        pnpm --dir $webDir dev
    } else {
        Write-Host "API et worker actifs en premier plan. Appuyez sur Ctrl+C pour arrêter." -ForegroundColor Cyan
        while ($true) {
            Start-Sleep -Seconds 1
            if ($apiProcess.HasExited) {
                Write-Host "API arrêtée." -ForegroundColor Yellow
                break
            }
        }
    }
} finally {
    Write-Host "Arrêt contrôlé des processus du projet..." -ForegroundColor Cyan
    if ($apiProcess -and -not $apiProcess.HasExited) {
        Stop-Process -Id $apiProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($workerProcess -and -not $workerProcess.HasExited) {
        Stop-Process -Id $workerProcess.Id -Force -ErrorAction SilentlyContinue
    }
    Remove-Item $trackingFile -ErrorAction SilentlyContinue
    Write-Host "Arrêt terminé (aucun processus étranger arrêté)." -ForegroundColor Green
}
