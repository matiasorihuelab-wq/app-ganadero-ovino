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
# NOTA: muchas veces alcanza con fijar el modelo (gpt-5.4) en .reviewbridge.json
# o por llamada; este parche binario es el último recurso si eso no alcanza.
#
# Prerequisito: tener el codex global instalado  ->  npm install -g @openai/codex
# Y haber corrido al menos una review (para que npx baje el bridge a su cache).
#
# Uso (PowerShell):
#   powershell -ExecutionPolicy Bypass -File scripts\fix-codex-binary.ps1
#   ... -Force                  # no pedir confirmación / no abortar en checks (automatización)
#   ... -TargetPath <codex.exe> # parchear solo ese binario, sin auto-descubrir
#
# Seguridad (endurecido tras review de codex-bridge):
#   - La fuente DEBE estar firmada por OpenAI (Authenticode) y ser >= 0.137;
#     si no se puede verificar firma o versión, ABORTA (salvo -Force).
#   - Acota los targets al codex.exe que cuelga de @openai/codex-win32-x64 dentro
#     de un install de npx que contiene codex-claude-bridge Y @openai/codex-sdk
#     (provenance: el binario pertenece a un install del bridge, no a cualquier
#     paquete que comparta el substring 'codex-win32-x64').
#   - Compara SHA256 antes (saltea lo ya parcheado) y verifica el hash post-copia.
#   - Pide confirmación salvo -Force. Reversible: deja un backup .0128.bak.

[CmdletBinding()]
param(
  [switch]$Force,
  [string]$TargetPath
)

$ErrorActionPreference = 'Stop'
$MinVersion = [version]'0.137.0'

function Get-Sha256($path) { (Get-FileHash -Algorithm SHA256 -Path $path).Hash }

# Bloquea (Write-Error => corta por $ErrorActionPreference='Stop') salvo -Force,
# donde degrada a warning. Centraliza el "escape controlado" de las validaciones.
function Stop-OrForce([string]$msg) {
  if ($Force) { Write-Warning "$msg Continuo por -Force." }
  else { Write-Error "$msg Usa -Force para saltar esta verificacion bajo tu responsabilidad." }
}

Write-Host '== Parche de binario codex para codex-bridge ==' -ForegroundColor Cyan

# 1) Fuente: codex.exe global. Verificar PROVENANCE antes de usarlo como origen.
$npmRoot = (npm root -g).Trim()
Write-Host "npm root -g: $npmRoot"
$globalCandidates = Get-ChildItem -Path $npmRoot -Recurse -Filter codex.exe -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -match 'codex-win32-x64' }
if (-not $globalCandidates) {
  Write-Error 'No se encontro codex.exe global. Corre primero:  npm install -g @openai/codex'
}
$source = ($globalCandidates | Sort-Object Length -Descending | Select-Object -First 1).FullName
Write-Host "Fuente (global): $source"

# 1a) Firma Authenticode válida y emitida por OpenAI (rechaza binarios manipulados).
$sig = Get-AuthenticodeSignature -FilePath $source
$signer = $sig.SignerCertificate.Subject
if (($sig.Status -ne 'Valid') -or ($signer -notmatch 'OpenAI')) {
  Stop-OrForce "La fuente no tiene una firma Authenticode valida de OpenAI (Status=$($sig.Status); Signer=$signer)."
} else {
  Write-Host "Firma fuente: Valid ($signer)" -ForegroundColor Green
}

# 1b) Version >= minima. El parseo se hace FUERA del try para que el Write-Error
#     bloqueante no lo trague el catch (que es solo para la ejecucion del exe).
$verRaw = $null
try { $verRaw = (& $source --version 2>$null | Select-Object -First 1) } catch { $verRaw = $null }
$verMatch = [regex]::Match([string]$verRaw, '\d+\.\d+\.\d+')
if (-not $verMatch.Success) {
  Stop-OrForce "No se pudo determinar la version de la fuente (salida: '$verRaw')."
} elseif ([version]$verMatch.Value -lt $MinVersion) {
  Stop-OrForce "La fuente reporta version $($verMatch.Value) (< $MinVersion); no sirve para el parche."
} else {
  Write-Host "Version fuente: $($verMatch.Value)" -ForegroundColor Green
}

$sourceHash = Get-Sha256 $source
Write-Host "SHA256 fuente: $sourceHash"

# 2) Targets: codex.exe del bridge en la cache de npx.
$npxCache = Join-Path $env:LOCALAPPDATA 'npm-cache\_npx'
if ($TargetPath) {
  if (-not (Test-Path $TargetPath)) { Write-Error "TargetPath no existe: $TargetPath" }
  $targets = @(Get-Item -LiteralPath $TargetPath)
} else {
  # PROVENANCE (layout npm hoisted): el codex.exe NO cuelga de codex-claude-bridge
  # sino de @openai/codex-win32-x64, hermano suyo bajo el mismo node_modules del
  # install npx. Bindeamos exigiendo que ese install (_npx\<hash>) contenga tanto
  # codex-claude-bridge como @openai/codex-sdk, y solo entonces tomamos el codex.exe
  # del paquete @openai/codex-win32-x64 de ESE install.
  $bridgeRoots = Get-ChildItem -Path $npxCache -Directory -ErrorAction SilentlyContinue |
    Where-Object {
      (Test-Path (Join-Path $_.FullName 'node_modules\codex-claude-bridge')) -and
      (Test-Path (Join-Path $_.FullName 'node_modules\@openai\codex-sdk'))
    }
  $targets = foreach ($root in $bridgeRoots) {
    $pkgDir = Join-Path $root.FullName 'node_modules\@openai\codex-win32-x64'
    if (Test-Path $pkgDir) {
      Get-ChildItem -Path $pkgDir -Recurse -Filter codex.exe -ErrorAction SilentlyContinue
    }
  }
  if (-not $targets) {
    Write-Warning "No se encontraron binarios de codex-claude-bridge en $npxCache"
    Write-Warning 'Corre primero una review (para que npx baje el bridge) y reintenta.'
    exit 1
  }
}

# 2a) Mostrar lo que se va a tocar y confirmar (salvo -Force).
Write-Host ''
Write-Host 'Se van a parchear estos binarios:' -ForegroundColor Yellow
$targets | ForEach-Object { Write-Host "  $($_.FullName)" }
if (-not $Force) {
  $resp = Read-Host 'Confirmas el reemplazo? (escribi "si" para continuar)'
  if ($resp -ne 'si') { Write-Host 'Cancelado.'; exit 0 }
}

# 3) Backup + swap, salteando lo ya parcheado y verificando el hash post-copia.
foreach ($t in $targets) {
  if ((Get-Sha256 $t.FullName) -eq $sourceHash) {
    Write-Host "Ya parcheado (hash coincide): $($t.FullName)" -ForegroundColor DarkGray
    continue
  }
  $bak = "$($t.FullName).0128.bak"
  if (-not (Test-Path $bak)) { Copy-Item $t.FullName $bak }
  Copy-Item $source $t.FullName -Force
  if ((Get-Sha256 $t.FullName) -ne $sourceHash) {
    Write-Error "Verificacion post-copia FALLO en $($t.FullName) (hash no coincide)."
  }
  Write-Host "Parcheado: $($t.FullName)" -ForegroundColor Green
  Write-Host "   backup:  $bak"
}

Write-Host ''
Write-Host 'Listo. Reinicia Claude Code en el proyecto y reintenta una review.' -ForegroundColor Cyan
Write-Host 'Nota: si npx vuelve a bajar el bridge en el futuro, re-ejecuta este script.' -ForegroundColor DarkYellow
