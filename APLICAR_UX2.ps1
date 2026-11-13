param([string]$Destination = 'C:\workspace\smart-learn')
$ErrorActionPreference = 'Stop'
$sourceRoot = $PSScriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $Destination 'package.json') -PathType Leaf)) { throw 'No se encuentra el proyecto actual.' }
if ([IO.Path]::GetFullPath($sourceRoot).TrimEnd([char[]]'\/') -eq [IO.Path]::GetFullPath($Destination).TrimEnd([char[]]'\/')) { throw 'Extrae el ZIP en otra carpeta antes de aplicar.' }
$files = Get-Content -LiteralPath (Join-Path $sourceRoot 'CAMBIOS_UX2.json') -Raw | ConvertFrom-Json
foreach ($relative in $files) {
    if ($relative -match '(^|[\\/])(\.env|\.git)' -or $relative -match '\.\.' -or [IO.Path]::IsPathRooted($relative) -or $relative -eq 'local-ai/iniciar-smart-learn.ps1') { throw 'Ruta no permitida en el manifiesto.' }
    if (-not (Test-Path -LiteralPath (Join-Path $sourceRoot $relative) -PathType Leaf)) { throw "Falta el archivo: $relative" }
    $target = Join-Path $Destination $relative
    if ((Test-Path -LiteralPath $target) -and -not (Test-Path -LiteralPath $target -PathType Leaf)) { throw "El destino no es un archivo: $relative" }
}
$stamp = (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + ([guid]::NewGuid().ToString('N').Substring(0,8))
$backup = Join-Path (Split-Path $Destination -Parent) ((Split-Path $Destination -Leaf) + '-backup-ux2-' + $stamp)
foreach ($relative in $files) {
    $target = Join-Path $Destination $relative
    if (Test-Path -LiteralPath $target -PathType Leaf) {
        $saved = Join-Path $backup $relative
        [IO.Directory]::CreateDirectory((Split-Path $saved -Parent)) | Out-Null
        Copy-Item -LiteralPath $target -Destination $saved
    }
    [IO.Directory]::CreateDirectory((Split-Path $target -Parent)) | Out-Null
    Copy-Item -LiteralPath (Join-Path $sourceRoot $relative) -Destination $target -Force
}
Write-Host "UX/UI 2 aplicada. Respaldo: $backup"
Write-Host 'Se conservaron las credenciales, los datos y el arranque local de IA.'
