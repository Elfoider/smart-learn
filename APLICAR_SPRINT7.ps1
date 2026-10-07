param([string]$Destination = 'C:\workspace\smart-learn')
$ErrorActionPreference = 'Stop'
$sourceRoot = $PSScriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $Destination 'package.json'))) { throw 'No se encuentra el proyecto actual.' }
if ([IO.Path]::GetFullPath($sourceRoot) -eq [IO.Path]::GetFullPath($Destination)) { throw 'Extrae el ZIP en otra carpeta antes de aplicar.' }
$files = Get-Content -LiteralPath (Join-Path $sourceRoot 'CAMBIOS_SPRINT7.json') -Raw | ConvertFrom-Json
# Validar todo antes de copiar; nunca sustituir secretos o el script local de arranque.
foreach ($relative in $files) {
    if ($relative -match '(^|[\\/])\.env' -or $relative -match '\.\.' -or [IO.Path]::IsPathRooted($relative) -or $relative -eq 'local-ai/iniciar-smart-learn.ps1') { throw 'Ruta no permitida en el manifiesto.' }
    if (-not (Test-Path -LiteralPath (Join-Path $sourceRoot $relative) -PathType Leaf)) { throw "Falta el archivo: $relative" }
}
$backup = Join-Path (Split-Path $Destination -Parent) ((Split-Path $Destination -Leaf) + '-backup-sprint7-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
foreach ($relative in $files) {
    $target = Join-Path $Destination $relative
    if (Test-Path -LiteralPath $target) {
        $saved = Join-Path $backup $relative
        [IO.Directory]::CreateDirectory((Split-Path $saved -Parent)) | Out-Null
        Copy-Item -LiteralPath $target -Destination $saved
    }
    [IO.Directory]::CreateDirectory((Split-Path $target -Parent)) | Out-Null
    Copy-Item -LiteralPath (Join-Path $sourceRoot $relative) -Destination $target -Force
}
Write-Host "Sprint 7 aplicado. Respaldo: $backup"
Write-Host 'Se conservaron las credenciales, .git y local-ai/iniciar-smart-learn.ps1.'
