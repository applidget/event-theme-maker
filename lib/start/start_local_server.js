const http = require("http");
const url = require("url");
const fs = require("fs");
const startNgrok = require("./utils/start_ngrok");
const { log, logError, logFatal } = require("../utils/log");
const replaceAssetsHost = require("./utils/replace_assets_host");

module.exports = (theme, apiClient, { port, expose, devServer }, cb) => {
  if (expose) {
    apiClient.fetchNgrokToken(theme, (ok, ngrokToken) => {
      if (!ok) {
        logFatal(`error fetching ngrok token: ${response}`);
      }

      startNgrok({ port, ngrokToken }, (host) => {
        createServer(host, port, devServer);
        cb(host);
      });
    })
    return;
  }

  const host = `http://localhost:${port}`;
  createServer(host, port, devServer);
  cb(host);
}

const createServer = (host, port, devServer) => {
  http.createServer(requestHandler(host, devServer)).listen(port);
}

const requestHandler = (host, devServer) => {
  return (req, res) => {
    const parsedUrl = url.parse(req.url);
    const { pathname } = parsedUrl;

    if (pathname === "/" || pathname === "" || !pathname) {
      res.statusCode = 200;
      res.end("Event theme maker");

      return;
    }

    log(`⤴️ ${pathname}`);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Request-Method", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
    res.setHeader("Access-Control-Allow-Headers", "*");

    if (!fs.existsSync(`.${pathname}`)) {
      // if the file is not found, we are probably looking for main.css or main.js, delegate this to webpack-dev-server
      delegateToWebpackDevServer(devServer, pathname, res);
      return;
    }

    // read file from file system
    fs.readFile(`.${pathname}`, function(err, data){
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        const content = data.toString();
        res.end(replaceAssetsHost(content, devServer, host));
      }
    });
  };
}

const delegateToWebpackDevServer = (devServer, pathname, res) => {
  http.get(`${devServer}${pathname}`, (resp) => {
    resp.on("data", (chunk) => {
      res.write(chunk);
    });

    resp.on("end", () => {
      res.end();
    });
  }).on("error", () => {
    const message = `File ${pathname} not found ! Make sure webpack dev server is running at ${devServer}`;
    res.statusCode = 404;
    res.end(message);

    logError(message);
  });
}
