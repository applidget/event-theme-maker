const http = require("http");
const url = require("url");
const fs = require("fs");

const { NGROK_PORT, DEV_HOST } = require("./constants");
const replaceAssetsHost = require("./replace_assets_host");

module.exports.startLocalServer = () => {
  http.createServer(handleRequest).listen(NGROK_PORT);
}

function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url);
  const { pathname } = parsedUrl;

  res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Request-Method", "*");
	res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
	res.setHeader("Access-Control-Allow-Headers", "*");

  fs.exists(`.${pathname}`, function (exist) {
    if (!exist) {
      // if the file is not found, we are probably looking for main.css or main.js, delegate this to webpack-dev-server
      delegateToWebpackDevServer(pathname, res);
      return;
    }

    // read file from file system
    fs.readFile(`.${pathname}`, function(err, data){
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        const content = data.toString();
        res.end(replaceAssetsHost(content));
      }
    });
  });
}

function delegateToWebpackDevServer(pathname, res) {
  http.get(`${DEV_HOST}/${pathname}`, (resp) => {
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
