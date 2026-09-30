$ErrorActionPreference = 'Stop'
$envPath = Join-Path $PSScriptRoot '.env'
if (Test-Path $envPath) {
    Write-Host 'Ya existe local-ai/.env. Se conserva la clave actual.'
    exit 0
}
$localSecret = & node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))"
if ($LASTEXITCODE -ne 0) { throw 'Se necesita Node.js 24.' }
@("LOCAL_AI_TOKEN=$localSecret", 'OLLAMA_MODEL=qwen2.5:3b', 'LOCAL_AI_PORT=8787') | Set-Content -Path $envPath -Encoding ascii
Write-Host 'Configuracion local creada. La clave no se muestra ni se incluye en Git.'
