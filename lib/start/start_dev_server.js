const Webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");

const { DEV_SERVER_PORT } = require("../constants");

module.exports = (theme, cb) => {
  const webpackConfig = require("../../webpack.config.js");
  const config = webpackConfig({ theme });
  const compiler = Webpack(config);
  const server = new WebpackDevServer(devServerOptions(theme), compiler);
  server.startCallback(cb);
}

const devServerOptions = (theme) => {
  return {
    static: `./themes/${theme}/assets/dist`,
    allowedHosts: "all",
    port: DEV_SERVER_PORT,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
    },
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    }
  };
}
