const Webpack = require("webpack");
const webpackConfig = require("../../webpack.config.js");

const {
  logFatal,
  logError
} = require("../utils/log");

const stringify = require("../utils/stringify");

module.exports = (theme, cb) => {
  const config = webpackConfig({ theme });
  const compiler = Webpack(config);

  compiler.run((err, stats) => {
    if (err) {
      logFatal(`failed to build assets: ${stringify(err)}`);
    }

    compiler.close((closeErr) => {
      if (closeErr) {
        logError(stringify(closeErr));
      }
      cb(stats);
    });
  });
}
