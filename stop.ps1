# Script d'arrêt contrôlé pour Orya Platform (API, Worker, Frontend)
[CmdletBinding()]
param(
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$trackingFile = Join-Path $root '.orya-processes.json'

Write-Host "Arrêt des processus d'application Orya Platform..." -ForegroundColor Cyan

$stoppedCount = 0

if (Test-Path $trackingFile) {
    try {
        $tracking = Get-Content $trackingFile -Raw | ConvertFrom-Json
        $pidsToStop = @()
        if ($tracking.api -and $tracking.api.pid) { $pidsToStop += $tracking.api.pid }
        if ($tracking.worker -and $tracking.worker.pid) { $pidsToStop += $tracking.worker.pid }
        if ($tracking.frontend -and $tracking.frontend.pid) { $pidsToStop += $tracking.frontend.pid }

        foreach ($pidToStop in $pidsToStop) {
            $proc = Get-Process -Id $pidToStop -ErrorAction SilentlyContinue
            if ($proc) {
                # Vérifier que le processus correspond bien à php ou node pour éviter de tuer un PID recyclé
                if ($proc.ProcessName -in @('php', 'node', 'pnpm', 'cmd')) {
                    Stop-Process -Id $pidToStop -Force -ErrorAction SilentlyContinue
                    Write-Host "  - Arrêté : $($proc.ProcessName) (PID $pidToStop)" -ForegroundColor Green
                    $stoppedCount++
                } else {
                    Write-Warning "Le PID $pidToStop ($($proc.ProcessName)) ne correspond pas à un processus Orya attendu ; non arrêté."
                }
            }
        }
    } finally {
        Remove-Item $trackingFile -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "Aucun fichier de suivi .orya-processes.json trouvé." -ForegroundColor Gray
}

# Si -Force est spécifié, vérifier également les ports 8000 et 3000
if ($Force) {
    foreach ($port in @(8000, 3000)) {
        $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        foreach ($conn in $conns) {
            $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($proc -and $proc.ProcessName -in @('php', 'node')) {
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                Write-Host "  - Arrêté processus sur port $port : $($proc.ProcessName) (PID $($proc.Id))" -ForegroundColor Yellow
                $stoppedCount++
            }
        }
    }
}

if ($stoppedCount -eq 0) {
    Write-Host "Aucun processus Orya actif à arrêter." -ForegroundColor Gray
} else {
    Write-Host "Arrêt terminé : $stoppedCount processus arrêté(s) sans toucher aux processus tiers." -ForegroundColor Green
}
