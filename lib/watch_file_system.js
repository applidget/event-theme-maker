const chokidar = require("chokidar");
const { logError, log } = require("./utils/log");

module.exports = (watchPath, cb) => {
  const watcher = chokidar.watch(watchPath, {
    persistent: true,
    ignoreInitial: true
  });

  watcher
    .on('add', cb)
    .on('change', cb)
    .on('unlink', (path) => log(`file destroyed: ${path}`))
    .on('error', (error) => logError(`watch file system error: ${error}`))
}
