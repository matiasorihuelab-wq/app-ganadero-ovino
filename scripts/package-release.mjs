// scripts/package-release.mjs — arma el paquete de distribución en release/.
//
// Genera AMBOS builds y los organiza en una carpeta lista para entregar, con
// metadatos de versión / fecha / commit. No toca el motor ni el código fuente.
//
// Uso:  npm run package
//
// Salida (release/):
//   web/                         -> build Web/PWA (publicar el contenido en un hosting)
//   app-rentabilidad-ovina.html  -> Single File (abrir con doble clic, offline)
//   VERSION.txt                  -> versión, fecha, commit, estado
//   CHANGELOG.md                 -> historial de versiones
//   LEEME.txt                    -> instrucciones para quien recibe el paquete

import { execSync } from 'node:child_process'
import { rmSync, mkdirSync, cpSync, copyFileSync, writeFileSync, readFileSync, existsSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const version = pkg.version
// El label (RC1, RC2, …) se deriva del sufijo -rc.N de la versión, para que el paquete
// quede siempre en sincronía con package.json / src/version.ts sin editar este script.
const rcMatch = /-rc\.(\d+)$/.exec(version)
const label = rcMatch ? `RC${rcMatch[1]}` : version
const estado = `Release Candidate (${label})`
const fecha = new Date().toISOString().slice(0, 10)
const commit = (() => {
  try { return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim() } catch { return '(desconocido)' }
})()
const commitCorto = commit.slice(0, 7)

console.log(`== Empaquetando release ${version} (${commitCorto}, ${fecha}) ==`)

// 1) Builds
console.log('Build Web/PWA…')
execSync('npm run build', { stdio: 'inherit' })
console.log('Build Single File…')
execSync('npm run build:single', { stdio: 'inherit' })

// 2) Estructura release/
rmSync('release', { recursive: true, force: true })
mkdirSync('release', { recursive: true })
cpSync('dist', 'release/web', { recursive: true })
copyFileSync('dist-single/index.html', 'release/app-rentabilidad-ovina.html')
if (existsSync('CHANGELOG.md')) copyFileSync('CHANGELOG.md', 'release/CHANGELOG.md')

// 3) Metadatos (también se escribe el VERSION de la raíz)
const versionTxt = [
  `version: ${version}`,
  `label: ${label}`,
  `estado: ${estado}`,
  `fecha: ${fecha}`,
  `commit: ${commit}`,
  '',
].join('\n')
writeFileSync('release/VERSION.txt', versionTxt)
writeFileSync('VERSION', versionTxt)

// 4) LÉEME para el destinatario
const leeme = `App de Análisis de Rentabilidad Ovina — ${estado}
Versión ${version} · ${fecha} · commit ${commitCorto}

Esta carpeta contiene la aplicación en dos formatos. Elegí uno:

1) ARCHIVO ÚNICO (lo más simple, sin internet)
   - Abrí "app-rentabilidad-ovina.html" con doble clic.
   - Funciona sin conexión. No instala nada.

2) WEB / PWA (para publicar online o instalar)
   - Subí el contenido de la carpeta "web/" a un hosting de estáticos
     (Netlify Drop, Vercel, etc.) y abrí la URL.
   - Debe servirse por http/https (no por doble clic).

Tus datos quedan guardados solo en el navegador que uses (no se envían a ningún lado).

Documentación de usuario: ver la carpeta docs/usuario/ del proyecto
(instalación, uso, preguntas frecuentes, limitaciones).

Esto es un Release Candidate para una beta cerrada: el motor de cálculo se
validará contra el Excel de referencia en una etapa posterior.
`
writeFileSync('release/LEEME.txt', leeme)

console.log('\nListo. Paquete en release/:')
console.log('  release/web/                        (Web/PWA)')
console.log('  release/app-rentabilidad-ovina.html (Single File)')
console.log('  release/VERSION.txt, CHANGELOG.md, LEEME.txt')
