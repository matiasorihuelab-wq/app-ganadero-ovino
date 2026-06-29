import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Build que inlinea TODO (JS + CSS + assets) en un único index.html autocontenido,
// abrible con doble clic y sin conexión a internet (file://).
//
// A diferencia del build web (dist/), este NO lleva PWA: el manifest y el service
// worker no aplican en file://. Por eso quitamos el <link rel="manifest"> (quedaría
// colgado) y no copiamos public/ (publicDir: false), para que la salida sea de
// verdad un solo archivo.
const sinManifest = {
  name: 'singlefile-sin-manifest',
  transformIndexHtml(html: string): string {
    return html.replace(/\s*<link rel="manifest"[^>]*>/g, '')
  },
}

export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [react(), viteSingleFile(), sinManifest],
  build: {
    outDir: 'dist-single',
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 100_000,
    cssCodeSplit: false,
    reportCompressedSize: false,
  },
})
