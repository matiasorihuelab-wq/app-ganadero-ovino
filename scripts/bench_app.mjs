// scripts/bench_app.mjs — arranque controlado del dev server para el browser bench.
//
// Por qué existe: garantiza que el bench corre contra el código ACTUAL del repo
// y no contra un dev server viejo (stale) de otra sesión. Mata cualquier proceso
// en :5174, levanta Vite sin abrir pestañas sueltas, espera a que responda y
// registra commit + timestamp. status confirma "LISTO PARA BENCH" solo si el
// servidor responde Y el commit registrado coincide con HEAD.
//
// Uso:
//   node scripts/bench_app.mjs start
//   node scripts/bench_app.mjs status   -> "LISTO PARA BENCH: true" antes de validar
//   node scripts/bench_app.mjs stop
//
// No edita vite.config.ts: usa flags CLI (--no-open evita que Vite abra el
// navegador del sistema y se cruce con el Chrome controlado; --strictPort hace
// que falle fuerte si :5174 está ocupado, en vez de saltar a 5175 en silencio).

import { spawn, execSync } from 'node:child_process'
import { writeFileSync, readFileSync, openSync, existsSync } from 'node:fs'

const PORT = 5174
const URL = `http://localhost:${PORT}`
const STATE = '.bench_app.json'
const cmd = process.argv[2]

function pidsOnPort(port) {
  try {
    // Sin "-p tcp": ese filtro en Windows lista SOLO IPv4 y deja afuera los
    // listeners IPv6 (TCPv6, ej. [::1]:5174). Vite escucha en ::1, así que con
    // el filtro el stop no lo veía y quedaba un proceso huérfano en el puerto.
    // "netstat -ano" incluye TCP y TCPv6; las líneas UDP no traen LISTENING y
    // las descarta el filtro de abajo.
    const out = execSync('netstat -ano', { encoding: 'utf8' })
    const pids = new Set()
    for (const line of out.split('\n')) {
      if (line.includes(`:${port} `) && line.includes('LISTENING')) {
        const cols = line.trim().split(/\s+/)
        pids.add(cols[cols.length - 1])
      }
    }
    return [...pids]
  } catch {
    return []
  }
}

const killPids = (pids) =>
  pids.forEach((pid) => {
    try {
      execSync(`taskkill /PID ${pid} /F /T`)
    } catch {}
  })

async function waitReady(timeoutMs = 30000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      if ((await fetch(URL)).ok) return true
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  return false
}

const commit = () => {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
  } catch {
    return '?'
  }
}

if (cmd === 'start') {
  const stale = pidsOnPort(PORT)
  if (stale.length) {
    console.log('Matando proceso(s) stale en :' + PORT + ' ->', stale.join(', '))
    killPids(stale)
  }
  const log = openSync('.bench_app.log', 'w')
  const child = spawn(
    'npx',
    ['vite', '--port', String(PORT), '--strictPort', '--no-open'],
    { detached: true, stdio: ['ignore', log, log], shell: true },
  )
  child.unref()
  writeFileSync(
    STATE,
    JSON.stringify(
      { pid: child.pid, port: PORT, commit: commit(), startedAt: new Date().toISOString() },
      null,
      2,
    ),
  )
  process.stdout.write('Esperando ' + URL + ' ... ')
  console.log((await waitReady()) ? 'LISTO' : 'NO RESPONDE (ver .bench_app.log)')
} else if (cmd === 'status') {
  if (!existsSync(STATE)) {
    console.log('Sin estado registrado. Corré: node scripts/bench_app.mjs start')
    process.exit(1)
  }
  const s = JSON.parse(readFileSync(STATE, 'utf8'))
  const responde = await fetch(URL).then((r) => r.ok).catch(() => false)
  const commitActual = commit()
  const fresh = s.commit === commitActual
  console.log({ ...s, commitActual, responde, codigoActual: fresh })
  console.log('LISTO PARA BENCH:', responde && fresh)
  if (!(responde && fresh)) process.exit(1)
} else if (cmd === 'stop') {
  killPids(pidsOnPort(PORT))
  console.log('Detenido. Puerto', PORT, 'libre:', pidsOnPort(PORT).length === 0)
} else {
  console.log('Uso: node scripts/bench_app.mjs <start|status|stop>')
  process.exit(1)
}
