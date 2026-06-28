// Flat config de ESLint 9. Set mínimo profesional para React + TS + Vite:
// reglas JS recomendadas, TS recomendadas (sin type-checking, para que sea
// rápido y no requiera proyecto de tipos), y react-hooks (correctitud de hooks).
// Sin reglas de formato/estilo: el objetivo es detectar errores, no opinar de estilo.
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  {
    // Artefactos de build y paquetes generados: no se lintean.
    ignores: ['dist', 'dist-single', 'paquete-web', 'paquete-escritorio', 'compartir'],
  },
  // Código de la app (navegador).
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },
  // Scripts y configs que corren en Node.
  {
    files: ['scripts/**/*.{js,mjs,ts}', '*.config.{js,ts,mjs}', 'eslint.config.js'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node, ...globals.browser },
    },
  },
)
