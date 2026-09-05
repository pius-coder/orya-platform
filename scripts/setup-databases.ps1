param([string]$AdminUser = 'postgres', [string]$DbHost = '127.0.0.1', [int]$Port = 5432)
. "$PSScriptRoot/env.ps1"
$secret = Read-Host 'Mot de passe administrateur PostgreSQL (reste local)' -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
try {
    $env:ORYA_PG_ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    Invoke-Checked php @("$PSScriptRoot/setup-databases.php", $AdminUser, $DbHost, "$Port")
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    Remove-Item Env:ORYA_PG_ADMIN_PASSWORD -ErrorAction SilentlyContinue
}
