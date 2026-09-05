$ErrorActionPreference = 'Stop'
$script:RepoRoot = Split-Path $PSScriptRoot -Parent
$pgBin = 'C:\Program Files\PostgreSQL\17\bin'
if (Test-Path $pgBin) { $env:Path = "$pgBin;$env:Path" }
$toolsPhp = Join-Path $script:RepoRoot '.exclude/tools/php'
$herdBin = Join-Path $env:USERPROFILE '.config/herd-lite/bin'
if (Test-Path (Join-Path $toolsPhp 'php.exe')) {
    $env:Path = "$toolsPhp;$herdBin;$env:Path"
} elseif (Test-Path (Join-Path $herdBin 'php.exe')) {
    $env:Path = "$herdBin;$env:Path"
}
if (-not (Get-Command php -ErrorAction SilentlyContinue)) { throw 'PHP introuvable. Installer https://php.new puis ouvrir un nouveau terminal.' }
function Invoke-Checked {
    param([string]$Executable, [string[]]$Arguments)
    & $Executable @Arguments
    if ($LASTEXITCODE -ne 0) { throw "$Executable a échoué (code $LASTEXITCODE)." }
}
