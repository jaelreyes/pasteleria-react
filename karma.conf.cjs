// Pruebas de Jasmine ejecutadas en Chrome.
const fs = require("fs");
const { createInstrumenter } = require("istanbul-lib-instrument");

// Instrumentador de istanbul: marca qué líneas se ejecutan para medir la cobertura.
const instrumentador = createInstrumenter({
  esModules: true,
  parserPlugins: ["jsx"],
});

// Plugin de esbuild que instrumenta el código de la app (no los tests).
const pluginCobertura = {
  name: "cobertura",

  setup(build) {
      // Instrumenta el panel, componentes, páginas, utilidades y datos.
    build.onLoad(
      {
        filter: /src[\\/](admin|components|pages|utils|data)[\\/].*\.jsx?$/,
      },
      async (archivo) => {
        const codigo = await fs.promises.readFile(
          archivo.path,
          "utf8"
        );

        return {
          contents: instrumentador.instrumentSync(
            codigo,
            archivo.path
          ),
          loader: "jsx",
        };
      }
    );
  },
};

module.exports = function (config) {
  config.set({
    // Las pruebas se escriben con Jasmine (describe, it, expect).
    frameworks: ["jasmine"],

    files: [
      "src/tests/**/*.spec.js",

      // Sirve las imágenes sin ejecutarlas como código.
      {
        pattern: "public/images/**/*",
        included: false,
        served: true,
        watched: false,
      },
    ],

    // Conserva las rutas que utiliza la aplicación.
    proxies: {
      "/images/": "/base/public/images/",
    },

    // esbuild transforma los tests (y el JSX que importan) antes de ejecutarlos.
    preprocessors: {
      "src/tests/**/*.spec.js": ["esbuild"],
    },

    esbuild: {
      jsx: "automatic",

      loader: {
        ".js": "jsx",
        ".css": "empty",
        ".png": "empty",
        ".svg": "empty",
      },

      define: {
        "process.env.NODE_ENV": '"test"',
      },

      plugins: [pluginCobertura],
    },

    // Muestra el avance y genera el informe de cobertura en coverage/html.
    reporters: ["progress", "coverage"],

    coverageReporter: {
      dir: "coverage",

      reporters: [
        { type: "html", subdir: "html" },
        { type: "text-summary" },
      ],
    },

    // Ejecuta una vez en Chrome sin ventana (npm test).
    browsers: ["ChromeHeadless"],
    singleRun: true,
  });
};