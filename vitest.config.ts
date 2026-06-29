import { defineConfig } from 'vitest/config'

// El motor es TS puro (sin DOM): tests en entorno node, rápidos y deterministas.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
