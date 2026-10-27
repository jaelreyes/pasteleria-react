// Configuración de ESLint (npm run lint): reglas de JavaScript, React y hooks.
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Carpetas generadas que no se revisan.
  globalIgnores(['dist', 'coverage']),
  {
    // Código de la app: corre en el navegador y usa JSX.
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // Pruebas unitarias: habilita describe, it, expect, spyOn, etc.
    files: ['src/tests/**/*.spec.js'],
    languageOptions: {
      globals: globals.jasmine,
    },
  },
  {
    // La configuración de Karma corre en Node.
    files: ['karma.conf.cjs'],
    languageOptions: {
      globals: globals.node,
      sourceType: 'commonjs',
    },
  },
])