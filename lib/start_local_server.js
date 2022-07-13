const http = require("http");
const url = require("url");
const fs = require("fs");
const startNgrok = require("./utils/start_ngrok");
const { logUpload } = require("./utils/log");
const replaceAssetsHost = require("./utils/replace_assets_host");

module.exports = ({ port, expose, devServer }, cb) => {
  if (expose) {
    startNgrok(port, (host) => {
      createServer(host, port, devServer);
      cb(host);
    });
    return;
  }

  const host = `http://localhost:${port}`;
  createServer(host, port, devServer);
  cb(host);
}

function createServer(host, port, devServer) {
  http.createServer(requestHandler(host, devServer)).listen(port);
}

function requestHandler(host, devServer) {
  return (req, res) => {
    const parsedUrl = url.parse(req.url);
    const { pathname } = parsedUrl;

    logUpload(pathname);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Request-Method", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
    res.setHeader("Access-Control-Allow-Headers", "*");

    fs.exists(`.${pathname}`, function (exist) {
      if (!exist) {
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
    });
  };
}

function delegateToWebpackDevServer(devServer, pathname, res) {
  http.get(`${devServer}/${pathname}`, (resp) => {
    resp.on("data", (chunk) => {
      res.write(chunk);
    });

    resp.on("end", () => {
      res.end();
    });
  }).on("error", () => {
    res.statusCode = 404;
    res.end(`File ${pathname} not found !`);
  });
}
