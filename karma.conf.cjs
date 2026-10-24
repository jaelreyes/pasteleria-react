// Pruebas de Jasmine ejecutadas en Chrome.
const fs = require("fs");
const { createInstrumenter } = require("istanbul-lib-instrument");

const instrumentador = createInstrumenter({
  esModules: true,
  parserPlugins: ["jsx"],
});

const pluginCobertura = {
  name: "cobertura",

  setup(build) {
    // Instrumenta componentes, páginas, utilidades y datos.
    build.onLoad(
      {
        filter: /src[\\/](components|pages|utils|data)[\\/].*\.jsx?$/,
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

    reporters: ["progress", "coverage"],

    coverageReporter: {
      dir: "coverage",

      reporters: [
        { type: "html", subdir: "html" },
        { type: "text-summary" },
      ],
    },

    browsers: ["ChromeHeadless"],
    singleRun: true,
  });
};