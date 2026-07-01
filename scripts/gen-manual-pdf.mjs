// ============================================================================
//  Genera PDFs profesionales (portada + índice + maquetado) a partir de los
//  manuales Markdown, usando Chrome/Edge headless (--print-to-pdf). Sin dependencias.
//    node scripts/gen-manual-pdf.mjs
// ============================================================================
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ---------- Markdown -> HTML (mínimo, suficiente para estos manuales) ----------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function inline(text) {
  // Divide en spans de código y el resto; el formato NO se aplica dentro del código.
  const parts = text.split(/(`[^`]+`)/g)
  return parts.map((p) => {
    if (p.length >= 2 && p.startsWith('`') && p.endsWith('`')) {
      return `<code>${esc(p.slice(1, -1))}</code>`
    }
    let t = esc(p)
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    t = t.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    return t
  }).join('')
}

function slug(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function mdToHtml(md) {
  const lines = md.split(/\r?\n/)
  const out = []
  const toc = []
  let i = 0
  let inCode = false, codeBuf = []
  const para = []
  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para.length = 0 } }

  while (i < lines.length) {
    const line = lines[i]
    if (/^```/.test(line)) {
      if (!inCode) { flushPara(); inCode = true; codeBuf = [] }
      else { out.push(`<pre><code>${codeBuf.map(esc).join('\n')}</code></pre>`); inCode = false }
      i++; continue
    }
    if (inCode) { codeBuf.push(line); i++; continue }

    // Tabla (fila + separador |---|)
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[-:\s|]+\|\s*$/.test(lines[i + 1])) {
      flushPara()
      const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
      const header = cells(line)
      i += 2
      const rows = []
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { rows.push(cells(lines[i])); i++ }
      let html = '<table><thead><tr>' + header.map((h) => `<th>${inline(h)}</th>`).join('') + '</tr></thead><tbody>'
      for (const r of rows) html += '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>'
      out.push(html + '</tbody></table>')
      continue
    }

    const h = line.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      flushPara()
      const level = h[1].length
      const id = slug(h[2])
      if (level === 2) toc.push({ id, txt: h[2] })
      out.push(`<h${level} id="${id}">${inline(h[2])}</h${level}>`)
      i++; continue
    }

    if (/^\s*---+\s*$/.test(line)) { flushPara(); out.push('<hr>'); i++; continue }

    if (/^\s*>\s?/.test(line)) {
      flushPara()
      const buf = []
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i++ }
      out.push(`<blockquote>${inline(buf.join(' '))}</blockquote>`)
      continue
    }

    if (/^\s*[-*]\s+/.test(line)) {
      flushPara()
      const items = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++ }
      out.push('<ul>' + items.map((t) => `<li>${inline(t)}</li>`).join('') + '</ul>')
      continue
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      flushPara()
      const items = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++ }
      out.push('<ol>' + items.map((t) => `<li>${inline(t)}</li>`).join('') + '</ol>')
      continue
    }

    if (line.trim() === '') { flushPara(); i++; continue }
    para.push(line.trim()); i++
  }
  flushPara()
  return { body: out.join('\n'), toc }
}

// ---------- Plantilla HTML profesional ----------
const CSS = `
  @page { size: A4; margin: 20mm 18mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; color: #222; font-size: 10.5pt; line-height: 1.5; }
  .cover { height: 245mm; display: flex; flex-direction: column; justify-content: center; align-items: center;
    text-align: center; page-break-after: always; }
  .cover .badge { background: #2d5016; color: #fff; border-radius: 20px; padding: 4px 16px; font-weight: 700; letter-spacing: .5px; font-size: 11pt; }
  .cover h1 { font-size: 28pt; color: #2d5016; margin: 18px 0 6px; line-height: 1.15; }
  .cover .sub { font-size: 13pt; color: #6b6257; margin-bottom: 40px; }
  .cover .sheep { font-size: 60pt; margin-bottom: 10px; }
  .cover .meta { font-size: 10pt; color: #8b7355; margin-top: 60px; }
  .toc { page-break-after: always; }
  .toc h2 { color: #2d5016; border-bottom: 2px solid #2d5016; padding-bottom: 4px; }
  .toc ol { list-style: none; padding: 0; }
  .toc li { padding: 5px 0; border-bottom: 1px dotted #ddd; font-size: 11pt; }
  .toc a { color: #333; text-decoration: none; }
  h1 { font-size: 20pt; color: #2d5016; }
  h2 { font-size: 15pt; color: #2d5016; border-bottom: 1.5px solid #cfe0c0; padding-bottom: 3px; margin-top: 22px; page-break-after: avoid; }
  h3 { font-size: 12.5pt; color: #3d6b1e; margin-top: 16px; page-break-after: avoid; }
  h4 { font-size: 11pt; color: #6e5a42; page-break-after: avoid; }
  p { margin: 6px 0; }
  a { color: #2d5016; }
  strong { color: #1c1c1c; }
  code { font-family: 'Consolas', monospace; background: #f3efe3; padding: 1px 4px; border-radius: 3px; font-size: 9.5pt; }
  pre { background: #faf8f2; border: 1px solid #e2dac9; border-left: 3px solid #8b7355; border-radius: 5px;
    padding: 10px 12px; overflow: auto; page-break-inside: avoid; }
  pre code { background: none; padding: 0; font-size: 9pt; line-height: 1.45; white-space: pre-wrap; word-break: break-word; }
  blockquote { border-left: 4px solid #e0a800; background: #fff8e6; margin: 10px 0; padding: 8px 14px; color: #5a4b2a; border-radius: 0 5px 5px 0; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 9.3pt; page-break-inside: auto; }
  th, td { border: 1px solid #d8cfbb; padding: 5px 7px; text-align: left; vertical-align: top; }
  th { background: #2d5016; color: #fff; font-weight: 600; }
  tr:nth-child(even) td { background: #faf8f2; }
  hr { border: none; border-top: 1px solid #e2dac9; margin: 16px 0; }
  ul, ol { margin: 6px 0; padding-left: 22px; }
  li { margin: 3px 0; }
`

function pagina({ title, subtitle, version, fecha, body, toc }) {
  const tocHtml = toc.map((t, n) => `<li><a href="#${t.id}">${esc(t.txt.replace(/^\d+\.\s*/, `${n + 1}. `))}</a></li>`).join('')
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${CSS}</style></head><body>
    <div class="cover">
      <div class="sheep">🐑</div>
      <div class="badge">${esc(version)}</div>
      <h1>${esc(title)}</h1>
      <div class="sub">${esc(subtitle)}</div>
      <div class="meta">App de Análisis de Rentabilidad Ovina<br>${esc(fecha)}</div>
    </div>
    <div class="toc"><h2>Índice</h2><ol>${tocHtml}</ol></div>
    <main>${body}</main>
  </body></html>`
}

// ---------- Chrome/Edge headless ----------
function navegador() {
  const cands = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  ]
  for (const c of cands) if (existsSync(c)) return c
  throw new Error('No se encontró Chrome ni Edge para generar el PDF.')
}

function htmlToPdf(htmlPath, pdfPath) {
  const exe = navegador()
  const profile = resolve(ROOT, '.pdf-profile')
  execFileSync(exe, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', '--disable-extensions',
    `--user-data-dir=${profile}`,
    '--print-to-pdf-no-header', `--print-to-pdf=${pdfPath}`,
    `file:///${htmlPath.replace(/\\/g, '/')}`,
  ], { stdio: 'ignore' })
  try { rmSync(profile, { recursive: true, force: true }) } catch { /* noop */ }
}

// ---------- Ejecución ----------
const FECHA = new Date().toISOString().slice(0, 10)
const outPublic = resolve(ROOT, 'public/docs')
const outDocs = resolve(ROOT, 'docs')
mkdirSync(outPublic, { recursive: true })

const manuales = [
  { md: 'docs/MANUAL_USUARIO.md', pdf: 'MANUAL_USUARIO.pdf', title: 'Manual de Usuario',
    subtitle: 'Guía sencilla para usar la aplicación', version: 'Beta · RC3' },
  { md: 'docs/MANUAL_TECNICO.md', pdf: 'MANUAL_TECNICO.pdf', title: 'Manual Técnico',
    subtitle: 'Documentación técnica y de cálculo', version: 'Beta · RC3' },
]

for (const m of manuales) {
  const md = readFileSync(resolve(ROOT, m.md), 'utf8')
  const sinH1 = md.replace(/^#\s+.*\n/, '') // el H1 va en la portada
  const { body, toc } = mdToHtml(sinH1)
  const html = pagina({ ...m, fecha: FECHA, body, toc })
  const tmp = resolve(outPublic, m.pdf.replace('.pdf', '.tmp.html'))
  writeFileSync(tmp, html, 'utf8')
  const pdfPublic = resolve(outPublic, m.pdf)
  htmlToPdf(tmp, pdfPublic)
  rmSync(tmp, { force: true })
  copyFileSync(pdfPublic, resolve(outDocs, m.pdf)) // copia en /docs (repo)
  console.log(`OK ${m.pdf} (${(readFileSync(pdfPublic).length / 1024).toFixed(0)} KB)`)
}
console.log('Listo: public/docs/*.pdf y docs/*.pdf')
