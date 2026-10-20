// Configuración de Karma para ejecutar las pruebas de Jasmine en Chrome.
const fs = require('fs')
const { createInstrumenter } = require('istanbul-lib-instrument')

// Agrega contadores al código de la aplicación para medir la cobertura.
const instrumentador = createInstrumenter({
  esModules: true,
  parserPlugins: ['jsx'],
})

const pluginCobertura = {
  name: 'cobertura',
  setup(build) {
    // Solo el código de la app, no las pruebas ni node_modules.
    build.onLoad(
      { filter: /src[\\/](components|pages|utils|data)[\\/].*\.jsx?$/ },
      async archivo => {
        const codigo = await fs.promises.readFile(archivo.path, 'utf8')
        return {
          contents: instrumentador.instrumentSync(codigo, archivo.path),
          loader: 'jsx',
        }
      },
    )
  },
}

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],

    // Las pruebas están en src/tests y terminan en .spec.js (pueden tener JSX).
    files: ['src/tests/**/*.spec.js'],

    // esbuild traduce el JSX y junta los imports de cada prueba.
    preprocessors: {
      'src/tests/**/*.spec.js': ['esbuild'],
    },

    esbuild: {
      jsx: 'automatic',
      loader: { '.js': 'jsx', '.css': 'empty', '.png': 'empty', '.svg': 'empty' },
      define: { 'process.env.NODE_ENV': '"test"' },
      plugins: [pluginCobertura],
    },

    reporters: ['progress', 'coverage'],

    coverageReporter: {
      dir: 'coverage',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'text-summary' },
      ],
    },

    browsers: ['ChromeHeadless'],
    singleRun: true,
  })
}