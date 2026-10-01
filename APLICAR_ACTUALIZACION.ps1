param([string]$Destination = 'C:\workspace\smart-learn')
$ErrorActionPreference = 'Stop'
$sourceRoot = $PSScriptRoot
if (-not (Test-Path (Join-Path $Destination 'package.json'))) { throw 'No se encuentra el proyecto actual.' }
if ([IO.Path]::GetFullPath($sourceRoot) -eq [IO.Path]::GetFullPath($Destination)) { throw 'Extrae el ZIP en otra carpeta antes de aplicar.' }
$files = Get-Content (Join-Path $sourceRoot 'CAMBIOS.json') -Raw | ConvertFrom-Json
$backup = Join-Path (Split-Path $Destination -Parent) ((Split-Path $Destination -Leaf) + '-backup-aula-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
foreach ($relative in $files) {
    if ($relative -match '(^|/)\.env' -or $relative -match '\.\.' -or [IO.Path]::IsPathRooted($relative)) { throw 'Ruta no permitida en el manifiesto.' }
    $target = Join-Path $Destination $relative
    if (Test-Path $target) {
        $saved = Join-Path $backup $relative
        New-Item -ItemType Directory -Force -Path (Split-Path $saved -Parent) | Out-Null
        Copy-Item $target $saved
    }
    New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
    Copy-Item (Join-Path $sourceRoot $relative) $target -Force
}
Write-Host "Actualizacion aplicada. Respaldo: $backup"
Write-Host 'Se conservaron .env.local, local-ai/.env y los archivos fuera del manifiesto.'
