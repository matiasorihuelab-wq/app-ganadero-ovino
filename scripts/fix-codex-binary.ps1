# scripts/fix-codex-binary.ps1
#
# CONTINGENCIA. Corré esto SOLO si, al probar el code review de codex-bridge,
# obtenés el error:  "gpt-5.3-codex not supported with a ChatGPT account".
#
# Causa: el MCP codex-claude-bridge fija @openai/codex-sdk@0.128, que trae un
# codex.exe viejo que fuerza un modelo inexistente para cuentas ChatGPT. La
# solución es reemplazar ese binario empaquetado por el codex.exe global más
# nuevo (>= 0.137), que respeta --model.
#
# Prerequisito: tener el codex global instalado  ->  npm install -g @openai/codex
# Y haber corrido al menos una review (para que npx baje el bridge a su cache).
#
# Uso (PowerShell):
#   powershell -ExecutionPolicy Bypass -File scripts\fix-codex-binary.ps1
#
# Es reversible: deja un backup .0128.bak junto a cada binario reemplazado.

$ErrorActionPreference = 'Stop'

Write-Host '== Parche de binario codex para codex-bridge ==' -ForegroundColor Cyan

# 1) Ubicar el codex.exe global (la fuente buena, mas nueva).
$npmRoot = (npm root -g).Trim()
Write-Host "npm root -g: $npmRoot"
$globalCandidates = Get-ChildItem -Path $npmRoot -Recurse -Filter codex.exe -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -match 'codex-win32-x64' }
if (-not $globalCandidates) {
  Write-Error 'No se encontro codex.exe global. Corre primero:  npm install -g @openai/codex'
}
$source = ($globalCandidates | Sort-Object Length -Descending | Select-Object -First 1).FullName
Write-Host "Fuente (global, buena): $source" -ForegroundColor Green

# 2) Ubicar los codex.exe que empaqueta el bridge en la cache de npx.
$npxCache = Join-Path $env:LOCALAPPDATA 'npm-cache\_npx'
$targets = Get-ChildItem -Path $npxCache -Recurse -Filter codex.exe -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -match 'codex-win32-x64' }
if (-not $targets) {
  Write-Warning "No se encontraron binarios del bridge en $npxCache"
  Write-Warning 'Corre primero una review (para que npx baje codex-claude-bridge) y reintenta.'
  exit 1
}

# 3) Backup + swap de cada uno.
foreach ($t in $targets) {
  $bak = "$($t.FullName).0128.bak"
  if (-not (Test-Path $bak)) { Copy-Item $t.FullName $bak }
  Copy-Item $source $t.FullName -Force
  Write-Host "Parcheado: $($t.FullName)" -ForegroundColor Green
  Write-Host "   backup:  $bak"
}

Write-Host ''
Write-Host 'Listo. Reinicia Claude Code en el proyecto y reintenta una review.' -ForegroundColor Cyan
Write-Host 'Nota: si npx vuelve a bajar el bridge en el futuro, el binario 0128 puede' -ForegroundColor DarkYellow
Write-Host '      volver. En ese caso, re-ejecuta este script.' -ForegroundColor DarkYellow
