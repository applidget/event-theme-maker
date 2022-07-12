const chokidar = require("chokidar");
const { WATCH_PATH } = require("./constants");

const { logError, log } = require("./utils/log");

module.exports = (cb) => {
  const watcher = chokidar.watch(WATCH_PATH, {
    persistent: true,
    ignoreInitial: true
  });

  watcher
    .on('add', cb)
    .on('change', cb)
    .on('unlink', (path) => log(`file destroyed: ${path}`))
    .on('error', (error) => logError(`watch file system error: ${error}`))
}
