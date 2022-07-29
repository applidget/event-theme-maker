const Webpack = require("webpack");
const webpackConfig = require("../../webpack.config.js");

const {
  logFatal,
  logError
} = require("../utils/log");

const stringify = require("../utils/stringify");

module.exports = (theme, cb) => {
  const config = webpackConfig({ theme, mode: "production" });
  const compiler = Webpack(config);

  compiler.run((err, stats) => {
    if (err) {
      logFatal(`failed to build assets: ${stringify(err)}`);
    }

    if (stats.hasErrors()) {
      const errors = stats.toJson().errors;
      logFatal(errors.map(e => e).join("\n"));
    }

    compiler.close((closeErr) => {
      if (closeErr) {
        logError(stringify(closeErr));
      }
      cb(stats);
    });
  });
}
